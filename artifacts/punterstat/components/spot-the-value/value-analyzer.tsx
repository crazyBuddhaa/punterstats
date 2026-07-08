"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from "react";
import {
  ChevronDown,
  ChevronUp,
  Zap,
  AlertTriangle,
  Minus,
  TrendingDown,
  TrendingUp,
  Search,
  X,
  Database,
} from "lucide-react";
import type { MatchValueResult, OutcomeAssessment, ValueRating } from "@/lib/spot-the-value/calculator";
import { computeMatchValue } from "@/lib/spot-the-value/calculator";
import type { LeagueSearchResult } from "@/lib/spot-the-value/types";

// ─── Static quick-access pills ──────────────────────────────────────────────
const QUICK_SPORTS: { key: string; label: string }[] = [
  { key: "soccer_epl", label: "Premier League" },
  { key: "soccer_uefa_champs_league", label: "Champions League" },
  { key: "soccer_spain_la_liga", label: "La Liga" },
  { key: "soccer_germany_bundesliga", label: "Bundesliga" },
  { key: "soccer_italy_serie_a", label: "Serie A" },
];

// ─── Value-rating display config ────────────────────────────────────────────
const RATING_CONFIG: Record<
  ValueRating,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  strong_value:    { label: "Strong value",      color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: TrendingUp },
  slight_value:    { label: "Slight value",       color: "text-teal-700",    bg: "bg-teal-50 border-teal-200",       icon: TrendingUp },
  fair:            { label: "Fair priced",        color: "text-slate-600",   bg: "bg-slate-50 border-slate-200",     icon: Minus },
  slight_undervalue: { label: "Slight undervalue", color: "text-amber-700", bg: "bg-amber-50 border-amber-200",    icon: TrendingDown },
  undervalue:      { label: "Undervalue",         color: "text-rose-700",   bg: "bg-rose-50 border-rose-200",       icon: TrendingDown },
};

