import { describe, it, expect } from "vitest";
import { assessSlip } from "../slip";

describe("lib/bet-assist/slip", () => {
  it("returns null for empty legs, invalid odds <= 1, or non-positive stake", () => {
    expect(assessSlip([], 10)).toBeNull();
    expect(assessSlip([{ selection: "Arsenal", decimalOdds: 1.0 }], 10)).toBeNull();
    expect(assessSlip([{ selection: "Arsenal", decimalOdds: 2.0 }], 0)).toBeNull();
    expect(assessSlip([{ selection: "Arsenal", decimalOdds: 2.0 }], -5)).toBeNull();
  });

  it("assesses a single leg using fair estimate when user probability is omitted", () => {
    const res = assessSlip([{ selection: "Arsenal to win", decimalOdds: 2.0 }], 20, 0.05);
    expect(res).not.toBeNull();
    expect(res!.combinedOdds).toBe(2);
    expect(res!.potentialReturn).toBe(40);
    expect(res!.potentialProfit).toBe(20);
    expect(res!.evSource).toBe("fair_estimate");
    expect(res!.yourProb).toBeNull();
    expect(res!.positives.some((p) => p.includes("single carries one margin"))).toBe(true);
  });

  it("uses user probabilities when provided on all legs and flags +EV", () => {
    const res = assessSlip(
      [
        { selection: "Home Win", decimalOdds: 2.2, yourProb: 0.55 },
        { selection: "Over 2.5", decimalOdds: 2.0, yourProb: 0.55 },
      ],
      10,
    );
    expect(res).not.toBeNull();
    expect(res!.evSource).toBe("yours");
    expect(res!.yourProb).toBeCloseTo(0.55 * 0.55, 6);
    expect(res!.ev).toBeGreaterThan(0);
    expect(res!.positives.some((p) => p.includes("positive expected value"))).toBe(true);
  });

  it("flags correlated same-event legs, short banker legs, and 5+ leg accumulators", () => {
    const res = assessSlip(
      [
        { selection: "Arsenal Win", event: "Arsenal vs Chelsea", decimalOdds: 1.15, yourProb: 0.7 },
        { selection: "Over 1.5", event: "arsenal vs chelsea", decimalOdds: 1.2, yourProb: 0.7 },
        { selection: "Liverpool Win", event: "Liverpool vs Everton", decimalOdds: 1.8 },
        { selection: "City Win", event: "Man City vs Spurs", decimalOdds: 1.6 },
        { selection: "Real Win", event: "Real Madrid vs Getafe", decimalOdds: 1.5 },
      ],
      10,
    );
    expect(res).not.toBeNull();
    expect(res!.warnings.some((w) => w.includes("5 legs compound"))).toBe(true);
    expect(res!.warnings.some((w) => w.includes("under 1.25"))).toBe(true);
    expect(res!.warnings.some((w) => w.includes("same event"))).toBe(true);
    expect(res!.warnings.some((w) => w.includes("negative EV"))).toBe(true);
  });

  it("blends matched model probabilities with fairProb on partial matches instead of discarding them", () => {
    const res = assessSlip(
      [
        { selection: "Arsenal Win", decimalOdds: 1.5, yourProb: 0.72 },
        { selection: "Obscure Team Win", decimalOdds: 2.0 },
      ],
      1000,
      0.05,
    );
    expect(res).not.toBeNull();
    expect(res!.evSource).toBe("blended");
    expect(res!.matchedLegCount).toBe(1);
    expect(res!.yourProb).toBeNull();
    const expectedLeg2Fair = (1 / 2.0) / 1.05;
    expect(res!.effectiveProb).toBeCloseTo(0.72 * expectedLeg2Fair, 6);
  });

  it("computes exact Cut-1 survival breakdown summing to 1", () => {
    const res = assessSlip(
      [
        { selection: "Leg 1", decimalOdds: 1.4, yourProb: 0.7 },
        { selection: "Leg 2", decimalOdds: 1.5, yourProb: 0.65 },
        { selection: "Leg 3", decimalOdds: 1.6, yourProb: 0.6 },
      ],
      1000,
    );
    expect(res).not.toBeNull();
    const { allWinProb, cutByOneProb, cutByTwoPlusProb } = res!.cutBreakdown;
    expect(allWinProb).toBeCloseTo(0.7 * 0.65 * 0.6, 6);
    expect(cutByOneProb).toBeCloseTo(
      0.3 * 0.65 * 0.6 + 0.7 * 0.35 * 0.6 + 0.7 * 0.65 * 0.4,
      6,
    );
    expect(allWinProb + cutByOneProb + cutByTwoPlusProb).toBeCloseTo(1, 6);
  });

  it("classifies combo markets, computes winsNeededPerLoss, and suggests trimming high-drag legs", () => {
    const res = assessSlip(
      [
        { selection: "Arsenal Win & Over 2.5", decimalOdds: 2.1, yourProb: 0.38 },
        { selection: "Man City Win", decimalOdds: 1.25, yourProb: 0.75 },
        { selection: "Liverpool Win", decimalOdds: 1.6, yourProb: 0.62 },
        { selection: "Barcelona Win", decimalOdds: 1.55, yourProb: 0.64 },
        { selection: "Bayern Win", decimalOdds: 1.2, yourProb: 0.76 },
      ],
      1000,
    );
    expect(res).not.toBeNull();
    expect(res!.legs[0].marketTier).toBe("combo");
    expect(res!.legs[1].likelihoodLabel).toBe("Very Likely");
    expect(res!.legs[1].winsNeededPerLoss).toBe(4);
    expect(res!.warnings.some((w) => w.includes("combo/exotic"))).toBe(true);
    expect(res!.trimSuggestion).not.toBeNull();
    expect(res!.trimSuggestion!.survivalBoostPct).toBeGreaterThanOrEqual(10);
    expect(res!.trimSuggestion!.newWinProb).toBeGreaterThan(res!.effectiveProb);
  });
});
