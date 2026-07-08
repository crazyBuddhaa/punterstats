/**
 * Two-bucket weighted sliding-window rate limiter.
 *
 * Uses two fixed-width buckets (current + previous) per key and computes a
 * weighted estimate of requests in the trailing `windowMs` period:
 *
 *   estimate = previousCount × (1 − elapsedFraction) + currentCount
 *
 * This is O(1) per check (no timestamp queues), prevents boundary bursts
 * (unlike a plain fixed-window counter), and is the same algorithm used
 * internally by Redis + Cloudflare rate-limit implementations.
 *
 * State lives in a module-level Map and is per edge-worker instance on
 * Vercel. Not globally shared across all instances, but significantly
 * reduces the blast radius. Upgrade to Upstash Redis for strict global
 * enforcement if needed.
 *
 * Keys are `ip:routeLabel` strings. Entries are pruned on a write-count
 * cadence (not store.size, which is stable at multiples of 50) so the Map
 * does not grow unbounded.
 */

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
    // Remove entries whose previous bucket is older than two full windows
    // (both buckets have definitely expired).
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
  /** Epoch ms when the current fixed-window slot resets. */
  resetAt: number;
}

export function checkRateLimit(
  key: string,
  { limit, windowMs }: RateLimitConfig,
): RateLimitResult {
  const now = Date.now();
  const slotStart = Math.floor(now / windowMs) * windowMs;
  const resetAt = slotStart + windowMs;

  // Prune stale entries every 50 writes (write-count, not store.size).
  writeCount += 1;
  if (writeCount % 50 === 0) prune(windowMs);

  const existing = store.get(key);
  let entry: Entry;

  if (!existing) {
    // First-ever request for this key.
    entry = {
      current: { count: 0, windowStart: slotStart },
      previous: { count: 0, windowStart: slotStart - windowMs },
    };
  } else if (existing.current.windowStart === slotStart) {
    // Still in the same slot — use as-is.
    entry = existing;
  } else if (existing.current.windowStart === slotStart - windowMs) {
    // Slot rolled over once — promote current → previous, reset current.
    entry = {
      previous: existing.current,
      current: { count: 0, windowStart: slotStart },
    };
  } else {
    // Two or more slots have passed — previous data is too stale to weight.
    entry = {
      current: { count: 0, windowStart: slotStart },
      previous: { count: 0, windowStart: slotStart - windowMs },
    };
  }

  // Weighted sliding-window estimate *before* counting this request.
  const elapsedFraction = (now - slotStart) / windowMs;
  const estimate =
    entry.previous.count * (1 - elapsedFraction) + entry.current.count;

  if (estimate >= limit) {
    store.set(key, entry);
    return { success: false, remaining: 0, resetAt };
  }

  // Allow: increment and persist.
  entry.current.count += 1;
  store.set(key, entry);

  const remaining = Math.max(0, Math.floor(limit - (estimate + 1)));
  return { success: true, remaining, resetAt };
}
