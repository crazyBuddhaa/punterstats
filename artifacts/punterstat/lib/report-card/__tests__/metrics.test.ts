import { describe, it, expect } from "vitest";
import type { JournalBet } from "@/lib/bet-assist/journal";
import {
  computeReportCard,
  computeBootstrapRoiInterval,
  computeMedian,
  MIN_SETTLED_FOR_VERDICT,
  MIN_CLV_SAMPLES_FOR_SKILL,
  DEFAULT_MIN_LEAK_SAMPLE,
  ODDS_BANDS,
} from "../metrics";
import { LEAK_LESSON_MAP } from "../leaks";

let seq = 0;

function makeBet(overrides: Partial<JournalBet> = {}): JournalBet {
  seq += 1;
  const iso = new Date(Date.UTC(2026, 0, 1, 0, seq)).toISOString();
  return {
    id: `00000000-0000-4000-8000-${String(seq).padStart(12, "0")}`,
    placedAt: iso,
    settledAt: iso,
    sport: "football",
    eventName: `Match ${seq}`,
    market: "1X2",
    selection: "Home Win",
    bookmaker: "Pinnacle",
    odds: 2.0,
    stake: 100,
    yourProb: null,
    closingOdds: null,
    status: "won",
    cashoutAmount: null,
    notes: null,
    ...overrides,
  };
}

