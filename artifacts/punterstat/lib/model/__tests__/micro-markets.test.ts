import { describe, expect, it } from "vitest";
import {
  CARDS_DISPERSION_R,
  CORNERS_DISPERSION_R,
  deriveCardMarkets,
  deriveCornerMarkets,
  negBinomPmf,
  probOverLine,
} from "../micro-markets";
import { deriveFullMarkets } from "../dixon-coles-engine";
import { estimateSelectionProb, type MatchIntel } from "@/lib/football/match-intel";

describe("lib/model/micro-markets (Corners & Cards Negative Binomial)", () => {
  it("normalizes Negative Binomial PMF to ~1 over reasonable counts", () => {
    let sum = 0;
    for (let k = 0; k <= 50; k++) {
      sum += negBinomPmf(10.2, CORNERS_DISPERSION_R, k);
    }
    expect(sum).toBeCloseTo(1, 5);
  });

  it("produces monotonic Over/Under probabilities for corners and cards", () => {
    const cm = deriveCornerMarkets(5.8, 4.4);
    expect(cm.expectedTotal).toBeCloseTo(10.2, 1);
    expect(cm.over75).toBeGreaterThan(cm.over85);
    expect(cm.over85).toBeGreaterThan(cm.over95);
    expect(cm.over95).toBeGreaterThan(cm.over105);
    expect(cm.over105).toBeGreaterThan(cm.over115);
    expect(cm.over95 + cm.under95).toBeCloseTo(1, 4);

    const dm = deriveCardMarkets(2.1, 2.4);
    expect(dm.expectedTotal).toBeCloseTo(4.5, 1);
    expect(dm.over25).toBeGreaterThan(dm.over35);
    expect(dm.over35).toBeGreaterThan(dm.over45);
    expect(dm.over45).toBeGreaterThan(dm.over55);
    expect(dm.over35 + dm.under35).toBeCloseTo(1, 4);
  });

  it("prices total and team corner/card selections inside estimateSelectionProb", () => {
    const intel: MatchIntel = {
      homeTeam: "Arsenal",
      awayTeam: "Chelsea",
      competitionStage: "derby",
      homeLineup: "full_strength",
      awayLineup: "full_strength",
      home: {
        name: "Arsenal",
        last5: ["W", "W", "D", "W", "W"],
        pointsLast5: 13,
        avgGoalsFor: 2.1,
        avgGoalsAgainst: 0.9,
        venueAvgGoalsFor: 2.3,
        venueAvgGoalsAgainst: 0.8,
        venueSampleSize: 6,
        avgCornersFor: 6.2,
        avgCornersAgainst: 3.8,
        cornersSampleSize: 10,
        avgCardsFor: 1.8,
        avgCardsAgainst: 2.3,
        cardsSampleSize: 10,
        daysSinceLastMatch: 5,
        cleanSheetPct: 45,
        elo: 1920,
        sampleSize: 12,
      },
      away: {
        name: "Chelsea",
        last5: ["W", "D", "W", "L", "W"],
        pointsLast5: 10,
        avgGoalsFor: 1.7,
        avgGoalsAgainst: 1.2,
        venueAvgGoalsFor: 1.5,
        venueAvgGoalsAgainst: 1.3,
        venueSampleSize: 6,
        avgCornersFor: 5.1,
        avgCornersAgainst: 4.9,
        cornersSampleSize: 10,
        avgCardsFor: 2.4,
        avgCardsAgainst: 2.0,
        cardsSampleSize: 10,
        daysSinceLastMatch: 6,
        cleanSheetPct: 30,
        elo: 1840,
        sampleSize: 12,
      },
      h2h: { meetings: 6, homeWins: 3, draws: 2, awayWins: 1, avgGoals: 2.5, bttsPct: 50 },
      lambdaHome: 1.75,
      lambdaAway: 1.05,
      rho: -0.056,
      markets: deriveFullMarkets(1.75, 1.05, -0.056),
      microMarkets: {
        corners: deriveCornerMarkets(6.0, 4.4),
        cards: deriveCardMarkets(2.2, 2.6),
      },
      strengthEdgeLabel: "Moderate Arsenal edge",
      dataSource: "dixon_coles+history",
      factors: [],
      riskNotes: [],
    };

    const pOver95Corners = estimateSelectionProb(intel, "Over 9.5 corners");
    expect(pOver95Corners).not.toBeNull();
    expect(pOver95Corners!).toBeCloseTo(probOverLine(10.4, 9.5, CORNERS_DISPERSION_R), 4);

    const pArsenalCorners = estimateSelectionProb(intel, "Arsenal Over 5.5 corners");
    expect(pArsenalCorners).not.toBeNull();
    expect(pArsenalCorners!).toBeCloseTo(probOverLine(6.0, 5.5, CORNERS_DISPERSION_R), 4);

    const pUnder45Cards = estimateSelectionProb(intel, "Under 4.5 bookings");
    expect(pUnder45Cards).not.toBeNull();
    expect(pUnder45Cards!).toBeCloseTo(1 - probOverLine(4.8, 4.5, CARDS_DISPERSION_R), 4);
  });
});
