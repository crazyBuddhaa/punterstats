"use client";

import { useState, useTransition } from "react";
import { FileDown, Loader2, ChevronDown } from "lucide-react";
import { getSavedAnalyses } from "@/lib/match-breakdown/actions";
import type { SavedAnalysis } from "@/lib/match-breakdown/types";

interface ImportFromMatchProps {
  onImport: (params: { decimalOdds: number; winPct: number }) => void;
}

function decimalOddsFromProb(prob: number): number {
  if (prob <= 0) return 1.01;
  return Math.max(1.01, 1 / prob);
}

/**
 * Optional prefill panel for the Probability Simulator: lets a signed-in
 * user pick one of their saved Match Breakdown analyses and import its
 * home-win probability (converted to fair decimal odds) as a starting
 * point. Manual entry remains the default, fully-supported flow.
 */
export function ImportFromMatch({ onImport }: ImportFromMatchProps) {
  const [open, setOpen] = useState(false);
  const [analyses, setAnalyses] = useState<SavedAnalysis[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && analyses === null) {
      startTransition(async () => {
        const res = await getSavedAnalyses();
        if (res.success) {
          setAnalyses(res.data);
        } else {
          setError(res.error);
        }
      });
    }
  }

  return (
    <div className="rounded-xl border border-dashed border-teal-300 bg-teal-50/40 p-4">
      <button onClick={toggle} className="flex w-full items-center justify-between text-left">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-teal-700">
          <FileDown className="h-3.5 w-3.5" />
          Optional: import from a saved match
        </span>
        <ChevronDown className={`h-4 w-4 text-teal-700 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {isPending && (
            <div className="flex items-center gap-2 text-xs text-[#1e293b]/50">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading your saved analyses…
            </div>
          )}

          {error && !isPending && <p className="text-xs text-[#1e293b]/50">{error}</p>}

          {!isPending && analyses !== null && analyses.length === 0 && (
            <p className="text-xs text-[#1e293b]/50">
              No saved Match Breakdown analyses yet — run one and save it, or continue with manual entry.
            </p>
          )}

          {!isPending && analyses && analyses.length > 0 && (
            <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
              {analyses.map((a) => (
                <button
                  key={a.id}
                  onClick={() =>
                    onImport({
                      decimalOdds: parseFloat(decimalOddsFromProb(a.analysisResult.homeWinProb).toFixed(2)),
                      winPct: Math.round(a.analysisResult.homeWinProb * 100),
                    })
                  }
                  className="flex w-full items-center justify-between rounded-lg border border-border bg-white px-3 py-2 text-left text-xs transition hover:border-teal-400"
                >
                  <span className="font-medium text-[#0f172a]">
                    {a.homeTeamName} vs {a.awayTeamName}
                  </span>
                  <span className="font-mono text-[#1e293b]/50">
                    {Math.round(a.analysisResult.homeWinProb * 100)}% home win
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
