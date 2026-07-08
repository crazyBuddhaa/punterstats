"use client";

import type { MatchResult } from "@/lib/match-breakdown/types";

const resultStyles: Record<MatchResult, string> = {
  W: "bg-emerald-100 text-emerald-700 border-emerald-200",
  D: "bg-amber-100 text-amber-700 border-amber-200",
  L: "bg-rose-100 text-rose-700 border-rose-200",
};

interface FormBadgeProps {
  result: MatchResult;
  size?: "sm" | "md";
}

export function FormBadge({ result, size = "md" }: FormBadgeProps) {
  const sizeClass = size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs";
  return (
    <span
      className={`inline-flex items-center justify-center rounded border font-bold ${sizeClass} ${resultStyles[result]}`}
    >
      {result}
    </span>
  );
}

interface FormRowProps {
  results: MatchResult[];
  label?: string;
}

export function FormRow({ results, label }: FormRowProps) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="w-28 shrink-0 text-xs font-medium text-[#1e293b]/60">{label}</span>}
      <div className="flex gap-1">
        {results.slice(0, 5).map((r, i) => (
          <FormBadge key={i} result={r} />
        ))}
        {results.length === 0 && (
          <span className="text-xs text-[#1e293b]/40">No results entered</span>
        )}
      </div>
    </div>
  );
}
