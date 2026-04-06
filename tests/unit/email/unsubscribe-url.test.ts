import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  buildEmailUnsubscribeUrl,
  resolveUnsubscribeUserId,
  getEmailUnsubscribeSecret,
} from "@/lib/email/unsubscribe-url";

describe("unsubscribe-url", () => {
  const prevEmail = process.env.EMAIL_UNSUBSCRIBE_SECRET;
  const prevCron = process.env.CRON_SECRET;

  beforeEach(() => {
    delete process.env.EMAIL_UNSUBSCRIBE_SECRET;
    delete process.env.CRON_SECRET;
  });

  afterEach(() => {
    if (prevEmail !== undefined) process.env.EMAIL_UNSUBSCRIBE_SECRET = prevEmail;
    else delete process.env.EMAIL_UNSUBSCRIBE_SECRET;
    if (prevCron !== undefined) process.env.CRON_SECRET = prevCron;
    else delete process.env.CRON_SECRET;
  });

  it("builds legacy user_id URL when no secret", () => {
    expect(getEmailUnsubscribeSecret()).toBeUndefined();
    const url = buildEmailUnsubscribeUrl("user-uuid-1", "https://app.example");
    expect(url).toContain("user_id=user-uuid-1");
    expect(url).not.toContain("token=");
  });

  it("round-trips signed token with EMAIL_UNSUBSCRIBE_SECRET", () => {
    process.env.EMAIL_UNSUBSCRIBE_SECRET = "unit-test-secret";
    const url = buildEmailUnsubscribeUrl("550e8400-e29b-41d4-a716-446655440000", "https://app.example");
    const token = new URL(url).searchParams.get("token");
    expect(token).toBeTruthy();
    const r = resolveUnsubscribeUserId(token, null);
    expect(r).toEqual({ ok: true, userId: "550e8400-e29b-41d4-a716-446655440000" });
  });

  it("rejects plain user_id when secret is set", () => {
    process.env.EMAIL_UNSUBSCRIBE_SECRET = "x";
    expect(resolveUnsubscribeUserId(null, "any-id")).toEqual({ ok: false, reason: "legacy_disabled" });
  });

  it("uses CRON_SECRET as fallback for signing", () => {
    process.env.CRON_SECRET = "cron-shared";
    const url = buildEmailUnsubscribeUrl("u1", "https://x.test");
    expect(url).toContain("token=");
  });
});
