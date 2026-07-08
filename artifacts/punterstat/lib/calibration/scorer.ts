export interface ResolvedPrediction {
  predictedHomeWinProb: number;
  predictedDrawProb: number;
  predictedAwayWinProb: number;
  actualResult: "home_win" | "draw" | "away_win";
}

export interface CalibrationBucket {
  bucketLabel: string;
  bucketMin: number;
  bucketMax: number;
  predictedAvg: number;
  actualFrequency: number;
  sampleSize: number;
}

export interface CalibrationSummary {
  sampleSize: number;
  brierScore: number;
  accuracy: number;
  calibrationCurve: CalibrationBucket[];
}

function outcomeProbFor(p: ResolvedPrediction, outcome: "home_win" | "draw" | "away_win"): number {
  if (outcome === "home_win") return p.predictedHomeWinProb;
  if (outcome === "draw") return p.predictedDrawProb;
  return p.predictedAwayWinProb;
}

function predictedOutcome(p: ResolvedPrediction): "home_win" | "draw" | "away_win" {
  const entries: Array<["home_win" | "draw" | "away_win", number]> = [
    ["home_win", p.predictedHomeWinProb],
    ["draw", p.predictedDrawProb],
    ["away_win", p.predictedAwayWinProb],
  ];
  return entries.reduce((best, cur) => (cur[1] > best[1] ? cur : best))[0];
}

/**
 * Multi-class Brier score across the three outcome classes (home/draw/away).
 * 0 = perfect, 2 = worst possible (matches the standard 3-outcome formulation
 * where each prediction is scored across all classes, not just the winner).
 * Lower is better; a well-calibrated football model typically lands
 * somewhere in the 0.55-0.70 range given draws are inherently hard to call.
 */
function brierScore(predictions: ResolvedPrediction[]): number {
  if (predictions.length === 0) return 0;
  const outcomes: Array<"home_win" | "draw" | "away_win"> = ["home_win", "draw", "away_win"];

  let total = 0;
  for (const p of predictions) {
    let sumSq = 0;
    for (const outcome of outcomes) {
      const predicted = outcomeProbFor(p, outcome);
      const actual = p.actualResult === outcome ? 1 : 0;
      sumSq += (predicted - actual) ** 2;
    }
    total += sumSq;
  }
  return total / predictions.length;
}

function accuracy(predictions: ResolvedPrediction[]): number {
  if (predictions.length === 0) return 0;
  const correct = predictions.filter((p) => predictedOutcome(p) === p.actualResult).length;
  return correct / predictions.length;
}

const BUCKETS = [
  { label: "0-20%", min: 0, max: 0.2 },
  { label: "20-40%", min: 0.2, max: 0.4 },
  { label: "40-60%", min: 0.4, max: 0.6 },
  { label: "60-80%", min: 0.6, max: 0.8 },
  { label: "80-100%", min: 0.8, max: 1.01 },
];

/**
 * Reliability/calibration curve: buckets every (outcome, predicted
 * probability) pair by its predicted probability, then compares the
 * average predicted probability in that bucket against how often that
 * outcome actually happened. A well-calibrated model tracks the diagonal
 * (predictedAvg ≈ actualFrequency) in every bucket.
 */
function calibrationCurve(predictions: ResolvedPrediction[]): CalibrationBucket[] {
  const outcomes: Array<"home_win" | "draw" | "away_win"> = ["home_win", "draw", "away_win"];

  return BUCKETS.map(({ label, min, max }) => {
    let predictedSum = 0;
    let occurred = 0;
    let count = 0;

    for (const p of predictions) {
      for (const outcome of outcomes) {
        const predicted = outcomeProbFor(p, outcome);
        if (predicted >= min && predicted < max) {
          count += 1;
          predictedSum += predicted;
          if (p.actualResult === outcome) occurred += 1;
        }
      }
    }

    return {
      bucketLabel: label,
      bucketMin: min,
      bucketMax: max,
      predictedAvg: count > 0 ? predictedSum / count : 0,
      actualFrequency: count > 0 ? occurred / count : 0,
      sampleSize: count,
    };
  });
}

/**
 * Computes the full calibration summary for a set of resolved predictions.
 * Unresolved predictions (no actual_result yet) should be filtered out by
 * the caller before this is invoked.
 */
export function scoreCalibration(predictions: ResolvedPrediction[]): CalibrationSummary {
  return {
    sampleSize: predictions.length,
    brierScore: Math.round(brierScore(predictions) * 10000) / 10000,
    accuracy: Math.round(accuracy(predictions) * 1000) / 1000,
    calibrationCurve: calibrationCurve(predictions),
  };
}
