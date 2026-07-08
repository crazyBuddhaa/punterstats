export interface HistoricalMatch {
  id: string;
  source: string;
  external_id: string;
  league_code: string;
  league_name: string;
  season: string;
  match_date: string;
  match_time: string | null;
  home_team: string;
  away_team: string;
  home_goals: number | null;
  away_goals: number | null;
  result: "H" | "D" | "A" | null;
  ht_home_goals: number | null;
  ht_away_goals: number | null;
  home_shots: number | null;
  away_shots: number | null;
  home_shots_on_target: number | null;
  away_shots_on_target: number | null;
  home_corners: number | null;
  away_corners: number | null;
  home_fouls: number | null;
  away_fouls: number | null;
  home_yellow_cards: number | null;
  away_yellow_cards: number | null;
  home_red_cards: number | null;
  away_red_cards: number | null;
  home_elo: number | null;
  away_elo: number | null;
  form3_home: number | null;
  form5_home: number | null;
  form3_away: number | null;
  form5_away: number | null;
  avg_home_odds: number | null;
  avg_draw_odds: number | null;
  avg_away_odds: number | null;
  max_home_odds: number | null;
  max_draw_odds: number | null;
  max_away_odds: number | null;
  over25_odds: number | null;
  under25_odds: number | null;
  handi_size: number | null;
  handi_home_odds: number | null;
  handi_away_odds: number | null;
  prob_lth: number | null;
  prob_lta: number | null;
  prob_vhd: number | null;
  prob_vad: number | null;
  prob_htb: number | null;
  prob_phb: number | null;
}

export interface ResultsFilter {
  league?: string;
  season?: string;
  team?: string;
  result?: "H" | "D" | "A";
}

export interface PaginatedResults {
  data: HistoricalMatch[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface H2HRecord {
  match: HistoricalMatch;
  perspective: "home" | "away"; // from team1's perspective
}

export interface H2HSummary {
  team1: string;
  team2: string;
  total: number;
  team1Wins: number;
  team2Wins: number;
  draws: number;
  team1Goals: number;
  team2Goals: number;
  matches: HistoricalMatch[];
}

export interface LeagueOption {
  code: string;
  name: string;
  country: string;
}
