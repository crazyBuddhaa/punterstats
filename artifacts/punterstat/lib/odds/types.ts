export interface OddsOutcome {
  name: string;
  price: number;
  point?: number;
}

export interface OddsMarket {
  key: string;
  outcomes: OddsOutcome[];
}

export interface OddsBookmaker {
  key: string;
  title: string;
  markets: OddsMarket[];
}

export interface OddsEvent {
  id: string;
  sportKey: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  bookmakers: OddsBookmaker[];
}

export interface CachedOddsRow {
  event_id: string;
  sport_key: string;
  home_team: string;
  away_team: string;
  commence_time: string;
  bookmaker: string;
  market_key: string;
  outcomes: OddsOutcome[];
  fetched_at: string;
  expires_at: string;
}

export type OddsResult = { success: true; events: OddsEvent[]; fromCache: boolean } | { success: false; error: string };
