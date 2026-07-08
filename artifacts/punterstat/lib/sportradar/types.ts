/**
 * Sportradar Soccer v4 — TypeScript types
 *
 * Derived from the official OpenAPI 3.0 spec (Soccer v4, version 4.0.0).
 * Covers all response shapes used by the 47 REST endpoints available on
 * trial and production keys.
 *
 * Push-stream types (stream_events, stream_statistics) are excluded —
 * those endpoints require a paid Realtime add-on and are not part of the
 * standard trial.
 */

// ── Shared primitives ──────────────────────────────────────────────────────────

/** Sportradar URN pattern  e.g. "sr:competition:17", "sr:season:106479" */
export type SrUrn = string;

export type Locale =
  | "en" | "de" | "fr" | "es" | "it" | "pt" | "nl" | "ru" | "zh"
  | "ja" | "ko" | "ar" | "pl" | "tr" | "sv" | "da" | "no" | "fi"
  | "cs" | "hr" | "hu" | "ro" | "sk" | "sl" | "bg" | "el" | "he"
  | "id" | "ms" | "th" | "uk" | "vi" | "ca" | "eu" | "gl";

// ── Enumerations ───────────────────────────────────────────────────────────────

export type SportEventStatus =
  | "not_started" | "live" | "postponed" | "suspended" | "cancelled"
  | "ended" | "closed" | "interrupted" | "abandoned" | "delayed"
  | "start_delayed" | "awaiting_penalties" | "penalties" | "overtime";

export type MatchStatus =
  | "not_started" | "1st_half" | "2nd_half" | "halftime" | "awaiting_extra_time"
  | "1st_extra" | "extra_time_halftime" | "2nd_extra" | "awaiting_penalties"
  | "penalties" | "overtime" | "ended" | "interrupted" | "postponed"
  | "suspended" | "cancelled" | "abandoned" | "delayed";

export type EventType =
  | "score_change" | "yellow_card" | "red_card" | "yellow_red_card"
  | "substitution" | "injury_time_shown" | "period_start" | "period_score"
  | "break_start" | "match_ended" | "match_started" | "offside"
  | "free_kick" | "corner_kick" | "goal_kick" | "throw_in"
  | "video_assistant_referee" | "video_assistant_referee_over"
  | "injury" | "penalty_missed" | "shot_on_target" | "shot_off_target"
  | "shot_saved" | "penalty_shootout" | "possible_va_r" | "fun_fact"
  | "momentum" | "ball_recovery" | "clearance" | "blocked_shot";

export type CompetitorQualifier = "home" | "away";

export type PlayerType = "goalkeeper" | "defender" | "midfielder" | "forward";

export type StandingType =
  | "total" | "home" | "away"
  | "first_half_total" | "first_half_home" | "first_half_away"
  | "second_half_total" | "second_half_home" | "second_half_away"
  | "best_third";

export type MissingPlayerType = "injured" | "suspended" | "ill" | "unknown";

export type AgeGroup =
  | "U23" | "U22" | "U21" | "U20" | "U19" | "U18" | "U17" | "U16"
  | "U15" | "U14" | "U13" | "U12" | "U11" | "Y10" | "Juniors" | "Youth";

// ── Core entities ──────────────────────────────────────────────────────────────

export interface Category {
  id: SrUrn;
  name: string;
  country_code?: string;
}

export interface Competition {
  id: SrUrn;
  name: string;
  parent_id?: SrUrn;
  type?: string;
  gender?: string;
  category?: Category;
}

export interface Season {
  id: SrUrn;
  name: string;
  start_date: string;  // YYYY-MM-DD
  end_date: string;
  year: string;        // e.g. "24/25"
  competition_id: SrUrn;
  competition?: Competition;
  disabled?: boolean;
}

export interface Venue {
  id: SrUrn;
  name: string;
  city_name?: string;
  country_name?: string;
  country_code?: string;
  capacity?: number;
  map_coordinates?: string;
}

export interface Manager {
  id: SrUrn;
  name: string;
  nationality?: string;
  country_code?: string;
  date_of_birth?: string;
}

export interface Competitor {
  id: SrUrn;
  name: string;
  short_name?: string;
  abbreviation?: string;
  country?: string;
  country_code?: string;
  gender?: string;
  age_group?: AgeGroup;
  qualifier?: CompetitorQualifier;
  form?: string;           // "WWDLW" — most recent on right
  other_season_id?: SrUrn;
}

