"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Loader2, CalendarClock, ChevronDown } from "lucide-react";
import type { Fixture } from "@/lib/sports-data/types";

interface FixtureSearchProps {
  onSelect: (fixture: Fixture) => void;
}

// Leagues surfaced in both data sources (footballdata.io + football-data.org).
// The string values are allowlisted in the API route — keep in sync.
export const SUPPORTED_LEAGUES = [
  { label: "All leagues",            value: "" },
  { label: "Premier League",         value: "Premier League" },
  { label: "La Liga",                value: "La Liga" },
  { label: "Bundesliga",             value: "Bundesliga" },
  { label: "Serie A",                value: "Serie A" },
  { label: "Ligue 1",                value: "Ligue 1" },
  { label: "Champions League",       value: "Champions League" },
  { label: "Europa League",          value: "Europa League" },
  { label: "Championship",           value: "Championship" },
  { label: "Eredivisie",             value: "Eredivisie" },
  { label: "Primeira Liga",          value: "Primeira Liga" },
  { label: "Scottish Premiership",   value: "Scottish Premiership" },
  { label: "World Cup",              value: "World Cup" },
] as const;

/**
 * Optional "search a real fixture" helper for the analyzer's Match Context
 * step. Purely additive — selecting a fixture only pre-fills the team name
 * fields and stashes the fixture id for "Track This Prediction" later.
 * Manual entry remains the primary, fully-supported path.
 */
export function FixtureSearch({ onSelect }: FixtureSearchProps) {
  const [query, setQuery]           = useState("");
  const [league, setLeague]         = useState("");
  const [leagueOpen, setLeagueOpen] = useState(false);
  const [results, setResults]       = useState<Fixture[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Used to cancel in-flight requests when a newer one is issued.
  const abortRef = useRef<AbortController | null>(null);

  // Dropdown container ref — used for outside-click detection.
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape.
  useEffect(() => {
    if (!leagueOpen) return;

    function handlePointerDown(e: PointerEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLeagueOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setLeagueOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [leagueOpen]);

  const runSearch = useCallback(async (q: string, lg: string) => {
    setSelectedId(null);

    // Need at least a 2-char team query OR a league selection.
    if (q.trim().length < 2 && !lg) {
      setResults([]);
      setError(null);
      return;
    }

    // Cancel any in-flight request.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q.trim().length >= 2) params.set("q", q.trim());
      if (lg)                   params.set("league", lg);

      const res = await fetch(`/api/fixtures/search?${params.toString()}`, {
        signal: controller.signal,
      });
      const json = await res.json();

      if (json.success) {
        setResults(json.fixtures ?? []);
        if ((json.fixtures ?? []).length === 0) {
          setError("No upcoming fixtures found — try a different team name or league.");
        }
      } else {
        setResults([]);
        setError(json.error ?? "Fixture search is unavailable right now.");
      }
    } catch (err) {
      // Ignore cancellations — a newer request is already in progress.
      if (err instanceof Error && err.name === "AbortError") return;
      setResults([]);
      setError("Fixture search is unavailable right now.");
    } finally {
      // Only clear loading if this controller wasn't superseded.
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  function handleQueryChange(q: string) {
    setQuery(q);
    runSearch(q, league);
  }

  function handleLeagueChange(lg: string) {
    setLeague(lg);
    setLeagueOpen(false);
    runSearch(query, lg);
  }

  const selectedLeagueLabel =
    SUPPORTED_LEAGUES.find((l) => l.value === league)?.label ?? "All leagues";

  return (
    <div className="rounded-xl border border-dashed border-teal-300 bg-teal-50/40 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-teal-700">
        Optional: search a real fixture
      </p>

      {/* League picker */}
      <div className="mb-2 relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setLeagueOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded-lg border border-border bg-white px-3 py-2 text-sm text-left hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
          aria-haspopup="listbox"
          aria-expanded={leagueOpen}
        >
          <span className={league ? "text-[#0f172a] font-medium" : "text-[#1e293b]/40"}>
            {selectedLeagueLabel}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-[#1e293b]/40 transition-transform duration-150 ${leagueOpen ? "rotate-180" : ""}`}
          />
        </button>

        {leagueOpen && (
          <div
            role="listbox"
            className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-white shadow-lg overflow-hidden"
          >
            <div className="max-h-52 overflow-y-auto">
              {SUPPORTED_LEAGUES.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  role="option"
                  aria-selected={league === l.value}
                  onClick={() => handleLeagueChange(l.value)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-teal-50 ${
                    league === l.value
                      ? "bg-teal-50 font-semibold text-teal-700"
                      : "text-[#1e293b]"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Team search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1e293b]/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder={
            league
              ? `Search in ${selectedLeagueLabel}…`
              : "Search by team name, e.g. Arsenal"
          }
          className="w-full rounded-lg border border-border bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-teal-500" />
        )}
      </div>

      {/* League-only browse hint */}
      {league && query.trim().length < 2 && !loading && results.length === 0 && !error && (
        <p className="mt-2 text-xs text-[#1e293b]/50">
          Showing upcoming fixtures in {selectedLeagueLabel} — or type a team name to narrow
          further.
        </p>
      )}

      {error && <p className="mt-2 text-xs text-[#1e293b]/50">{error}</p>}

      {results.length > 0 && (
        <div className="mt-3 space-y-1.5 max-h-60 overflow-y-auto">
          {results.map((fixture) => (
            <button
              key={fixture.id}
              onClick={() => {
                setSelectedId(fixture.id);
                onSelect(fixture);
              }}
              className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                selectedId === fixture.id
                  ? "border-teal-500 bg-white font-medium text-teal-700"
                  : "border-border bg-white hover:bg-slate-50"
              }`}
            >
              <div className="min-w-0">
                <span className="block truncate">
                  {fixture.homeTeam}{" "}
                  <span className="text-[#1e293b]/40">vs</span>{" "}
                  {fixture.awayTeam}
                </span>
                {fixture.league && (
                  <span className="text-[10px] text-[#1e293b]/40 truncate block">
                    {fixture.league}
                  </span>
                )}
              </div>
              <span className="ml-2 flex shrink-0 items-center gap-1 text-xs text-[#1e293b]/40">
                <CalendarClock className="h-3 w-3" />
                {new Date(fixture.kickoff).toLocaleDateString()}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