// ─── Shared outcome row ──────────────────────────────────────────────────────
function OutcomeRow({ outcome }: { outcome: OutcomeAssessment }) {
  const ratingCfg = outcome.valueRating ? RATING_CONFIG[outcome.valueRating] : null;
  const Icon = ratingCfg?.icon;

  return (
    <div className="flex items-center justify-between py-2.5 text-sm">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-[#0f172a] truncate">{outcome.label}</p>
        <p className="text-xs text-[#1e293b]/50">
          {outcome.decimalOdds.toFixed(2)} · market fair: {Math.round(outcome.fairImpliedProb * 100)}%
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-4">
        {outcome.modelProb !== null && (
          <span className="text-sm text-[#1e293b]/70">
            model: {Math.round(outcome.modelProb * 100)}%
          </span>
        )}
        {ratingCfg && outcome.valueDelta !== null && (
          <span className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${ratingCfg.bg} ${ratingCfg.color}`}>
            {Icon && <Icon className="h-3 w-3" />}
            {outcome.valueDelta > 0 ? "+" : ""}{Math.round(outcome.valueDelta * 100)}pp
          </span>
        )}
        {!ratingCfg && <span className="text-xs text-[#1e293b]/30 italic">no model</span>}
      </div>
    </div>
  );
}

// ─── Match card (odds-based) ─────────────────────────────────────────────────
function MatchCard({ match }: { match: MatchValueResult }) {
  const [expanded, setExpanded] = useState(false);
  const [modelInputs, setModelInputs] = useState({ home: "", draw: "", away: "" });
  const [computed, setComputed] = useState<MatchValueResult | null>(null);

  const kick = new Date(match.commenceTime).toLocaleDateString("en-GB", {
    weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  function handleCompare() {
    const home = parseFloat(modelInputs.home) / 100;
    const draw = parseFloat(modelInputs.draw) / 100;
    const away = parseFloat(modelInputs.away) / 100;
    if (isNaN(home) || isNaN(draw) || isNaN(away)) return;
    if (Math.abs(home + draw + away - 1) > 0.1) return;
    const homeOdds = match.outcomes.find((o) => o.outcome === "home_win");
    const drawOdds = match.outcomes.find((o) => o.outcome === "draw");
    const awayOdds = match.outcomes.find((o) => o.outcome === "away_win");
    if (!homeOdds || !drawOdds || !awayOdds) return;
    setComputed(computeMatchValue(
      match.homeTeam, match.awayTeam, match.commenceTime,
      match.bookmakerKey, match.bookmakerTitle,
      homeOdds.decimalOdds, drawOdds.decimalOdds, awayOdds.decimalOdds,
      { home, draw, away }
    ));
  }

  const display = computed ?? match;
  const totalPct = parseFloat(modelInputs.home || "0") + parseFloat(modelInputs.draw || "0") + parseFloat(modelInputs.away || "0");
  const totalValid = Math.abs(totalPct - 100) < 2;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <button
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition"
        onClick={() => setExpanded((e) => !e)}
      >
        <div>
          <p className="font-semibold text-[#0f172a]">
            {match.homeTeam} <span className="text-[#1e293b]/40 font-normal">vs</span> {match.awayTeam}
          </p>
          <p className="mt-0.5 text-xs text-[#1e293b]/50">
            {kick} · {match.bookmakerTitle} · margin {match.overroundPct}%
          </p>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-[#1e293b]/40 shrink-0" /> : <ChevronDown className="h-4 w-4 text-[#1e293b]/40 shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-border px-5 pb-5 pt-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#1e293b]/40">
            Market odds + fair probabilities
          </p>
          <div className="divide-y divide-border/60">
            {display.outcomes.map((o) => <OutcomeRow key={o.outcome} outcome={o} />)}
          </div>

          <div className="mt-5 rounded-xl border border-dashed border-[#3D2DFF]/30 bg-[#3D2DFF]/5 p-4">
            <p className="mb-3 text-xs font-semibold text-[#3D2DFF]">Enter your model probabilities to spot value gaps</p>
            <div className="grid grid-cols-3 gap-3">
              {([["home", match.homeTeam], ["draw", "Draw"], ["away", match.awayTeam]] as const).map(([key, label]) => (
                <div key={key}>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#1e293b]/50 truncate">{label}</label>
                  <div className="relative">
                    <input
                      type="number" min="0" max="100" step="0.5" placeholder="0"
                      value={modelInputs[key]}
                      onChange={(e) => setModelInputs((p) => ({ ...p, [key]: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-white px-3 py-2 pr-7 text-sm text-[#0f172a] placeholder:text-[#1e293b]/30 focus:border-[#3D2DFF] focus:outline-none focus:ring-1 focus:ring-[#3D2DFF]"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#1e293b]/40">%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className={`text-xs ${totalPct === 0 ? "text-[#1e293b]/30" : totalValid ? "text-emerald-600" : "text-amber-600"}`}>
                {totalPct === 0 ? "Probabilities should sum to 100%" : totalValid ? `Total: ${totalPct.toFixed(1)}% ✓` : `Total: ${totalPct.toFixed(1)}% — should be ~100%`}
              </p>
              <button
                onClick={handleCompare} disabled={!totalValid}
                className="shrink-0 rounded-lg bg-[#3D2DFF] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#3D2DFF]/90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Compare
              </button>
            </div>
          </div>

          <p className="mt-4 text-[11px] leading-relaxed text-[#1e293b]/40">
            Value delta = your model probability minus the market&apos;s fair probability (overround removed). A positive gap suggests your model sees more probability here than the market does.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Fixture card (no market odds — manual entry for both) ───────────────────
interface FixtureMatch {
  homeTeam: string;
  awayTeam: string;
  kickoff: string;
  league: string;
}

function FixtureCard({ fixture }: { fixture: FixtureMatch }) {
  const [expanded, setExpanded] = useState(false);
  const [marketOdds, setMarketOdds] = useState({ home: "", draw: "", away: "" });
  const [modelProbs, setModelProbs] = useState({ home: "", draw: "", away: "" });
  const [result, setResult] = useState<MatchValueResult | null>(null);

  const kick = new Date(fixture.kickoff).toLocaleDateString("en-GB", {
    weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  // Clear stale analysis whenever either input set changes
  useEffect(() => { setResult(null); }, [marketOdds, modelProbs]);

  const homeOdds = parseFloat(marketOdds.home);
  const drawOdds = parseFloat(marketOdds.draw);
  const awayOdds = parseFloat(marketOdds.away);
  const homeProb = parseFloat(modelProbs.home) / 100;
  const drawProb = parseFloat(modelProbs.draw) / 100;
  const awayProb = parseFloat(modelProbs.away) / 100;

  const oddsValid = [homeOdds, drawOdds, awayOdds].every((o) => o > 1 && Number.isFinite(o));
  const probTotal = (parseFloat(modelProbs.home) || 0) + (parseFloat(modelProbs.draw) || 0) + (parseFloat(modelProbs.away) || 0);
  const probsValid = Math.abs(probTotal - 100) < 2 && ![homeProb, drawProb, awayProb].some(isNaN);
  const canCompare = oddsValid && probsValid;

  function handleCompare() {
    if (!canCompare) return;
    setResult(computeMatchValue(
      fixture.homeTeam, fixture.awayTeam, fixture.kickoff,
      "manual", "Manual entry",
      homeOdds, drawOdds, awayOdds,
      { home: homeProb, draw: drawProb, away: awayProb }
    ));
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <button
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition"
        onClick={() => setExpanded((e) => !e)}
      >
        <div>
          <p className="font-semibold text-[#0f172a]">
            {fixture.homeTeam} <span className="text-[#1e293b]/40 font-normal">vs</span> {fixture.awayTeam}
          </p>
          <p className="mt-0.5 text-xs text-[#1e293b]/50">{kick} · {fixture.league}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">No live odds</span>
          {expanded ? <ChevronUp className="h-4 w-4 text-[#1e293b]/40" /> : <ChevronDown className="h-4 w-4 text-[#1e293b]/40" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border px-5 pb-5 pt-4 space-y-5">
          {/* Result rows if computed */}
          {result && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#1e293b]/40">Value analysis</p>
              <div className="divide-y divide-border/60">
                {result.outcomes.map((o) => <OutcomeRow key={o.outcome} outcome={o} />)}
              </div>
              <p className="mt-2 text-[11px] text-[#1e293b]/40">
                Overround: {result.overroundPct}%
              </p>
            </div>
          )}

          {/* Market odds input */}
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <p className="mb-3 text-xs font-semibold text-slate-600">
              Enter market decimal odds (from any bookmaker)
            </p>
            <div className="grid grid-cols-3 gap-3">
              {([["home", fixture.homeTeam], ["draw", "Draw"], ["away", fixture.awayTeam]] as const).map(([key, label]) => (
                <div key={key}>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#1e293b]/50 truncate">{label}</label>
                  <input
                    type="number" min="1.01" step="0.01" placeholder="e.g. 2.50"
                    value={marketOdds[key]}
                    onChange={(e) => setMarketOdds((p) => ({ ...p, [key]: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-[#0f172a] placeholder:text-[#1e293b]/30 focus:border-[#3D2DFF] focus:outline-none focus:ring-1 focus:ring-[#3D2DFF]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Model probs input */}
          <div className="rounded-xl border border-dashed border-[#3D2DFF]/30 bg-[#3D2DFF]/5 p-4">
            <p className="mb-3 text-xs font-semibold text-[#3D2DFF]">Enter your model probabilities</p>
            <div className="grid grid-cols-3 gap-3">
              {([["home", fixture.homeTeam], ["draw", "Draw"], ["away", fixture.awayTeam]] as const).map(([key, label]) => (
                <div key={key}>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#1e293b]/50 truncate">{label}</label>
                  <div className="relative">
                    <input
                      type="number" min="0" max="100" step="0.5" placeholder="0"
                      value={modelProbs[key]}
                      onChange={(e) => setModelProbs((p) => ({ ...p, [key]: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-white px-3 py-2 pr-7 text-sm text-[#0f172a] placeholder:text-[#1e293b]/30 focus:border-[#3D2DFF] focus:outline-none focus:ring-1 focus:ring-[#3D2DFF]"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#1e293b]/40">%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className={`text-xs ${
                probTotal === 0 ? "text-[#1e293b]/30"
                : probsValid ? "text-emerald-600"
                : "text-amber-600"
              }`}>
                {probTotal === 0 ? "Probs should sum to 100%" : probsValid ? `${probTotal.toFixed(1)}% ✓` : `${probTotal.toFixed(1)}% — needs ~100%`}
              </p>
              <button
                onClick={handleCompare} disabled={!canCompare}
                className="shrink-0 rounded-lg bg-[#3D2DFF] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#3D2DFF]/90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Compare
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── League search bar ───────────────────────────────────────────────────────
interface SearchResult { primary: LeagueSearchResult[]; secondary: LeagueSearchResult[] }

interface LeagueSearchBarProps {
  onSelect: (league: LeagueSearchResult) => void;
}

function LeagueSearchBar({ onSelect }: LeagueSearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); setOpen(false); return; }

    // Cancel any in-flight request before starting a new one
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const res = await fetch(`/api/spot-the-value/leagues?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      });
      const json = await res.json() as SearchResult;
      // Only update state if this request wasn't superseded
      if (!controller.signal.aborted) {
        setResults(json);
        setOpen(true);
      }
    } catch (err) {
      if ((err as { name?: string }).name !== "AbortError") {
        setResults(null);
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 320);
  }

  function handleSelect(league: LeagueSearchResult) {
    setQuery("");
    setResults(null);
    setOpen(false);
    onSelect(league);
  }

  const hasResults = results && (results.primary.length > 0 || results.secondary.length > 0);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-3.5 py-2.5 shadow-sm focus-within:border-[#3D2DFF] focus-within:ring-1 focus-within:ring-[#3D2DFF]">
        {loading
          ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#3D2DFF] border-t-transparent shrink-0" />
          : <Search className="h-4 w-4 text-[#1e293b]/40 shrink-0" />
        }
        <input
          type="text"
          placeholder="Search any league — e.g. Ligue 1, MLS, Eredivisie…"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => results && setOpen(true)}
          className="flex-1 bg-transparent text-sm text-[#0f172a] placeholder:text-[#1e293b]/40 outline-none min-w-0"
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults(null); setOpen(false); }}>
            <X className="h-4 w-4 text-[#1e293b]/40 hover:text-[#1e293b]" />
          </button>
        )}
      </div>

      {open && hasResults && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1.5 overflow-hidden rounded-xl border border-border bg-white shadow-lg">
          {results.primary.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[#1e293b]/40">
                Live odds available
              </p>
              {results.primary.map((r) => (
                <button
                  key={r.key}
                  onClick={() => handleSelect(r)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition"
                >
                  <Zap className="h-3.5 w-3.5 text-[#3D2DFF] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#0f172a] truncate">{r.title}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {results.secondary.length > 0 && (
            <div className={results.primary.length > 0 ? "border-t border-border" : ""}>
              <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[#1e293b]/40">
                Fixture data only — enter market odds manually
              </p>
              {results.secondary.map((r) => (
                <button
                  key={r.key}
                  onClick={() => handleSelect(r)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition"
                >
                  <Database className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#0f172a] truncate">{r.title}</p>
                    <p className="text-xs text-[#1e293b]/40">No live odds — manual entry</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {query.length >= 2 && !results.primary.length && !results.secondary.length && (
            <p className="px-4 py-3 text-sm text-[#1e293b]/50">No leagues found for &ldquo;{query}&rdquo;</p>
          )}
        </div>
      )}

      {open && query.length >= 2 && !loading && !hasResults && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1.5 rounded-xl border border-border bg-white shadow-lg px-4 py-3">
          <p className="text-sm text-[#1e293b]/50">No leagues found for &ldquo;{query}&rdquo;</p>
        </div>
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
        const json = await res.json() as { matches?: MatchValueResult[]; fromCache?: boolean; error?: string };
        if (!res.ok || json.error) { setError(json.error ?? "Failed to load odds."); setMatches([]); }
        else { setMatches(json.matches ?? []); setCacheNote(json.fromCache ?? false); }
      } catch { setError("Network error loading odds."); }
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
        const json = await res.json() as { fixtures?: FixtureMatch[]; error?: string };
        if (!res.ok || json.error) { setError(json.error ?? "Failed to load fixtures."); setFixtureMatches([]); }
        else { setFixtureMatches(json.fixtures ?? []); }
      } catch { setError("Network error loading fixtures."); }
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