export interface Player {
  id: SrUrn;
  name: string;
  full_name?: string;
  date_of_birth?: string;
  nationality?: string;
  country_code?: string;
  height?: number;
  weight?: number;
  jersey_number?: number;
  position?: PlayerType;
  gender?: string;
  place_of_birth?: string;
  nickname?: string;
  preferred_foot?: "left" | "right" | "both";
}

export interface PlayerRole {
  competitor: Competitor;
  type: string;   // "player" | "coach" | etc.
  active?: boolean;
  start_date?: string;
  end_date?: string;
}

// ── Sport event context ────────────────────────────────────────────────────────

export interface SportEventContextRound {
  number?: number;
  name?: string;
  cup_round_matchups?: number;
  cup_round_match_number?: number;
  other_sport_event_id?: SrUrn;
}

export interface SportEventContextStage {
  order?: number;
  type?: string;
  phase?: string;
  start_date?: string;
  end_date?: string;
  year?: string;
}

export interface SportEventContext {
  competition: Competition;
  season: Season;
  stage?: SportEventContextStage;
  round?: SportEventContextRound;
  groups?: Array<{ id: SrUrn; name: string; group_name?: string }>;
}

export interface SportEvent {
  id: SrUrn;
  scheduled?: string;          // ISO 8601 datetime
  start_time_tbd?: boolean;
  status?: SportEventStatus;
  replaced_by?: SrUrn;
  resume_time?: string;
  competitors?: Competitor[];
  venue?: Venue;
  sport_event_context?: SportEventContext;
  coverage?: {
    live?: boolean;
    type?: string;
  };
}

// ── Status & scoring ───────────────────────────────────────────────────────────

export interface PeriodScore {
  home_score: number;
  away_score: number;
  type:
    | "regular_period" | "overtime" | "penalties" | "pause" | "awaiting_extra"
    | "awaiting_penalties" | "interrupted" | "1st_half" | "2nd_half";
  number: number;
}

export interface Clock {
  played?: string;    // "45:00"
  stoppage_time_played?: string;
  remaining?: string;
  remaining_in_period?: string;
}

export interface BallLocation {
  order?: number;
  qualifier?: CompetitorQualifier;
  status?: string;
  updated_at?: string;
}

export interface MatchSituation {
  status?: string;
  qualifier?: CompetitorQualifier;
  start_time?: string;
}

export interface SportEventStatusDetail {
  status: SportEventStatus;
  match_status?: MatchStatus;
  home_score?: number;
  away_score?: number;
  home_normaltime_score?: number;
  away_normaltime_score?: number;
  home_overtime_score?: number;
  away_overtime_score?: number;
  aggregate_home_score?: number;
  aggregate_away_score?: number;
  aggregate_winner_id?: SrUrn;
  winner_id?: SrUrn;
  match_tie?: boolean;
  decided_by_fed?: boolean;
  scout_abandoned?: boolean;
  period_scores?: PeriodScore[];
  clock?: Clock;
  ball_locations?: BallLocation[];
  match_situation?: MatchSituation;
}

// ── Statistics ─────────────────────────────────────────────────────────────────

/** Per-team stats block — same shape in period and totals */
export interface CompetitorStatisticsBlock {
  /** 0–100 */
  ball_possession?: number;
  cards_given?: number;
  corner_kicks?: number;
  fouls?: number;
  free_kicks?: number;
  goal_kicks?: number;
  injuries?: number;
  offsides?: number;
  red_cards?: number;
  shots_blocked?: number;
  shots_off_target?: number;
  shots_on_target?: number;
  shots_saved?: number;
  shots_total?: number;
  substitutions?: number;
  tackles?: number;
  throw_ins?: number;
  yellow_cards?: number;
  yellow_red_cards?: number;
  // Extended (Soccer Extended API / Tier 1)
  assists?: number;
  chances_created?: number;
  clearances?: number;
  clean_sheet?: boolean;
  crosses_successful?: number;
  crosses_total?: number;
  defensive_blocks?: number;
  diving_saves?: number;
  dribbles?: number;
  dribbles_completed?: number;
  errors_lead_to_goal?: number;
  errors_lead_to_shot?: number;
  goals_by_head?: number;
  goals_by_penalty?: number;
  interceptions?: number;
  long_balls_successful?: number;
  long_balls_total?: number;
  passes_successful?: number;
  passes_total?: number;
  saves?: number;
  shots_direct_free_kicks?: number;
  // xG
  xg?: number;
  xg_shot?: number;
}

