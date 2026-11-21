"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  buildSlipCheckerHref,
  filterScreenedMatches,
  type ScreenedMatch,
  type ScreenerPreset,
  type ScreenerSlipLeg,
} from "@/lib/screener/engine";
import { cn } from "@/lib/utils";

const PRESETS: Array<{ id: ScreenerPreset; label: string; hint: string }> = [
  { id: "all", label: "All Upcoming", hint: "Sorted by kickoff" },
  { id: "acca_anchors", label: "Acca Anchors", hint: "54–74% clean main markets (~1.35–1.85)" },
  { id: "clean_favorites", label: "Clean Favorites", hint: "Strong favorites (>= 56%)" },
  { id: "over25", label: "Over 2.5 Goals", hint: "High-scoring fixtures (>= 54%)" },
  { id: "btts", label: "BTTS Yes", hint: "Both teams to score (>= 52%)" },
  { id: "draw_hunters", label: "Draw Hunters", hint: "Evenly matched, low-xG fixtures with highest draw %" },
  { id: "under25", label: "Under 2.5 Goals", hint: "Tight defensive games (>= 54%)" },
];

function fmtKickoff(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function pct(v: number): string {
  return `${Math.round(v * 100)}%`;
}

export function MatchScreener() {
  const [matches, setMatches] = useState<ScreenedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preset, setPreset] = useState<ScreenerPreset>("all");
  const [league, setLeague] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedLegs, setSelectedLegs] = useState<ScreenerSlipLeg[]>([]);

  const loadMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/screener");
      const data = (await res.json()) as {
        success?: boolean;
        matches?: ScreenedMatch[];
        error?: string;
      };
      if (!res.ok || !data.success) {
        setError(data.error ?? "Unable to load upcoming fixtures right now.");
        setMatches([]);
      } else {
        setMatches(data.matches ?? []);
      }
    } catch {
      setError("Network error while loading upcoming fixtures.");
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetch("/api/screener")
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (cancelled) return;
        const payload = data as { success?: boolean; matches?: ScreenedMatch[]; error?: string };
        if (!ok || !payload.success) {
          setError(payload.error ?? "Unable to load upcoming fixtures right now.");
          setMatches([]);
        } else {
          setMatches(payload.matches ?? []);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setError("Network error while loading upcoming fixtures.");
        setMatches([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const leagues = useMemo(() => {
    const set = new Set<string>();
    for (const m of matches) set.add(m.league);
    return Array.from(set).sort();
  }, [matches]);

  const filtered = useMemo(
    () => filterScreenedMatches(matches, { preset, league, search }),
    [matches, preset, league, search],
  );

  const toggleLeg = (event: string, selection: string, fairOdds: number) => {
    const key = `${event}::${selection}`;
    setSelectedLegs((prev) => {
      const exists = prev.some((l) => `${l.event}::${l.selection}` === key);
      if (exists) return prev.filter((l) => `${l.event}::${l.selection}` !== key);
      return [...prev.slice(0, 19), { event, selection, odds: fairOdds.toFixed(2) }];
    });
  };

  const isSelected = (event: string, selection: string) =>
    selectedLegs.some((l) => l.event === event && l.selection === selection);

  const combinedFairOdds = useMemo(
    () => selectedLegs.reduce((acc, l) => acc * (Number(l.odds) || 1), 1),
    [selectedLegs],
  );

  return (
    <div className="space-y-6">
      {/* Preset Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPreset(p.id)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
              preset === p.id
                ? "border-[#3D2DFF] bg-[#3D2DFF] text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
            )}
            title={p.hint}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-slate-200 py-3.5">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search team or league…"
              className="h-9 bg-white pl-8 text-xs"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              aria-label="Filter by league"
              value={league}
              onChange={(e) => setLeague(e.target.value)}
              className="h-9 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-700"
            >
              <option value="all">All leagues ({leagues.length})</option>
              {leagues.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>
            Showing <strong>{filtered.length}</strong> of {matches.length} modeled fixtures
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={loadMatches}
            className="h-8 gap-1.5 text-xs"
          >
            <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Selected Slip Handoff Tray */}
      {selectedLegs.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal-200 bg-teal-50/70 px-4 py-3 text-xs">
          <div className="space-y-0.5">
            <p className="font-bold text-teal-950">
              Slip Draft: {selectedLegs.length} {selectedLegs.length === 1 ? "leg" : "legs"} · Est. fair odds{" "}
              <span className="tabular-nums">{combinedFairOdds.toFixed(2)}</span>
            </p>
            <p className="text-teal-900/80">
              {selectedLegs.map((l) => `${l.selection} (@${l.odds})`).join(" · ")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setSelectedLegs([])}
              className="h-8 gap-1 border-teal-200 bg-white text-slate-600"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </Button>
            <Button size="sm" variant="teal" asChild className="h-8 gap-1.5">
              <Link href={buildSlipCheckerHref(selectedLegs)}>
                Audit in Slip Checker <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Results List */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-[#3D2DFF]" />
          Scoring upcoming fixtures with Dixon-Coles v2.0…
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-6 text-center text-sm text-rose-700">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
          No upcoming fixtures match this filter right now. Try switching to{" "}
          <button
            type="button"
            onClick={() => {
              setPreset("all");
              setLeague("all");
              setSearch("");
            }}
            className="font-semibold text-[#3D2DFF] hover:underline"
          >
            All Upcoming
          </button>
          .
        </div>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
          {filtered.map((m) => {
            const eventName = `${m.homeTeam} vs ${m.awayTeam}`;
            const favSel = `${m.favoriteTeam} to win`;
            const favFair = m.favoriteFairOdds;
            const o25Fair = Math.round((1 / Math.max(0.05, m.over25Prob)) * 100) / 100;
            const bttsFair = Math.round((1 / Math.max(0.05, m.bttsProb)) * 100) / 100;

            return (
              <li key={m.id} className="px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span className="font-semibold text-teal-700">{m.league}</span>
                      <span>·</span>
                      <span>{fmtKickoff(m.kickoff)}</span>
                      <span>·</span>
                      <span className="tabular-nums">
                        xG {m.lambdaHome.toFixed(2)} – {m.lambdaAway.toFixed(2)}
                      </span>
                      {m.sharpFavoriteProb != null && m.sharpSourceLabel && (
                        <>
                          <span>·</span>
                          <span className="rounded bg-sky-50 px-1.5 py-0.5 font-medium text-sky-700">
                            {m.sharpSourceLabel}: {pct(m.sharpFavoriteProb)} {m.favoriteTeam}
                          </span>
                        </>
                      )}
                    </div>

                    <p className="text-sm font-bold text-slate-900">
                      {m.homeTeam} <span className="font-normal text-slate-400">vs</span> {m.awayTeam}
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs tabular-nums text-slate-600">
                      <span>
                        1X2: <strong>{pct(m.homeWinProb)}</strong> / {pct(m.drawProb)} /{" "}
                        <strong>{pct(m.awayWinProb)}</strong>
                      </span>
                      <span>
                        O2.5: <strong>{pct(m.over25Prob)}</strong>
                      </span>
                      <span>
                        BTTS: <strong>{pct(m.bttsProb)}</strong>
                      </span>
                      {m.anchorPick && (
                        <span className="text-teal-700">
                          Anchor: <strong>{m.anchorPick.selection}</strong> ({pct(m.anchorPick.modelProb)}, fair @
                          {m.anchorPick.fairOdds.toFixed(2)})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Add to Slip buttons */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { label: `${m.favoriteTeam} (${pct(m.favoriteProb)})`, selection: favSel, fair: favFair },
                      { label: `Draw (${pct(m.drawProb)})`, selection: "Draw", fair: Math.round((1 / Math.max(0.05, m.drawProb)) * 100) / 100 },
                      { label: `O2.5 (${pct(m.over25Prob)})`, selection: "Over 2.5 goals", fair: o25Fair },
                      { label: `BTTS (${pct(m.bttsProb)})`, selection: "BTTS Yes", fair: bttsFair },
                    ].map((opt) => {
                      const active = isSelected(eventName, opt.selection);
                      return (
                        <button
                          key={opt.selection}
                          type="button"
                          onClick={() => toggleLeg(eventName, opt.selection, opt.fair)}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-colors",
                            active
                              ? "border-teal-600 bg-teal-600 text-white"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100",
                          )}
                        >
                          {active ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
