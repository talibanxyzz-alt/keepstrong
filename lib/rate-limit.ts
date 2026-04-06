import { type Duration, Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

let redisClient: Redis | null | undefined;
let missingConfigLogged = false;

function getRedis(): Redis | null {
  if (redisClient !== undefined) {
    return redisClient;
  }
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    if (!missingConfigLogged) {
      missingConfigLogged = true;
      console.warn(
        "[rate-limit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set — rate limiting is disabled."
      );
    }
    redisClient = null;
    return null;
  }
  redisClient = new Redis({ url, token });
  return redisClient;
}

const limiterCache = new Map<string, Ratelimit>();

function getLimiter(bucket: string, max: number, window: Duration): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  const key = `${bucket}:${max}:${String(window)}`;
  let limiter = limiterCache.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(max, window),
      prefix: `keepstrong:rl:${bucket}`,
      analytics: false,
    });
    limiterCache.set(key, limiter);
  }
  return limiter;
}

/** Client IP for rate limiting (Vercel / common proxies). */
export function getRequestIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

export type RateLimitResult =
  | { ok: true }
  | { ok: false; response: NextResponse };

/**
 * Enforce a sliding-window limit. If Upstash is not configured, requests are allowed.
 */
export async function enforceRateLimit(
  bucket: string,
  identifier: string,
  max: number,
  window: Duration
): Promise<RateLimitResult> {
  if (identifier === "unknown") {
    return { ok: true };
  }
  const limiter = getLimiter(bucket, max, window);
  if (!limiter) {
    return { ok: true };
  }

  const { success, reset } = await limiter.limit(identifier);
  if (success) {
    return { ok: true };
  }

  const retryAfterSec = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return {
    ok: false,
    response: NextResponse.json(
      { error: "Too many requests. Try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSec),
        },
      }
    ),
  };
}
