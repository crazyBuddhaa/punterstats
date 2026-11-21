import { describe, expect, it } from "vitest";
import { validateSimulationMarket } from "../market-validator";

describe("validateSimulationMarket", () => {
  it("validates and evaluates European handicaps like Home (2:0) and Home (3:0)", () => {
    const h20 = validateSimulationMarket("Home (2:0)");
    expect(h20.status).toBe("simulatable");
    expect(h20.canonicalLabel).toBe("Home (2:0)");
    expect(h20.evaluate?.(0, 1)).toBe("won"); // 2:1
    expect(h20.evaluate?.(0, 2)).toBe("lost"); // 2:2 (draw, not home win in 3-way EH)
    expect(h20.evaluate?.(1, 2)).toBe("won"); // 3:2

    const h30 = validateSimulationMarket("Handicap 3:0 - Home");
    expect(h30.status).toBe("simulatable");
    expect(h30.canonicalLabel).toBe("Home (3:0)");
    expect(h30.evaluate?.(0, 2)).toBe("won");
    expect(h30.evaluate?.(0, 3)).toBe("lost");
  });

  it("validates team goals, DNB, and combos including team names", () => {
    const teamGoal = validateSimulationMarket("Barcelona Over 0.5", "Sabah", "Barcelona");
    expect(teamGoal.status).toBe("simulatable");
    expect(teamGoal.canonicalLabel).toBe("Away Over 0.5");
    expect(teamGoal.evaluate?.(0, 1)).toBe("won");
    expect(teamGoal.evaluate?.(2, 0)).toBe("lost");

    const combo = validateSimulationMarket("1X & Under 3.5");
    expect(combo.status).toBe("simulatable");
    expect(combo.evaluate?.(2, 1)).toBe("won");
    expect(combo.evaluate?.(2, 2)).toBe("lost");
    expect(combo.evaluate?.(0, 1)).toBe("lost");

    const dnb = validateSimulationMarket("Home DNB");
    expect(dnb.status).toBe("simulatable");
    expect(dnb.evaluate?.(1, 1)).toBe("void");
    expect(dnb.evaluate?.(2, 1)).toBe("won");
  });

  it("flags valid football markets that cannot be simulated with full-time goal data", () => {
    const firstHalf = validateSimulationMarket("1st Half - Double Chance 1X");
    expect(firstHalf.status).toBe("unsupported_data");
    expect(firstHalf.evaluate).toBeUndefined();

    const corners = validateSimulationMarket("Over 9.5 Corners");
    expect(corners.status).toBe("unsupported_data");

    const scorer = validateSimulationMarket("Bukayo Saka Anytime Goalscorer");
    expect(scorer.status).toBe("unsupported_data");
  });

  it("rejects unrecognized gibberish inputs", () => {
    const bad = validateSimulationMarket("banana123");
    expect(bad.status).toBe("invalid");
    expect(bad.evaluate).toBeUndefined();
  });
});
