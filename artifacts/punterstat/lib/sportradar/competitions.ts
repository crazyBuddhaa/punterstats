/**
 * Sportradar Soccer v4 — Competition & Season endpoints
 *
 * Endpoints:
 *   GET /{locale}/competitions                            → getCompetitions
 *   GET /{locale}/competitions/{urn}/info                → getCompetitionInfo
 *   GET /{locale}/competitions/{urn}/seasons             → getCompetitionSeasons
 *   GET /{locale}/seasons                                → getSeasons
 *   GET /{locale}/seasons/{urn}/info                     → getSeasonInfo
 *   GET /{locale}/seasons/{urn}/competitors              → getSeasonCompetitors
 *   GET /{locale}/seasons/{urn}/competitor_players       → getSeasonCompetitorPlayers
 *   GET /{locale}/seasons/{urn}/competitors/{urn}/stats  → getSeasonCompetitorStatistics
 *   GET /{locale}/seasons/{urn}/stages_groups_cup_rounds → getSeasonBrackets
 *   GET /{locale}/seasons/{urn}/simple_team_mappings     → getSeasonSimpleTeamMappings
 *   GET /{locale}/seasons/{urn}/simple_tournament_mappings → getSeasonSimpleTournamentMappings
 *   GET /{locale}/seasons_disabled                       → getSeasonsDisabled
 */

import { srFetch, srPath, getDefaultLocale } from "./client";
import type {
  CompetitionsResponse,
  CompetitionInfoResponse,
  CompetitionSeasonsResponse,
  SeasonsResponse,
  SeasonInfoResponse,
  SeasonCompetitorsResponse,
  SeasonCompetitorPlayersResponse,
  SeasonCompetitorStatisticsResponse,
  SeasonBracketsResponse,
  SimpleTeamMappingsResponse,
  SimpleTournamentMappingsResponse,
} from "./types";

type Locale = string;

/** List all competitions your API key is licensed for */
export async function getCompetitions(locale: Locale = getDefaultLocale()) {
  return srFetch<CompetitionsResponse>(srPath(locale, "/competitions"));
}

/** Detailed info (groups, coverage) for one competition */
export async function getCompetitionInfo(
  competitionId: string,
  locale: Locale = getDefaultLocale()
) {
  return srFetch<CompetitionInfoResponse>(
    srPath(locale, `/competitions/${competitionId}/info`)
  );
}

/** All historical and current seasons for a competition */
export async function getCompetitionSeasons(
  competitionId: string,
  locale: Locale = getDefaultLocale()
) {
  return srFetch<CompetitionSeasonsResponse>(
    srPath(locale, `/competitions/${competitionId}/seasons`)
  );
}

/** List all seasons your key can access */
export async function getSeasons(locale: Locale = getDefaultLocale()) {
  return srFetch<SeasonsResponse>(srPath(locale, "/seasons"));
}

/** Summary info (teams, groups) for one season */
export async function getSeasonInfo(
  seasonId: string,
  locale: Locale = getDefaultLocale()
) {
  return srFetch<SeasonInfoResponse>(srPath(locale, `/seasons/${seasonId}/info`));
}

/** List of clubs participating in a season */
export async function getSeasonCompetitors(
  seasonId: string,
  opts: { offset?: number; limit?: number; start?: number; locale?: Locale } = {}
) {
  const { locale = getDefaultLocale(), ...params } = opts;
  return srFetch<SeasonCompetitorsResponse>(
    srPath(locale, `/seasons/${seasonId}/competitors`),
    { params }
  );
}

/** All clubs + their full squads for a season */
export async function getSeasonCompetitorPlayers(
  seasonId: string,
  opts: { offset?: number; limit?: number; start?: number; locale?: Locale } = {}
) {
  const { locale = getDefaultLocale(), ...params } = opts;
  return srFetch<SeasonCompetitorPlayersResponse>(
    srPath(locale, `/seasons/${seasonId}/competitor_players`),
    { params }
  );
}

/** Season aggregate stats for one club and all its players */
export async function getSeasonCompetitorStatistics(
  seasonId: string,
  competitorId: string,
  locale: Locale = getDefaultLocale()
) {
  return srFetch<SeasonCompetitorStatisticsResponse>(
    srPath(locale, `/seasons/${seasonId}/competitors/${competitorId}/statistics`)
  );
}

/** Stage/group/cup-round bracket info for a season */
export async function getSeasonBrackets(
  seasonId: string,
  locale: Locale = getDefaultLocale()
) {
  return srFetch<SeasonBracketsResponse>(
    srPath(locale, `/seasons/${seasonId}/stages_groups_cup_rounds`)
  );
}

/** Simple external→internal team ID mapping for a season */
export async function getSeasonSimpleTeamMappings(
  seasonId: string,
  locale: Locale = getDefaultLocale()
) {
  return srFetch<SimpleTeamMappingsResponse>(
    srPath(locale, `/seasons/${seasonId}/simple_team_mappings`)
  );
}

/** Simple external→internal tournament ID mapping for a season */
export async function getSeasonSimpleTournamentMappings(
  seasonId: string,
  locale: Locale = getDefaultLocale()
) {
  return srFetch<SimpleTournamentMappingsResponse>(
    srPath(locale, `/seasons/${seasonId}/simple_tournament_mappings`)
  );
}

/** Future seasons that are currently disabled */
export async function getSeasonsDisabled(locale: Locale = getDefaultLocale()) {
  return srFetch<SeasonsResponse>(srPath(locale, "/seasons_disabled"));
}
