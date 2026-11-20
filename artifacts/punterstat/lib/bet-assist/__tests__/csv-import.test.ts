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
});
