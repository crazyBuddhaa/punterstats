import { createAdminClient } from "@/lib/supabase/admin";
import { checkLock, writeLock, releaseLock } from "@/lib/cache/locks";
import type { Fixture, SportsDataSource } from "./types";

/** Maximum age of stale data we'll serve as a fallback. Slightly wider than
 *  the 2-hour hard TTL to handle clock skew and in-flight lock periods. */
const MAX_STALE_MS = 3 * 60 * 60 * 1000; // 3 hours

interface FixtureRow {
  id: string;
  source: SportsDataSource;
  external_id: string;
  league: string;
  season: string | null;
  home_team: string;
  away_team: string;
  kickoff: string;
  status: Fixture["status"];
  home_score: number | null;
  away_score: number | null;
}

function rowToFixture(row: FixtureRow): Fixture {
  return {
    id: row.id,
    source: row.source,
    externalId: row.external_id,
    league: row.league,
    season: row.season ?? undefined,
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    kickoff: row.kickoff,
    status: row.status,
    homeScore: row.home_score ?? undefined,
    awayScore: row.away_score ?? undefined,
  };
}

/**
 * Read cached fixtures for a source using the adaptive two-threshold TTL.
 *
 * Returns `{ fixtures, shouldRefresh: false }` when the cache is fresh or when
 * another concurrent request already holds the refresh lock (stale-while-revalidate).
 *
 * Returns `{ fixtures, shouldRefresh: true }` when this caller has acquired the
 * refresh lock and MUST call writeFixturesCache() (on success) or
 * releaseFixturesLock() (on failure) before returning.
 *
 * fixtures is [] only on a true cache miss (no data has ever been written for
 * this source).
 */
export async function getCachedFixtures(
  source: SportsDataSource,
  options?: { league?: string; search?: string }
): Promise<{ fixtures: Fixture[]; shouldRefresh: boolean }> {
  const cacheKey = `fixtures:${source}`;
  const { exists, shouldRefresh } = await checkLock(cacheKey);

  if (!exists) {
    // Pass through checkLock's shouldRefresh: true means this caller won the
    // atomic INSERT race and holds the lock; false means another concurrent
    // request is bootstrapping — caller returns empty gracefully.
    return { fixtures: [], shouldRefresh };
  }

  // Read stale-safe data: fetched within the last 3 hours.
  const cutoff = new Date(Date.now() - MAX_STALE_MS).toISOString();
  const supabase = createAdminClient();

  let query = supabase
    .from("fixtures_cache")
    .select(
      "id, source, external_id, league, season, home_team, away_team, kickoff, status, home_score, away_score"
    )
    .eq("source", source)
    .gt("fetched_at", cutoff)
    .order("kickoff", { ascending: true });

  if (options?.league) {
    query = query.eq("league", options.league);
  }
  if (options?.search) {
    query = query.or(
      `home_team.ilike.%${options.search}%,away_team.ilike.%${options.search}%`
    );
  }

  const { data, error } = await query;
  if (error || !data) {
    console.error("[sports-data/cache] getCachedFixtures read failed", error);
    return { fixtures: [], shouldRefresh: true };
  }

  return { fixtures: (data as FixtureRow[]).map(rowToFixture), shouldRefresh };
}

/**
 * Upsert freshly-fetched fixtures and set a fresh adaptive TTL.
 * Also releases the refresh lock.
 */
export async function writeFixturesCache(
  source: SportsDataSource,
  fixtures: Omit<Fixture, "id" | "source">[],
  rawPayloads: Record<string, unknown>[]
): Promise<void> {
  // Always finalise the lock even on empty payload so TTL resets and the next
  // caller doesn't immediately re-acquire and hammer the upstream API.
  if (fixtures.length === 0) {
    await writeLock(`fixtures:${source}`);
    return;
  }

  const supabase = createAdminClient();
  const now = new Date();
  // expires_at kept for schema compatibility and future cleanup jobs.
  const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();

  const rows = fixtures.map((f, i) => ({
    source,
    external_id: f.externalId,
    league: f.league,
    season: f.season ?? null,
    home_team: f.homeTeam,
    away_team: f.awayTeam,
    kickoff: f.kickoff,
    status: f.status,
    home_score: f.homeScore ?? null,
    away_score: f.awayScore ?? null,
    raw_payload: rawPayloads[i] ?? {},
    fetched_at: now.toISOString(),
    expires_at: expiresAt,
  }));

  const { error } = await supabase
    .from("fixtures_cache")
    .upsert(rows, { onConflict: "source,external_id" });

  if (error) {
    console.error("[sports-data/cache] writeFixturesCache failed", error);
  }

  // Update lock table: new TTL + release lock.
  await writeLock(`fixtures:${source}`);
}

/**
 * Release the refresh lock without writing new data — call this when a live
 * API request fails so the next caller can retry after the back-off window.
 */
export async function releaseFixturesLock(source: SportsDataSource): Promise<void> {
  await releaseLock(`fixtures:${source}`);
}
