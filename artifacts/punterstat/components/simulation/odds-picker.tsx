"use client";

import { useEffect, useState } from "react";
import { Radar, Loader2, RefreshCw, ChevronDown } from "lucide-react";
import { stripOverround } from "@/lib/odds/devig";

interface OddsOutcome {
  name: string;
  price: number;
}

interface OddsBookmaker {
  key: string;
  title: string;
  markets: { key: string; outcomes: OddsOutcome[] }[];
}

interface OddsEvent {
  id: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  bookmakers: OddsBookmaker[];
}

const SPORTS = [
  { key: "soccer_epl", label: "Premier League" },
  { key: "soccer_uefa_champs_league", label: "Champions League" },
  { key: "soccer_spain_la_liga", label: "La Liga" },
];

/** Which side of the shared 1X2 scoreline a leg backs, when it's a plain h2h outcome. */
export type OddsLegSide = "home" | "draw" | "away";

export interface OddsLegFixtureInfo {
  fixtureId: string;
  side: OddsLegSide;
  fixtureFairProbs: { home: number; draw: number; away: number };
}

interface OddsPickerProps {
  /** Called when user picks a single outcome price (single-bet mode). Includes the de-vigged fair probability (0-1) for that outcome. */
  onSelect?: (decimalOdds: number, label: string, fairProb: number) => void;
  /**
   * Called when user adds a leg to an accumulator. `fairProb` is the
   * de-vigged fair probability for this outcome. `fixtureInfo` is present
   * for plain 1X2 (h2h) outcomes and lets legs on the same match be
   * correlated via a shared Poisson-model scoreline instead of simulated as
   * independent events.
   */
  onAddLeg?: (
    decimalOdds: number,
    label: string,
    match: string,
    fixtureId?: string,
    fairProb?: number,
    fixtureInfo?: OddsLegFixtureInfo
  ) => void;
  /** When true, the "add" button text becomes "Add to acca" instead of "Use odds". */
  accumMode?: boolean;
}

/**
 * Live odds panel — auto-fetches on mount so odds are ready the moment the
 * page loads. Always visible (no toggle), compact layout.
 */
