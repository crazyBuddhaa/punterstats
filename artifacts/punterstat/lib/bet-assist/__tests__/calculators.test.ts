import { describe, it, expect } from "vitest";
import {
  toDecimal,
  decimalToFractional,
  decimalToAmerican,
  convertOdds,
  marketMargin,
  expectedValue,
  kellyStake,
  accumulator,
  arbitrage,
  round,
  pct,
} from "../calculators";

describe("lib/bet-assist/calculators", () => {
  describe("toDecimal & convertOdds", () => {
    it("parses valid decimal odds", () => {
      expect(toDecimal("2.50", "decimal")).toBe(2.5);
      expect(toDecimal(" 1.05 ", "decimal")).toBe(1.05);
    });

    it("rejects decimal odds <= 1 or non-numeric strings", () => {
      expect(toDecimal("1", "decimal")).toBeNull();
      expect(toDecimal("1.0", "decimal")).toBeNull();
      expect(toDecimal("0.95", "decimal")).toBeNull();
      expect(toDecimal("-2.0", "decimal")).toBeNull();
      expect(toDecimal("", "decimal")).toBeNull();
      expect(toDecimal("abc", "decimal")).toBeNull();
    });

    it("parses valid fractional odds", () => {
      expect(toDecimal("6/4", "fractional")).toBe(2.5);
      expect(toDecimal("1 - 2", "fractional")).toBe(1.5);
      expect(toDecimal("11/10", "fractional")).toBeCloseTo(2.1, 5);
    });

    it("rejects invalid fractional odds", () => {
      expect(toDecimal("0/4", "fractional")).toBeNull();
      expect(toDecimal("4/0", "fractional")).toBeNull();
      expect(toDecimal("invalid", "fractional")).toBeNull();
    });

    it("parses valid American odds", () => {
      expect(toDecimal("+150", "american")).toBe(2.5);
      expect(toDecimal("150", "american")).toBe(2.5);
      expect(toDecimal("-200", "american")).toBe(1.5);
      expect(toDecimal("+100", "american")).toBe(2);
      expect(toDecimal("-100", "american")).toBe(2);
    });

    it("rejects American odds with magnitude < 100", () => {
      expect(toDecimal("+99", "american")).toBeNull();
      expect(toDecimal("-50", "american")).toBeNull();
      expect(toDecimal("0", "american")).toBeNull();
    });

    it("converts between decimal, fractional, American, and implied probability", () => {
      expect(decimalToFractional(2.5)).toBe("3/2");
      expect(decimalToFractional(1.5)).toBe("1/2");
      expect(decimalToAmerican(2.5)).toBe("+150");
      expect(decimalToAmerican(1.5)).toBe("-200");

      const converted = convertOdds("2.0", "decimal");
      expect(converted).toEqual({
        decimal: 2,
        fractional: "1/1",
        american: "+100",
        impliedProb: 0.5,
      });
      expect(convertOdds("1.0", "decimal")).toBeNull();
    });
  });

  describe("marketMargin", () => {
    it("calculates overround and fair probabilities for a 2-way market", () => {
      const res = marketMargin([1.91, 1.91]);
      expect(res).not.toBeNull();
      expect(res!.margin).toBeCloseTo(2 / 1.91 - 1, 5);
      expect(res!.fairProbs[0]).toBeCloseTo(0.5, 5);
      expect(res!.fairProbs[1]).toBeCloseTo(0.5, 5);
      expect(res!.fairOdds[0]).toBeCloseTo(2.0, 5);
    });

    it("returns null for fewer than 2 outcomes or odds <= 1", () => {
      expect(marketMargin([2.0])).toBeNull();
      expect(marketMargin([2.0, 1.0])).toBeNull();
      expect(marketMargin([2.0, 0.8])).toBeNull();
      expect(marketMargin([])).toBeNull();
    });
  });

  describe("expectedValue & kellyStake", () => {
    it("computes EV per unit staked", () => {
      expect(expectedValue(0.5, 2.1)).toBeCloseTo(0.05, 6);
      expect(expectedValue(0.5, 2.0)).toBeCloseTo(0, 6);
      expect(expectedValue(0.4, 2.0)).toBeCloseTo(-0.2, 6);
    });

    it("computes positive Kelly fraction and stake when EV > 0", () => {
      // p = 0.55, odds = 2.0 (b = 1) -> full Kelly = (1*0.55 - 0.45)/1 = 0.10
      const res = kellyStake(0.55, 2.0, 1000, 0.25);
      expect(res.fullFraction).toBeCloseTo(0.1, 6);
      expect(res.fraction).toBeCloseTo(0.025, 6);
      expect(res.stake).toBe(25);
      expect(res.edge).toBeCloseTo(0.1, 6);
    });

    it("clamps Kelly fraction and stake to 0 when edge is negative or zero", () => {
      const neg = kellyStake(0.45, 2.0, 1000, 0.25);
      expect(neg.fullFraction).toBe(0);
      expect(neg.fraction).toBe(0);
      expect(neg.stake).toBe(0);
      expect(neg.edge).toBeCloseTo(-0.1, 6);
    });

    it("handles edge cases: odds <= 1, prob <= 0, prob >= 1, zero bankroll", () => {
      expect(kellyStake(0.6, 1.0, 1000).stake).toBe(0);
      expect(kellyStake(0.6, 0.9, 1000).stake).toBe(0);
      expect(kellyStake(0, 2.5, 1000).stake).toBe(0);
      expect(kellyStake(1, 2.5, 1000).stake).toBe(0);
      expect(kellyStake(0.6, 2.5, 0).stake).toBe(0);
    });
  });

  describe("accumulator", () => {
    it("calculates combined odds, returns, profit, and compounded margin", () => {
      const res = accumulator([2.0, 1.5, 2.0], 10, 0.05);
      expect(res).not.toBeNull();
      expect(res!.combinedOdds).toBe(6);
      expect(res!.impliedProb).toBeCloseTo(1 / 6, 6);
      expect(res!.returns).toBe(60);
      expect(res!.profit).toBe(50);
      expect(res!.compoundedMargin).toBeCloseTo(Math.pow(1.05, 3) - 1, 6);
    });

    it("handles zero stake and rejects empty legs or legs with odds <= 1", () => {
      const zeroStake = accumulator([2.0, 2.0], 0);
      expect(zeroStake).not.toBeNull();
      expect(zeroStake!.returns).toBe(0);
      expect(zeroStake!.profit).toBe(0);

      expect(accumulator([], 10)).toBeNull();
      expect(accumulator([2.0, 1.0], 10)).toBeNull();
      expect(accumulator([2.0, -1.5], 10)).toBeNull();
    });
  });

  describe("arbitrage", () => {
    it("identifies a profitable arbitrage opportunity when book < 1", () => {
      const res = arbitrage([2.1, 2.1], 100);
      expect(res).not.toBeNull();
      expect(res!.isArb).toBe(true);
      expect(res!.book).toBeCloseTo(2 / 2.1, 6);
      expect(res!.profitPct).toBeCloseTo(2.1 / 2 - 1, 6);
      expect(res!.stakes).toEqual([50, 50]);
      expect(res!.payout).toBe(105);
    });

    it("identifies non-arbitrage when book >= 1", () => {
      const res = arbitrage([1.9, 1.9], 100);
      expect(res).not.toBeNull();
      expect(res!.isArb).toBe(false);
      expect(res!.book).toBeGreaterThan(1);
      expect(res!.profitPct).toBeLessThan(0);
    });

    it("returns null for invalid inputs (odds <= 1, zero stake, single outcome)", () => {
      expect(arbitrage([2.1], 100)).toBeNull();
      expect(arbitrage([2.1, 1.0], 100)).toBeNull();
      expect(arbitrage([2.1, 2.1], 0)).toBeNull();
      expect(arbitrage([2.1, 2.1], -50)).toBeNull();
    });
  });

  describe("round & pct helpers", () => {
    it("rounds numbers and formats percentages", () => {
      expect(round(1.2345, 2)).toBe(1.23);
      expect(round(1.2355, 2)).toBe(1.24);
      expect(pct(0.1234, 1)).toBe("12.3%");
    });
  });
});
