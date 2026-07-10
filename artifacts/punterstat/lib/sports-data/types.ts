export type SportsDataSource = "sportsapipro" | "footballdata-io" | "football-data";

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
  /**
   * SportsAPIPro's numeric team ids — only populated for that source. Used
   * to fetch match enrichment (recent form, head-to-head) after a fixture
   * is selected; other sources leave these undefined and enrichment is
   * simply skipped.
   */
  homeTeamId?: number;
  awayTeamId?: number;
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
