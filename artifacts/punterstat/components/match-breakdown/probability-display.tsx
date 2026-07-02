"use client";

import type { MatchAnalysisResult } from "@/lib/match-breakdown/types";
import { Info } from "lucide-react";

interface ProbabilityDisplayProps {
  result: MatchAnalysisResult;
  homeTeamName: string;
  awayTeamName: string;
}

interface OutcomeBarProps {
  label: string;
  prob: number;
  color: string;
  impliedOdds: number;
}

function OutcomeBar({ label, prob, color, impliedOdds }: OutcomeBarProps) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-semibold text-[#0f172a]">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#1e293b]/50">Implied odds: {impliedOdds.toFixed(2)}</span>
          <span className="min-w-[3.5rem] text-right font-bold text-[#0f172a]">
            {(prob * 100).toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${prob * 100}%` }}
        />
      </div>
    </div>
  );
}

export function ProbabilityDisplay({
  result,
  homeTeamName,
  awayTeamName,
}: ProbabilityDisplayProps) {
  const { homeWinProb, drawProb, awayWinProb, expectedGoals, keyInsights, educationalNote } =
    result;

  return (
    <div className="space-y-6">
      {/* Outcome probability bars */}
      <div className="rounded-xl border border-border bg-white p-6">
        <h3 className="mb-5 font-semibold text-[#0f172a]">Outcome Probability Estimate</h3>
        <div className="space-y-4">
          <OutcomeBar
            label={`${homeTeamName} Win`}
            prob={homeWinProb}
            color="bg-teal-500"
            impliedOdds={1 / homeWinProb}
          />
          <OutcomeBar
            label="Draw"
            prob={drawProb}
            color="bg-amber-400"
            impliedOdds={1 / drawProb}
          />
          <OutcomeBar
            label={`${awayTeamName} Win`}
            prob={awayWinProb}
            color="bg-indigo-500"
            impliedOdds={1 / awayWinProb}
          />
        </div>
      </div>

      {/* xG & Goals */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-white p-5 text-center">
          <p className="text-xs font-medium text-[#1e293b]/50 uppercase tracking-wide mb-1">
            {homeTeamName} xG
          </p>
          <p className="text-3xl font-bold text-teal-600">{expectedGoals.home.toFixed(1)}</p>
          <p className="mt-1 text-[10px] text-[#1e293b]/40">expected goals</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-5 text-center">
          <p className="text-xs font-medium text-[#1e293b]/50 uppercase tracking-wide mb-1">
            {awayTeamName} xG
          </p>
          <p className="text-3xl font-bold text-indigo-600">{expectedGoals.away.toFixed(1)}</p>
          <p className="mt-1 text-[10px] text-[#1e293b]/40">expected goals</p>
        </div>
      </div>

      {/* Combined xG note */}
      <div className="rounded-lg bg-slate-50 border border-border px-4 py-3">
        <p className="text-xs text-[#1e293b]/60">
          <span className="font-semibold text-[#0f172a]">Combined xG:</span>{" "}
          {(expectedGoals.home + expectedGoals.away).toFixed(1)} — implies{" "}
          {expectedGoals.home + expectedGoals.away > 2.5
            ? "over 2.5 goals is statistically favoured"
            : "under 2.5 goals is statistically favoured"}{" "}
          based on the factors entered.
        </p>
      </div>

      {/* Key insights */}
      {keyInsights.length > 0 && (
        <div className="rounded-xl border border-border bg-white p-6">
          <h3 className="mb-4 font-semibold text-[#0f172a]">Key Signals</h3>
          <ul className="space-y-2">
            {keyInsights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#1e293b]/80">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Educational disclaimer */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p className="text-xs leading-relaxed text-amber-800">{educationalNote}</p>
      </div>
    </div>
  );
}
