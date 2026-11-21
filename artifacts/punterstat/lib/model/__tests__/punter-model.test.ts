import { describe, expect, it } from "vitest";
import type { JournalBet } from "@/lib/bet-assist/journal";
import {
  betFingerprint,
  EB_PRIOR_ROI,
  scoreSlipWithPunterModel,
  trainPunterModel,
} from "../punter-model";

function makeBet(overrides: Partial<JournalBet> & { id: string }): JournalBet {
  return {
    placedAt: "2026-10-01T12:00:00.000Z",
    sport: "football",
    eventName: "Arsenal vs Chelsea",
    market: "1X2",
    selection: "Home Win",
    bookmaker: "SportyBet",
    odds: 2.0,
    stake: 1000,
    yourProb: null,
    closingOdds: null,
    status: "won",
    cashoutAmount: null,
    notes: null,
    settledAt: "2026-10-01T15:00:00.000Z",
    legCount: 1,
    ...overrides,
  };
}

describe("punter-model (Empirical Bayes personal behavior model)", () => {
  it("shrinks small samples conservatively toward the -5% prior", () => {
    const bets = [
      makeBet({ id: "1", odds: 2.0, status: "won" }), // +100% raw ROI
      makeBet({ id: "2", odds: 2.0, status: "won" }),
    ];
    const model = trainPunterModel(bets);
    expect(model.maturity).toBe("cold");
    expect(model.overallRawRoi).toBeCloseTo(1.0, 4);
    // (2 * 1.0 + 15 * -0.05) / 17 = 1.25 / 17 ≈ +0.0735
    expect(model.overallShrunkRoi).toBeGreaterThan(EB_PRIOR_ROI);
    expect(model.overallShrunkRoi).toBeLessThan(0.15);
  });

  it("identifies profitable singles vs leaking long accumulators and scores slips", () => {
    const bets: JournalBet[] = [];
    // 25 winning-leaning singles at 1.80 odds (interleaved ~68% win rate -> +22% raw ROI)
    for (let i = 0; i < 25; i++) {
      bets.push(
        makeBet({
          id: `s-${i}`,
          placedAt: new Date(2026, 9, 1 + i).toISOString(),
          odds: 1.8,
          legCount: 1,
          bookmaker: "Bet9ja",
          status: i % 3 !== 0 ? "won" : "lost",
        }),
      );
    }
    // 20 leaking 5-leg accumulators at 8.00 odds (1 won, 19 lost -> -60% raw ROI)
    for (let i = 0; i < 20; i++) {
      bets.push(
        makeBet({
          id: `a-${i}`,
          placedAt: new Date(2026, 9, 1 + i, 18).toISOString(),
          odds: 8.0,
          legCount: 5,
          market: "Accumulator",
          bookmaker: "SportyBet",
          status: i === 0 ? "won" : "lost",
        }),
      );
    }

    const model = trainPunterModel(bets);
    expect(model.maturity).toBe("active");
    expect(model.settledBets).toBe(45);
    expect(model.bestSegment?.shrunkRoi).toBeGreaterThan(0);
    expect(model.worstSegment?.shrunkRoi).toBeLessThan(-0.2);

    const accaInsight = scoreSlipWithPunterModel(model, {
      combinedOdds: 7.5,
      legCount: 5,
      stake: 1000,
      bookmaker: "sportybet_ng",
    });
    expect(accaInsight.riskLevel).toBe("high_leak");
    expect(accaInsight.predictedRoi).toBeLessThan(-0.15);
    expect(accaInsight.warnings.length).toBeGreaterThanOrEqual(2);

    const singleInsight = scoreSlipWithPunterModel(model, {
      combinedOdds: 1.8,
      legCount: 1,
      stake: 1000,
      bookmaker: "Bet9ja",
    });
    expect(singleInsight.riskLevel).toBe("aligned");
    expect(singleInsight.strengths.length).toBeGreaterThanOrEqual(1);
  });

  it("flags tilt when user spikes stake during an active losing streak", () => {
    const bets: JournalBet[] = [];
    for (let i = 0; i < 10; i++) {
      bets.push(
        makeBet({
          id: `b-${i}`,
          placedAt: new Date(2026, 10, 1 + i).toISOString(),
          stake: i >= 7 ? 3000 : 1000,
          status: i >= 6 ? "lost" : "won",
        }),
      );
    }

    const model = trainPunterModel(bets);
    expect(model.tilt.currentLossStreak).toBe(4);
    expect(model.tilt.postLossStakeRatio).toBeGreaterThan(2);
    expect(model.tilt.tiltLevel).toBe("high");

    const insight = scoreSlipWithPunterModel(model, {
      combinedOdds: 2.0,
      legCount: 1,
      stake: 4000,
    });
    expect(insight.riskLevel).toBe("high_leak");
    expect(insight.warnings.some((w) => w.toLowerCase().includes("tilt alert"))).toBe(true);
  });

  it("produces identical fingerprints for duplicate CSV rows regardless of formatting", () => {
    const fp1 = betFingerprint({
      placedAt: "2026-11-15T14:30:00.000Z",
      eventName: "Arsenal  vs  Chelsea",
      selection: "Arsenal Win",
      odds: 1.95,
      stake: 5000,
      bookmaker: "SportyBet (NG)",
    });
    const fp2 = betFingerprint({
      placedAt: "2026-11-15",
      eventName: "arsenal vs chelsea",
      selection: "  arsenal win ",
      odds: 1.95,
      stake: 5000.0,
      bookmaker: "sportybet",
    });
    expect(fp1).toBe(fp2);
  });

  it("weights recent bets more heavily than old bets and classifies Punter Profiles + acca leg buckets", () => {
    const bets: JournalBet[] = [];
    // 60 old losing 10-leg accas
    for (let i = 0; i < 60; i++) {
      bets.push(
        makeBet({
          id: `old-${i}`,
          placedAt: new Date(2025, 0, 1 + i).toISOString(),
          odds: 12.0,
          legCount: 10,
          market: "Accumulator",
          status: "lost",
        }),
      );
    }
    // 20 recent winning 5-leg accas at 4.0 odds (8 won, 12 lost -> +60% raw ROI)
    for (let i = 0; i < 20; i++) {
      bets.push(
        makeBet({
          id: `new-${i}`,
          placedAt: new Date(2026, 9, 1 + i).toISOString(),
          odds: 4.0,
          legCount: 5,
          market: "Accumulator",
          status: i % 5 < 2 ? "won" : "lost",
        }),
      );
    }

    const model = trainPunterModel(bets);
    expect(model.profile.id).toBe("acca_builder");
    const bucket4to7 = model.byAccaBucket.find((b) => b.key === "4-7");
    const bucket8to12 = model.byAccaBucket.find((b) => b.key === "8-12");
    expect(bucket4to7?.bets).toBe(20);
    expect(bucket8to12?.bets).toBe(60);
    expect(bucket4to7!.shrunkRoi).toBeGreaterThan(0);
    expect(bucket8to12!.shrunkRoi).toBeLessThan(-0.4);
    // Because recent bets are positive, recency-weighted overallShrunkRoi is higher than unweighted overallRawRoi
    expect(model.overallShrunkRoi).toBeGreaterThan(model.overallRawRoi);
  });
});
