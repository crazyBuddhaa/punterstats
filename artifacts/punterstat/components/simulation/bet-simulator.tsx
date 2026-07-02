"use client";

import { useState, useCallback, useTransition } from "react";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Flame,
  Target,
  Activity,
} from "lucide-react";
import { createSession, recordBet } from "@/lib/simulation/actions";
import type { SimulationHistory } from "@/types";

const STARTING_BALANCE = 10_000;
const CURRENCY = "₦";

function formatMoney(n: number) {
  return `${CURRENCY}${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function impliedProbability(decimalOdds: number): number {
  return 1 / decimalOdds;
}

function simulateOutcome(winProb: number): "win" | "loss" {
  return Math.random() < winProb ? "win" : "loss";
}

interface BetEntry extends SimulationHistory {
  runningBalance: number;
}

interface Stats {
  totalBets: number;
  wins: number;
  losses: number;
  winRate: number;
  longestWinStreak: number;
  longestLossStreak: number;
  currentStreak: { type: "win" | "loss" | null; count: number };
  totalStaked: number;
  totalProfit: number;
  roi: number;
  biggestWin: number;
  biggestLoss: number;
}

function computeStats(history: BetEntry[]): Stats {
  let wins = 0;
  let losses = 0;
  let longestWin = 0;
  let longestLoss = 0;
  let currentWin = 0;
  let currentLoss = 0;
  let totalStaked = 0;
  let totalProfit = 0;
  let biggestWin = 0;
  let biggestLoss = 0;

  for (const entry of history) {
    totalStaked += entry.stake;
    totalProfit += entry.profitLoss;
    if (entry.outcome === "win") {
      wins++;
      currentWin++;
      currentLoss = 0;
      longestWin = Math.max(longestWin, currentWin);
      biggestWin = Math.max(biggestWin, entry.profitLoss);
    } else {
      losses++;
      currentLoss++;
      currentWin = 0;
      longestLoss = Math.max(longestLoss, currentLoss);
      biggestLoss = Math.min(biggestLoss, entry.profitLoss);
    }
  }

  const last = history[history.length - 1];
  const currentStreak: Stats["currentStreak"] =
    !last
      ? { type: null, count: 0 }
      : last.outcome === "win"
        ? { type: "win", count: currentWin }
        : { type: "loss", count: currentLoss };

  return {
    totalBets: history.length,
    wins,
    losses,
    winRate: history.length ? (wins / history.length) * 100 : 0,
    longestWinStreak: longestWin,
    longestLossStreak: longestLoss,
    currentStreak,
    totalStaked,
    totalProfit,
    roi: totalStaked ? (totalProfit / totalStaked) * 100 : 0,
    biggestWin,
    biggestLoss,
  };
}

export function BetSimulator({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [balance, setBalance] = useState(STARTING_BALANCE);
  const [odds, setOdds] = useState("2.00");
  const [stake, setStake] = useState("500");
  const [history, setHistory] = useState<BetEntry[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<"win" | "loss" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const stats = computeStats(history);

  const ensureSession = useCallback(async (): Promise<string | null> => {
    if (sessionId) return sessionId;
    if (!isAuthenticated) return null;
    const res = await createSession("bet", STARTING_BALANCE);
    if (res.success && res.data) {
      setSessionId(res.data.id);
      return res.data.id;
    }
    return null;
  }, [sessionId, isAuthenticated]);

  const placeBet = useCallback(() => {
    setErrorMsg(null);
    const parsedOdds = parseFloat(odds);
    const parsedStake = parseFloat(stake);

    if (isNaN(parsedOdds) || parsedOdds < 1.01) {
      setErrorMsg("Odds must be at least 1.01.");
      return;
    }
    if (isNaN(parsedStake) || parsedStake < 1) {
      setErrorMsg("Stake must be at least ₦1.");
      return;
    }
    if (parsedStake > balance) {
      setErrorMsg("Stake exceeds your available balance.");
      return;
    }

    startTransition(async () => {
      const outcome = simulateOutcome(impliedProbability(parsedOdds));
      const profitLoss =
        outcome === "win"
          ? parseFloat(((parsedOdds - 1) * parsedStake).toFixed(2))
          : -parsedStake;
      const newBalance = parseFloat((balance + profitLoss).toFixed(2));

      const entry: BetEntry = {
        id: crypto.randomUUID(),
        sessionId: sessionId ?? "",
        odds: parsedOdds,
        stake: parsedStake,
        outcome,
        profitLoss,
        balanceAfter: newBalance,
        runningBalance: newBalance,
        createdAt: new Date().toISOString(),
      };

      setHistory((prev) => [entry, ...prev]);
      setBalance(newBalance);
      setLastResult(outcome);

      if (isAuthenticated) {
        const sid = await ensureSession();
        if (sid) {
          await recordBet(sid, parsedOdds, parsedStake, outcome, profitLoss, newBalance);
        }
      }
    });
  }, [odds, stake, balance, sessionId, isAuthenticated, ensureSession]);

  const reset = useCallback(() => {
    setBalance(STARTING_BALANCE);
    setHistory([]);
    setSessionId(null);
    setLastResult(null);
    setErrorMsg(null);
  }, []);

  const balanceDelta = balance - STARTING_BALANCE;
  const balanceColor =
    balanceDelta > 0 ? "text-emerald-600" : balanceDelta < 0 ? "text-red-500" : "text-[#0f172a]";

  return (
    <div className="space-y-6">
      {/* Balance header */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#1e293b]/50">
              Virtual Balance
            </p>
            <p className={`mt-1 text-4xl font-bold tracking-tight ${balanceColor}`}>
              {formatMoney(balance)}
            </p>
            {history.length > 0 && (
              <p
                className={`mt-0.5 text-sm font-medium ${balanceDelta >= 0 ? "text-emerald-600" : "text-red-500"}`}
              >
                {balanceDelta >= 0 ? "+" : ""}
                {formatMoney(balanceDelta)} from start
              </p>
            )}
          </div>
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-medium text-[#1e293b]/60 transition hover:bg-[#f8fafc] hover:text-[#0f172a]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset session
          </button>
        </div>

        <div className="mt-5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#f1f5f9]">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                balance >= STARTING_BALANCE ? "bg-emerald-500" : "bg-red-400"
              }`}
              style={{
                width: `${Math.min(100, Math.max(2, (balance / STARTING_BALANCE) * 100))}%`,
              }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-[#1e293b]/40">
            <span>₦0</span>
            <span>Starting: {formatMoney(STARTING_BALANCE)}</span>
          </div>
        </div>
      </div>

      {/* Last result flash */}
      {lastResult && (
        <div
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
            lastResult === "win"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {lastResult === "win" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0" />
          )}
          <span>
            {lastResult === "win" ? "Win! Well done." : "Loss. The market wins sometimes."}
          </span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Bet input */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-[#0f172a]">Place a Simulated Bet</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#1e293b]/60">
                  Decimal Odds
                </label>
                <input
                  type="number"
                  min="1.01"
                  step="0.05"
                  value={odds}
                  onChange={(e) => setOdds(e.target.value)}
                  className="w-full rounded-lg border border-border bg-[#f8fafc] px-3 py-2.5 text-sm font-mono text-[#0f172a] outline-none transition focus:border-[#0f172a] focus:ring-2 focus:ring-[#0f172a]/10"
                  placeholder="e.g. 2.50"
                />
                <p className="mt-1 text-[10px] text-[#1e293b]/40">
                  Implied probability:{" "}
                  {parseFloat(odds) > 1
                    ? `${(impliedProbability(parseFloat(odds)) * 100).toFixed(1)}%`
                    : "—"}
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#1e293b]/60">
                  Stake Amount (₦)
                </label>
                <input
                  type="number"
                  min="1"
                  step="100"
                  value={stake}
                  onChange={(e) => setStake(e.target.value)}
                  className="w-full rounded-lg border border-border bg-[#f8fafc] px-3 py-2.5 text-sm font-mono text-[#0f172a] outline-none transition focus:border-[#0f172a] focus:ring-2 focus:ring-[#0f172a]/10"
                  placeholder="e.g. 500"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[250, 500, 1000, 2500].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setStake(String(amt))}
                      className="rounded border border-border px-2 py-1 text-[10px] font-medium text-[#1e293b]/60 transition hover:border-[#0f172a]/30 hover:text-[#0f172a]"
                    >
                      ₦{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {parseFloat(odds) > 1 && parseFloat(stake) > 0 && (
                <div className="rounded-lg bg-[#f8fafc] px-3 py-2.5">
                  <p className="text-[10px] text-[#1e293b]/50">Potential return</p>
                  <p className="font-mono text-sm font-semibold text-emerald-600">
                    {formatMoney(parseFloat(odds) * parseFloat(stake))}
                  </p>
                  <p className="text-[10px] text-[#1e293b]/40">
                    Profit: {formatMoney((parseFloat(odds) - 1) * parseFloat(stake))}
                  </p>
                </div>
              )}

              {errorMsg && (
                <div className="flex items-center gap-2 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {errorMsg}
                </div>
              )}

              <button
                onClick={placeBet}
                disabled={isPending || balance <= 0}
                className="w-full rounded-xl bg-[#0f172a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "Simulating…" : "Simulate Bet"}
              </button>

              {balance <= 0 && (
                <p className="text-center text-xs text-red-500">
                  Balance is ₦0. Reset your session to continue.
                </p>
              )}
              {!isAuthenticated && (
                <p className="text-center text-[10px] text-[#1e293b]/40">
                  Sign in to save your session history
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="lg:col-span-3 space-y-4">
          {stats.currentStreak.type && (
            <div
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                stats.currentStreak.type === "win"
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <Flame
                className={`h-4 w-4 ${stats.currentStreak.type === "win" ? "text-emerald-600" : "text-red-500"}`}
              />
              <span
                className={`text-sm font-medium ${stats.currentStreak.type === "win" ? "text-emerald-700" : "text-red-700"}`}
              >
                {stats.currentStreak.count} {stats.currentStreak.type} streak
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              {
                label: "Total Bets",
                value: stats.totalBets,
                icon: Target,
                fmt: (v: number) => String(v),
              },
              {
                label: "Win Rate",
                value: stats.winRate,
                icon: Activity,
                fmt: (v: number) => `${v.toFixed(1)}%`,
              },
              {
                label: "Total ROI",
                value: stats.roi,
                icon: stats.roi >= 0 ? TrendingUp : TrendingDown,
                fmt: (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`,
                color: stats.roi >= 0 ? "text-emerald-600" : "text-red-500",
              },
              {
                label: "Total Staked",
                value: stats.totalStaked,
                fmt: (v: number) => formatMoney(v),
              },
              {
                label: "Profit / Loss",
                value: stats.totalProfit,
                fmt: (v: number) => `${v >= 0 ? "+" : ""}${formatMoney(v)}`,
                color: stats.totalProfit >= 0 ? "text-emerald-600" : "text-red-500",
              },
              {
                label: "Best Streak",
                value: stats.longestWinStreak,
                fmt: (v: number) => `${v} wins`,
                icon: Flame,
              },
            ].map(({ label, value, fmt, color, icon: Icon }) => (
              <div key={label} className="rounded-xl border border-border bg-white p-4 shadow-sm">
                {Icon && <Icon className="mb-2 h-4 w-4 text-[#1e293b]/30" />}
                <p className="text-[10px] font-medium uppercase tracking-wider text-[#1e293b]/50">
                  {label}
                </p>
                <p className={`mt-0.5 text-lg font-bold ${color ?? "text-[#0f172a]"}`}>
                  {fmt(value as number)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History table */}
      {history.length > 0 && (
        <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="border-b border-border px-6 py-4">
            <h3 className="text-sm font-semibold text-[#0f172a]">
              Bet History ({history.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-[#f8fafc] text-left text-[10px] font-medium uppercase tracking-wider text-[#1e293b]/50">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Odds</th>
                  <th className="px-4 py-3">Stake</th>
                  <th className="px-4 py-3">Outcome</th>
                  <th className="px-4 py-3">Profit/Loss</th>
                  <th className="px-4 py-3">Balance</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 25).map((entry, i) => (
                  <tr
                    key={entry.id}
                    className="border-b border-border/50 transition hover:bg-[#f8fafc]/50"
                  >
                    <td className="px-4 py-3 text-[#1e293b]/40 text-xs">{history.length - i}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#0f172a]">
                      {entry.odds.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#1e293b]/70">
                      {formatMoney(entry.stake)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          entry.outcome === "win"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {entry.outcome === "win" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {entry.outcome}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 font-mono text-xs font-medium ${
                        entry.profitLoss >= 0 ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {entry.profitLoss >= 0 ? "+" : ""}
                      {formatMoney(entry.profitLoss)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#0f172a]">
                      {formatMoney(entry.balanceAfter)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {history.length > 25 && (
              <p className="px-6 py-3 text-center text-xs text-[#1e293b]/40">
                Showing 25 most recent bets
              </p>
            )}
          </div>
        </div>
      )}

      {/* Educational note */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
        <p className="mb-1 text-sm font-semibold text-amber-800">Educational Note</p>
        <p className="text-xs leading-relaxed text-amber-700">
          This simulator uses implied probability derived directly from the odds you enter. If you
          enter odds of 2.00, the simulator gives you a 50% chance of winning — exactly what the
          odds imply. Real bookmakers price in a margin (the overround), which means the true
          probability is always lower than implied. Notice how your balance trends over time even
          when you <em>feel</em> like you&apos;re making good decisions.
        </p>
      </div>
    </div>
  );
}
