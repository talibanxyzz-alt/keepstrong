import { createHmac, timingSafeEqual } from "node:crypto";

/** Links remain valid for one year (long-lived unsubscribe from old emails). */
const TTL_SECONDS = 365 * 24 * 60 * 60;

export function getEmailUnsubscribeSecret(): string | undefined {
  return process.env.EMAIL_UNSUBSCRIBE_SECRET || process.env.CRON_SECRET;
}

export function buildEmailUnsubscribeUrl(userId: string, baseUrl: string): string {
  const secret = getEmailUnsubscribeSecret();
  const base = baseUrl.replace(/\/$/, "");
  if (!secret) {
    return `${base}/api/emails/unsubscribe?user_id=${encodeURIComponent(userId)}`;
  }
  const token = signUnsubscribeToken(userId, secret);
  return `${base}/api/emails/unsubscribe?token=${encodeURIComponent(token)}`;
}

function signUnsubscribeToken(userId: string, secret: string): string {
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const payload = `${userId}.${exp}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return Buffer.from(`${payload}.${sig}`, "utf8").toString("base64url");
}

function verifyUnsubscribeToken(token: string, secret: string): string | null {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const lastDot = raw.lastIndexOf(".");
    if (lastDot <= 0) return null;
    const sigHex = raw.slice(lastDot + 1);
    const payload = raw.slice(0, lastDot);
    const expectedHex = createHmac("sha256", secret).update(payload).digest("hex");
    const a = Buffer.from(sigHex, "hex");
    const b = Buffer.from(expectedHex, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    const firstDot = payload.indexOf(".");
    if (firstDot <= 0) return null;
    const userId = payload.slice(0, firstDot);
    const exp = Number.parseInt(payload.slice(firstDot + 1), 10);
    if (!userId || !Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return null;
    return userId;
  } catch {
    return null;
  }
}

export type UnsubscribeResolve =
  | { ok: true; userId: string }
  | { ok: false; reason: "missing" | "invalid" | "legacy_disabled" };

/**
 * Prefer signed `token`. Plain `user_id` is only allowed when no signing secret is configured (local dev).
 */
export function resolveUnsubscribeUserId(
  token: string | null,
  userIdParam: string | null
): UnsubscribeResolve {
  const secret = getEmailUnsubscribeSecret();

  if (token) {
    if (!secret) return { ok: false, reason: "invalid" };
    const userId = verifyUnsubscribeToken(token, secret);
    return userId ? { ok: true, userId } : { ok: false, reason: "invalid" };
  }

  if (userIdParam) {
    if (secret) return { ok: false, reason: "legacy_disabled" };
    return { ok: true, userId: userIdParam };
  }

  return { ok: false, reason: "missing" };
}
