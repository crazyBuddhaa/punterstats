import { describe, expect, it } from "vitest";
import { blendModelWithMarket, mapSelectionToSharpProb } from "../sharp-check";

describe("lib/odds/sharp-check", () => {
  const fair1x2 = { homeFair: 0.62, drawFair: 0.23, awayFair: 0.15 };

  it("maps 1X2, Double Chance, and DNB selections accurately", () => {
    expect(mapSelectionToSharpProb("Arsenal to win", "Arsenal", "Everton", fair1x2)).toBeCloseTo(0.62, 5);
    expect(mapSelectionToSharpProb("Draw", "Arsenal", "Everton", fair1x2)).toBeCloseTo(0.23, 5);
    expect(mapSelectionToSharpProb("Everton", "Arsenal", "Everton", fair1x2)).toBeCloseTo(0.15, 5);
    expect(mapSelectionToSharpProb("1X", "Arsenal", "Everton", fair1x2)).toBeCloseTo(0.85, 5);
    expect(mapSelectionToSharpProb("X2", "Arsenal", "Everton", fair1x2)).toBeCloseTo(0.38, 5);
    expect(mapSelectionToSharpProb("Arsenal DNB", "Arsenal", "Everton", fair1x2)).toBeCloseTo(
      0.62 / (0.62 + 0.15),
      5,
    );
  });

  it("returns null for goals, BTTS, or combo selections so 1X2 sharp odds are not misapplied", () => {
    expect(mapSelectionToSharpProb("Over 2.5 goals", "Arsenal", "Everton", fair1x2)).toBeNull();
    expect(mapSelectionToSharpProb("BTTS Yes", "Arsenal", "Everton", fair1x2)).toBeNull();
    expect(mapSelectionToSharpProb("Arsenal Win and Over 2.5", "Arsenal", "Everton", fair1x2)).toBeNull();
  });

  it("blends model and market probabilities smoothly in log-odds space", () => {
    const blended = blendModelWithMarket(0.75, 0.60, 0.5);
    expect(blended).toBeGreaterThan(0.60);
    expect(blended).toBeLessThan(0.75);
  });
});
