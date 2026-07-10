import { getCachedFixtures, writeFixturesCache, releaseFixturesLock } from "./cache";
import { recordApiUsage } from "./router";
import type { Fixture, FixturesResult } from "./types";

/**
 * SportsAPIPro — free-plan primary source for football fixtures.
 *
 * Free plan is capped at 100 requests/day, but the adaptive cache (1h soft /
 * 2h hard TTL, shared with the other sports-data sources) keeps actual usage
 * to roughly one call per cache group per hour, well within budget.
 *
 * Auth:  x-api-key header
 * Docs:  https://docs.sportsapipro.com
 */
const BASE_URL = "https://api.sportsapipro.com/v1/football";
const SOURCE = "sportsapipro" as const;

interface RawCompetitor {
  id: number;
  name: string;
  score: number; // -1 when the game hasn't started yet
}

interface RawGame {
  id: number;
  competitionDisplayName: string;
  seasonNum: number;
  startTime: string; // ISO 8601
  statusGroup: number; // 2 = scheduled, 3 = live, 4 = ended/postponed/cancelled
  statusText: string; // e.g. "Scheduled" | "1st Half" | "Finished" | "Postponed" | "Cancelled"
  homeCompetitor: RawCompetitor;
  awayCompetitor: RawCompetitor;
}

interface RawResponse {
  success: boolean;
  error?: string;
  message?: string;
  data?: { games: RawGame[] };
}

function mapStatus(raw: RawGame): Fixture["status"] {
  const text = raw.statusText.toLowerCase();
  if (text.includes("postponed")) return "postponed";
  if (text.includes("cancel") || text.includes("abandon")) return "cancelled";
  if (raw.statusGroup === 3) return "live";
  if (raw.statusGroup === 4) return "finished";
  return "scheduled";
}

function mapRawGame(raw: RawGame): Omit<Fixture, "id" | "source"> {
  const started = raw.homeCompetitor.score >= 0;
  return {
    externalId: String(raw.id),
    league: raw.competitionDisplayName,
    season: String(raw.seasonNum),
    homeTeam: raw.homeCompetitor.name,
    awayTeam: raw.awayCompetitor.name,
    kickoff: raw.startTime,
    status: mapStatus(raw),
    homeScore: started ? raw.homeCompetitor.score : undefined,
    awayScore: started ? raw.awayCompetitor.score : undefined,
  };
}

/**
 * Fetch football fixtures from SportsAPIPro — the primary source.
 *
 * Reads from the adaptive 1–2 hour cache before spending a request against
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
    // "all" covers today's full slate (scheduled + live + finished) across
    // every competition on the free plan in a single request.
    const res = await fetch(`${BASE_URL}/all`, {
      headers: { "x-api-key": apiKey, accept: "application/json" },
      next: { revalidate: 0 }, // always rely on our Supabase cache, not fetch cache
    });

    await recordApiUsage(SOURCE);

    if (!res.ok) {
      const body = await res.text().catch(() => "(no body)");
      await releaseFixturesLock(SOURCE);
      return { success: false, error: `SportsAPIPro error ${res.status}: ${body}` };
    }

    const json = (await res.json()) as RawResponse;
    if (!json.success || !json.data?.games) {
      await releaseFixturesLock(SOURCE);
      return {
        success: false,
        error: json.message ?? json.error ?? "No fixture data returned from SportsAPIPro",
      };
    }

    const mapped = json.data.games.map(mapRawGame);

    // Persist the full unfiltered batch so every league/search combo pulls
    // from the same cache write.
    await writeFixturesCache(
      SOURCE,
      mapped,
      json.data.games.map((g) => g as unknown as Record<string, unknown>)
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
