"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type { H2HSummary, HistoricalMatch } from "@/lib/historical-stats/types";
import { Search, ArrowLeftRight } from "lucide-react";

interface H2HViewProps {
  light?: boolean;
}

function StatBox({
  label,
  value,
  highlight,
  light,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
  light?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center rounded-xl border p-4 ${
        highlight
          ? light
            ? "border-[#3D2DFF]/30 bg-[#3D2DFF]/5"
            : "border-[#3D2DFF]/40 bg-[#3D2DFF]/10"
          : light
            ? "border-border bg-slate-50"
            : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <span className={`text-2xl font-bold tabular-nums ${light ? "text-[#0f172a]" : "text-white"}`}>{value}</span>
      <span className={`text-xs mt-1 text-center ${light ? "text-[#1e293b]/55" : "text-white/50"}`}>{label}</span>
    </div>
  );
}

function matchOutcome(m: HistoricalMatch, team1: string): "win" | "draw" | "loss" | null {
  if (!m.result) return null;
  const t1Home = m.home_team.toLowerCase() === team1.toLowerCase();
  if (m.result === "D") return "draw";
  if ((m.result === "H" && t1Home) || (m.result === "A" && !t1Home)) return "win";
  return "loss";
}

function TeamAutocomplete({
  label,
  value,
  onChange,
  onSubmit,
  teams,
  placeholder,
  light,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  teams: string[];
  placeholder: string;
  light?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q || teams.length === 0) return [];
    const starts: string[] = [];
    const includes: string[] = [];
    for (const t of teams) {
      const lower = t.toLowerCase();
      if (lower === q) continue;
      if (lower.startsWith(q)) starts.push(t);
      else if (lower.includes(q)) includes.push(t);
      if (starts.length + includes.length >= 10) break;
    }
    return [...starts, ...includes].slice(0, 8);
  }, [value, teams]);

  return (
    <div className="relative flex flex-col gap-1">
      <label className={`text-xs font-medium uppercase tracking-wide ${light ? "text-[#1e293b]/60" : "text-white/50"}`}>
        {label}
      </label>
      <input
        value={value}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setOpen(false);
            onSubmit();
          }
        }}
        placeholder={placeholder}
        className={
          light
            ? "h-10 w-52 rounded-md border border-input bg-white px-3 text-sm text-[#0f172a] placeholder:text-[#1e293b]/35 focus:outline-none focus:ring-1 focus:ring-[#3D2DFF]"
            : "h-10 w-52 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#3D2DFF]"
        }
      />
      {open && suggestions.length > 0 && (
        <ul
          className={`absolute left-0 top-full z-20 mt-1 max-h-52 w-56 overflow-y-auto rounded-lg border shadow-lg ${
            light ? "border-border bg-white" : "border-white/15 bg-[#1e293b]"
          }`}
        >
          {suggestions.map((t) => (
            <li key={t}>
              <button
                type="button"
                onMouseDown={() => {
                  onChange(t);
                  setOpen(false);
                }}
                className={`w-full px-3 py-1.5 text-left text-xs transition ${
                  light ? "text-[#0f172a] hover:bg-slate-100" : "text-white/85 hover:bg-white/10"
                }`}
              >
                {t}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function H2HView({ light = false }: H2HViewProps) {
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [teams, setTeams] = useState<string[]>([]);
  const [summary, setSummary] = useState<H2HSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    fetch("/api/historical/teams")
      .then((r) => r.json())
      .then((json: { success?: boolean; teams?: string[] }) => {
        if (active && json.success && Array.isArray(json.teams)) {
          setTeams(json.teams);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

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

  // Compute betting-market summary metrics from H2H matches
  const marketStats = useMemo(() => {
    if (!summary || summary.matches.length === 0) return null;
    const withGoals = summary.matches.filter(
      (m) => m.home_goals !== null && m.away_goals !== null,
    );
    if (withGoals.length === 0) return null;
    const n = withGoals.length;
    let totalGoals = 0;
    let btts = 0;
    let over15 = 0;
    let over25 = 0;
    let cleanSheets = 0;
    let cornerMatches = 0;
    let totalCorners = 0;

    for (const m of withGoals) {
      const hg = m.home_goals!;
      const ag = m.away_goals!;
      totalGoals += hg + ag;
      if (hg > 0 && ag > 0) btts++;
      if (hg + ag >= 2) over15++;
      if (hg + ag >= 3) over25++;
      if (hg === 0 || ag === 0) cleanSheets++;
      if (m.home_corners !== null && m.away_corners !== null) {
        cornerMatches++;
        totalCorners += m.home_corners + m.away_corners;
      }
    }

    return {
      avgGoals: (totalGoals / n).toFixed(2),
      bttsPct: `${Math.round((btts / n) * 100)}%`,
      over15Pct: `${Math.round((over15 / n) * 100)}%`,
      over25Pct: `${Math.round((over25 / n) * 100)}%`,
      cleanSheetPct: `${Math.round((cleanSheets / n) * 100)}%`,
      avgCorners: cornerMatches > 0 ? (totalCorners / cornerMatches).toFixed(1) : null,
    };
  }, [summary]);

  return (
    <div className="space-y-8">
      {/* Team inputs with autocomplete */}
      <div className="flex flex-wrap items-end gap-3">
        <TeamAutocomplete
          label="Team 1"
          value={team1}
          onChange={setTeam1}
          onSubmit={fetchH2H}
          teams={teams}
          placeholder="e.g. Arsenal"
          light={light}
        />

        <button
          type="button"
          onClick={swap}
          title="Swap teams"
          className={
            light
              ? "mb-0.5 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-white text-[#1e293b]/50 hover:text-[#0f172a] hover:border-slate-300 transition-colors"
              : "mb-0.5 flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/50 hover:text-white hover:border-white/30 transition-colors"
          }
        >
          <ArrowLeftRight className="h-4 w-4" />
        </button>

        <TeamAutocomplete
          label="Team 2"
          value={team2}
          onChange={setTeam2}
          onSubmit={fetchH2H}
          teams={teams}
          placeholder="e.g. Chelsea"
          light={light}
        />

        <button
          type="button"
          onClick={fetchH2H}
          disabled={isPending || !team1.trim() || !team2.trim()}
          className="h-10 flex items-center gap-2 rounded-md bg-[#3D2DFF] px-5 text-sm font-medium text-white hover:bg-[#3D2DFF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Search className="h-4 w-4" />
          {isPending ? "Searching…" : "Compare"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {isPending && (
        <div className={`flex items-center justify-center py-16 text-sm ${light ? "text-[#1e293b]/50" : "text-white/40"}`}>
          Fetching records…
        </div>
      )}

      {summary && !isPending && (
        <div className="space-y-6">
          {summary.total === 0 ? (
            <div className={`text-center py-12 text-sm ${light ? "text-[#1e293b]/55" : "text-white/40"}`}>
              No meetings found between{" "}
              <span className={light ? "font-semibold text-[#0f172a]" : "text-white"}>{summary.team1}</span> and{" "}
              <span className={light ? "font-semibold text-[#0f172a]" : "text-white"}>{summary.team2}</span>.
              {teams.length > 0 && " Try picking a team name from the autocomplete suggestions."}
            </div>
          ) : (
            <>
              {/* Score bar */}
              <div
                className={
                  light
                    ? "rounded-2xl border border-border bg-white p-6 shadow-sm"
                    : "rounded-2xl border border-white/10 bg-white/[0.03] p-6"
                }
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-lg font-bold ${light ? "text-[#0f172a]" : "text-white"}`}>{summary.team1}</span>
                  <span className={`text-sm ${light ? "text-[#1e293b]/50" : "text-white/40"}`}>{summary.total} meetings</span>
                  <span className={`text-lg font-bold ${light ? "text-[#0f172a]" : "text-white"}`}>{summary.team2}</span>
                </div>

                {/* Win bar */}
                <div className={`flex h-3 w-full overflow-hidden rounded-full mb-3 ${light ? "bg-slate-200" : "bg-white/10"}`}>
                  <div className="bg-[#3D2DFF] transition-all duration-500" style={{ width: `${t1WinPct}%` }} />
                  <div
                    className={light ? "bg-slate-400/50 transition-all duration-500" : "bg-white/20 transition-all duration-500"}
                    style={{ width: `${Math.round((summary.draws / summary.total) * 100)}%` }}
                  />
                </div>

                <div className={`flex justify-between text-xs mb-4 ${light ? "text-[#1e293b]/60" : "text-white/50"}`}>
                  <span>{t1WinPct}% win rate</span>
                  <span>{Math.round((summary.draws / summary.total) * 100)}% draw</span>
                  <span>{Math.round((summary.team2Wins / summary.total) * 100)}% win rate</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatBox label={`${summary.team1} wins`} value={summary.team1Wins} highlight light={light} />
                  <StatBox label="Draws" value={summary.draws} light={light} />
                  <StatBox label={`${summary.team2} wins`} value={summary.team2Wins} light={light} />
                  <StatBox label="Goals" value={`${summary.team1Goals} – ${summary.team2Goals}`} light={light} />
                </div>
              </div>

              {/* Betting-market summary */}
              {marketStats && (
                <div
                  className={
                    light
                      ? "rounded-2xl border border-border bg-white p-5 shadow-sm"
                      : "rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                  }
                >
                  <h3 className={`text-xs font-semibold uppercase tracking-wide mb-3 ${light ? "text-[#1e293b]/55" : "text-white/50"}`}>
                    Betting Market Trends (H2H)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <StatBox label="BTTS %" value={marketStats.bttsPct} light={light} />
                    <StatBox label="Over 1.5 %" value={marketStats.over15Pct} light={light} />
                    <StatBox label="Over 2.5 %" value={marketStats.over25Pct} light={light} />
                    <StatBox label="Avg Goals" value={marketStats.avgGoals} light={light} />
                    <StatBox
                      label={marketStats.avgCorners ? "Avg Corners" : "Clean Sheet %"}
                      value={marketStats.avgCorners ?? marketStats.cleanSheetPct}
                      light={light}
                    />
                  </div>
                </div>
              )}

              {/* Match history */}
              <div>
                <h3 className={`text-sm font-semibold uppercase tracking-wide mb-3 ${light ? "text-[#1e293b]/60" : "text-white/60"}`}>
                  Match history
                </h3>
                <div className={`overflow-x-auto rounded-xl border ${light ? "border-border bg-white shadow-sm" : "border-white/10"}`}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={`border-b ${light ? "border-border bg-slate-50" : "border-white/10 bg-white/[0.03]"}`}>
                        <th className={`px-4 py-3 text-left font-medium ${light ? "text-[#1e293b]/60" : "text-white/50"}`}>Date</th>
                        <th className={`px-4 py-3 text-left font-medium ${light ? "text-[#1e293b]/60" : "text-white/50"}`}>League</th>
                        <th className={`px-4 py-3 text-left font-medium ${light ? "text-[#1e293b]/60" : "text-white/50"}`}>Season</th>
                        <th className={`px-4 py-3 text-right font-medium ${light ? "text-[#1e293b]/60" : "text-white/50"}`}>Home</th>
                        <th className={`px-4 py-3 text-center font-medium ${light ? "text-[#1e293b]/60" : "text-white/50"}`}>Score</th>
                        <th className={`px-4 py-3 text-left font-medium ${light ? "text-[#1e293b]/60" : "text-white/50"}`}>Away</th>
                        <th className={`px-4 py-3 text-center font-medium ${light ? "text-[#1e293b]/60" : "text-white/50"}`}>Outcome</th>
                      </tr>
                    </thead>
                    <tbody className={light ? "divide-y divide-border" : "divide-y divide-white/5"}>
                      {summary.matches.map((m) => {
                        const outcome = matchOutcome(m, summary.team1);
                        const outcomeStyle =
                          outcome === "win"
                            ? light ? "text-emerald-600" : "text-emerald-400"
                            : outcome === "loss"
                            ? light ? "text-rose-600" : "text-red-400"
                            : light ? "text-[#1e293b]/50" : "text-white/50";

                        return (
                          <tr key={m.id} className={light ? "hover:bg-slate-50 transition-colors" : "hover:bg-white/[0.03] transition-colors"}>
                            <td className={`px-4 py-3 whitespace-nowrap tabular-nums ${light ? "text-[#1e293b]/65" : "text-white/60"}`}>
                              {new Date(m.match_date).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-mono ${
                                  light
                                    ? "border-border bg-slate-100 text-[#1e293b]/70"
                                    : "border-white/10 bg-white/8 text-white/60"
                                }`}
                              >
                                {m.league_code}
                              </span>
                            </td>
                            <td className={`px-4 py-3 text-xs ${light ? "text-[#1e293b]/55" : "text-white/50"}`}>{m.season}</td>
                            <td className={`px-4 py-3 text-right font-medium ${light ? "text-[#0f172a]" : "text-white"}`}>{m.home_team}</td>
                            <td className={`px-4 py-3 text-center font-bold tabular-nums ${light ? "text-[#0f172a]" : "text-white"}`}>
                              {m.home_goals ?? "?"} – {m.away_goals ?? "?"}
                            </td>
                            <td className={`px-4 py-3 font-medium ${light ? "text-[#0f172a]" : "text-white"}`}>{m.away_team}</td>
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
                  <p className={`mt-2 text-center text-xs ${light ? "text-[#1e293b]/40" : "text-white/30"}`}>
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
