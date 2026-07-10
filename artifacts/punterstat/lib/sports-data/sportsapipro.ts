import { createAdminClient } from "@/lib/supabase/admin";
import { getCachedFixtures, writeFixturesCache, releaseFixturesLock } from "./cache";
import { recordApiUsage } from "./router";
import type { Fixture, FixturesResult } from "./types";

/**
 * SportsAPIPro — free-plan primary source for football fixtures.
 *
 * Free plan is capped at 100 requests/day. Per league we spend 1 request
 * (events/next) per refresh cycle, plus an occasional +1 to resolve a
 * league's current seasonId (cached 24h — see sportsapipro_season_cache).
 * With 12 leagues that's ~12 requests per adaptive-cache refresh; combined
 * with the router's 50%-of-budget cutoff, SportsAPIPro self-throttles to
 * roughly 4 refresh cycles/day before falling back to footballdata.io.
 *
 * Docs: https://docs.sportsapipro.com
 *   - Canonical league IDs: /api-reference/football-v2/canonical-ids
 *   - Season resolution:    /api-reference/football-v2/season-ids
 *   - Tournament endpoints: /api-reference/football-v2/tournament
 */
const BASE_URL = "https://api.sportsapipro.com/v2/football";
const SOURCE = "sportsapipro" as const;
const SEASON_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h — seasons roll over a few times/year

/**
 * uniqueTournament.id (canonical, season-independent) for every league the
 * UI exposes — see components/match-breakdown/fixture-search.tsx
 * SUPPORTED_LEAGUES. Keep in sync with that list.
 *
 * IDs confirmed via SportsAPIPro docs (Canonical IDs page) for the top 8,
 * and via GET /v2/football/search?q=... for the remaining four — NOT the
 * v1 /football/search endpoint, whose "competitions[].id" values are a
 * different, incompatible ID space from v2's uniqueTournament.id despite
 * the docs implying equivalence (verified live: v1 search returned id=57
 * for "Eredivisie", but v2 tournament 57 is actually a German handball cup).
 * Always confirm a v1-search-derived ID against v2 before trusting it.
 */
const LEAGUE_TOURNAMENT_IDS: Record<string, number> = {
  "Premier League": 17,
  "La Liga": 8,
  Bundesliga: 35,
  "Serie A": 23,
  "Ligue 1": 34,
  "Champions League": 7,
  "Europa League": 679,
  Championship: 18,
  Eredivisie: 37,
  "Primeira Liga": 238,
  "Scottish Premiership": 36,
  "World Cup": 16,
};

interface RawTeam {
  id: number;
  name: string;
}

interface RawScore {
  current?: number;
}

interface RawStatus {
  code: number;
  description: string;
  /** "notstarted" | "inprogress" | "finished" | "postponed" | "canceled" | "abandoned" | "interrupted" */
  type: string;
}

interface RawEvent {
  id: number;
  tournament: { name: string };
  season?: { name?: string; year?: string };
  homeTeam: RawTeam;
  awayTeam: RawTeam;
  homeScore?: RawScore;
  awayScore?: RawScore;
  status: RawStatus;
  startTimestamp: number; // unix seconds
}

interface SeasonsResponse {
  success: boolean;
  seasons?: { id: number; name: string; year: string }[];
}

interface EventsResponse {
  success: boolean;
  error?: string | { code: string; message: string };
  data?: { events?: RawEvent[] };
}

function mapStatus(status: RawStatus): Fixture["status"] {
  switch (status.type) {
    case "inprogress":
      return "live";
    case "finished":
      return "finished";
    case "postponed":
      return "postponed";
    case "canceled":
    case "cancelled":
    case "abandoned":
    case "interrupted":
      return "cancelled";
    case "notstarted":
    default:
      return "scheduled";
  }
}

function mapRawEvent(raw: RawEvent): Omit<Fixture, "id" | "source"> {
  const started = raw.status.type !== "notstarted";
  return {
    externalId: String(raw.id),
    league: raw.tournament.name,
    season: raw.season?.year ?? raw.season?.name,
    homeTeam: raw.homeTeam.name,
    awayTeam: raw.awayTeam.name,
    kickoff: new Date(raw.startTimestamp * 1000).toISOString(),
    status: mapStatus(raw.status),
    homeScore: started ? raw.homeScore?.current : undefined,
    awayScore: started ? raw.awayScore?.current : undefined,
  };
}

/**
 * Resolve the current seasonId for a tournament, cached 24h in
 * sportsapipro_season_cache. Returns null if resolution fails (caller
 * should skip that league for this refresh rather than fail the whole
 * batch).
 */
