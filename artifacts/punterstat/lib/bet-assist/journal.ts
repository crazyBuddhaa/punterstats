/**
 * Bet Tracker — shared types and pure statistics for the bet journal.
 * Safe to import from client and server.
 */

export const BET_STATUSES = [
  "pending",
  "won",
  "lost",
  "void",
  "half_won",
  "half_lost",
  "cashed_out",
] as const;

export type BetStatus = (typeof BET_STATUSES)[number];

export const STATUS_LABELS: Record<BetStatus, string> = {
  pending: "Pending",
  won: "Won",
  lost: "Lost",
  void: "Void",
  half_won: "Half won",
  half_lost: "Half lost",
  cashed_out: "Cashed out",
};

export interface JournalBet {
  id: string;
  placedAt: string;
  sport: string;
  eventName: string;
  market: string;
  selection: string;
  bookmaker: string | null;
  odds: number;
  stake: number;
  yourProb: number | null;
  closingOdds: number | null;
  status: BetStatus;
  cashoutAmount: number | null;
  notes: string | null;
  settledAt: string | null;
}

/** Total amount returned to the bettor (stake included) for a settled bet. */
export function betReturn(b: Pick<JournalBet, "status" | "odds" | "stake" | "cashoutAmount">): number {
  switch (b.status) {
    case "won":
      return b.stake * b.odds;
    case "lost":
      return 0;
    case "void":
      return b.stake;
    case "half_won":
      return (b.stake / 2) * b.odds + b.stake / 2;
    case "half_lost":
      return b.stake / 2;
    case "cashed_out":
      return b.cashoutAmount ?? 0;
    default:
      return 0;
  }
}

export function betProfit(b: Pick<JournalBet, "status" | "odds" | "stake" | "cashoutAmount">): number {
  return b.status === "pending" ? 0 : betReturn(b) - b.stake;
}

export interface JournalStats {
  totalBets: number;
  pendingBets: number;
  pendingStake: number;
  settledBets: number;
  staked: number;
  returned: number;
  profit: number;
  roi: number;
  /** Share of decided bets (won + half-won counted as wins) that won. */
  strikeRate: number;
  avgOdds: number;
  /** Strike rate the average odds imply — compare with the actual strike rate. */
  breakEvenRate: number;
  /** Average closing-line value where closing odds were logged. Positive = beating the close. */
  avgClv: number | null;
  clvSamples: number;
  longestLosingRun: number;
  /** Cumulative profit after each settled bet, oldest first. */
  curve: { label: string; profit: number }[];
  byMarket: { market: string; bets: number; staked: number; profit: number; roi: number }[];
}

export function journalStats(bets: JournalBet[]): JournalStats {
  const settled = bets
    .filter((b) => b.status !== "pending")
    .sort(
      (a, b) =>
        new Date(a.settledAt ?? a.placedAt).getTime() - new Date(b.settledAt ?? b.placedAt).getTime(),
    );
  const pending = bets.filter((b) => b.status === "pending");

  let staked = 0;
  let returned = 0;
  let wins = 0;
  let decided = 0;
  let oddsSum = 0;
  let run = 0;
  let longestRun = 0;
  let cum = 0;
  const curve: JournalStats["curve"] = [];
  const markets = new Map<string, { bets: number; staked: number; profit: number }>();

  for (const b of settled) {
    const ret = betReturn(b);
    const p = ret - b.stake;
    staked += b.stake;
    returned += ret;
    cum += p;
    curve.push({
      label: new Date(b.settledAt ?? b.placedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      profit: Math.round(cum * 100) / 100,
    });

    if (b.status !== "void" && b.status !== "cashed_out") {
      decided++;
      oddsSum += b.odds;
      if (b.status === "won" || b.status === "half_won") {
        wins++;
        run = 0;
      } else {
        run++;
        longestRun = Math.max(longestRun, run);
      }
    }

    const m = markets.get(b.market) ?? { bets: 0, staked: 0, profit: 0 };
    m.bets++;
    m.staked += b.stake;
    m.profit += p;
    markets.set(b.market, m);
  }

  const clvBets = bets.filter((b) => b.closingOdds && b.closingOdds > 1);
  const avgClv =
    clvBets.length > 0
      ? clvBets.reduce((s, b) => s + (b.odds / (b.closingOdds as number) - 1), 0) / clvBets.length
      : null;

  const avgOdds = decided > 0 ? oddsSum / decided : 0;

  return {
    totalBets: bets.length,
    pendingBets: pending.length,
    pendingStake: pending.reduce((s, b) => s + b.stake, 0),
    settledBets: settled.length,
    staked,
    returned,
    profit: returned - staked,
    roi: staked > 0 ? (returned - staked) / staked : 0,
    strikeRate: decided > 0 ? wins / decided : 0,
    avgOdds,
    breakEvenRate: avgOdds > 0 ? 1 / avgOdds : 0,
    avgClv,
    clvSamples: clvBets.length,
    longestLosingRun: longestRun,
    curve,
    byMarket: [...markets.entries()]
      .map(([market, m]) => ({ market, ...m, roi: m.staked > 0 ? m.profit / m.staked : 0 }))
      .sort((a, b) => b.bets - a.bets),
  };
}
