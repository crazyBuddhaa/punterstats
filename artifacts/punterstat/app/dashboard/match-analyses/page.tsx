import type { Metadata } from "next";
import Link from "next/link";
import { BarChart2, ArrowRight } from "lucide-react";
import { requireAuth } from "@/lib/auth/helpers";
import { getSavedMatchAnalyses } from "@/lib/dashboard/queries";
import { EmptyState } from "@/components/dashboard/empty-state";

export const metadata: Metadata = { title: "Match Analyses — Dashboard — PunterStat" };

function ProbBar({ prob, color }: { prob: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${prob * 100}%` }} />
      </div>
      <span className="w-9 text-right text-xs font-semibold text-[#0f172a]">
        {(prob * 100).toFixed(0)}%
      </span>
    </div>
  );
}

export default async function MatchAnalysesPage() {
  const profile = await requireAuth();
  const analyses = await getSavedMatchAnalyses(profile.userId);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Saved Match Analyses</h1>
          <p className="mt-1 text-sm text-[#1e293b]/60">
            {analyses.length} analysis{analyses.length !== 1 ? "es" : ""} saved.
          </p>
        </div>
        <Link
          href="/match-breakdown/analyzer"
          className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          New analysis <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {analyses.length === 0 ? (
        <EmptyState
          icon={BarChart2}
          title="No saved analyses"
          description="Run the Match Breakdown Analyzer and save your results to see them here."
          actionLabel="Open Analyzer"
          actionHref="/match-breakdown/analyzer"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {analyses.map((a) => (
            <div key={a.id} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-[#0f172a]">
                    {a.homeTeamName}{" "}
                    <span className="text-[#1e293b]/40">vs</span>{" "}
                    {a.awayTeamName}
                  </p>
                  <p className="mt-0.5 text-xs text-[#1e293b]/50">
                    {new Date(a.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <BarChart2 className="h-4 w-4 shrink-0 text-[#1e293b]/30" />
              </div>

              <div className="space-y-2">
                <div>
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[#1e293b]/40">
                    {a.homeTeamName} Win
                  </p>
                  <ProbBar prob={a.homeWinProb} color="bg-teal-500" />
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[#1e293b]/40">
                    Draw
                  </p>
                  <ProbBar prob={a.drawProb} color="bg-amber-400" />
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[#1e293b]/40">
                    {a.awayTeamName} Win
                  </p>
                  <ProbBar prob={a.awayWinProb} color="bg-indigo-500" />
                </div>
              </div>

              <div className="mt-4 border-t border-border pt-3 text-center">
                <Link
                  href="/match-breakdown/analyzer"
                  className="text-xs font-medium text-teal-600 hover:text-teal-700"
                >
                  Run a new analysis →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
