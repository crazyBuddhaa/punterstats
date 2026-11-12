"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { MatchValueResult, OutcomeAssessment, ValueRating } from "@/lib/spot-the-value/calculator";
import { computeMatchValue } from "@/lib/spot-the-value/calculator";

// ─── Value-rating display config ────────────────────────────────────────────
const RATING_CONFIG: Record<
  ValueRating,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  strong_value:      { label: "Strong value",      color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: TrendingUp },
  slight_value:      { label: "Slight value",      color: "text-teal-700",    bg: "bg-teal-50 border-teal-200",       icon: TrendingUp },
  fair:              { label: "Fair priced",       color: "text-slate-600",   bg: "bg-slate-50 border-slate-200",     icon: Minus },
  slight_undervalue: { label: "Slight undervalue", color: "text-amber-700",   bg: "bg-amber-50 border-amber-200",     icon: TrendingDown },
  undervalue:        { label: "Undervalue",        color: "text-rose-700",    bg: "bg-rose-50 border-rose-200",      icon: TrendingDown },
};

// ─── Shared outcome row ──────────────────────────────────────────────────────
export function OutcomeRow({ outcome }: { outcome: OutcomeAssessment }) {
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
export function MatchCard({ match }: { match: MatchValueResult }) {
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
export interface FixtureMatch {
  homeTeam: string;
  awayTeam: string;
  kickoff: string;
  league: string;
}

export function FixtureCard({ fixture }: { fixture: FixtureMatch }) {
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
