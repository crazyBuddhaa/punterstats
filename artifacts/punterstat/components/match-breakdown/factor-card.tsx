"use client";

import type { ProbabilityFactor } from "@/lib/match-breakdown/types";

const confidencePill: Record<string, string> = {
  high: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-slate-100 text-slate-500",
};

interface FactorCardProps {
  factor: ProbabilityFactor;
  homeTeamName: string;
  awayTeamName: string;
}

export function FactorCard({ factor, homeTeamName, awayTeamName }: FactorCardProps) {
  const edge = factor.homeEdge; // -1 to +1
  const pct = Math.abs(edge) * 100;
  const favoursHome = edge >= 0;

  // Bar fills from centre
  const homeBarPct = favoursHome ? Math.min(pct * 2, 50) : 0;
  const awayBarPct = !favoursHome ? Math.min(pct * 2, 50) : 0;

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-[#0f172a] text-sm">{factor.name}</p>
          <p className="mt-0.5 text-xs text-[#1e293b]/60">{factor.description}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${confidencePill[factor.confidence]}`}
        >
          {factor.confidence} confidence
        </span>
      </div>

      {/* Edge bar */}
      <div className="mb-3">
        <div className="mb-1 flex justify-between text-[10px] font-medium text-[#1e293b]/50">
          <span>{homeTeamName}</span>
          <span>{awayTeamName}</span>
        </div>
        {/* Two-sided bar */}
        <div className="relative flex h-2.5 overflow-hidden rounded-full bg-slate-100">
          {/* Home side (left of centre, fills right → centre) */}
          <div className="flex flex-1 items-center justify-end pr-px">
            <div
              className="h-full rounded-l-full bg-teal-500 transition-all duration-500"
              style={{ width: `${homeBarPct * 2}%` }}
            />
          </div>
          {/* Centre line */}
          <div className="w-px bg-slate-300" />
          {/* Away side (right of centre) */}
          <div className="flex flex-1 items-center pl-px">
            <div
              className="h-full rounded-r-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${awayBarPct * 2}%` }}
            />
          </div>
        </div>
        <div className="mt-1 text-center text-[10px] text-[#1e293b]/40">
          {edge === 0
            ? "Neutral"
            : favoursHome
            ? `+${pct.toFixed(1)}% edge → ${homeTeamName}`
            : `+${pct.toFixed(1)}% edge → ${awayTeamName}`}
        </div>
      </div>

      {/* Explanation */}
      <p className="text-xs leading-relaxed text-[#1e293b]/60">{factor.explanation}</p>
    </div>
  );
}
