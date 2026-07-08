import { createAdminClient } from "@/lib/supabase/admin";

// ── TTL constants ────────────────────────────────────────────────────────────
/** How long before the cache is considered "soft expired" (still served to
 *  low-traffic callers, but a high-traffic caller triggers a refresh). */
export const SOFT_TTL_MS = 60 * 60 * 1000; // 1 hour

/** How long before the cache MUST be refreshed regardless of traffic. */
export const HARD_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

/** A cache entry served within this window counts as "high traffic". */
const HIGH_TRAFFIC_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

/** A refresh lock held longer than this is considered crashed and auto-cleared. */
const STALE_LOCK_MS = 2 * 60 * 1000; // 2 minutes

// ── Types ────────────────────────────────────────────────────────────────────
interface LockRow {
  cache_key: string;
  fetched_at: string;
  soft_expires_at: string;
  hard_expires_at: string;
  last_served_at: string | null;
  is_refreshing: boolean;
  refreshing_since: string | null;
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Inspect the adaptive TTL state for a cache key and optionally acquire the
 * refresh lock.
 *
 * Returns `{ exists: false, shouldRefresh: true }` on a true miss (no lock row).
 * Returns `{ exists: true, shouldRefresh: false }` when the cache is fresh or
 *   another request already holds the refresh lock.
 * Returns `{ exists: true, shouldRefresh: true }` when THIS caller has
 *   successfully acquired the lock — it MUST call writeLock() (on success) or
 *   releaseLock() (on failure) before returning.
 *
 * Also fires a non-blocking update of `last_served_at` on every hit so the
 * traffic-signal stays fresh.
 */
export async function checkLock(cacheKey: string): Promise<{
  exists: boolean;
  shouldRefresh: boolean;
}> {
  const supabase = createAdminClient();
  const now = Date.now();
  const nowIso = new Date(now).toISOString();

  const { data: lock } = await supabase
    .from("cache_refresh_locks")
    .select("*")
    .eq("cache_key", cacheKey)
    .maybeSingle<LockRow>();

  // True miss — no lock row means no cached data exists yet.
  // Atomically INSERT with is_refreshing=true so only ONE concurrent cold-miss
  // request gets the lock; all others see the duplicate-key error and wait.
  if (!lock) {
    const placeholder = {
      cache_key: cacheKey,
      fetched_at: nowIso,
      soft_expires_at: new Date(0).toISOString(), // epoch sentinel — writeLock overwrites
      hard_expires_at: new Date(0).toISOString(),
      is_refreshing: true,
      refreshing_since: nowIso,
    };
    const { error: insertErr } = await supabase
      .from("cache_refresh_locks")
      .insert(placeholder);

    if (!insertErr) {
      // We inserted the row — we hold the lock.
      return { exists: false, shouldRefresh: true };
    }
    // Another concurrent request already claimed the lock.
    // Return empty/stale — caller should serve gracefully while bootstrapping.
    return { exists: false, shouldRefresh: false };
  }

  const softExpiry = new Date(lock.soft_expires_at).getTime();
  const hardExpiry = new Date(lock.hard_expires_at).getTime();
  const lastServed = lock.last_served_at ? new Date(lock.last_served_at).getTime() : 0;
  const isHighTraffic = now - lastServed < HIGH_TRAFFIC_WINDOW_MS;

  // Non-blocking traffic signal update — fire and forget.
  void supabase
    .from("cache_refresh_locks")
    .update({ last_served_at: nowIso })
    .eq("cache_key", cacheKey);

  // ── Zone 1: definitely fresh ─────────────────────────────────────────────
  if (now < softExpiry) {
    return { exists: true, shouldRefresh: false };
  }

  // ── Zone 2: between soft and hard — serve stale if traffic is low ────────
  if (now < hardExpiry && !isHighTraffic) {
    return { exists: true, shouldRefresh: false };
  }

  // ── Zone 3: refresh needed (high traffic or past hard expiry) ────────────

  // Auto-clear a stale lock left by a crashed refresher.
  const staleCutoff = new Date(now - STALE_LOCK_MS).toISOString();
  if (lock.is_refreshing && lock.refreshing_since && lock.refreshing_since < staleCutoff) {
    await supabase
      .from("cache_refresh_locks")
      .update({ is_refreshing: false, refreshing_since: null })
      .eq("cache_key", cacheKey)
      .eq("is_refreshing", true)
      .lt("refreshing_since", staleCutoff);
  }

  // Atomic conditional acquire: only succeeds if nobody else holds the lock.
  const { data: acquired } = await supabase
    .from("cache_refresh_locks")
    .update({ is_refreshing: true, refreshing_since: nowIso })
    .eq("cache_key", cacheKey)
    .eq("is_refreshing", false)
    .select("cache_key");

  if (acquired && acquired.length > 0) {
    // This caller now holds the refresh lock.
    return { exists: true, shouldRefresh: true };
  }

  // Another request is actively refreshing — serve the stale row.
  return { exists: true, shouldRefresh: false };
}

/**
 * Called immediately after a successful cache write.
 * Sets fresh soft/hard expiry windows and releases the refresh lock.
 */
export async function writeLock(cacheKey: string): Promise<void> {
  const supabase = createAdminClient();
  const now = new Date();
  await supabase
    .from("cache_refresh_locks")
    .upsert(
      {
        cache_key: cacheKey,
        fetched_at: now.toISOString(),
        soft_expires_at: new Date(now.getTime() + SOFT_TTL_MS).toISOString(),
        hard_expires_at: new Date(now.getTime() + HARD_TTL_MS).toISOString(),
        last_served_at: null,
        is_refreshing: false,
        refreshing_since: null,
      },
      { onConflict: "cache_key" }
    );
}

/**
 * Called when a refresh attempt fails. Releases the lock without updating
 * the TTL windows, and pushes the hard expiry forward by 5 minutes to
 * prevent a thundering-herd retry storm immediately after a failure.
 */
export async function releaseLock(cacheKey: string): Promise<void> {
  const supabase = createAdminClient();
  const retryAfter = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  await supabase
    .from("cache_refresh_locks")
    .update({
      is_refreshing: false,
      refreshing_since: null,
      hard_expires_at: retryAfter, // brief back-off to reduce retry pressure
    })
    .eq("cache_key", cacheKey);
}
