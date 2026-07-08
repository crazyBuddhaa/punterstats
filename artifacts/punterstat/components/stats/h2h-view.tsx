"use client";

import { useState, useTransition } from "react";
import type { H2HSummary, HistoricalMatch } from "@/lib/historical-stats/types";
import { Search, ArrowLeftRight } from "lucide-react";

function StatBox({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center rounded-xl border p-4 ${
        highlight
          ? "border-[#3D2DFF]/40 bg-[#3D2DFF]/10"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <span className="text-2xl font-bold text-white tabular-nums">{value}</span>
      <span className="text-xs text-white/50 mt-1">{label}</span>
    </div>
  );
}

function ResultBadge({ result }: { result: string | null }) {
  if (!result) return null;
  const cls =
    result === "H"
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
      : result === "A"
      ? "bg-red-500/15 text-red-400 border-red-500/30"
      : "bg-white/10 text-white/60 border-white/20";
  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-semibold ${cls}`}>
      {result}
    </span>
  );
}

function matchOutcome(m: HistoricalMatch, team1: string): "win" | "draw" | "loss" | null {
  if (!m.result) return null;
  const t1Home = m.home_team.toLowerCase() === team1.toLowerCase();
  if (m.result === "D") return "draw";
  if ((m.result === "H" && t1Home) || (m.result === "A" && !t1Home)) return "win";
  return "loss";
}

export function H2HView() {
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [summary, setSummary] = useState<H2HSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function fetchH2H() {
    if (!team1.trim() || !team2.trim()) return;
    setError(null);
    setSummary(null);
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/historical/h2h?team1=${encodeURIComponent(team1.trim())}&team2=${encodeURIComponent(team2.trim())}`
        );
        const json = await res.json();
        if (!json.success) throw new Error(json.error ?? "Request failed");
        setSummary(json.data as H2HSummary);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  }

  function swap() {
    const t = team1;
    setTeam1(team2);
    setTeam2(t);
    setSummary(null);
  }

  const t1WinPct = summary && summary.total > 0
    ? Math.round((summary.team1Wins / summary.total) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Team inputs */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/50 font-medium uppercase tracking-wide">Team 1</label>
          <input
            value={team1}
            onChange={(e) => setTeam1(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchH2H()}
            placeholder="e.g. Arsenal"
            className="h-10 w-52 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#3D2DFF]"
          />
        </div>

        <button
          onClick={swap}
          title="Swap teams"
          className="mb-0.5 flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/50 hover:text-white hover:border-white/30 transition-colors"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </button>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/50 font-medium uppercase tracking-wide">Team 2</label>
          <input
            value={team2}
            onChange={(e) => setTeam2(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchH2H()}
            placeholder="e.g. Chelsea"
            className="h-10 w-52 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#3D2DFF]"
          />
        </div>

        <button
          onClick={fetchH2H}
          disabled={isPending || !team1.trim() || !team2.trim()}
          className="h-10 flex items-center gap-2 rounded-md bg-[#3D2DFF] px-5 text-sm font-medium text-white hover:bg-[#3D2DFF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Search className="h-4 w-4" />
          {isPending ? "Searching…" : "Compare"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {isPending && (
        <div className="flex items-center justify-center py-16 text-white/40 text-sm">
          Fetching records…
        </div>
      )}

      {summary && !isPending && (
        <div className="space-y-6">
          {/* Summary stats */}
          {summary.total === 0 ? (
            <div className="text-center py-12 text-white/40">
              No meetings found between{" "}
              <span className="text-white">{summary.team1}</span> and{" "}
              <span className="text-white">{summary.team2}</span>.
            </div>
          ) : (
            <>
              {/* Score bar */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold text-white">{summary.team1}</span>
                  <span className="text-sm text-white/40">{summary.total} meetings</span>
                  <span className="text-lg font-bold text-white">{summary.team2}</span>
                </div>

                {/* Win bar */}
                <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/10 mb-3">
                  <div
                    className="bg-[#3D2DFF] transition-all duration-500"
                    style={{ width: `${t1WinPct}%` }}
                  />
                  <div
                    className="bg-white/20 transition-all duration-500"
                    style={{ width: `${Math.round((summary.draws / summary.total) * 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-white/50 mb-4">
                  <span>{t1WinPct}% win rate</span>
                  <span>{Math.round((summary.draws / summary.total) * 100)}% draw</span>
                  <span>{Math.round((summary.team2Wins / summary.total) * 100)}% win rate</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatBox label={`${summary.team1} wins`} value={summary.team1Wins} highlight />
                  <StatBox label="Draws" value={summary.draws} />
                  <StatBox label={`${summary.team2} wins`} value={summary.team2Wins} />
                  <StatBox
                    label="Goals"
                    value={`${summary.team1Goals} – ${summary.team2Goals}`}
                  />
                </div>
              </div>

              {/* Match history */}
              <div>
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">
                  Match history
                </h3>
                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.03]">
                        <th className="px-4 py-3 text-left font-medium text-white/50">Date</th>
                        <th className="px-4 py-3 text-left font-medium text-white/50">League</th>
                        <th className="px-4 py-3 text-left font-medium text-white/50">Season</th>
                        <th className="px-4 py-3 text-right font-medium text-white/50">Home</th>
                        <th className="px-4 py-3 text-center font-medium text-white/50">Score</th>
                        <th className="px-4 py-3 text-left font-medium text-white/50">Away</th>
                        <th className="px-4 py-3 text-center font-medium text-white/50">Outcome</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {summary.matches.map((m) => {
                        const outcome = matchOutcome(m, summary.team1);
                        const outcomeStyle =
                          outcome === "win"
                            ? "text-emerald-400"
                            : outcome === "loss"
                            ? "text-red-400"
                            : "text-white/50";

                        return (
                          <tr key={m.id} className="hover:bg-white/[0.03] transition-colors">
                            <td className="px-4 py-3 text-white/60 whitespace-nowrap tabular-nums">
                              {new Date(m.match_date).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center rounded bg-white/8 border border-white/10 px-1.5 py-0.5 text-xs font-mono text-white/60">
                                {m.league_code}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-white/50 text-xs">{m.season}</td>
                            <td className="px-4 py-3 text-right font-medium text-white">{m.home_team}</td>
                            <td className="px-4 py-3 text-center font-bold text-white tabular-nums">
                              {m.home_goals ?? "?"} – {m.away_goals ?? "?"}
                            </td>
                            <td className="px-4 py-3 font-medium text-white">{m.away_team}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-xs font-semibold ${outcomeStyle}`}>
                                {outcome === "win"
                                  ? `${summary.team1} W`
                                  : outcome === "loss"
                                  ? `${summary.team2} W`
                                  : "Draw"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {summary.matches.length === 200 && (
                  <p className="mt-2 text-center text-xs text-white/30">
                    Showing most recent 200 meetings
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
