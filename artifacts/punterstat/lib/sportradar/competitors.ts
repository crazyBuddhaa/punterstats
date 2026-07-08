/**
 * Sportradar Soccer v4 — Competitor (club) & Player endpoints
 *
 * Endpoints:
 *   GET /{locale}/competitors/{urn}/profile                     → getCompetitorProfile
 *   GET /{locale}/competitors/{urn}/schedules                   → getCompetitorSchedules
 *   GET /{locale}/competitors/{urn}/summaries                   → getCompetitorSummaries
 *   GET /{locale}/competitors/{urn}/versus/{urn}/summaries      → getH2HSummaries
 *   GET /{locale}/competitors/mappings                          → getCompetitorMappings
 *   GET /{locale}/competitors/merge_mappings                    → getCompetitorMergeMappings
 *   GET /{locale}/players/{urn}/profile                         → getPlayerProfile
 *   GET /{locale}/players/{urn}/schedules                       → getPlayerSchedules
 *   GET /{locale}/players/{urn}/summaries                       → getPlayerSummaries
 *   GET /{locale}/players/mappings                              → getPlayerMappings
 *   GET /{locale}/players/merge_mappings                        → getPlayerMergeMappings
 *   GET /{locale}/schedules/{date}/schedules                    → getDailySchedules
 *   GET /{locale}/schedules/{date}/summaries                    → getDailySummaries
 */

import { srFetch, srPath, getDefaultLocale } from "./client";
import type {
  CompetitorProfileResponse,
  CompetitorSchedulesResponse,
  CompetitorSummariesResponse,
  CompetitorVersusSummariesResponse,
  MappingsResponse,
  MergeMappingsResponse,
  PlayerProfileResponse,
  PlayerSchedulesResponse,
  PlayerSummariesResponse,
  ScheduleSchedulesResponse,
  ScheduleSummariesResponse,
} from "./types";

type Locale = string;

// ── Competitor (club) ─────────────────────────────────────────────────────────

/**
 * Club profile — name, country, venue, manager, full squad.
 * Squad depth depends on tier; Tier 1/2 gives full roster with player details.
 */
export async function getCompetitorProfile(
  competitorId: string,
  locale: Locale = getDefaultLocale()
) {
  return srFetch<CompetitorProfileResponse>(
    srPath(locale, `/competitors/${competitorId}/profile`)
  );
}

/** Last 30 results and all upcoming fixtures for a club */
export async function getCompetitorSchedules(
  competitorId: string,
  locale: Locale = getDefaultLocale()
) {
  return srFetch<CompetitorSchedulesResponse>(
    srPath(locale, `/competitors/${competitorId}/schedules`)
  );
}

/** Last 30 result summaries (with stats) and upcoming fixtures for a club */
export async function getCompetitorSummaries(
  competitorId: string,
  locale: Locale = getDefaultLocale()
) {
  return srFetch<CompetitorSummariesResponse>(
    srPath(locale, `/competitors/${competitorId}/summaries`)
  );
}

/**
 * Head-to-head: last 10 results and next 10 fixtures between two clubs.
 * Crosses competitions and seasons — ideal for H2H widgets on match preview pages.
 */
export async function getH2HSummaries(
  competitorId1: string,
  competitorId2: string,
  locale: Locale = getDefaultLocale()
) {
  return srFetch<CompetitorVersusSummariesResponse>(
    srPath(locale, `/competitors/${competitorId1}/versus/${competitorId2}/summaries`)
  );
}

/** External ID → Sportradar URN mapping for clubs */
export async function getCompetitorMappings(
  opts: { offset?: number; limit?: number; start?: number; locale?: Locale } = {}
) {
  const { locale = getDefaultLocale(), ...params } = opts;
  return srFetch<MappingsResponse>(
    srPath(locale, "/competitors/mappings"),
    { params }
  );
}

/** Old → new ID pairs for clubs that have been merged in the Sportradar system */
export async function getCompetitorMergeMappings(locale: Locale = getDefaultLocale()) {
  return srFetch<MergeMappingsResponse>(srPath(locale, "/competitors/merge_mappings"));
}

// ── Player ────────────────────────────────────────────────────────────────────

/**
 * Full player profile — DOB, nationality, height/weight, position, jersey
 * number, plus current club and historical roles (useful for transfer tracking).
 */
export async function getPlayerProfile(
  playerId: string,
  locale: Locale = getDefaultLocale()
) {
  return srFetch<PlayerProfileResponse>(
    srPath(locale, `/players/${playerId}/profile`)
  );
}

/** Last 10 fixtures the player participated in */
export async function getPlayerSchedules(
  playerId: string,
  locale: Locale = getDefaultLocale()
) {
  return srFetch<PlayerSchedulesResponse>(
    srPath(locale, `/players/${playerId}/schedules`)
  );
}

/** Last 10 match summaries (with stats) the player appeared in */
export async function getPlayerSummaries(
  playerId: string,
  locale: Locale = getDefaultLocale()
) {
  return srFetch<PlayerSummariesResponse>(
    srPath(locale, `/players/${playerId}/summaries`)
  );
}

/** External ID → Sportradar URN mapping for players */
export async function getPlayerMappings(
  opts: { offset?: number; limit?: number; start?: number; locale?: Locale } = {}
) {
  const { locale = getDefaultLocale(), ...params } = opts;
  return srFetch<MappingsResponse>(
    srPath(locale, "/players/mappings"),
    { params }
  );
}

/** Old → new ID pairs for players that have been merged */
export async function getPlayerMergeMappings(locale: Locale = getDefaultLocale()) {
  return srFetch<MergeMappingsResponse>(srPath(locale, "/players/merge_mappings"));
}

// ── Daily schedule ────────────────────────────────────────────────────────────

/**
 * All fixtures on a given date across all licensed competitions.
 *
 * @param date YYYY-MM-DD
 */
export async function getDailySchedules(
  date: string,
  opts: { offset?: number; limit?: number; locale?: Locale } = {}
) {
  const { locale = getDefaultLocale(), ...params } = opts;
  return srFetch<ScheduleSchedulesResponse>(
    srPath(locale, `/schedules/${date}/schedules`),
    { params }
  );
}

/**
 * All match summaries (results + stats) on a given date.
 *
 * @param date YYYY-MM-DD
 */
export async function getDailySummaries(
  date: string,
  opts: { offset?: number; limit?: number; locale?: Locale } = {}
) {
  const { locale = getDefaultLocale(), ...params } = opts;
  return srFetch<ScheduleSummariesResponse>(
    srPath(locale, `/schedules/${date}/summaries`),
    { params }
  );
}
