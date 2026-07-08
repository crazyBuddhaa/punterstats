import { createAdminClient } from "@/lib/supabase/admin";
import { checkLock, writeLock, releaseLock } from "@/lib/cache/locks";
import type { CachedOddsRow, OddsEvent } from "./types";

/** Maximum age of stale data we'll serve as a fallback. Slightly wider than
 *  the 2-hour hard TTL to handle clock skew and in-flight lock periods. */
const MAX_STALE_MS = 3 * 60 * 60 * 1000; // 3 hours

function rowsToEvents(rows: CachedOddsRow[]): OddsEvent[] {
  const byEvent = new Map<string, OddsEvent>();

  for (const row of rows) {
    let event = byEvent.get(row.event_id);
    if (!event) {
      event = {
        id: row.event_id,
        sportKey: row.sport_key,
        homeTeam: row.home_team,
        awayTeam: row.away_team,
        commenceTime: row.commence_time,
        bookmakers: [],
      };
      byEvent.set(row.event_id, event);
    }

    let bookmaker = event.bookmakers.find((b) => b.key === row.bookmaker);
    if (!bookmaker) {
      bookmaker = { key: row.bookmaker, title: row.bookmaker, markets: [] };
      event.bookmakers.push(bookmaker);
    }

    bookmaker.markets.push({ key: row.market_key, outcomes: row.outcomes });
  }

  return Array.from(byEvent.values());
}

/**
 * Read cached odds for a sport using the adaptive two-threshold TTL.
 *
 * Returns `{ events, shouldRefresh: false }` when the cache is fresh or when
 * another concurrent request already holds the refresh lock (stale data is
 * returned as-is — stale-while-revalidate).
 *
 * Returns `{ events, shouldRefresh: true }` when this caller has acquired the
 * refresh lock and MUST call writeOddsCache() (on success) or
 * releaseOddsLock() (on failure) before returning.
 *
 * events is [] only on a true cache miss (no data has ever been written).
 */
export async function getCachedOdds(sportKey: string): Promise<{
  events: OddsEvent[];
  shouldRefresh: boolean;
}> {
  const cacheKey = `odds:${sportKey}`;
  const { exists, shouldRefresh } = await checkLock(cacheKey);

  if (!exists) {
    // Pass through checkLock's shouldRefresh: true means this caller won the
    // atomic INSERT race and holds the lock; false means another concurrent
    // request is bootstrapping — caller returns empty gracefully.
    return { events: [], shouldRefresh };
  }

  // Read stale-safe data: fetched within the last 3 hours (belt-and-suspenders
  // guard against extremely old rows if the lock table is ever reset).
  const cutoff = new Date(Date.now() - MAX_STALE_MS).toISOString();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("odds_cache")
    .select(
      "event_id, sport_key, home_team, away_team, commence_time, bookmaker, market_key, outcomes, fetched_at, expires_at"
    )
    .eq("sport_key", sportKey)
    .gt("fetched_at", cutoff);

  if (error || !data) {
    console.error("[odds/cache] getCachedOdds read failed", error);
    return { events: [], shouldRefresh: true };
  }

  return { events: rowsToEvents(data as CachedOddsRow[]), shouldRefresh };
}

/**
 * Upsert freshly-fetched odds and set a fresh adaptive TTL.
 * Also releases the refresh lock so other waiters can serve the new data.
 *
 * sportKey is required explicitly so the lock can always be finalised even
 * when the upstream API returns an empty event list (which would make
 * events[0] undefined and leak the lock indefinitely).
 */
export async function writeOddsCache(sportKey: string, events: OddsEvent[]): Promise<void> {
  const supabase = createAdminClient();

  if (events.length > 0) {
    const now = new Date();
    // expires_at kept for schema compatibility and future cleanup jobs;
    // TTL decisions are owned by cache_refresh_locks.
    const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();

    const rows = events.flatMap((event) =>
      event.bookmakers.flatMap((bookmaker) =>
        bookmaker.markets.map((market) => ({
          event_id: event.id,
          sport_key: event.sportKey,
          home_team: event.homeTeam,
          away_team: event.awayTeam,
          commence_time: event.commenceTime,
          bookmaker: bookmaker.key,
          market_key: market.key,
          outcomes: market.outcomes,
          fetched_at: now.toISOString(),
          expires_at: expiresAt,
        }))
      )
    );

    const { error } = await supabase
      .from("odds_cache")
      .upsert(rows, { onConflict: "event_id,bookmaker,market_key" });

    if (error) {
      console.error("[odds/cache] writeOddsCache failed", error);
    }
  }

  // Always finalise the lock — even on empty payload — so the TTL resets and
  // the next caller doesn't immediately re-acquire and call the API again.
  await writeLock(`odds:${sportKey}`);
}

/**
 * Release the refresh lock without writing new data — call this when a live
 * API request fails so the next caller can retry after the back-off window.
 */
export async function releaseOddsLock(sportKey: string): Promise<void> {
  await releaseLock(`odds:${sportKey}`);
}
