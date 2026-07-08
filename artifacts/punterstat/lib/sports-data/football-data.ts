import { getCachedFixtures, writeFixturesCache, releaseFixturesLock } from "./cache";
import { recordApiUsage } from "./router";
import type { Fixture, FixturesResult } from "./types";

const FOOTBALL_DATA_BASE = "https://api.football-data.org/v4";
const SOURCE = "football-data" as const;

// football-data.org's free tier only covers these competitions.
// 10 req/min rate limit, no monthly cap — this is the primary (unlimited) source.
const SUPPORTED_COMPETITIONS = ["PL", "PD", "SA", "BL1", "FL1"] as const;

interface RawMatch {
  id: number;
  utcDate: string;
  status: string;
  competition: { name: string };
  season: { startDate: string };
  homeTeam: { name: string };
  awayTeam: { name: string };
  score: {
    fullTime: { home: number | null; away: number | null };
  };
}

function mapStatus(status: string): Fixture["status"] {
  if (status === "SCHEDULED" || status === "TIMED") return "scheduled";
  if (status === "IN_PLAY" || status === "PAUSED") return "live";
  if (status === "FINISHED") return "finished";
  if (status === "POSTPONED") return "postponed";
  if (status === "CANCELLED" || status === "SUSPENDED" || status === "AWARDED") return "cancelled";
  return "scheduled";
}

function mapRawMatch(raw: RawMatch): Omit<Fixture, "id" | "source"> {
  return {
    externalId: String(raw.id),
    league: raw.competition.name,
    season: raw.season.startDate.slice(0, 4),
    homeTeam: raw.homeTeam.name,
    awayTeam: raw.awayTeam.name,
    kickoff: raw.utcDate,
    status: mapStatus(raw.status),
    homeScore: raw.score.fullTime.home ?? undefined,
    awayScore: raw.score.fullTime.away ?? undefined,
  };
}

/**
 * Fetch fixtures from football-data.org — the PRIMARY source.
 *
 * football-data.org has a 10 req/min rate limit but NO monthly cap, making it
 * the right primary choice. The 1–2 hour adaptive cache means we typically
 * issue only 1 API call per cache group per hour regardless of traffic, well
 * within the 10 req/min ceiling.
 *
 * Covers top-5 leagues: PL, La Liga, Bundesliga, Serie A, Ligue 1.
 * If a request falls outside these leagues, the router falls back to
 * footballdata.io (monthly-capped).
 *
 * Go through lib/sports-data/router.ts rather than calling this directly.
 */
export async function getFootballDataFixtures(options?: {
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

  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    console.warn(
      "[sports-data/football-data] FOOTBALL_DATA_API_KEY is not set — cannot fetch live fixtures."
    );
    await releaseFixturesLock(SOURCE);
    return { success: false, error: "Match data is not configured yet" };
  }

  try {
    const url = new URL(`${FOOTBALL_DATA_BASE}/matches`);
    url.searchParams.set("competitions", SUPPORTED_COMPETITIONS.join(","));

    const res = await fetch(url.toString(), {
      headers: { "X-Auth-Token": apiKey },
    });

    await recordApiUsage(SOURCE);

    if (!res.ok) {
      const body = await res.text();
      await releaseFixturesLock(SOURCE);
      return {
        success: false,
        error: `football-data.org error ${res.status}: ${body.slice(0, 200)}`,
      };
    }

    const json = (await res.json()) as { matches: RawMatch[] };
    const mapped = json.matches.map(mapRawMatch);

    // Persist ALL matches (unfiltered) so every league/search combo is covered
    // from the same cache batch.
    await writeFixturesCache(
      SOURCE,
      mapped,
      json.matches.map((m) => m as unknown as Record<string, unknown>)
    );

    // Apply caller-supplied filters after writing the full batch.
    let filtered = mapped;
    if (options?.league) {
      filtered = filtered.filter(
        (f) => f.league.toLowerCase() === options.league!.toLowerCase()
      );
    }
    if (options?.search) {
      const needle = options.search.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.homeTeam.toLowerCase().includes(needle) ||
          f.awayTeam.toLowerCase().includes(needle)
      );
    }

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
