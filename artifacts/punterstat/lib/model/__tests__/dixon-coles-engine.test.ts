import { describe, expect, it } from "vitest";
import {
  GLOBAL_DC_RHO,
  MODEL_VERSION,
  deriveFullMarkets,
  europeanHandicapProbs,
  getLeagueReliability,
  getLeagueRho,
  predictMatchFromModel,
} from "../dixon-coles-engine";
import { analyzeMatch } from "@/lib/match-breakdown/analyzer";
import { LEAGUE_MAP } from "@/lib/historical-stats/league-map";
import { poisson1x2Probs } from "@/lib/simulation/poisson";

describe("dixon-coles-engine v2.0", () => {
  it("loads versioned metadata and per-league rho", () => {
    expect(MODEL_VERSION).toBe("2.0.0");
    expect(GLOBAL_DC_RHO).toBeLessThan(0);
    expect(getLeagueRho("E0")).toBeTypeOf("number");
    expect(getLeagueReliability("E0")).toBe("Gold");
  });

  it("predicts real fixtures with calibrated 1X2 and coherent derived markets", () => {
    const pred = predictMatchFromModel("Arsenal", "Chelsea", "E0");
    expect(pred).not.toBeNull();
    expect(pred!.matched).toBe(true);
    expect(pred!.leagueCode).toBe("E0");
    expect(pred!.reliabilityTier).toBe("Gold");

    const sum = pred!.homeWinProb + pred!.drawProb + pred!.awayWinProb;
    expect(sum).toBeCloseTo(1, 5);

    const m = pred!.markets;
    expect(m.over05).toBeGreaterThan(m.over15);
    expect(m.over15).toBeGreaterThan(m.over25);
    expect(m.over25).toBeGreaterThan(m.over35);
    expect(m.over35).toBeGreaterThan(m.over45);
    expect(m.homeDnb + m.awayDnb).toBeCloseTo(1, 5);
    expect(m.topScorelines).toHaveLength(5);
    expect(m.topScorelines[0].prob).toBeGreaterThanOrEqual(m.topScorelines[1].prob);
  });

  it("auto-resolves league when leagueCode is omitted", () => {
    const pred = predictMatchFromModel("Real Madrid", "Barcelona");
    expect(pred).not.toBeNull();
    expect(pred!.leagueCode).toBe("SP1");
  });

  it("returns null for unknown teams so analyzer falls back cleanly", () => {
    expect(predictMatchFromModel("Nonexistent FC", "Imaginary United")).toBeNull();
  });

  it("resolves common bookmaker team aliases across top leagues", () => {
    const epl = predictMatchFromModel("Manchester United", "Wolverhampton Wanderers", "E0");
    expect(epl).not.toBeNull();
    expect(epl!.matched).toBe(true);
    expect(epl!.usedPromotedPrior).toBe(false);

    const laLiga = predictMatchFromModel("Atletico Madrid", "Real Sociedad");
    expect(laLiga).not.toBeNull();
    expect(laLiga!.leagueCode).toBe("SP1");

    const ligue1 = predictMatchFromModel("PSG", "Olympique Lyonnais");
    expect(ligue1).not.toBeNull();
    expect(ligue1!.leagueCode).toBe("F1");
  });

  it("uses bottom-quartile league prior when one side is newly promoted or across divisions", () => {
    const promoted = predictMatchFromModel("Arsenal", "Newly Promoted Town FC", "E0");
    expect(promoted).not.toBeNull();
    expect(promoted!.usedPromotedPrior).toBe(true);
    expect(promoted!.homeWinProb).toBeGreaterThan(0.55);

    const crossDiv = predictMatchFromModel("Tottenham", "Ipswich Town");
    expect(crossDiv).not.toBeNull();
    expect(crossDiv!.leagueCode).toBe("E0");
    expect(crossDiv!.usedPromotedPrior).toBe(true);
  });

  it("computes 3-way European Handicap probabilities summing to 1", () => {
    const eh = europeanHandicapProbs(1.4, 1.5, -0.056, 3, 0);
    expect(eh.homeWin + eh.draw + eh.awayWin).toBeCloseTo(1, 5);
    expect(eh.homeWin).toBeGreaterThan(0.85);
  });

  it("integrates into analyzeMatch with injury sensitivity and heuristic fallback", () => {
    const baseInput = {
      homeTeam: { name: "Arsenal", last5: ["W", "W", "D", "W", "L"] as ("W" | "D" | "L")[], goalsScored: 2.1, goalsConceded: 0.9 },
      awayTeam: { name: "Chelsea", last5: ["W", "D", "W", "L", "W"] as ("W" | "D" | "L")[], goalsScored: 1.7, goalsConceded: 1.2 },
      headToHead: { homeWins: 4, draws: 2, awayWins: 2, avgGoals: 2.6 },
      homeInjuries: { impactRating: "none" as const },
      awayInjuries: { impactRating: "none" as const },
      leagueImportance: "league" as const,
      leagueCode: "E0",
    };

    const healthy = analyzeMatch(baseInput);
    expect(healthy.modelMeta?.source).toBe("dixon-coles-v2");
    expect(healthy.modelMeta?.leagueCode).toBe("E0");
    expect(healthy.derivedMarkets.topScorelines).toHaveLength(5);
    expect(healthy.derivedMarkets.homeDnb).toBeGreaterThan(0);

    const injured = analyzeMatch({
      ...baseInput,
      homeInjuries: { impactRating: "major" },
    });
    expect(injured.homeWinProb).toBeLessThan(healthy.homeWinProb);

    const custom = analyzeMatch({
      ...baseInput,
      homeTeam: { ...baseInput.homeTeam, name: "Custom Home FC" },
      awayTeam: { ...baseInput.awayTeam, name: "Custom Away FC" },
      leagueCode: undefined,
    });
    expect(custom.modelMeta?.source).toBe("heuristic");
    expect(custom.derivedMarkets.topScorelines).toHaveLength(5);
  });

  it("applies Dixon-Coles low-score correlation in poisson1x2Probs when rho < 0", () => {
    const indep = poisson1x2Probs(1.3, 1.1, 10, 0);
    const dc = poisson1x2Probs(1.3, 1.1, 10, -0.135);
    expect(dc.draw).toBeGreaterThan(indep.draw);
    expect(dc.home + dc.draw + dc.away).toBeCloseTo(1, 6);
  });

  it("exposes all 39 seeded leagues in LEAGUE_MAP", () => {
    expect(Object.keys(LEAGUE_MAP).length).toBeGreaterThanOrEqual(39);
    expect(LEAGUE_MAP.DZ1.country).toBe("Algeria");
    expect(LEAGUE_MAP.EG1.country).toBe("Egypt");
    expect(LEAGUE_MAP.SN1.country).toBe("Senegal");
    expect(LEAGUE_MAP.BRA.country).toBe("Brazil");
    expect(LEAGUE_MAP.USA.country).toBe("USA");
  });

  it("derives valid full markets directly from lambdas", () => {
    const m = deriveFullMarkets(1.6, 1.1, -0.056);
    expect(m.homeWin + m.draw + m.awayWin).toBeCloseTo(1, 6);
    expect(m.btts + m.noBtts).toBeCloseTo(1, 6);
  });
});
