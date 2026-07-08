/**
 * Sportradar Soccer v4 — Season data endpoints
 *
 * Endpoints:
 *   GET /{locale}/seasons/{urn}/schedules            → getSeasonSchedules
 *   GET /{locale}/seasons/{urn}/summaries            → getSeasonSummaries
 *   GET /{locale}/seasons/{urn}/standings            → getSeasonStandings
 *   GET /{locale}/seasons/{urn}/form_standings       → getSeasonFormStandings
 *   GET /{locale}/seasons/{urn}/probabilities        → getSeasonProbabilities
 *   GET /{locale}/seasons/{urn}/leaders              → getSeasonLeaders
 *   GET /{locale}/seasons/{urn}/lineups              → getSeasonLineups
 *   GET /{locale}/seasons/{urn}/missing_players      → getSeasonMissingPlayers
 *   GET /{locale}/seasons/{urn}/players              → getSeasonPlayers
 *   GET /{locale}/seasons/{urn}/transfers            → getSeasonTransfers
 *   GET /{locale}/seasons/{urn}/over_under_statistics → getSeasonOverUnderStats
 *
 * Rate: all cached 5–30 min. Pull at most once per TTL.
 * Pagination: summaries/schedules/players use offset+limit+start (max 200/page).
 */

import { srFetch, srPath, getDefaultLocale } from "./client";
import type {
  SeasonSchedulesResponse,
  SeasonSummariesResponse,
  SeasonStandingsResponse,
  SeasonFormStandingsResponse,
  SeasonProbabilitiesResponse,
  SeasonLeadersResponse,
  SeasonLineupsResponse,
  SeasonMissingPlayersResponse,
  SeasonPlayersResponse,
  SeasonTransfersResponse,
  SeasonOverUnderStatisticsResponse,
} from "./types";

type Locale = string;

// ── Pagination helper ─────────────────────────────────────────────────────────

interface Pageable {
  offset?: number;
  limit?: number;
  start?: number;
  locale?: Locale;
}

/** Fetch ALL pages of a paginated season endpoint automatically */
async function fetchAllPages<T extends { summaries?: unknown[]; schedules?: unknown[]; players?: unknown[] }>(
  fetcher: (offset: number) => Promise<T>,
  key: keyof T,
  pageSize = 200
): Promise<T> {
  let offset = 0;
  let first: T | null = null;
  let items: unknown[] = [];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const page = await fetcher(offset);
    if (!first) first = page;
    const batch = page[key] as unknown[] | undefined;
    if (!batch || batch.length === 0) break;
    items = items.concat(batch);
    if (batch.length < pageSize) break;
    offset += pageSize;
  }

  return { ...first!, [key]: items };
}

// ── Endpoints ────────────────────────────────────────────────────────────────

/** Full season schedule — all fixtures regardless of status */
export async function getSeasonSchedules(
  seasonId: string,
  locale: Locale = getDefaultLocale()
) {
  return srFetch<SeasonSchedulesResponse>(
    srPath(locale, `/seasons/${seasonId}/schedules`)
  );
}

/**
 * Season summaries (results + stats).
 * Pass `allPages: true` to automatically page through the full season.
 */
export async function getSeasonSummaries(
  seasonId: string,
  opts: Pageable & { allPages?: boolean } = {}
) {
  const { locale = getDefaultLocale(), allPages = false, ...params } = opts;

  if (allPages) {
    return fetchAllPages<SeasonSummariesResponse>(
      (offset) =>
        srFetch<SeasonSummariesResponse>(
          srPath(locale, `/seasons/${seasonId}/summaries`),
          { params: { ...params, offset, limit: 200 } }
        ),
      "summaries"
    );
  }

  return srFetch<SeasonSummariesResponse>(
    srPath(locale, `/seasons/${seasonId}/summaries`),
    { params }
  );
}

/**
 * Season standings.
 * @param live Pass true during a match day to get live-updated standings
 */
export async function getSeasonStandings(
  seasonId: string,
  opts: { round?: number; live?: boolean; locale?: Locale } = {}
) {
  const { locale = getDefaultLocale(), ...params } = opts;
  return srFetch<SeasonStandingsResponse>(
    srPath(locale, `/seasons/${seasonId}/standings`),
    { params }
  );
}

/**
 * Form standings — recent form over last N matches (default 6, max 10).
 * Shows W/D/L run for each club.
 */
export async function getSeasonFormStandings(
  seasonId: string,
  opts: { round?: number; limit?: number; locale?: Locale } = {}
) {
  const { locale = getDefaultLocale(), ...params } = opts;
  return srFetch<SeasonFormStandingsResponse>(
    srPath(locale, `/seasons/${seasonId}/form_standings`),
    { params }
  );
}

/**
 * Sportradar's modelled H/D/A win probabilities for every fixture in the
 * season. The standout endpoint for PunterStat — compare these with your
 * own calibrated probabilities to surface value gaps.
 */
export async function getSeasonProbabilities(
  seasonId: string,
  locale: Locale = getDefaultLocale()
) {
  return srFetch<SeasonProbabilitiesResponse>(
    srPath(locale, `/seasons/${seasonId}/probabilities`)
  );
}

/** Top scorers, assisters, yellow/red cards, clean sheets for a season */
export async function getSeasonLeaders(
  seasonId: string,
  locale: Locale = getDefaultLocale()
) {
  return srFetch<SeasonLeadersResponse>(
    srPath(locale, `/seasons/${seasonId}/leaders`)
  );
}

/** All match lineups (and formations) for a season — paginated */
export async function getSeasonLineups(
  seasonId: string,
  opts: Pageable = {}
) {
  const { locale = getDefaultLocale(), ...params } = opts;
  return srFetch<SeasonLineupsResponse>(
    srPath(locale, `/seasons/${seasonId}/lineups`),
    { params }
  );
}

/**
 * Missing players (injured, suspended, ill) for all clubs in the season.
 * Tier 1 only. Excellent for pre-match analysis.
 */
export async function getSeasonMissingPlayers(
  seasonId: string,
  locale: Locale = getDefaultLocale()
) {
  return srFetch<SeasonMissingPlayersResponse>(
    srPath(locale, `/seasons/${seasonId}/missing_players`)
  );
}

/** All players registered for a season — paginated */
export async function getSeasonPlayers(
  seasonId: string,
  opts: Pageable & { allPages?: boolean } = {}
) {
  const { locale = getDefaultLocale(), allPages = false, ...params } = opts;

  if (allPages) {
    return fetchAllPages<SeasonPlayersResponse>(
      (offset) =>
        srFetch<SeasonPlayersResponse>(
          srPath(locale, `/seasons/${seasonId}/players`),
          { params: { ...params, offset, limit: 200 } }
        ),
      "players"
    );
  }

  return srFetch<SeasonPlayersResponse>(
    srPath(locale, `/seasons/${seasonId}/players`),
    { params }
  );
}

/** Transfer activity (in/out) across the season */
export async function getSeasonTransfers(
  seasonId: string,
  locale: Locale = getDefaultLocale()
) {
  return srFetch<SeasonTransfersResponse>(
    srPath(locale, `/seasons/${seasonId}/transfers`)
  );
}

/** Over/under 2.5 goals stats for each team across the season */
export async function getSeasonOverUnderStats(
  seasonId: string,
  locale: Locale = getDefaultLocale()
) {
  return srFetch<SeasonOverUnderStatisticsResponse>(
    srPath(locale, `/seasons/${seasonId}/over_under_statistics`)
  );
}
