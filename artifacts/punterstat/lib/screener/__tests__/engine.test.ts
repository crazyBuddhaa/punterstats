import { describe, expect, it } from "vitest";
import type { Fixture } from "@/lib/sports-data/types";
import {
  buildSlipCheckerHref,
  filterScreenedMatches,
  scoreFixturesForScreener,
} from "../engine";

const SAMPLE_FIXTURES: Fixture[] = [
  {
    id: "1",
    source: "football-data",
    externalId: "1",
    league: "Premier League",
    homeTeam: "Arsenal",
    awayTeam: "Everton",
    kickoff: "2026-11-22T15:00:00Z",
    status: "scheduled",
  },
  {
    id: "2",
    source: "football-data",
    externalId: "2",
    league: "La Liga",
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    kickoff: "2026-11-22T20:00:00Z",
    status: "scheduled",
  },
  {
    id: "3",
    source: "football-data",
    externalId: "3",
    league: "Bundesliga",
    homeTeam: "Bayern Munich",
    awayTeam: "Borussia Dortmund",
    kickoff: "2026-11-22T17:30:00Z",
    status: "scheduled",
  },
  {
    id: "4",
    source: "football-data",
    externalId: "4",
    league: "Premier League",
    homeTeam: "Arsenal",
    awayTeam: "Chelsea",
    kickoff: "2026-11-20T15:00:00Z",
    status: "finished",
  },
  {
    id: "5",
    source: "football-data",
    externalId: "5",
    league: "Unknown Cup",
    homeTeam: "Nonexistent FC",
    awayTeam: "Imaginary United",
    kickoff: "2026-11-22T12:00:00Z",
    status: "scheduled",
  },
];

describe("lib/screener/engine", () => {
  it("scores scheduled matched fixtures and skips finished or unmatched fixtures", () => {
    const scored = scoreFixturesForScreener(SAMPLE_FIXTURES);
    expect(scored).toHaveLength(3);
    expect(scored[0].homeTeam).toBe("Arsenal");
    expect(scored[0].favoriteProb).toBeGreaterThan(0.5);
    expect(scored[0].over25Prob).toBeGreaterThan(0);
    expect(scored[0].over25Prob).toBeLessThan(1);
  });

  it("filters and sorts by preset, league, and search query", () => {
    const scored = scoreFixturesForScreener(SAMPLE_FIXTURES);
    const favs = filterScreenedMatches(scored, { preset: "clean_favorites" });
    expect(favs.length).toBeGreaterThanOrEqual(1);
    for (let i = 1; i < favs.length; i++) {
      expect(favs[i - 1].favoriteProb).toBeGreaterThanOrEqual(favs[i].favoriteProb);
    }

    const byLeague = filterScreenedMatches(scored, { preset: "all", league: "La Liga" });
    expect(byLeague).toHaveLength(1);
    expect(byLeague[0].homeTeam).toBe("Real Madrid");

    const bySearch = filterScreenedMatches(scored, { preset: "all", search: "dortmund" });
    expect(bySearch).toHaveLength(1);
    expect(bySearch[0].awayTeam).toBe("Borussia Dortmund");
  });

  it("builds a valid Slip Checker handoff URL", () => {
    const href = buildSlipCheckerHref([
      { event: "Arsenal vs Everton", selection: "Arsenal to win", odds: "1.45" },
    ]);
    expect(href.startsWith("/bet-assist/slip-checker?legs=")).toBe(true);
    const parsed = JSON.parse(decodeURIComponent(href.split("?legs=")[1]));
    expect(parsed).toHaveLength(1);
    expect(parsed[0].selection).toBe("Arsenal to win");
  });
});
