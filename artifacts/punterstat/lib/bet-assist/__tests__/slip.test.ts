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
});