export interface SportEventPlayerStatistics {
  player: Player;
  statistics: CompetitorStatisticsBlock & {
    goals_scored?: number;
    goals_conceded?: number;
    own_goals?: number;
    minutes_played?: number;
    starter?: boolean;
  };
}

export interface SportEventCompetitorStatistics extends Competitor {
  statistics?: CompetitorStatisticsBlock;
  players?: SportEventPlayerStatistics[];
}

export interface SportEventStatisticsPeriod {
  type:
    | "regular_period" | "overtime" | "penalties" | "1st_half" | "2nd_half";
  number?: number;
  competitors?: SportEventCompetitorStatistics[];
}

export interface SportEventStatistics {
  totals?: { competitors?: SportEventCompetitorStatistics[] };
  periods?: SportEventStatisticsPeriod[];
}

// ── Timeline events ────────────────────────────────────────────────────────────

export interface EventPlayer {
  id: SrUrn;
  name: string;
  type?: "scorer" | "assist" | "substituted_in" | "substituted_out" | "missed_penalty";
}

export interface GenericEvent {
  id?: number;
  type: EventType;
  time?: string;         // ISO 8601
  match_time?: number;   // minute
  match_clock?: string;  // "45:00"
  period?: number;
  period_name?: string;
  period_type?: string;
  stoppage_time?: number;
  stoppage_time_clock?: string;
  injury_time_announced?: number;
  competitor?: CompetitorQualifier;
  home_score?: number;
  away_score?: number;
  shootout_home_score?: number;
  shootout_away_score?: number;
  players?: EventPlayer[];
  // Extended fields
  x?: number;
  y?: number;
  destination_x?: number;
  destination_y?: number;
  goalface_x?: number;
  goalface_y?: number;
  xg_value?: number;
  outcome?: string;
  method?: string;
  body_type?: string;
  counterattack?: boolean;
  in_penalty_area?: boolean;
  distance?: number;
  passing_range?: string;
  direction?: string;
  trajectory?: string;
  style?: string;
  free_kick_type?: string;
  corner_type?: string;
  action_type?: string;
  additional_outcome?: string;
  card_description?: string;
  reason?: string;
  decision?: string;         // VAR decision
  description?: string;      // VAR description
  late?: boolean;            // substitution — player slow to leave
  break_name?: string;
  updated?: boolean;
  updated_start_time?: string;
  updated_time?: string;
  commentaries?: Array<{ text: string }>;
}

// ── Summary & schedule wrappers ────────────────────────────────────────────────

export interface Schedule {
  sport_event: SportEvent;
  sport_event_status?: SportEventStatusDetail;
}

export interface Summary {
  sport_event: SportEvent;
  sport_event_status: SportEventStatusDetail;
  statistics?: SportEventStatistics;
}

export interface TimelineSummary extends Summary {
  timeline?: GenericEvent[];
  statistics?: SportEventStatistics;
}

// ── Probability ────────────────────────────────────────────────────────────────

export interface ProbabilityOutcome {
  name:
    | "home_team_winner" | "draw" | "away_team_winner"
    | "home_team_winner_regular_time" | "draw_regular_time" | "away_team_winner_regular_time";
  probability: number;  // 0.0–1.0
}

export interface ProbabilityMarket {
  name: "3_way" | "2_way";
  next_event?: GenericEvent;
  outcomes: ProbabilityOutcome[];
}

export interface SportEventProbability {
  sport_event: SportEvent;
  sport_event_status?: SportEventStatusDetail;
  markets?: ProbabilityMarket[];
}

// ── Standings ──────────────────────────────────────────────────────────────────

export interface StandingCompetitor {
  competitor: Competitor;
  rank?: number;
  change?: number;
  played?: number;
  win?: number;
  draw?: number;
  loss?: number;
  goals_for?: number;
  goals_against?: number;
  goals_diff?: number;
  points?: number;
  points_per_game?: number;
  current_outcome?: string;
  comments?: Array<{ text: string }>;
}

export interface StandingGroup {
  id: SrUrn;
  name: string;
  group_name?: string;
  parent_group_id?: SrUrn;
  live?: boolean;
  stage?: SportEventContextStage;
  standings?: StandingCompetitor[];
  comments?: Array<{ text: string }>;
}

