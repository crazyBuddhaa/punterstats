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
}

export interface ProbabilityFactor {
  name: string;
  description: string;
  homeEdge: number; // -1 to +1, positive favours home
  confidence: "low" | "medium" | "high";
  explanation: string;
}

export interface DerivedMarkets {
  /** Over / Under totals — Poisson on combined xG */
  over25: number;
  under25: number;
  over15: number;
  under15: number;
  over35: number;
  under35: number;
  /** Both Teams To Score — product of each side scoring ≥ 1 */
  btts: number;
  noBtts: number;
  /** Double chance — sum of two 1X2 outcomes */
  doubleChanceHD: number; // Home or Draw
  doubleChanceDA: number; // Draw or Away
  doubleChanceHA: number; // Home or Away (no draw)
  /** Clean sheet — Poisson P(opponent scores 0) */
  homeCleanSheet: number;
  awayCleanSheet: number;
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
