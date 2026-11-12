"use client";

import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Flame,
  Target,
  Activity,
  Layers,
  Zap,
} from "lucide-react";
import type { OddsLegFixtureInfo } from "./odds-picker";
import type { SimulationHistory } from "@/types";

export const STARTING_BALANCE = 10_000;
export const CURRENCY = "₦";
export const MAX_LEGS = 8;

export const SUGGESTIONS = [
  { label: "Heavy Fav", odds: 1.2 },
  { label: "Favourite", odds: 1.65 },
  { label: "Slight Fav", odds: 2.0 },
  { label: "Even", odds: 2.5 },
  { label: "Outsider", odds: 4.0 },
  { label: "Longshot", odds: 10.0 },
];

export function formatMoney(n: number) {
  return `${CURRENCY}${n.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export interface AccaLeg {
  id: string;
  label: string;
  match?: string;
  odds: number;
  fixtureId?: string;
  fixtureInfo?: OddsLegFixtureInfo;
}

export interface BetEntry extends SimulationHistory {
  runningBalance: number;
  legs?: number;
}

export interface Stats {
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

export function computeStats(history: BetEntry[]): Stats {
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

export function StakeInput({
  stake,
  setStake,
  balance,
}: {
  stake: string;
  setStake: (v: string) => void;
  balance: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[#1e293b]/60">Stake Amount (₦)</label>
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
            onClick={() => setStake(String(Math.min(amt, balance)))}
            className="rounded border border-border px-2 py-1 text-[10px] font-medium text-[#1e293b]/60 transition hover:border-[#0f172a]/30 hover:text-[#0f172a]"
          >
            ₦{amt.toLocaleString()}
          </button>
        ))}
        <button
          onClick={() => setStake(balance.toFixed(0))}
          className="rounded border border-red-200 px-2 py-1 text-[10px] font-medium text-red-400 transition hover:border-red-400 hover:text-red-600"
        >
          All in
        </button>
      </div>
    </div>
  );
}

export function ReturnPreview({
  odds,
  stake,
  label = "Potential return",
}: {
  odds: number;
  stake: number;
  label?: string;
}) {
  return (
    <div className="rounded-lg bg-[#f8fafc] px-3 py-2.5">
      <p className="text-[10px] text-[#1e293b]/50">{label}</p>
      <p className="font-mono text-sm font-semibold text-emerald-600">{formatMoney(odds * stake)}</p>
      <p className="text-[10px] text-[#1e293b]/40">Profit: {formatMoney((odds - 1) * stake)}</p>
    </div>
  );
}

export function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-red-600">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {msg}
    </div>
  );
}

export function SimulateButton({
  onClick,
  disabled,
  pending,
  label,
}: {
  onClick: () => void;
  disabled: boolean;
  pending: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-xl bg-[#0f172a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Simulating…" : label}
    </button>
  );
}

export function BetSimulatorStats({ stats }: { stats: Stats }) {
  return (
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
            className={`h-4 w-4 ${
              stats.currentStreak.type === "win" ? "text-emerald-600" : "text-red-500"
            }`}
          />
          <span
            className={`text-sm font-medium ${
              stats.currentStreak.type === "win" ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {stats.currentStreak.count} {stats.currentStreak.type} streak
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { label: "Total Bets", value: stats.totalBets, icon: Target, fmt: (v: number) => String(v) },
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
          { label: "Total Staked", value: stats.totalStaked, fmt: (v: number) => formatMoney(v) },
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
  );
}

export function BetHistoryTable({ history }: { history: BetEntry[] }) {
  if (history.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
      <div className="border-b border-border px-6 py-4">
        <h3 className="text-sm font-semibold text-[#0f172a]">Bet History ({history.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-[#f8fafc] text-left text-[10px] font-medium uppercase tracking-wider text-[#1e293b]/50">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Type</th>
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
                <td className="px-4 py-3">
                  {entry.legs ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700">
                      <Layers className="h-3 w-3" />
                      {entry.legs}-Leg Acca
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                      <Zap className="h-3 w-3" />
                      Single
                    </span>
                  )}
                </td>
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
  );
}