export interface Standing {
  type: StandingType;
  round?: number;
  points_win?: number;
  points_draw?: number;
  points_loss?: number;
  tie_break_rule?: string;
  groups?: StandingGroup[];
}

// ── Lineups ────────────────────────────────────────────────────────────────────

export interface LineupPlayer {
  id: SrUrn;
  name: string;
  type: "starter" | "substitute" | "manager" | "missing";
  position?: PlayerType;
  jersey_number?: number;
  order?: number;
  reason?: MissingPlayerType;
  start_time_tbd?: boolean;
}

export interface Lineup {
  competitor: Competitor;
  formation?: string;         // "4-3-3"
  players?: LineupPlayer[];
  manager?: Manager;
}

export interface SportEventLineups {
  sport_event: SportEvent;
  lineups?: Lineup[];
}

// ── Players & rosters ──────────────────────────────────────────────────────────

export interface MissingPlayer {
  player: Player;
  competitor?: Competitor;
  type: MissingPlayerType;
  reason?: string;
  start_date?: string;
  end_date?: string;
  run_out_of_contract?: boolean;
}

export interface Transfer {
  player: Player;
  type: "permanent" | "loan" | "free_transfer" | "loan_end";
  date?: string;
  from_team?: Competitor;
  to_team?: Competitor;
  transferred_for?: string;   // market value string
}

// ── Season leaders ─────────────────────────────────────────────────────────────

export interface LeaderEntry {
  rank: number;
  player?: Player;
  competitor?: Competitor;
  value?: number;
}

export interface LeaderCategory {
  type: string;  // "goals", "assists", "yellow_cards", "red_cards", "clean_sheets"
  competitors?: Array<{ competitor: Competitor; value: number; rank: number }>;
  players?: LeaderEntry[];
}

// ── Season over/under stats ────────────────────────────────────────────────────

export interface OverUnderRow {
  competitor: Competitor;
  total_matches?: number;
  over?: number;
  under?: number;
  exactly?: number;
  threshold?: number;
}

// ── ID mappings ────────────────────────────────────────────────────────────────

export interface Mapping {
  id: SrUrn;
  external_id: string;
  external_name?: string;
  provider?: string;
}

export interface MergeMapping {
  old_id: SrUrn;
  new_id: SrUrn;
}

// ── Competitor profile ─────────────────────────────────────────────────────────

export interface CompetitorProfile {
  competitor: Competitor & {
    players?: Player[];
    venue?: Venue;
    manager?: Manager;
    jerseys?: Array<{ type: string; base: string; number?: string; sleeve?: string; shirt_type?: string }>;
  };
}

// ── API response envelopes ─────────────────────────────────────────────────────

export interface SrResponse {
  generated_at?: string;
}

export interface CompetitionsResponse extends SrResponse {
  competitions: Competition[];
}

export interface CompetitionInfoResponse extends SrResponse {
  competition: Competition;
  groups?: Array<{ id: SrUrn; name: string }>;
  season_coverage_info?: Record<string, unknown>;
}

export interface CompetitionSeasonsResponse extends SrResponse {
  seasons: Season[];
}

export interface SeasonsResponse extends SrResponse {
  seasons: Season[];
}

export interface CompetitorProfileResponse extends SrResponse {
  competitor: CompetitorProfile["competitor"];
}

export interface CompetitorSchedulesResponse extends SrResponse {
  schedules: Schedule[];
}

export interface CompetitorSummariesResponse extends SrResponse {
  summaries: Summary[];
}

export interface CompetitorVersusSummariesResponse extends SrResponse {
  competitors: Competitor[];
  last_meetings: Summary[];
  next_meetings: Summary[];
}

export interface PlayerProfileResponse extends SrResponse {
  player: Player;
  competitors?: Competitor[];
  roles?: PlayerRole[];
}

export interface PlayerSchedulesResponse extends SrResponse {
  schedules: Schedule[];
}

export interface PlayerSummariesResponse extends SrResponse {
  summaries: Summary[];
}

export interface ScheduleSchedulesResponse extends SrResponse {
  schedules: Schedule[];
}

export interface ScheduleSummariesResponse extends SrResponse {
  summaries: Summary[];
}

