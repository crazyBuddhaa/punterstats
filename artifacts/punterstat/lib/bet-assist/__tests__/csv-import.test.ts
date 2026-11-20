import { describe, expect, it } from "vitest";
import { normalizeBetStatus, parseBetsCsv, SAMPLE_BETS_CSV } from "../csv-import";

describe("bet-assist csv-import", () => {
  it("parses the sample template CSV cleanly", () => {
    const res = parseBetsCsv(SAMPLE_BETS_CSV);
    expect(res.skipped).toHaveLength(0);
    expect(res.rows).toHaveLength(3);
    expect(res.rows[0]).toMatchObject({
      bookmaker: "SportyBet",
      eventName: "Arsenal vs Chelsea",
      selection: "Arsenal Win",
      odds: 1.95,
      stake: 5000,
      status: "won",
      legCount: 1,
    });
    expect(res.rows[2].legCount).toBe(3);
    expect(res.rows[2].status).toBe("lost");
  });

  it("strips currency symbols, applies defaultBookmaker, and handles quoted commas", () => {
    const csv = [
      'Match,Pick,Price,Amount,Result,Notes',
      '"Man City vs Liverpool","Over 2.5, BTTS",2.15,"₦10,500",Win,"Good value"',
      '"Bad Row","Pick",0.95,500,Lost,"Invalid odds"',
    ].join("\n");

    const res = parseBetsCsv(csv, { defaultBookmaker: "Bet9ja" });
    expect(res.rows).toHaveLength(1);
    expect(res.skipped).toHaveLength(1);
    expect(res.rows[0].bookmaker).toBe("Bet9ja");
    expect(res.rows[0].selection).toBe("Over 2.5, BTTS");
    expect(res.rows[0].stake).toBe(10500);
    expect(res.rows[0].status).toBe("won");
  });

  it("normalizes common bookmaker status labels", () => {
    expect(normalizeBetStatus("WIN")).toBe("won");
    expect(normalizeBetStatus("Loss")).toBe("lost");
    expect(normalizeBetStatus("Refunded")).toBe("void");
    expect(normalizeBetStatus("Cashed Out")).toBe("cashed_out");
    expect(normalizeBetStatus("open")).toBe("pending");
  });

  it("handles currency-suffixed headers, missing odds column, partial returns, and truncated multi-leg counts", () => {
    const csv = [
      "Date,Ticket reference,Bet type,Status,Stake (NGN),Return (NGN),Visible selections,Visible selection count",
      "2026-10-16,ord001,Multiple,Won,143.00,231.10,Team A v Team B | Team C v Team D,2",
      "2026-08-15,ord002,Multiple,Won,49.00,29.14,Team E v Team F | Team G v Team H,2",
      "2026-08-16,ord003,Multiple,Lost,400.00,0.00,Celtic v LASK | Benfica v AGF | Porto v Braga | ...(and 20 other matches),4",
      "2026-08-06,ord004,Singles,Won,300.00,450.00,Benfica v Hearts,1",
    ].join("\n");

    const res = parseBetsCsv(csv, { defaultBookmaker: "SportyBet", overrideBookmaker: true });
    expect(res.skipped).toHaveLength(0);
    expect(res.rows).toHaveLength(4);

    // Row 0: Won with Return > Stake -> derived odds 231.10 / 143 = 1.62
    expect(res.rows[0]).toMatchObject({
      status: "won",
      odds: 1.62,
      stake: 143,
      market: "Accumulator",
      legCount: 2,
      notes: "ord001",
    });

    // Row 1: Partial return (0 < Return <= Stake) -> reclassified as cashed_out with exact return
    expect(res.rows[1]).toMatchObject({
      status: "cashed_out",
      cashoutAmount: 29.14,
      stake: 49,
    });

    // Row 2: Truncated 3 visible + 20 other matches -> true legCount = 23
    expect(res.rows[2]).toMatchObject({
      status: "lost",
      legCount: 23,
      market: "Accumulator",
      stake: 400,
    });

    // Row 3: Single won -> derived odds 450 / 300 = 1.50
    expect(res.rows[3]).toMatchObject({
      status: "won",
      odds: 1.5,
      market: "Single",
      legCount: 1,
    });
  });
});
