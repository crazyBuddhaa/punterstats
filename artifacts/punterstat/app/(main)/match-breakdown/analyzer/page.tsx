import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { getUserProfile } from "@/lib/auth/helpers";
import { getEffectiveTierForProfile, hasPlanAccess } from "@/lib/auth/access";
import { MatchAnalyzer } from "@/components/match-breakdown/match-analyzer";
import { PlanGate } from "@/components/billing/plan-gate";

export const metadata: Metadata = {
  title: "Match Analyzer — Match Breakdown Engine — PunterStat",
  description:
    "Step through six probability factors for any football match and get an educational breakdown of outcome probabilities, xG, and per-factor analysis.",
};

export default async function MatchAnalyzerPage() {
  const profile = await getUserProfile();
  const isAuthenticated = Boolean(profile);
  const tier = await getEffectiveTierForProfile(profile);

  if (isAuthenticated) {
    if (!hasPlanAccess(tier, "pro")) {
      return (
        <PlanGate
          requiredPlan="pro"
          currentTier={tier}
          toolName="Match Breakdown Analyzer"
          description="Unlock PunterStat's v2.0 Dixon-Coles match engine across 39 global leagues — weight 6 match factors, inspect Top-5 scorelines, Asian Handicaps, and compare fair odds against your bookmaker."
          highlights={[
            "Dixon-Coles v2.0 probabilities across 39 European, global & African leagues",
            "Expanded markets: 1X2, Over/Under 0.5–4.5, BTTS, DNB, Asian Handicap & Top-5 Scorelines",
            "Save unlimited match breakdowns to your Saved Match Analyses history",
            "One-click +EV logging directly into Bet Tracker",
          ]}
        />
      );
    }

    return (
      <div className="space-y-6 py-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-[#0f172a] sm:text-2xl">Match Breakdown Analyzer</h1>
            <p className="mt-1 text-xs text-[#1e293b]/55">
              Weight 6 match factors, compare fair odds against your bookmaker, and log +EV spots directly to Bet Tracker.
            </p>
          </div>
          <Link
            href="/dashboard/match-analyses"
            className="text-xs font-semibold text-[#3D2DFF] hover:underline"
          >
            Saved analyses →
          </Link>
        </div>

        <MatchAnalyzer isAuthenticated />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Top nav breadcrumb */}
      <div className="border-b border-border bg-white">
        <div className="container mx-auto max-w-5xl px-4 py-3 flex items-center gap-3">
          <Link
            href="/match-breakdown"
            className="flex items-center gap-1 text-xs text-[#1e293b]/60 hover:text-[#0f172a] transition"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Match Breakdown Engine
          </Link>
          <span className="text-[#1e293b]/30">/</span>
          <span className="text-xs font-medium text-[#0f172a]">Analyzer</span>
        </div>
      </div>

      {/* Disclaimer strip */}
      <div className="bg-[#0f172a] border-b border-white/10">
        <div className="container mx-auto max-w-5xl px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-teal-400" />
            <span>
              18+ only. Probabilities are model estimates, not guarantees or tips. Compare them with live odds in
              Daily Match Screener, or check your slips in Bet Assist.
            </span>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="container mx-auto max-w-4xl px-4 py-10">
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
          <span className="font-semibold">Sign in to save analyses.</span> Results are available
          for this session only.{" "}
          <Link href="/login" className="underline hover:text-amber-900">
            Sign in →
          </Link>
        </div>

        <MatchAnalyzer isAuthenticated={false} />
      </div>
    </div>
  );
}