export interface LiveSchedulesResponse extends SrResponse {
  schedules: Schedule[];
}

export interface LiveSummariesResponse extends SrResponse {
  summaries: Summary[];
}

export interface LiveTimelinesResponse extends SrResponse {
  sport_event_timelines: TimelineSummary[];
}

export interface LiveTimelinesDeltaResponse extends SrResponse {
  sport_event_timelines: TimelineSummary[];
}

export interface SeasonCompetitorsResponse extends SrResponse {
  season_competitors: Competitor[];
}

export interface SeasonCompetitorPlayersResponse extends SrResponse {
  season_competitor_players: Array<{
    competitor: Competitor;
    players: Player[];
  }>;
}

export interface SeasonCompetitorStatisticsResponse extends SrResponse {
  statistics: {
    competitors: SportEventCompetitorStatistics[];
    players: SportEventPlayerStatistics[];
  };
}

export interface SeasonInfoResponse extends SrResponse {
  season: Season;
  competitors?: Competitor[];
  groups?: StandingGroup[];
}

export interface SeasonSchedulesResponse extends SrResponse {
  schedules: Schedule[];
}

export interface SeasonSummariesResponse extends SrResponse {
  summaries: Summary[];
}

export interface SeasonStandingsResponse extends SrResponse {
  standings: Standing[];
}

export interface SeasonFormStandingsResponse extends SrResponse {
  standings: Standing[];
}

export interface SeasonProbabilitiesResponse extends SrResponse {
  sport_event_probabilities: SportEventProbability[];
}

export interface SeasonLeadersResponse extends SrResponse {
  leaders: LeaderCategory[];
}

export interface SeasonLineupsResponse extends SrResponse {
  lineups: SportEventLineups[];
}

export interface SeasonMissingPlayersResponse extends SrResponse {
  missing_players: MissingPlayer[];
}

export interface SeasonPlayersResponse extends SrResponse {
  players: Player[];
}

export interface SeasonTransfersResponse extends SrResponse {
  transfers: Transfer[];
}

export interface SeasonOverUnderStatisticsResponse extends SrResponse {
  over_under_statistics: OverUnderRow[];
}

export interface SportEventSummaryResponse extends SrResponse {
  sport_event: SportEvent;
  sport_event_status: SportEventStatusDetail;
  statistics?: SportEventStatistics;
}

export interface SportEventTimelineResponse extends SrResponse {
  sport_event: SportEvent;
  sport_event_status: SportEventStatusDetail;
  statistics?: SportEventStatistics;
  timeline?: GenericEvent[];
}

export interface SportEventLineupsResponse extends SrResponse {
  sport_event: SportEvent;
  lineups?: Lineup[];
}

export interface SportEventMomentumResponse extends SrResponse {
  sport_event: SportEvent;
  data?: Array<{ minute: number; value: number }>;
}

export interface SportEventFunFactsResponse extends SrResponse {
  fun_facts?: Array<{
    id?: string;
    type?: string;
    message?: string;
  }>;
}

export interface SportEventsCreatedResponse extends SrResponse {
  sport_events: SportEvent[];
}

export interface SportEventsRemovedResponse extends SrResponse {
  sport_events: SportEvent[];
}

export interface SportEventsUpdatedResponse extends SrResponse {
  sport_events: SportEvent[];
}

export interface MappingsResponse extends SrResponse {
  mappings: Mapping[];
}

export interface MergeMappingsResponse extends SrResponse {
  mappings: MergeMapping[];
}

export interface SimpleTeamMappingsResponse extends SrResponse {
  simple_team_mappings: Array<{ id: SrUrn; name: string; external_id: string }>;
}

export interface SimpleTournamentMappingsResponse extends SrResponse {
  simple_tournament_mappings: Array<{ id: SrUrn; name: string; external_id: string }>;
}

export interface SeasonBracketsResponse extends SrResponse {
  stages?: SportEventContextStage[];
  groups?: StandingGroup[];
  cup_rounds?: Array<{
    id?: SrUrn;
    type?: string;
    name?: string;
    cup_round_matchups?: number;
    sport_events?: SportEvent[];
  }>;
}

// ── Client error type ──────────────────────────────────────────────────────────

export class SportradarError extends Error {
  constructor(
    public readonly status: number,
    public readonly endpoint: string,
    message: string
  ) {
    super(message);
    this.name = "SportradarError";
  }
}
