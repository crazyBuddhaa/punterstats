"use client";

import { useState, useTransition } from "react";
import { Zap, AlertTriangle, Database } from "lucide-react";
import type { MatchValueResult } from "@/lib/spot-the-value/calculator";
import type { LeagueSearchResult } from "@/lib/spot-the-value/types";
import { MatchCard, FixtureCard, type FixtureMatch } from "./value-cards";
import { LeagueSearchBar } from "./league-search-bar";

// ─── Static quick-access pills ──────────────────────────────────────────────
const QUICK_SPORTS: { key: string; label: string }[] = [
  { key: "soccer_epl", label: "Premier League" },
  { key: "soccer_uefa_champs_league", label: "Champions League" },
  { key: "soccer_spain_la_liga", label: "La Liga" },
  { key: "soccer_germany_bundesliga", label: "Bundesliga" },
  { key: "soccer_italy_serie_a", label: "Serie A" },
];

// ─── Main analyzer ───────────────────────────────────────────────────────────
interface ValueAnalyzerProps {
  initialMatches: MatchValueResult[];
  initialSport: string;
  fromCache: boolean;
}

export function ValueAnalyzer({ initialMatches, initialSport, fromCache }: ValueAnalyzerProps) {
  const [sport, setSport] = useState(initialSport);
  const [sportLabel, setSportLabel] = useState(
    QUICK_SPORTS.find((s) => s.key === initialSport)?.label ?? initialSport
  );
  const [mode, setMode] = useState<"odds" | "fixtures">("odds");
  const [matches, setMatches] = useState<MatchValueResult[]>(initialMatches);
  const [fixtureMatches, setFixtureMatches] = useState<FixtureMatch[]>([]);
  const [cacheNote, setCacheNote] = useState(fromCache);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function loadSport(key: string, label: string) {
    setSport(key);
    setSportLabel(label);
    setMode("odds");
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/spot-the-value?sport=${key}`);
        const json = (await res.json()) as { matches?: MatchValueResult[]; fromCache?: boolean; error?: string };
        if (!res.ok || json.error) {
          setError(json.error ?? "Failed to load odds.");
          setMatches([]);
        } else {
          setMatches(json.matches ?? []);
          setCacheNote(json.fromCache ?? false);
        }
      } catch {
        setError("Network error loading odds.");
      }
    });
  }

  function loadFixtures(leagueName: string, label: string) {
    setSport("fixtures");
    setSportLabel(label);
    setMode("fixtures");
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/spot-the-value?sport=fixtures&league=${encodeURIComponent(leagueName)}`);
        const json = (await res.json()) as { fixtures?: FixtureMatch[]; error?: string };
        if (!res.ok || json.error) {
          setError(json.error ?? "Failed to load fixtures.");
          setFixtureMatches([]);
        } else {
          setFixtureMatches(json.fixtures ?? []);
        }
      } catch {
        setError("Network error loading fixtures.");
      }
    });
  }

  function handleLeagueSelect(league: LeagueSearchResult) {
    if (league.source === "odds-api") {
      loadSport(league.key, league.title);
    } else {
      loadFixtures(league.key, league.title);
    }
  }

  const noResults = !isPending && !error && (mode === "odds" ? matches.length === 0 : fixtureMatches.length === 0);

  return (
    <div className="space-y-5">
      {/* Quick-access pills */}
      <div className="flex flex-wrap gap-2">
        {QUICK_SPORTS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => loadSport(key, label)}
            disabled={isPending}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
              sport === key && mode === "odds"
                ? "border-[#3D2DFF] bg-[#3D2DFF] text-white"
                : "border-border bg-white text-[#1e293b]/70 hover:border-[#3D2DFF]/40 hover:text-[#3D2DFF]"
            } disabled:opacity-50`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* League search */}
      <LeagueSearchBar onSelect={handleLeagueSelect} />

      {/* Active league label */}
      {sportLabel && !QUICK_SPORTS.some((s) => s.key === sport) && (
        <div className="flex items-center gap-2 text-sm text-[#1e293b]/60">
          {mode === "fixtures"
            ? <Database className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            : <Zap className="h-3.5 w-3.5 shrink-0 text-[#3D2DFF]" />
          }
          <span>
            Showing <strong className="text-[#0f172a]">{sportLabel}</strong>
            {mode === "fixtures" && " — no live odds; enter market odds manually per fixture"}
          </span>
        </div>
      )}

      {cacheNote && mode === "odds" && (
        <p className="text-xs text-[#1e293b]/40">Cached odds (refreshed every 5 min to protect quota).</p>
      )}

      {isPending && (
        <div className="flex items-center gap-2 text-sm text-[#1e293b]/50">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#3D2DFF] border-t-transparent" />
          Loading…
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">Unavailable</p>
            <p className="mt-0.5 text-xs">{error}</p>
          </div>
        </div>
      )}

      {!isPending && noResults && (
        <div className="rounded-2xl border border-dashed border-border bg-white py-12 text-center">
          <Zap className="mx-auto mb-3 h-8 w-8 text-[#1e293b]/20" />
          <p className="font-semibold text-[#0f172a]">No fixtures found</p>
          <p className="mt-1 text-sm text-[#1e293b]/50">
            No upcoming matches for this league right now.
          </p>
        </div>
      )}

      {/* Odds-based matches */}
      {!isPending && mode === "odds" && matches.length > 0 && (
        <div className="space-y-3">
          {matches.map((m) => (
            <MatchCard key={`${m.homeTeam}-${m.awayTeam}-${m.commenceTime}`} match={m} />
          ))}
        </div>
      )}

      {/* Fixture-only matches */}
      {!isPending && mode === "fixtures" && fixtureMatches.length > 0 && (
        <div className="space-y-3">
          {fixtureMatches.map((f) => (
            <FixtureCard key={`${f.homeTeam}-${f.awayTeam}-${f.kickoff}`} fixture={f} />
          ))}
        </div>
      )}
    </div>
  );
}
