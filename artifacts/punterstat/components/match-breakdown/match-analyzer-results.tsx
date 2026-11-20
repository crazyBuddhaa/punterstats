"use client";

import { useState } from "react";
import Link from "next/link";
import { Save, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { FactorCard } from "./factor-card";
import { ProbabilityDisplay } from "./probability-display";
import type {
  InjuryFactor,
  InjuryImpact,
  MatchAnalysisResult,
} from "@/lib/match-breakdown/types";

const INJURY_OPTIONS: InjuryImpact[] = ["none", "minor", "moderate", "significant", "major"];

function OddsComparisonCard({
  result,
  homeTeamName,
  awayTeamName,
}: {
  result: MatchAnalysisResult;
  homeTeamName: string;
  awayTeamName: string;
}) {
  const [homeOdds, setHomeOdds] = useState("");
  const [drawOdds, setDrawOdds] = useState("");
  const [awayOdds, setAwayOdds] = useState("");

  const rows = [
    { label: `${homeTeamName} Win`, prob: result.homeWinProb, oddsStr: homeOdds, set: setHomeOdds },
    { label: "Draw", prob: result.drawProb, oddsStr: drawOdds, set: setDrawOdds },
    { label: `${awayTeamName} Win`, prob: result.awayWinProb, oddsStr: awayOdds, set: setAwayOdds },
  ];

  return (
    <div className="space-y-4 border-t border-slate-200 pt-6">
      <div>
        <h3 className="text-sm font-bold text-[#0f172a]">Compare vs Bookmaker Odds &amp; Log Bet</h3>
        <p className="mt-0.5 text-xs text-[#1e293b]/60">
          Enter SportyBet / Bet9ja decimal odds to check whether your model sees positive expected value (+EV), then log directly to Bet Tracker.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {rows.map((r) => {
          const offered = parseFloat(r.oddsStr);
          const hasOdds = Number.isFinite(offered) && offered > 1;
          const fairOdds = r.prob > 0 ? 1 / r.prob : 0;
          const ev = hasOdds ? r.prob * offered - 1 : null;
          const positive = ev !== null && ev > 0;

          return (
            <div key={r.label} className="space-y-2 rounded-xl bg-slate-50/80 p-3.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-[#0f172a] truncate">{r.label}</p>
                <span className="text-[11px] text-[#1e293b]/50 tabular-nums shrink-0">
                  Fair {fairOdds.toFixed(2)}
                </span>
              </div>
              <input
                inputMode="decimal"
                value={r.oddsStr}
                onChange={(e) => r.set(e.target.value)}
                placeholder={`Book odds (e.g. ${fairOdds.toFixed(2)})`}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm tabular-nums text-[#0f172a] focus:border-teal-600 focus:outline-none"
              />
              {ev !== null ? (
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <span
                    className={`text-xs font-bold tabular-nums ${
                      positive ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {positive ? "+" : ""}
                    {(ev * 100).toFixed(1)}% EV
                  </span>
                  <Link
                    href={`/dashboard/bet-tracker?${new URLSearchParams({
                      event: `${homeTeamName} vs ${awayTeamName}`,
                      selection: r.label,
                      odds: offered.toFixed(2),
                      prob: String(Math.round(r.prob * 1000) / 10),
                      market: "1X2",
                    }).toString()}`}
                    className="inline-flex items-center gap-1 rounded-md bg-teal-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-teal-700"
                  >
                    Log <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ) : (
                <p className="text-[11px] text-[#1e293b]/45">
                  Model: {Math.round(r.prob * 100)}%
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StepAvailability({
  homeTeamName,
  awayTeamName,
  homeInjuries,
  awayInjuries,
  setHomeInjuries,
  setAwayInjuries,
}: {
  homeTeamName: string;
  awayTeamName: string;
  homeInjuries: InjuryFactor;
  awayInjuries: InjuryFactor;
  setHomeInjuries: (inj: InjuryFactor) => void;
  setAwayInjuries: (inj: InjuryFactor) => void;
}) {
  return (
    <div className="space-y-6">
      <p className="text-xs text-slate-500">
        Estimate the overall impact of injuries and suspensions for each side. Consider the
        quality and role of absent players, not just the count.
      </p>

      {[
        {
          team: homeTeamName || "Home team",
          injuries: homeInjuries,
          setInjuries: setHomeInjuries,
        },
        {
          team: awayTeamName || "Away team",
          injuries: awayInjuries,
          setInjuries: setAwayInjuries,
        },
      ].map(({ team, injuries, setInjuries }) => (
        <div key={team}>
          <label className="block text-sm font-medium text-[#0f172a] mb-1.5">
            {team} — Absence Impact
          </label>
          <div className="mt-1 grid grid-cols-5 gap-1.5">
            {INJURY_OPTIONS.map((opt) => {
              const optColors: Record<InjuryImpact, string> = {
                none: "border-emerald-400 bg-emerald-50 text-emerald-700",
                minor: "border-teal-400 bg-teal-50 text-teal-700",
                moderate: "border-amber-400 bg-amber-50 text-amber-700",
                significant: "border-orange-400 bg-orange-50 text-orange-700",
                major: "border-rose-400 bg-rose-50 text-rose-700",
              };
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setInjuries({ impactRating: opt })}
                  className={`rounded-lg border-2 px-1 py-2 text-center text-[10px] font-semibold capitalize transition ${
                    injuries.impactRating === opt
                      ? optColors[opt]
                      : "border-slate-200 bg-white text-[#1e293b]/50 hover:border-slate-300"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="border-t border-slate-200 pt-4 text-xs text-slate-500 leading-relaxed">
        <p className="mb-1.5 font-semibold text-slate-800">Impact guide</p>
        <ul className="space-y-1">
          <li>
            <span className="font-medium text-emerald-700">None</span> — Full squad available
          </li>
          <li>
            <span className="font-medium text-teal-700">Minor</span> — Rotation players absent
          </li>
          <li>
            <span className="font-medium text-amber-700">Moderate</span> — Important squad players
            out
          </li>
          <li>
            <span className="font-medium text-orange-700">Significant</span> — Key starters missing
            (top scorer, CB, CDM)
          </li>
          <li>
            <span className="font-medium text-rose-700">Major</span> — Multiple first-XI starters
            absent, including captain or main creator
          </li>
        </ul>
      </div>
    </div>
  );
}

export function StepBreakdownResults({
  result,
  isAuthenticated,
  homeTeamName,
  awayTeamName,
  saved,
  isPending,
  saveError,
  onSave,
  tracked,
  isTracking,
  trackError,
  onTrackPrediction,
  onReset,
}: {
  result: MatchAnalysisResult;
  isAuthenticated: boolean;
  homeTeamName: string;
  awayTeamName: string;
  saved: boolean;
  isPending: boolean;
  saveError: string | null;
  onSave: () => void;
  tracked: boolean;
  isTracking: boolean;
  trackError: string | null;
  onTrackPrediction: () => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-8">
      {isAuthenticated && (
        <div className="flex items-center justify-between rounded-xl border border-border bg-white px-5 py-3">
          <div>
            <p className="text-sm font-semibold text-[#0f172a]">
              {homeTeamName} vs {awayTeamName}
            </p>
            <p className="text-xs text-[#1e293b]/50">Save to your dashboard for later reference</p>
          </div>
          {saved ? (
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              <CheckCircle2 className="h-4 w-4" /> Saved
            </span>
          ) : (
            <button
              onClick={onSave}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save Analysis
            </button>
          )}
        </div>
      )}
      {saveError && (
        <p className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-2 text-xs text-rose-600">
          {saveError}
        </p>
      )}

      {isAuthenticated && (
        <div className="flex items-center justify-between rounded-xl border border-border bg-white px-5 py-3">
          <div>
            <p className="text-sm font-semibold text-[#0f172a]">Track This Prediction</p>
            <p className="text-xs text-[#1e293b]/50">
              Records the model&apos;s output now so it can be scored later against the real result
            </p>
          </div>
          {tracked ? (
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              <CheckCircle2 className="h-4 w-4" /> Tracked
            </span>
          ) : (
            <button
              onClick={onTrackPrediction}
              disabled={isTracking}
              className="flex items-center gap-1.5 rounded-lg border border-teal-600 px-4 py-1.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-50 disabled:opacity-60"
            >
              {isTracking ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              Track This Prediction
            </button>
          )}
        </div>
      )}
      {trackError && (
        <p className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-2 text-xs text-rose-600">
          {trackError}
        </p>
      )}

      <ProbabilityDisplay
        result={result}
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
      />

      <OddsComparisonCard
        result={result}
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
      />

      <div>
        <h3 className="mb-4 font-semibold text-[#0f172a]">Factor-by-Factor Breakdown</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          {result.factors.map((f) => (
            <FactorCard
              key={f.name}
              factor={f}
              homeTeamName={homeTeamName}
              awayTeamName={awayTeamName}
            />
          ))}
        </div>
      </div>

      <div className="text-center pt-2">
        <button
          onClick={onReset}
          className="rounded-lg border border-border px-5 py-2 text-sm font-medium text-[#1e293b] transition hover:bg-slate-50"
        >
          Analyse Another Match
        </button>
      </div>
    </div>
  );
}
