export type MatchResult = "W" | "D" | "L";

export type InjuryImpact = "none" | "minor" | "moderate" | "significant" | "major";

export type LeagueImportance =
  | "friendly"
  | "league"
  | "cup"
  | "playoff"
  | "title-decider";

export interface TeamForm {
  name: string;
  last5: MatchResult[];
  goalsScored: number; // avg per game
  goalsConceded: number; // avg per game
}

export interface HeadToHead {
  homeWins: number;
  draws: number;
  awayWins: number;
  avgGoals: number; // avg total goals in H2H matches
}

export interface InjuryFactor {
  impactRating: InjuryImpact;
}

export interface MatchAnalysisInput {
  homeTeam: TeamForm;
  awayTeam: TeamForm;
  headToHead: HeadToHead;
  homeInjuries: InjuryFactor;
  awayInjuries: InjuryFactor;
  leagueImportance: LeagueImportance;
  /** Optional league code (e.g. "E0", "SP1", "DZ1") for per-league Dixon-Coles rho & model lookup. */
  leagueCode?: string;
}

export interface ProbabilityFactor {
  name: string;
  description: string;
  homeEdge: number; // -1 to +1, positive favours home
  confidence: "low" | "medium" | "high";
  explanation: string;
}

export interface ScorelineProbability {
  score: string;
  home: number;
  away: number;
  prob: number;
}

export interface DerivedMarkets {
  /** Over / Under totals — Dixon-Coles joint scoreline distribution */
  over25: number;
  under25: number;
  over15: number;
  under15: number;
  over35: number;
  under35: number;
  over05?: number;
  under05?: number;
  over45?: number;
  under45?: number;
  /** Both Teams To Score */
  btts: number;
  noBtts: number;
  /** Double chance — sum of two 1X2 outcomes */
  doubleChanceHD: number; // Home or Draw
  doubleChanceDA: number; // Draw or Away
  doubleChanceHA: number; // Home or Away (no draw)
  /** Draw No Bet */
  homeDnb?: number;
  awayDnb?: number;
  /** Clean sheet — P(opponent scores 0) */
  homeCleanSheet: number;
  awayCleanSheet: number;
  /** Team goal totals */
  homeOver05?: number;
  homeOver15?: number;
  awayOver05?: number;
  awayOver15?: number;
  /** Asian handicaps (home side) */
  ahHomeMinus15?: number;
  ahHomePlus15?: number;
  /** Top 5 most probable exact scorelines */
  topScorelines?: ScorelineProbability[];
}

export interface MatchModelMeta {
  source: "dixon-coles-v2" | "heuristic";
  modelVersion: string;
  leagueCode?: string | null;
  leagueRho: number;
  reliabilityTier?: "Gold" | "Silver" | "Bronze" | null;
}

export interface MatchAnalysisResult {
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  factors: ProbabilityFactor[];
  expectedGoals: { home: number; away: number };
  derivedMarkets: DerivedMarkets;
  keyInsights: string[];
  educationalNote: string;
  modelMeta?: MatchModelMeta;
}

export interface SavedAnalysis {
  id: string;
  userId: string;
  homeTeamName: string;
  awayTeamName: string;
  analysisInput: MatchAnalysisInput;
  analysisResult: MatchAnalysisResult;
  createdAt: string;
}
