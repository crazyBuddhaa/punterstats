export type SportsDataSource = "footballdata-io" | "football-data";

export interface Fixture {
  id: string;
  source: SportsDataSource;
  externalId: string;
  league: string;
  season?: string;
  homeTeam: string;
  awayTeam: string;
  kickoff: string;
  status: "scheduled" | "live" | "finished" | "postponed" | "cancelled";
  homeScore?: number;
  awayScore?: number;
}

export type FixturesResult =
  | { success: true; fixtures: Fixture[]; source: SportsDataSource; fromCache: boolean }
  | { success: false; error: string };

export interface QuotaWindow {
  provider: string;
  requestCount: number;
  windowStart: string;
  windowEnd: string;
  limit: number;
}
