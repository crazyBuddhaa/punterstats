"use client";

import { useState, useTransition } from "react";
import { Zap, AlertTriangle, Database, SlidersHorizontal } from "lucide-react";
import { computeMatchValue, type MatchValueResult } from "@/lib/spot-the-value/calculator";
import type { LeagueSearchResult } from "@/lib/spot-the-value/types";
import { MatchCard, FixtureCard, OutcomeRow, type FixtureMatch } from "./value-cards";
import { LeagueSearchBar } from "./league-search-bar";

// ─── Static quick-access pills ──────────────────────────────────────────────
const QUICK_SPORTS: { key: string; label: string }[] = [
  { key: "soccer_epl", label: "Premier League" },
  { key: "soccer_uefa_champs_league", label: "Champions League" },
  { key: "soccer_uefa_europa_league", label: "Europa League" },
  { key: "soccer_spain_la_liga", label: "La Liga" },
  { key: "soccer_germany_bundesliga", label: "Bundesliga" },
  { key: "soccer_italy_serie_a", label: "Serie A" },
  { key: "soccer_efl_champ", label: "Championship" },
  { key: "basketball_nba", label: "NBA" },
];

const BOOKMAKER_PRESETS = ["SportyBet", "Bet9ja", "BetKing", "1xBet", "MSport", "Pinnacle"];

