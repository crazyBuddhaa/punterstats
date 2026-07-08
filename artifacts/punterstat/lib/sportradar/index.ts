/**
 * Sportradar Soccer v4 — barrel export
 *
 * Usage:
 *   import { getSeasonProbabilities, getMatchSummary } from "@/lib/sportradar"
 *   import type { SportEventProbability, SportEventStatistics } from "@/lib/sportradar"
 */

// Client utilities
export {
  srFetch,
  srPath,
  isSportradarConfigured,
  getDefaultLocale,
} from "./client";
export type { SrFetchOptions } from "./client";

// Competition & season discovery
export {
  getCompetitions,
  getCompetitionInfo,
  getCompetitionSeasons,
  getSeasons,
  getSeasonInfo,
  getSeasonCompetitors,
  getSeasonCompetitorPlayers,
  getSeasonCompetitorStatistics,
  getSeasonBrackets,
  getSeasonSimpleTeamMappings,
  getSeasonSimpleTournamentMappings,
  getSeasonsDisabled,
} from "./competitions";

// Season data
export {
  getSeasonSchedules,
  getSeasonSummaries,
  getSeasonStandings,
  getSeasonFormStandings,
  getSeasonProbabilities,
  getSeasonLeaders,
  getSeasonLineups,
  getSeasonMissingPlayers,
  getSeasonPlayers,
  getSeasonTransfers,
  getSeasonOverUnderStats,
} from "./seasons";

// Match-level data
export {
  getMatchSummary,
  getMatchTimeline,
  getMatchLeagueTimeline,
  getMatchLineups,
  getMatchMomentum,
  getMatchFunFacts,
  getSportEventsCreated,
  getSportEventsRemoved,
  getSportEventsUpdated,
} from "./matches";

// Competitors & players
export {
  getCompetitorProfile,
  getCompetitorSchedules,
  getCompetitorSummaries,
  getH2HSummaries,
  getCompetitorMappings,
  getCompetitorMergeMappings,
  getPlayerProfile,
  getPlayerSchedules,
  getPlayerSummaries,
  getPlayerMappings,
  getPlayerMergeMappings,
  getDailySchedules,
  getDailySummaries,
} from "./competitors";

// Live data
export {
  getLiveSchedules,
  getLiveSummaries,
  getLiveTimelines,
  getLiveTimelinesDelta,
} from "./live";

// All types
export type {
  // Enums
  Locale,
  SrUrn,
  SportEventStatus,
  MatchStatus,
  EventType,
  CompetitorQualifier,
  PlayerType,
  StandingType,
  MissingPlayerType,
  AgeGroup,
  // Core entities
  Category,
  Competition,
  Season,
  Venue,
  Manager,
  Competitor,
  Player,
  PlayerRole,
  // Sport event
  SportEventContext,
  SportEventContextRound,
  SportEventContextStage,
  SportEvent,
  PeriodScore,
  Clock,
  SportEventStatusDetail,
  // Statistics
  CompetitorStatisticsBlock,
  SportEventPlayerStatistics,
  SportEventCompetitorStatistics,
  SportEventStatisticsPeriod,
  SportEventStatistics,
  // Timeline
  EventPlayer,
  GenericEvent,
  // Wrappers
  Schedule,
  Summary,
  TimelineSummary,
  // Probability
  ProbabilityOutcome,
  ProbabilityMarket,
  SportEventProbability,
  // Standings
  StandingCompetitor,
  StandingGroup,
  Standing,
  // Lineups
  LineupPlayer,
  Lineup,
  SportEventLineups,
  // Players
  MissingPlayer,
  Transfer,
  LeaderEntry,
  LeaderCategory,
  OverUnderRow,
  Mapping,
  MergeMapping,
  CompetitorProfile,
  // Response envelopes
  SrResponse,
  CompetitionsResponse,
  CompetitionInfoResponse,
  CompetitionSeasonsResponse,
  SeasonsResponse,
  SeasonInfoResponse,
  SeasonCompetitorsResponse,
  SeasonCompetitorPlayersResponse,
  SeasonCompetitorStatisticsResponse,
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
  SportEventSummaryResponse,
  SportEventTimelineResponse,
  SportEventLineupsResponse,
  SportEventMomentumResponse,
  SportEventFunFactsResponse,
  SportEventsCreatedResponse,
  SportEventsRemovedResponse,
  SportEventsUpdatedResponse,
  CompetitorProfileResponse,
  CompetitorSchedulesResponse,
  CompetitorSummariesResponse,
  CompetitorVersusSummariesResponse,
  PlayerProfileResponse,
  PlayerSchedulesResponse,
  PlayerSummariesResponse,
  MappingsResponse,
  MergeMappingsResponse,
  ScheduleSchedulesResponse,
  ScheduleSummariesResponse,
  LiveSchedulesResponse,
  LiveSummariesResponse,
  LiveTimelinesResponse,
  LiveTimelinesDeltaResponse,
  SeasonBracketsResponse,
  SimpleTeamMappingsResponse,
  SimpleTournamentMappingsResponse,
  // Error
  SportradarError,
} from "./types";