export function OddsPicker({ onSelect, onAddLeg, accumMode = false }: OddsPickerProps) {
  const [sportKey, setSportKey] = useState(SPORTS[0].key);
  const [events, setEvents] = useState<OddsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load(key: string) {
    setSportKey(key);
    setLoading(true);
    setError(null);
    setExpanded(null);
    try {
      const res = await fetch(`/api/odds?sport=${encodeURIComponent(key)}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.events) && json.events.length > 0) {
        setEvents(json.events);
        setExpanded(json.events[0]?.id ?? null);
      } else {
        setEvents([]);
        setError(json.error ?? "No live odds right now — try another league or enter odds manually.");
      }
    } catch {
      setEvents([]);
      setError("Could not reach odds service — enter odds manually.");
    } finally {
      setLoading(false);
    }
  }

  // Auto-load on mount
  useEffect(() => { load(SPORTS[0].key); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-[#f8fafc] px-4 py-2.5">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#1e293b]/60">
          <Radar className="h-3.5 w-3.5 text-teal-500" />
          Live Odds
        </span>
        <button
          onClick={() => load(sportKey)}
          disabled={loading}
          className="flex items-center gap-1 text-[10px] text-[#1e293b]/40 transition hover:text-[#0f172a] disabled:opacity-40"
          title="Refresh"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* League pills */}
      <div className="flex gap-1.5 overflow-x-auto px-3 py-2.5 scrollbar-none">
        {SPORTS.map((s) => (
          <button
            key={s.key}
            onClick={() => load(s.key)}
            disabled={loading}
            className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium transition disabled:opacity-50 ${
              sportKey === s.key
                ? "border-teal-500 bg-teal-50 text-teal-700"
                : "border-border text-[#1e293b]/60 hover:border-slate-300 hover:text-[#0f172a]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="px-3 pb-3">
        {loading && (
          <div className="flex items-center gap-2 py-4 text-xs text-[#1e293b]/40">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Fetching live odds…
          </div>
        )}

        {!loading && error && (
          <p className="py-3 text-xs text-[#1e293b]/40">{error}</p>
        )}

        {!loading && events.length > 0 && (
          <div className="max-h-72 space-y-1.5 overflow-y-auto pr-0.5">
            {events.map((event) => {
              const bookmaker = event.bookmakers[0];
              const market = bookmaker?.markets.find((m) => m.key === "h2h");
              if (!market) return null;
              const isOpen = expanded === event.id;
              return (
                <div key={event.id} className="rounded-lg border border-border overflow-hidden">
                  {/* Match row — click to expand */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : event.id)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-[#f8fafc]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-medium text-[#0f172a]">
                        {event.homeTeam} <span className="text-[#1e293b]/30">vs</span> {event.awayTeam}
                      </p>
                      <p className="text-[10px] text-[#1e293b]/40">
                        {new Date(event.commenceTime).toLocaleDateString("en-GB", {
                          weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <ChevronDown className={`ml-2 h-3.5 w-3.5 shrink-0 text-[#1e293b]/30 transition ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Outcome buttons */}
                  {isOpen && (() => {
                    const devig = stripOverround(market.outcomes.map((o) => o.price));
                    // h2h market outcomes are always [home, away, draw] or similar — classify each by name.
                    const sideForOutcome = (name: string): OddsLegSide | undefined => {
                      if (name === event.homeTeam) return "home";
                      if (name === event.awayTeam) return "away";
                      if (name === "Draw") return "draw";
                      return undefined;
                    };
                    const isFullH2h =
                      market.key === "h2h" &&
                      market.outcomes.every((o) => sideForOutcome(o.name) !== undefined);
                    const fixtureFairProbs = isFullH2h
                      ? {
                          home: devig.fair[market.outcomes.findIndex((o) => sideForOutcome(o.name) === "home")] ?? 0,
                          away: devig.fair[market.outcomes.findIndex((o) => sideForOutcome(o.name) === "away")] ?? 0,
                          draw: devig.fair[market.outcomes.findIndex((o) => sideForOutcome(o.name) === "draw")] ?? 0,
                        }
                      : undefined;
                    return (
                      <div className="border-t border-border bg-[#f8fafc] px-3 py-2">
                        <div className="flex flex-wrap gap-1.5">
                          {market.outcomes.map((outcome, i) => {
                            const matchLabel = `${event.homeTeam} vs ${event.awayTeam}`;
                            const selectionLabel = outcome.name === "Draw"
                              ? `Draw — ${event.homeTeam} vs ${event.awayTeam}`
                              : outcome.name;
                            const side = sideForOutcome(outcome.name);
                            const fixtureInfo: OddsLegFixtureInfo | undefined =
                              fixtureFairProbs && side
                                ? { fixtureId: event.id, side, fixtureFairProbs }
                                : undefined;
                            return (
                              <button
                                key={outcome.name}
                                onClick={() => {
                                  if (accumMode && onAddLeg) {
                                    onAddLeg(outcome.price, selectionLabel, matchLabel, event.id, devig.fair[i], fixtureInfo);
                                  } else if (onSelect) {
                                    onSelect(outcome.price, `${matchLabel} — ${outcome.name}`, devig.fair[i]);
                                  }
                                }}
                                className="rounded border border-teal-200 bg-white px-2.5 py-1.5 text-left text-[11px] font-mono text-[#1e293b] transition hover:border-teal-500 hover:text-teal-700"
                              >
                                <span className="block">{outcome.name} · {outcome.price.toFixed(2)}</span>
                                <span className="block text-[9px] font-sans text-[#1e293b]/40">
                                  raw {(devig.rawImplied[i] * 100).toFixed(1)}% · fair {(devig.fair[i] * 100).toFixed(1)}%
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        <p className="mt-1.5 text-[9px] text-[#1e293b]/30">
                          {bookmaker.title} · overround (bookmaker margin): {devig.overroundPct.toFixed(1)}%
                        </p>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
