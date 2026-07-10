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
 * Base URL is versioned + sport-scoped by subdomain (per official docs):
 *   https://v2.football.sportsapipro.com/api/...
 * Auth:  x-api-key header
 * Docs:  https://docs.sportsapipro.com
 */
const BASE_URL = "https://v2.football.sportsapipro.com/api";
const SOURCE = "sportsapipro" as const;

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
  slug: string;
  tournament: { name: string };
  season?: { name?: string; year?: string };
  homeTeam: RawTeam;
  awayTeam: RawTeam;
  homeScore?: RawScore;
  awayScore?: RawScore;
  status: RawStatus;
  startTimestamp: number; // unix seconds
}

interface RawResponse {
  success: boolean;
  error?: string | { code: string; message: string };
  events?: RawEvent[];
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
    // /today covers the full day's slate (scheduled + live + finished) for
    // football in a single request.
    const res = await fetch(`${BASE_URL}/today`, {
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
    if (!json.success || !json.events) {
      await releaseFixturesLock(SOURCE);
      const errMsg =
        typeof json.error === "string"
          ? json.error
          : json.error?.message ?? "No fixture data returned from SportsAPIPro";
      return { success: false, error: errMsg };
    }

    const mapped = json.events.map(mapRawEvent);

    // Persist the full unfiltered batch so every league/search combo pulls
    // from the same cache write.
    await writeFixturesCache(
      SOURCE,
      mapped,
      json.events.map((e) => e as unknown as Record<string, unknown>)
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