async function resolveSeasonId(tournamentId: number, apiKey: string): Promise<number | null> {
  const supabase = createAdminClient();

  const { data: cached } = await supabase
    .from("sportsapipro_season_cache")
    .select("season_id, fetched_at")
    .eq("tournament_id", tournamentId)
    .maybeSingle();

  if (cached && Date.now() - new Date(cached.fetched_at).getTime() < SEASON_CACHE_TTL_MS) {
    return cached.season_id;
  }

  try {
    const res = await fetch(`${BASE_URL}/tournaments/${tournamentId}/seasons`, {
      headers: { "x-api-key": apiKey, accept: "application/json" },
    });
    if (!res.ok) return cached?.season_id ?? null;

    const json = (await res.json()) as SeasonsResponse;
    const current = json.seasons?.[0]; // most recent season is first
    if (!json.success || !current) return cached?.season_id ?? null;

    await supabase.from("sportsapipro_season_cache").upsert(
      {
        tournament_id: tournamentId,
        season_id: current.id,
        season_name: current.name,
        fetched_at: new Date().toISOString(),
      },
      { onConflict: "tournament_id" }
    );

    return current.id;
  } catch (err) {
    console.warn(`[sports-data/sportsapipro] season resolution failed for tournament ${tournamentId}:`, err);
    return cached?.season_id ?? null;
  }
}

/**
 * Fetch upcoming events for one league. Returns [] on any failure — a
 * single league's outage shouldn't fail the whole batch.
 */
async function fetchLeagueUpcoming(
  league: string,
  tournamentId: number,
  apiKey: string
): Promise<RawEvent[]> {
  const seasonId = await resolveSeasonId(tournamentId, apiKey);
  if (seasonId === null) return [];

  try {
    const res = await fetch(
      `${BASE_URL}/tournament/${tournamentId}/season/${seasonId}/events/next/0`,
      { headers: { "x-api-key": apiKey, accept: "application/json" } }
    );
    if (!res.ok) return [];

    const json = (await res.json()) as EventsResponse;
    if (!json.success || !json.data?.events) return [];
    return json.data.events;
  } catch (err) {
    console.warn(`[sports-data/sportsapipro] events fetch failed for ${league}:`, err);
    return [];
  }
}

/**
 * Fetch football fixtures from SportsAPIPro — the primary source.
 *
 * Reads from the adaptive 1–2 hour cache before spending requests against
 * the 100/day free-plan budget. Go through lib/sports-data/router.ts rather
 * than calling this directly, so quota tracking and fallback stay consistent.
 */
export async function getSportsApiProFixtures(options?: {
  league?: string;
  search?: string;
  forceRefresh?: boolean;
}): Promise<FixturesResult> {
  if (!options?.forceRefresh) {
    const { fixtures, shouldRefresh } = await getCachedFixtures(SOURCE, {
      league: options?.league,
      search: options?.search,
    });

    if (!shouldRefresh) {
      return { success: true, fixtures, source: SOURCE, fromCache: true };
    }
    // shouldRefresh=true: this caller holds the lock, must hit the API.
  }

  const apiKey = process.env.SPORTSAPIPRO_API_KEY;
  if (!apiKey) {
    console.warn(
      "[sports-data/sportsapipro] SPORTSAPIPRO_API_KEY is not set — cannot fetch fixtures."
    );
    await releaseFixturesLock(SOURCE);
    return { success: false, error: "Match data is not configured yet" };
  }

  try {
    const leagues = Object.entries(LEAGUE_TOURNAMENT_IDS);

    const results = await Promise.all(
      leagues.map(async ([league, tournamentId]) => {
        const events = await fetchLeagueUpcoming(league, tournamentId, apiKey);
        // One quota unit per league request (season resolution is cached
        // separately and only counts against quota when it actually misses).
        await recordApiUsage(SOURCE);
        return events;
      })
    );

    const allRaw = results.flat();

    if (allRaw.length === 0) {
      await releaseFixturesLock(SOURCE);
      return { success: false, error: "No fixture data returned from SportsAPIPro" };
    }

    const mapped = allRaw.map(mapRawEvent);

    // Persist the full unfiltered batch so every league/search combo pulls
    // from the same cache write.
    await writeFixturesCache(
      SOURCE,
      mapped,
      allRaw.map((e) => e as unknown as Record<string, unknown>)
    );

    let filtered = mapped;
    if (options?.league) {
      const lc = options.league.toLowerCase();
      filtered = filtered.filter((f) => f.league.toLowerCase().includes(lc));
    }
    if (options?.search) {
      const needle = options.search.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.homeTeam.toLowerCase().includes(needle) ||
          f.awayTeam.toLowerCase().includes(needle)
      );
    }
    filtered.sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());

    const fixtures: Fixture[] = filtered.map((f) => ({
      ...f,
      id: f.externalId,
      source: SOURCE,
    }));

    return { success: true, fixtures, source: SOURCE, fromCache: false };
  } catch (err) {
    await releaseFixturesLock(SOURCE);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error fetching fixtures",
    };
  }
}
