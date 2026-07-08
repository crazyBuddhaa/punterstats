export type PlayingStyle =
  | "possession-based"
  | "direct"
  | "high-tempo"
  | "counter-attacking"
  | "mixed";

export interface League {
  id: string;
  slug: string;
  name: string;
  country: string;
  sport: string;
  logoUrl: string | null;
  season: string;
  playingStyle: PlayingStyle;
  styleSummary: string | null;
  avgGoalsPerGame: number | null;
  xgTrend: string | null;
  homeAdvantageIndex: number | null;
  homeWinPct: number | null;
  drawPct: number | null;
  awayWinPct: number | null;
  ouReferenceLine: number | null;
  overPct: number | null;
  fatiguePattern: string | null;
  parityScore: number | null;
  parityNote: string | null;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeagueTeam {
  id: string;
  leagueId: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  season: string;
  playingStyle: string | null;
  typicalFormation: string | null;
  homeWinPct: number | null;
  homeDrawPct: number | null;
  homeLossPct: number | null;
  awayWinPct: number | null;
  awayDrawPct: number | null;
  awayLossPct: number | null;
  xgFor: number | null;
  xgAgainst: number | null;
  cleanSheetRate: number | null;
  styleNote: string | null;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
