/**
 * Shared DTO types for the Spot The Value feature.
 * Import from here in both API routes and client components — avoids coupling
 * the client component to a route module.
 */

export interface LeagueSearchResult {
  /** Sport key (e.g. "soccer_epl") for Odds API sources, or league name for fixture sources. */
  key: string;
  /** Human-readable league title. */
  title: string;
  /** Sport group (e.g. "Soccer"). */
  group: string;
  /** "odds-api" means live market odds are available; "fixture" means fixtures only (manual odds entry). */
  source: "odds-api" | "fixture";
}