describe("lib/report-card/metrics", () => {
  it("handles empty input cleanly", () => {
    const card = computeReportCard([]);
    expect(card.totalBets).toBe(0);
    expect(card.settledBets).toBe(0);
    expect(card.pendingBets).toBe(0);
    expect(card.voidBets).toBe(0);
    expect(card.staked).toBe(0);
    expect(card.profit).toBe(0);
    expect(card.roi).toBe(0);
    expect(card.strikeRate).toBe(0);
    expect(card.breakEvenRate).toBe(0);
    expect(card.maxDrawdown).toBe(0);
    expect(card.clv.mean).toBeNull();
    expect(card.clv.sampleCount).toBe(0);
    expect(card.expectedVsActual.expectedProfit).toBeNull();
    expect(card.expectedVsActual.isApproximate).toBe(true);
    expect(card.calibration.sampleSize).toBe(0);
    expect(card.verdict).toBe("too_early");
    expect(card.leaks).toEqual([]);
    expect(card.breakdowns.byOddsBand).toHaveLength(ODDS_BANDS.length);
  });

  it("excludes void and pending bets from settled counts and ROI while handling half_won, half_lost, and cashed_out consistently with betProfit", () => {
    const bets: JournalBet[] = [
      makeBet({ status: "won", odds: 2.0, stake: 100 }), // +100
      makeBet({ status: "lost", odds: 2.0, stake: 100 }), // -100
      makeBet({ status: "half_won", odds: 2.0, stake: 100 }), // +50
      makeBet({ status: "half_lost", odds: 2.0, stake: 100 }), // -50
      makeBet({ status: "cashed_out", odds: 3.0, stake: 100, cashoutAmount: 140 }), // +40
      makeBet({ status: "cashed_out", odds: 3.0, stake: 100, cashoutAmount: 60 }), // -40
      makeBet({ status: "void", odds: 2.5, stake: 500, closingOdds: 2.0 }), // excluded
      makeBet({ status: "pending", odds: 2.5, stake: 500 }), // excluded
    ];

    const card = computeReportCard(bets);
    expect(card.totalBets).toBe(8);
    expect(card.settledBets).toBe(6);
    expect(card.voidBets).toBe(1);
    expect(card.pendingBets).toBe(1);
    expect(card.staked).toBe(600);
    // Net profit: +100 - 100 + 50 - 50 + 40 - 40 = 0
    expect(card.profit).toBe(0);
    expect(card.roi).toBe(0);
    // Wins: won, half_won, cashed_out(140 > 100) => 3 of 6
    expect(card.wins).toBe(3);
    expect(card.losses).toBe(3);
    expect(card.strikeRate).toBeCloseTo(0.5, 4);
    // Void bet with closingOdds is excluded from CLV
    expect(card.clv.sampleCount).toBe(0);
  });

  it("computes strike rate vs break-even as mean implied probability (1/odds) of settled bets", () => {
    const bets: JournalBet[] = [
      makeBet({ status: "won", odds: 1.5, stake: 100 }), // 1/1.5 = 0.6667
      makeBet({ status: "won", odds: 2.0, stake: 100 }), // 1/2.0 = 0.5000
      makeBet({ status: "lost", odds: 4.0, stake: 100 }), // 1/4.0 = 0.2500
    ];

    const card = computeReportCard(bets);
    const expectedBreakEven = (1 / 1.5 + 1 / 2.0 + 1 / 4.0) / 3; // 0.4722
    expect(card.breakEvenRate).toBeCloseTo(expectedBreakEven, 4);
    expect(card.strikeRate).toBeCloseTo(2 / 3, 4);
    expect(card.strikeVsBreakEven).toBeCloseTo(2 / 3 - expectedBreakEven, 3);
  });

  it("computes max drawdown accurately across peak-to-trough sequences", () => {
    const bets: JournalBet[] = [
      makeBet({ status: "won", odds: 2.0, stake: 100, settledAt: "2026-01-01T10:00:00Z" }), // cum +100, peak 100, dd 0
      makeBet({ status: "won", odds: 2.5, stake: 100, settledAt: "2026-01-02T10:00:00Z" }), // cum +250, peak 250, dd 0
      makeBet({ status: "lost", odds: 2.0, stake: 100, settledAt: "2026-01-03T10:00:00Z" }), // cum +150, peak 250, dd 100
      makeBet({ status: "lost", odds: 2.0, stake: 120, settledAt: "2026-01-04T10:00:00Z" }), // cum +30,  peak 250, dd 220
      makeBet({ status: "won", odds: 3.0, stake: 150, settledAt: "2026-01-05T10:00:00Z" }), // cum +330, peak 330, dd 0
      makeBet({ status: "lost", odds: 2.0, stake: 50, settledAt: "2026-01-06T10:00:00Z" }), // cum +280, peak 330, dd 50
    ];

    const card = computeReportCard(bets);
    expect(card.maxDrawdown).toBe(220);
    expect(card.equityCurve).toHaveLength(6);
    expect(card.equityCurve[3].drawdown).toBe(220);
    expect(card.equityCurve[4].drawdown).toBe(0);
  });

  it("computes CLV and approximate expected vs actual profit from closing odds", () => {
    const bets: JournalBet[] = [
      // odds 2.20 vs close 2.00 -> CLV = +10%, expected profit = 100 * 0.10 = +10, actual = +120
      makeBet({ status: "won", odds: 2.2, closingOdds: 2.0, stake: 100 }),
      // odds 1.90 vs close 2.00 -> CLV = -5%, expected profit = 200 * (-0.05) = -10, actual = -200
      makeBet({ status: "lost", odds: 1.9, closingOdds: 2.0, stake: 200 }),
      // no closing odds -> not in CLV sample
      makeBet({ status: "won", odds: 2.0, closingOdds: null, stake: 100 }),
    ];

    const card = computeReportCard(bets);
    expect(card.clv.sampleCount).toBe(2);
    expect(card.clv.mean).toBeCloseTo((0.1 - 0.05) / 2, 4);
    expect(card.clv.positiveShare).toBe(0.5);

    expect(card.expectedVsActual.isApproximate).toBe(true);
    expect(card.expectedVsActual.sampleSize).toBe(2);
    expect(card.expectedVsActual.expectedProfit).toBeCloseTo(0, 2);
    expect(card.expectedVsActual.actualProfit).toBeCloseTo(-80, 2);
    expect(card.expectedVsActual.delta).toBeCloseTo(-80, 2);
  });

  it("computes calibration Brier score and probability buckets by reusing scoreCalibration", () => {
    const bets: JournalBet[] = [
      makeBet({ status: "won", yourProb: 0.75 }),
      makeBet({ status: "won", yourProb: 0.65 }),
      makeBet({ status: "lost", yourProb: 0.25 }),
      makeBet({ status: "won", yourProb: null }),
    ];

    const card = computeReportCard(bets);
    expect(card.calibration.sampleSize).toBe(3);
    expect(card.calibration.brierScore).toBeGreaterThan(0);
    expect(card.calibration.brierScore).toBeLessThan(0.3);
    expect(card.calibration.binaryBrierScore).toBeCloseTo(card.calibration.brierScore / 2, 3);

    const bucket6080 = card.calibration.userProbBuckets.find((b) => b.bucketLabel === "60-80%");
    expect(bucket6080?.sampleSize).toBe(2);
    expect(bucket6080?.actualFrequency).toBe(1);
  });

  it("produces breakdowns by market, odds band, bookmaker, stake tertile, and bet type", () => {
    const bets: JournalBet[] = [
      makeBet({ market: "1X2", odds: 1.4, bookmaker: "Bet365", stake: 50, status: "won" }),
      makeBet({ market: "Over/Under", odds: 1.8, bookmaker: "Pinnacle", stake: 100, status: "lost" }),
      makeBet({ market: "BTTS", odds: 2.4, bookmaker: "Pinnacle", stake: 200, status: "won" }),
      makeBet({ market: "Asian handicap", odds: 3.5, bookmaker: "Betfair", stake: 100, status: "lost" }),
      makeBet({ market: "Accumulator", odds: 6.0, bookmaker: "Bet365", stake: 50, status: "lost" }),
    ];

    const card = computeReportCard(bets);
    expect(card.breakdowns.byMarket.map((m) => m.key)).toHaveLength(5);
    expect(card.breakdowns.byOddsBand.map((b) => b.key)).toEqual(["<1.5", "1.5-2", "2-3", "3-5", "5+"]);
    expect(card.breakdowns.byOddsBand.every((b) => b.bets === 1)).toBe(true);
    expect(card.breakdowns.byBookmaker.find((b) => b.key === "Pinnacle")?.bets).toBe(2);
    expect(card.breakdowns.byStakeTertile).toHaveLength(3);
    expect(card.breakdowns.byBetType.find((t) => t.key === "accumulator")?.bets).toBe(1);
    expect(card.breakdowns.byBetType.find((t) => t.key === "single")?.bets).toBe(4);
    expect(card.breakdowns.betTypeNote).toContain("leg_count");
  });

  it("classifies Single vs Accumulator and Long Accumulator from explicit legCount", () => {
    const bets: JournalBet[] = [
      makeBet({ market: "1X2", legCount: 1, odds: 2.0, status: "won" }),
      // Explicit 2-leg double even if market is 1X2
      makeBet({ market: "1X2", legCount: 2, odds: 2.8, status: "lost" }),
      // Explicit 4-leg accumulator even if odds are below 5.0
      makeBet({ market: "1X2", legCount: 4, odds: 3.6, status: "lost" }),
    ];

    const card = computeReportCard(bets);
    expect(card.breakdowns.byBetType.find((t) => t.key === "single")?.bets).toBe(1);
    expect(card.breakdowns.byBetType.find((t) => t.key === "accumulator")?.bets).toBe(2);
    expect(card.behaviourFlags.longAccumulatorShare.accumulatorCount).toBe(2);
    expect(card.behaviourFlags.longAccumulatorShare.count).toBe(1);
    expect(card.behaviourFlags.longAccumulatorShare.share).toBeCloseTo(1 / 3, 4);
  });

  it("detects behaviour flags: loss-streak chasing, >3x median stake spikes, and long accumulators", () => {
    const bets: JournalBet[] = [
      makeBet({ stake: 100, status: "lost", settledAt: "2026-01-01T01:00:00Z" }),
      makeBet({ stake: 100, status: "lost", settledAt: "2026-01-01T02:00:00Z" }),
      // Chasing bet after 2 losses (stake 200 >= 1.5 * 100)
      makeBet({ stake: 200, status: "won", settledAt: "2026-01-01T03:00:00Z" }),
      makeBet({ stake: 100, status: "won", settledAt: "2026-01-01T04:00:00Z" }),
      // Stake spike > 3x median (median is 100, 350 > 300)
      makeBet({
        stake: 350,
        status: "lost",
        market: "Accumulator",
        odds: 7.5,
        settledAt: "2026-01-01T05:00:00Z",
      }),
    ];

    const card = computeReportCard(bets);
    expect(computeMedian([100, 100, 200, 100, 350])).toBe(100);
    expect(card.behaviourFlags.chasing.detected).toBe(true);
    expect(card.behaviourFlags.chasing.instances).toBe(1);
    expect(card.behaviourFlags.stakeSpikes.detected).toBe(true);
    expect(card.behaviourFlags.stakeSpikes.count).toBe(1);
    expect(card.behaviourFlags.stakeSpikes.maxSpikeRatio).toBe(3.5);
    expect(card.behaviourFlags.longAccumulatorShare.count).toBe(1);
    expect(card.behaviourFlags.longAccumulatorShare.share).toBeCloseTo(0.2, 4);
  });

  it("enforces verdict thresholds at 49 vs 50 settled bets and CLV sample boundaries", () => {
    // 49 settled bets + 2 void + 2 pending -> still < 50 settled -> "too_early"
    const fortyNine = Array.from({ length: MIN_SETTLED_FOR_VERDICT - 1 }, (_, i) =>
      makeBet({
        status: i % 2 === 0 ? "won" : "lost",
        odds: 2.0,
        closingOdds: 1.9,
      }),
    );
    const withExtras = [
      ...fortyNine,
      makeBet({ status: "void", odds: 2.0 }),
      makeBet({ status: "pending", odds: 2.0 }),
    ];
    const card49 = computeReportCard(withExtras);
    expect(card49.settledBets).toBe(49);
    expect(card49.verdict).toBe("too_early");

    // 50th settled bet added: mixed results so ROI CI includes 0, and >= 30 positive CLV samples -> "early_skill_signs"
    const fiftyWithSkill = [
      ...fortyNine,
      makeBet({ status: "lost", odds: 2.0, closingOdds: 1.9 }),
    ];
    const card50Skill = computeReportCard(fiftyWithSkill);
    expect(card50Skill.settledBets).toBe(50);
    expect(card50Skill.clv.sampleCount).toBeGreaterThanOrEqual(MIN_CLV_SAMPLES_FOR_SKILL);
    expect(card50Skill.clv.mean!).toBeGreaterThan(0);
    expect(card50Skill.roiInterval.lower).toBeLessThanOrEqual(0);
    expect(card50Skill.roiInterval.upper).toBeGreaterThanOrEqual(0);
    expect(card50Skill.verdict).toBe("early_skill_signs");

    // Edge case: only 29 CLV samples (< 30) on 50 settled bets -> "no_edge_yet"
    const fiftyOnly29Clv = Array.from({ length: 50 }, (_, i) =>
      makeBet({
        status: i % 2 === 0 ? "won" : "lost",
        odds: 2.0,
        closingOdds: i < MIN_CLV_SAMPLES_FOR_SKILL - 1 ? 1.85 : null,
      }),
    );
    const card29Clv = computeReportCard(fiftyOnly29Clv);
    expect(card29Clv.clv.sampleCount).toBe(29);
    expect(card29Clv.verdict).toBe("no_edge_yet");

    // Edge case: 50 settled bets with negative CLV -> "no_edge_yet" (when ROI CI includes 0)
    const fiftyNegativeClv = Array.from({ length: 50 }, (_, i) =>
      makeBet({
        status: i % 2 === 0 ? "won" : "lost",
        odds: 2.0,
        closingOdds: 2.15,
      }),
    );
    expect(computeReportCard(fiftyNegativeClv).verdict).toBe("no_edge_yet");

    // 50 settled bets with heavy losses so ROI CI upper < 0 -> "losing_to_margin"
    const fiftyLosing = Array.from({ length: 50 }, (_, i) =>
      makeBet({
        status: i < 10 ? "won" : "lost",
        odds: 1.8,
        closingOdds: 1.75,
      }),
    );
    const cardLosing = computeReportCard(fiftyLosing);
    expect(cardLosing.roiInterval.upper).toBeLessThan(0);
    expect(cardLosing.verdict).toBe("losing_to_margin");
  });

  it("produces deterministic bootstrap ROI confidence intervals for a given seed", () => {
    const sample = Array.from({ length: 30 }, (_, i) =>
      makeBet({ status: i % 3 === 0 ? "won" : "lost", odds: 2.4, stake: 100 }),
    );
    const ci1 = computeBootstrapRoiInterval(sample, 123);
    const ci2 = computeBootstrapRoiInterval(sample, 123);
    expect(ci1).toEqual(ci2);
    expect(ci1.lower).toBeLessThan(ci1.upper);
  });

  it("enforces minimum segment sample size (default 15) on leak rules and maps to verified lesson slugs", () => {
    // 14 losing longshots (< 15 default minimum sample) -> no longshot_bias leak
    const fourteenLongshots = Array.from({ length: DEFAULT_MIN_LEAK_SAMPLE - 1 }, () =>
      makeBet({ status: "lost", odds: 4.5, closingOdds: 4.8 }),
    );
    const card14 = computeReportCard(fourteenLongshots);
    expect(card14.leaks.find((l) => l.id === "longshot_bias")).toBeUndefined();

    // 15 losing longshots with negative CLV -> triggers longshot_bias and negative_clv
    const fifteenLongshots = [
      ...fourteenLongshots,
      makeBet({ status: "lost", odds: 4.5, closingOdds: 4.8 }),
    ];
    const card15 = computeReportCard(fifteenLongshots);
    const longshotLeak = card15.leaks.find((l) => l.id === "longshot_bias");
    const clvLeak = card15.leaks.find((l) => l.id === "negative_clv");

    expect(longshotLeak).toBeDefined();
    expect(longshotLeak?.lessonSlug).toBe(LEAK_LESSON_MAP.longshot_bias.fullSlug);
    expect(clvLeak).toBeDefined();
    expect(clvLeak?.lessonSlug).toBe(LEAK_LESSON_MAP.negative_clv.fullSlug);
  });
});
