import { describe, expect, it } from "vitest";
import { computeClvPct } from "../closing-odds";

describe("lib/bet-assist/closing-odds", () => {
  it("computes positive and negative CLV percentages accurately", () => {
    // Took 2.10, closed at 1.90 -> +10.5% CLV
    expect(computeClvPct(2.1, 1.9)).toBeCloseTo(10.5, 1);
    // Took 1.80, closed at 2.00 -> -10.0% CLV
    expect(computeClvPct(1.8, 2.0)).toBeCloseTo(-10.0, 1);
    // Identical odds -> 0% CLV
    expect(computeClvPct(1.95, 1.95)).toBe(0);
  });

  it("returns null for invalid odds <= 1", () => {
    expect(computeClvPct(1.0, 1.9)).toBeNull();
    expect(computeClvPct(2.0, 1.0)).toBeNull();
  });
});