function ManualOddsChecker() {
  const [homeTeam, setHomeTeam] = useState("Arsenal");
  const [awayTeam, setAwayTeam] = useState("Chelsea");
  const [bookmaker, setBookmaker] = useState("SportyBet");
  const [homeOdds, setHomeOdds] = useState("1.95");
  const [drawOdds, setDrawOdds] = useState("3.50");
  const [awayOdds, setAwayOdds] = useState("4.00");
  const [homeProb, setHomeProb] = useState("54");
  const [drawProb, setDrawProb] = useState("24");
  const [awayProb, setAwayProb] = useState("22");
  const [loadingModel, setLoadingModel] = useState(false);
  const [modelNote, setModelNote] = useState<string | null>(null);

  const loadPunterStatModel = async () => {
    const h = homeTeam.trim();
    const a = awayTeam.trim();
    if (h.length < 2 || a.length < 2) return;
    setLoadingModel(true);
    setModelNote(null);
    try {
      const res = await fetch(
        `/api/football/match-intel?home=${encodeURIComponent(h)}&away=${encodeURIComponent(a)}`,
      );
      const data = await res.json();
      if (data.success && data.intel) {
        const m = data.intel.markets;
        const hp = Math.round(m.homeWin * 100);
        const dp = Math.round(m.draw * 100);
        const ap = Math.max(1, 100 - hp - dp);
        setHomeProb(String(hp));
        setDrawProb(String(dp));
        setAwayProb(String(ap));
        setModelNote(
          `Loaded PunterStat football model (${data.intel.strengthEdgeLabel} · xG ${data.intel.lambdaHome.toFixed(2)}–${data.intel.lambdaAway.toFixed(2)}). Adjust if you have late team news.`,
        );
      }
    } catch {
      setModelNote("Could not load model — enter your own probability estimates below.");
    } finally {
      setLoadingModel(false);
    }
  };

  const ho = parseFloat(homeOdds);
  const do_ = parseFloat(drawOdds);
  const ao = parseFloat(awayOdds);
  const oddsValid = ho > 1 && do_ > 1 && ao > 1;

  const hp = parseFloat(homeProb);
  const dp = parseFloat(drawProb);
  const ap = parseFloat(awayProb);
  const totalPct = (Number.isFinite(hp) ? hp : 0) + (Number.isFinite(dp) ? dp : 0) + (Number.isFinite(ap) ? ap : 0);
  const modelValid = Number.isFinite(hp) && Number.isFinite(dp) && Number.isFinite(ap) && Math.abs(totalPct - 100) <= 2;

  const result = oddsValid
    ? computeMatchValue(
        homeTeam.trim() || "Home",
        awayTeam.trim() || "Away",
        new Date().toISOString(),
        bookmaker.toLowerCase(),
        bookmaker || "Bookmaker",
        ho,
        do_,
        ao,
        modelValid ? { home: hp / 100, draw: dp / 100, away: ap / 100 } : undefined,
      )
    : null;

  return (
    <div className="space-y-5 rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-[#0f172a]">Manual Odds Checker</h3>
          <p className="mt-0.5 text-xs text-[#1e293b]/55">
            Paste 1X2 odds from SportyBet, Bet9ja, or any bookmaker, then auto-fill PunterStat&apos;s football model (or enter your own %) to check if the price has value.
          </p>
        </div>
        <button
          type="button"
          disabled={loadingModel}
          onClick={loadPunterStatModel}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#3D2DFF] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#3D2DFF]/90 disabled:opacity-50"
        >
          {loadingModel ? "Loading model…" : "Auto-fill PunterStat Model"}
        </button>
      </div>

      {modelNote && (
        <p className="rounded-lg bg-teal-50 px-3 py-2 text-xs font-medium text-teal-800">{modelNote}</p>
      )}

      {/* Bookmaker chips */}
      <div className="flex flex-wrap gap-1.5">
        {BOOKMAKER_PRESETS.map((bm) => (
          <button
            key={bm}
            type="button"
            onClick={() => setBookmaker(bm)}
            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition ${
              bookmaker === bm
                ? "border-teal-600 bg-teal-50 text-teal-700"
                : "border-border bg-white text-[#1e293b]/60 hover:border-slate-300"
            }`}
          >
            {bm}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-[#1e293b]/60">Home team</label>
          <input
            value={homeTeam}
            onChange={(e) => setHomeTeam(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-white px-3 text-sm text-[#0f172a] focus:border-[#3D2DFF] focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#1e293b]/60">Away team</label>
          <input
            value={awayTeam}
            onChange={(e) => setAwayTeam(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-white px-3 text-sm text-[#0f172a] focus:border-[#3D2DFF] focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 rounded-xl border border-border bg-slate-50/70 p-3.5">
          <p className="text-xs font-semibold text-[#0f172a]">Bookmaker 1X2 odds ({bookmaker})</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Home (1)", val: homeOdds, set: setHomeOdds },
              { label: "Draw (X)", val: drawOdds, set: setDrawOdds },
              { label: "Away (2)", val: awayOdds, set: setAwayOdds },
            ].map((f) => (
              <div key={f.label}>
                <label className="mb-1 block text-[10px] font-medium uppercase text-[#1e293b]/50">{f.label}</label>
                <input
                  inputMode="decimal"
                  value={f.val}
                  onChange={(e) => f.set(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-white px-2.5 text-sm tabular-nums text-[#0f172a] focus:border-[#3D2DFF] focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-[#3D2DFF]/20 bg-[#3D2DFF]/5 p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#3D2DFF]">Football probability estimates (%)</p>
            <span className={`text-[11px] font-medium ${modelValid ? "text-emerald-600" : "text-amber-600"}`}>
              {totalPct.toFixed(0)}% {modelValid ? "✓" : "(aim for 100%)"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Home %", val: homeProb, set: setHomeProb },
              { label: "Draw %", val: drawProb, set: setDrawProb },
              { label: "Away %", val: awayProb, set: setAwayProb },
            ].map((f) => (
              <div key={f.label}>
                <label className="mb-1 block text-[10px] font-medium uppercase text-[#1e293b]/50">{f.label}</label>
                <input
                  inputMode="decimal"
                  value={f.val}
                  onChange={(e) => f.set(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-white px-2.5 text-sm tabular-nums text-[#0f172a] focus:border-[#3D2DFF] focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {result ? (
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="mb-2 flex items-center justify-between text-xs text-[#1e293b]/55">
            <span>
              <strong>{result.homeTeam}</strong> vs <strong>{result.awayTeam}</strong>
            </span>
            <span>
              Bookmaker margin: <strong className="text-[#0f172a]">{result.overroundPct}%</strong>
            </span>
          </div>
          <div className="divide-y divide-border/60">
            {result.outcomes.map((o) => (
              <OutcomeRow
                key={o.outcome}
                outcome={o}
                eventName={`${result.homeTeam} vs ${result.awayTeam}`}
                bookmaker={bookmaker}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-rose-600">Enter decimal odds greater than 1.00 for all three outcomes.</p>
      )}
    </div>
  );
}

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
  const [mode, setMode] = useState<"odds" | "fixtures" | "manual">(
    initialMatches.length > 0 ? "odds" : "manual",
  );
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
          setError(json.error ?? "Live odds are temporarily unavailable — use Manual Odds Checker below.");
          setMatches([]);
        } else {
          setMatches(json.matches ?? []);
          setCacheNote(json.fromCache ?? false);
        }
      } catch {
        setError("Network error loading odds. You can still use Manual Odds Checker.");
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

  const noResults =
    !isPending &&
    !error &&
    mode !== "manual" &&
    (mode === "odds" ? matches.length === 0 : fixtureMatches.length === 0);

  return (
    <div className="space-y-5">
      {/* Quick-access pills + Manual Odds Checker toggle */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setMode("manual");
            setError(null);
          }}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
            mode === "manual"
              ? "border-teal-600 bg-teal-600 text-white"
              : "border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Manual Odds Checker
        </button>

        {QUICK_SPORTS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
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
      {mode !== "manual" && <LeagueSearchBar onSelect={handleLeagueSelect} />}

      {/* Active league label */}
      {mode !== "manual" && sportLabel && !QUICK_SPORTS.some((s) => s.key === sport) && (
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
        <div className="flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Live odds unavailable</p>
              <p className="mt-0.5 text-xs">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setMode("manual");
              setError(null);
            }}
            className="shrink-0 rounded-lg bg-amber-900/10 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-900/15"
          >
            Use Manual Checker →
          </button>
        </div>
      )}

      {mode === "manual" && <ManualOddsChecker />}

      {!isPending && noResults && (
        <div className="rounded-2xl border border-dashed border-border bg-white py-10 text-center space-y-3">
          <Zap className="mx-auto h-8 w-8 text-[#1e293b]/20" />
          <p className="font-semibold text-[#0f172a]">No live odds right now for {sportLabel}</p>
          <p className="text-sm text-[#1e293b]/50">
            You can still paste odds from SportyBet or Bet9ja into the Manual Odds Checker.
          </p>
          <button
            type="button"
            onClick={() => setMode("manual")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700"
          >
            Open Manual Odds Checker
          </button>
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
