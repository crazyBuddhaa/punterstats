import { describe, it, expect } from "vitest";
import {
  stripOverround,
  impliedProbability,
  fairOddsFromProbability,
} from "../devig";

describe("lib/odds/devig", () => {
  it("strips overround from a 3-way 1X2 market and normalises fair probabilities", () => {
    const res = stripOverround([2.0, 3.5, 4.0]);
    // Raw implied: 0.5, 0.2857, 0.25 -> sum = 1.0357 -> 3.6% overround
    expect(res.rawImplied).toEqual([0.5, 0.286, 0.25]);
    expect(res.overroundPct).toBe(3.6);
    const fairSum = res.fair.reduce((s, p) => s + p, 0);
    expect(fairSum).toBeCloseTo(1, 2);
  });

  it("clamps invalid odds <= 1 safely instead of dividing by zero", () => {
    const res = stripOverround([1.0, -2.0]);
    expect(res.fair[0]).toBeCloseTo(0.5, 2);
    expect(res.fair[1]).toBeCloseTo(0.5, 2);
  });

  it("computes single-outcome impliedProbability and fairOddsFromProbability", () => {
    expect(impliedProbability(2.5)).toBe(0.4);
    expect(impliedProbability(1.0)).toBe(0);
    expect(impliedProbability(0)).toBe(0);

    expect(fairOddsFromProbability(0.4)).toBe(2.5);
    expect(fairOddsFromProbability(0)).toBe(Infinity);
    expect(fairOddsFromProbability(-0.1)).toBe(Infinity);
  });
});
