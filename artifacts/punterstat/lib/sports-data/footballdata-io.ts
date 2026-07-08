import { getCachedFixtures, writeFixturesCache, releaseFixturesLock } from "./cache";
import { recordApiUsage } from "./router";
import type { Fixture, FixturesResult } from "./types";

const BASE_URL = "https://footballdata.io/api/v1";
const SOURCE = "footballdata-io" as const;

/**
 * Leagues available on the free plan, keyed by a human-readable name so
 * callers can filter without knowing internal league IDs.
 */
const FREE_LEAGUES: Record<number, string> = {
  15: "Premier League",
  10: "La Liga",
  45: "UEFA Champions League",
  46: "UEFA Europa League",
  50: "World Cup",
};

interface RawMatch {
  match_id: number;
  match_date: string;
  date_unix: number;
  status: string; // "incomplete" | "live" | "complete" | "cancelled" | "postponed"
  status_localized: string;
  league: {
    league_id: number;
    name: string;
    country: string;
    competition_name: string;
  };
  season: { season_id: number; year: number };
  home_team: { team_id: number; team_name: string };
  away_team: { team_id: number; team_name: string };
  score: { home: number; away: number; total_goals: number };
  odds?: { home_win: number; draw: number; away_win: number };
  probabilities?: { home_win: number; draw: number; away_win: number };
}

interface RawResponse {
  success: boolean;
  data?: { from: string; to: string | null; matches: RawMatch[] };
  error?: { code: string; message: string };
  meta?: { requests_used: number; requests_limit: number; requests_remaining: number };
}

function mapStatus(status: string): Fixture["status"] {
  switch (status) {
    case "incomplete":  return "scheduled";
    case "live":        return "live";
    case "complete":    return "finished";
    case "postponed":   return "postponed";
    case "cancelled":
    case "suspended":   return "cancelled";
    default:            return "scheduled";
  }
}

function mapRawMatch(raw: RawMatch): Omit<Fixture, "id" | "source"> {
  return {
    externalId: String(raw.match_id),
    league: raw.league.competition_name || raw.league.name,
    season: String(raw.season.year),
    homeTeam: raw.home_team.team_name,
    awayTeam: raw.away_team.team_name,
    kickoff: new Date(raw.date_unix * 1000).toISOString(),
    status: mapStatus(raw.status),
    homeScore: raw.status === "incomplete" ? undefined : raw.score.home,
    awayScore: raw.status === "incomplete" ? undefined : raw.score.away,
  };
}

/**
 * Fetch fixtures from footballdata.io — the monthly-capped fallback source.
 *
 * The router now tries football-data.org first (no monthly limit); this function
 * is called only when the primary fails or the league is outside its top-5
 * coverage. Reads from the adaptive 1–2 hour cache before spending a credit.
 *
 * This function acquires the cache refresh lock when it hits the API. If the
 * API call fails, it releases the lock and falls back to stale data.
 *
 * Go through lib/sports-data/router.ts rather than calling this directly.
 */
export async function getFootballDataIoFixtures(options?: {
  league?: string;
  search?: string;
  forceRefresh?: boolean;
}): Promise<FixturesResult> {
  // Adaptive cache check — respects 1h soft / 2h hard TTL with SWR lock.
  if (!options?.forceRefresh) {
    const { fixtures, shouldRefresh } = await getCachedFixtures(SOURCE, {
      league: options?.league,
      search: options?.search,
    });

    if (!shouldRefresh) {
      // Fresh or stale-while-revalidate.
      return { success: true, fixtures, source: SOURCE, fromCache: true };
    }
    // shouldRefresh=true: this caller holds the lock, must hit the API.
  }

  const apiKey = process.env.FOOTBALLDATA_IO_API_KEY;
  if (!apiKey) {
    console.warn(
      "[sports-data/footballdata-io] FOOTBALLDATA_IO_API_KEY is not set — cannot fetch live fixtures."
    );
    await releaseFixturesLock(SOURCE);
    return { success: false, error: "Match data is not configured yet" };
  }

  try {
    // Fetch upcoming fixtures for all free-plan leagues in parallel, then merge.
    const leagueIds = Object.keys(FREE_LEAGUES).map(Number);

    const responses = await Promise.all(
      leagueIds.map((id) =>
        fetch(`${BASE_URL}/fixtures/upcoming?league_id=${id}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
          next: { revalidate: 0 }, // always rely on our Supabase cache
        })
          .then((r) => r.json() as Promise<RawResponse>)
          .catch((err) => {
            console.warn(`[sports-data/footballdata-io] league ${id} fetch error:`, err);
            return null;
          })
      )
    );

    // Record one quota unit per batch (not per individual league request).
    await recordApiUsage(SOURCE);

    const allRaw: RawMatch[] = [];
    for (const res of responses) {
      if (res && res.success && res.data?.matches) {
        allRaw.push(...res.data.matches);
      }
    }

    if (allRaw.length === 0) {
      const firstError = responses.find((r) => r && !r.success);
      await releaseFixturesLock(SOURCE);
      return {
        success: false,
        error: firstError?.error?.message ?? "No fixture data returned from footballdata.io",
      };
    }

    const mapped = allRaw.map(mapRawMatch);

    // Persist ALL matches (unfiltered) so every league/search combo is covered
    // from the same cache batch.
    await writeFixturesCache(
      SOURCE,
      mapped,
      allRaw.map((r) => r as unknown as Record<string, unknown>)
    );

    // Apply caller-supplied filters after writing the full batch.
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
