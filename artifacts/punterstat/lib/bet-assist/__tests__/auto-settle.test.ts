import { describe, expect, it } from "vitest";
import {
  deriveAccumulatorStatus,
  effectiveAccaOdds,
  evaluateSelection,
  parseFixtureTeams,
} from "../auto-settle";

describe("parseFixtureTeams", () => {
  it("parses common football fixture separators", () => {
    expect(parseFixtureTeams("Arsenal vs Chelsea")).toEqual({
      homeTeam: "Arsenal",
      awayTeam: "Chelsea",
    });
    expect(parseFixtureTeams("Liverpool v Man City")).toEqual({
      homeTeam: "Liverpool",
      awayTeam: "Man City",
    });
    expect(parseFixtureTeams("Real Madrid - Barcelona")).toEqual({
      homeTeam: "Real Madrid",
      awayTeam: "Barcelona",
    });
  });

  it("returns null for unparseable strings", () => {
    expect(parseFixtureTeams("5-leg accumulator")).toBeNull();
  });
});

describe("evaluateSelection", () => {
  it("evaluates 1X2 selections", () => {
    expect(evaluateSelection("Arsenal to win", "1X2", "Arsenal", "Chelsea", 2, 1)).toBe("won");
    expect(evaluateSelection("Chelsea to win", "1X2", "Arsenal", "Chelsea", 2, 1)).toBe("lost");
    expect(evaluateSelection("Draw", "1X2", "Arsenal", "Chelsea", 1, 1)).toBe("won");
    expect(evaluateSelection("1", "1X2", "Arsenal", "Chelsea", 2, 0)).toBe("won");
    expect(evaluateSelection("2", "1X2", "Arsenal", "Chelsea", 2, 0)).toBe("lost");
  });

  it("evaluates Over/Under goals", () => {
    expect(evaluateSelection("Over 2.5 goals", "Over/Under", "Arsenal", "Chelsea", 2, 1)).toBe("won");
    expect(evaluateSelection("Over 2.5", "Over/Under", "Arsenal", "Chelsea", 1, 1)).toBe("lost");
    expect(evaluateSelection("Under 2.5", "Over/Under", "Arsenal", "Chelsea", 1, 1)).toBe("won");
    expect(evaluateSelection("Over 2", "Over/Under", "Arsenal", "Chelsea", 1, 1)).toBe("void");
  });

  it("evaluates BTTS (GG / NG)", () => {
    expect(evaluateSelection("BTTS Yes", "BTTS", "Arsenal", "Chelsea", 2, 1)).toBe("won");
    expect(evaluateSelection("GG", "BTTS", "Arsenal", "Chelsea", 2, 0)).toBe("lost");
    expect(evaluateSelection("NG", "BTTS", "Arsenal", "Chelsea", 2, 0)).toBe("won");
  });

  it("evaluates Double Chance and Draw No Bet", () => {
    expect(evaluateSelection("1X", "Double chance", "Arsenal", "Chelsea", 1, 1)).toBe("won");
    expect(evaluateSelection("X2", "Double chance", "Arsenal", "Chelsea", 2, 1)).toBe("lost");
    expect(evaluateSelection("Arsenal DNB", "Draw No Bet", "Arsenal", "Chelsea", 1, 1)).toBe("void");
    expect(evaluateSelection("Arsenal DNB", "Draw No Bet", "Arsenal", "Chelsea", 2, 1)).toBe("won");
  });
});

describe("deriveAccumulatorStatus", () => {
  it("immediately marks accumulator lost if 1+ leg is lost even with pending legs", () => {
    const res = deriveAccumulatorStatus(["won", "lost", "pending", "pending"]);
    expect(res.status).toBe("lost");
    expect(res.lostLegs).toBe(1);
    expect(res.pendingLegs).toBe(2);
  });

  it("keeps accumulator pending if 0 legs lost and 1+ leg pending", () => {
    const res = deriveAccumulatorStatus(["won", "won", "pending"]);
    expect(res.status).toBe("pending");
  });

  it("marks accumulator won when all active legs win (ignoring void legs)", () => {
    const res = deriveAccumulatorStatus(["won", "void", "won"]);
    expect(res.status).toBe("won");
    expect(
      effectiveAccaOdds([
        { odds: 1.5, status: "won" },
        { odds: 2.0, status: "void" },
        { odds: 1.8, status: "won" },
      ]),
    ).toBe(2.7);
  });

  it("marks accumulator void when all legs are void", () => {
    expect(deriveAccumulatorStatus(["void", "void"]).status).toBe("void");
  });
});
