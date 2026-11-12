import { describe, it, expect } from "vitest";
import {
  scoreCalibration,
  scoreCalibrationTrend,
  type ResolvedPrediction,
} from "../scorer";

describe("lib/calibration/scorer", () => {
  it("handles an empty prediction set cleanly", () => {
    const summary = scoreCalibration([]);
    expect(summary.sampleSize).toBe(0);
    expect(summary.brierScore).toBe(0);
    expect(summary.accuracy).toBe(0);
    expect(summary.calibrationCurve).toHaveLength(5);
  });

  it("scores perfect predictions with Brier score 0 and accuracy 1", () => {
    const perfect: ResolvedPrediction[] = [
      { predictedHomeWinProb: 1, predictedDrawProb: 0, predictedAwayWinProb: 0, actualResult: "home_win" },
      { predictedHomeWinProb: 0, predictedDrawProb: 1, predictedAwayWinProb: 0, actualResult: "draw" },
      { predictedHomeWinProb: 0, predictedDrawProb: 0, predictedAwayWinProb: 1, actualResult: "away_win" },
    ];
    const summary = scoreCalibration(perfect);
    expect(summary.sampleSize).toBe(3);
    expect(summary.brierScore).toBe(0);
    expect(summary.accuracy).toBe(1);
  });

  it("normalises un-normalised probabilities and skips invalid zero/NaN predictions", () => {
    const mixed: ResolvedPrediction[] = [
      // Sums to 2.0 -> normalised to 0.5, 0.25, 0.25
      { predictedHomeWinProb: 1.0, predictedDrawProb: 0.5, predictedAwayWinProb: 0.5, actualResult: "home_win" },
      // Sums to 0 -> skipped
      { predictedHomeWinProb: 0, predictedDrawProb: 0, predictedAwayWinProb: 0, actualResult: "draw" },
    ];
    const summary = scoreCalibration(mixed);
    expect(summary.sampleSize).toBe(1);
    expect(summary.accuracy).toBe(1);
    // (0.5 - 1)^2 + (0.25 - 0)^2 + (0.25 - 0)^2 = 0.25 + 0.0625 + 0.0625 = 0.375
    expect(summary.brierScore).toBeCloseTo(0.375, 4);
  });

  it("computes calibration trend direction when sample size >= 6", () => {
    const predictions: ResolvedPrediction[] = [
      // Earlier half: poor calibration (confident wrong calls)
      { predictedHomeWinProb: 0.8, predictedDrawProb: 0.1, predictedAwayWinProb: 0.1, actualResult: "away_win" },
      { predictedHomeWinProb: 0.8, predictedDrawProb: 0.1, predictedAwayWinProb: 0.1, actualResult: "away_win" },
      { predictedHomeWinProb: 0.8, predictedDrawProb: 0.1, predictedAwayWinProb: 0.1, actualResult: "away_win" },
      // Recent half: strong calibration (confident right calls)
      { predictedHomeWinProb: 0.85, predictedDrawProb: 0.1, predictedAwayWinProb: 0.05, actualResult: "home_win" },
      { predictedHomeWinProb: 0.85, predictedDrawProb: 0.1, predictedAwayWinProb: 0.05, actualResult: "home_win" },
      { predictedHomeWinProb: 0.85, predictedDrawProb: 0.1, predictedAwayWinProb: 0.05, actualResult: "home_win" },
    ];

    const trend = scoreCalibrationTrend(predictions);
    expect(trend.direction).toBe("improving");
    expect(trend.earlierBrierScore).not.toBeNull();
    expect(trend.recentBrierScore).not.toBeNull();
    expect(trend.recentBrierScore!).toBeLessThan(trend.earlierBrierScore!);
    expect(trend.points).toHaveLength(2);
  });

  it("returns null trend direction when fewer than 6 predictions exist", () => {
    const trend = scoreCalibrationTrend([
      { predictedHomeWinProb: 0.6, predictedDrawProb: 0.2, predictedAwayWinProb: 0.2, actualResult: "home_win" },
    ]);
    expect(trend.direction).toBeNull();
    expect(trend.earlierBrierScore).toBeNull();
    expect(trend.recentBrierScore).toBeNull();
  });
});
