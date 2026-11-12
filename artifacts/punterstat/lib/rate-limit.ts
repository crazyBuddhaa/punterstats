/**
 * Rate limiter with automatic Upstash Redis support + two-bucket weighted
 * sliding-window in-memory fallback.
 *
 * When `UPSTASH_REDIS_REST_URL` (and `UPSTASH_REDIS_REST_TOKEN`) are set,
 * uses `@upstash/ratelimit` (`Ratelimit.slidingWindow`) backed by Upstash
 * Redis for global cross-instance enforcement.
 *
 * Otherwise (or if Upstash is unreachable), falls back to the O(1) two-bucket
 * weighted sliding-window in-memory limiter.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

interface Bucket {
  count: number;
  windowStart: number; // epoch ms — start of this fixed window slot
}

interface Entry {
  current: Bucket;
  previous: Bucket;
}

const store = new Map<string, Entry>();
let writeCount = 0;

function prune(windowMs: number): void {
  const cutoff = Date.now() - windowMs * 2;
  for (const [key, entry] of store) {
    if (entry.previous.windowStart < cutoff) {
      store.delete(key);
    }
  }
}

export interface RateLimitConfig {
  /** Max requests allowed in the trailing window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  /** true → request is allowed. */
  success: boolean;
  /** Approximate remaining capacity (floor). */
  remaining: number;
  /** Epoch ms when the current window resets. */
  resetAt: number;
}

// ── Upstash Redis client & limiter cache ───────────────────────────────────

let redisClient: Redis | null = null;
const upstashLimiters = new Map<string, Ratelimit>();

function getUpstashLimiter(limit: number, windowMs: number): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const cacheKey = `${limit}:${windowMs}`;
  const cached = upstashLimiters.get(cacheKey);
  if (cached) return cached;

  if (!redisClient) {
    redisClient = new Redis({ url, token });
  }

  const windowSec = Math.max(1, Math.round(windowMs / 1_000));
  const limiter = new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
    prefix: "punterstat:rl",
  });

  upstashLimiters.set(cacheKey, limiter);
  return limiter;
}

// ── In-memory fallback ─────────────────────────────────────────────────────

export function checkMemoryRateLimit(
  key: string,
  { limit, windowMs }: RateLimitConfig,
): RateLimitResult {
  const now = Date.now();
  const slotStart = Math.floor(now / windowMs) * windowMs;
  const resetAt = slotStart + windowMs;

  writeCount += 1;
  if (writeCount % 50 === 0) prune(windowMs);

  const existing = store.get(key);
  let entry: Entry;

  if (!existing) {
    entry = {
      current: { count: 0, windowStart: slotStart },
      previous: { count: 0, windowStart: slotStart - windowMs },
    };
  } else if (existing.current.windowStart === slotStart) {
    entry = existing;
  } else if (existing.current.windowStart === slotStart - windowMs) {
    entry = {
      previous: existing.current,
      current: { count: 0, windowStart: slotStart },
    };
  } else {
    entry = {
      current: { count: 0, windowStart: slotStart },
      previous: { count: 0, windowStart: slotStart - windowMs },
    };
  }

  const elapsedFraction = (now - slotStart) / windowMs;
  const estimate =
    entry.previous.count * (1 - elapsedFraction) + entry.current.count;

  if (estimate >= limit) {
    store.set(key, entry);
    return { success: false, remaining: 0, resetAt };
  }

  entry.current.count += 1;
  store.set(key, entry);

  const remaining = Math.max(0, Math.floor(limit - (estimate + 1)));
  return { success: true, remaining, resetAt };
}

// ── Unified async rate-limit check ─────────────────────────────────────────

export async function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const upstash = getUpstashLimiter(config.limit, config.windowMs);
  if (upstash) {
    try {
      const res = await upstash.limit(key);
      return {
        success: res.success,
        remaining: Math.max(0, res.remaining),
        resetAt: res.reset,
      };
    } catch (err) {
      console.error(
        "[rate-limit] Upstash check failed, falling back to in-memory:",
        err instanceof Error ? err.message : String(err)
      );
    }
  }

  return checkMemoryRateLimit(key, config);
}

/**
 * Extract client IP from request headers and run `checkRateLimit`.
 * Convenient for Server Actions (auth, contact form) where `headers()` is used.
 */
export async function checkActionRateLimit(
  label: string,
  config: RateLimitConfig,
  requestHeaders: { get(name: string): string | null },
  identifierSuffix?: string,
): Promise<RateLimitResult> {
  const forwarded = requestHeaders.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip")?.trim() ||
    "unknown";

  const key = identifierSuffix
    ? `${ip}:${label}:${identifierSuffix}`
    : `${ip}:${label}`;

  return checkRateLimit(key, config);
}
