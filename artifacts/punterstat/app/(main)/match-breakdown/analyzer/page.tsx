import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { getUser } from "@/lib/auth/helpers";
import { MatchAnalyzer } from "@/components/match-breakdown/match-analyzer";

export const metadata: Metadata = {
  title: "Match Analyzer — Match Breakdown Engine — PunterStat",
  description:
    "Step through six probability factors for any football match and get an educational breakdown of outcome probabilities, xG, and per-factor analysis.",
};

export default async function MatchAnalyzerPage() {
  const user = await getUser();
  const isAuthenticated = !!user;

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
              Educational tool only — probabilities are illustrative, not match predictions. No tips.
              No financial advice.
            </span>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="container mx-auto max-w-4xl px-4 py-10">
        {!isAuthenticated && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
            <span className="font-semibold">Sign in to save analyses.</span> Results are available
            for this session only.{" "}
            <Link href="/login" className="underline hover:text-amber-900">
              Sign in →
            </Link>
          </div>
        )}

        <MatchAnalyzer isAuthenticated={isAuthenticated} />
      </div>
    </div>
  );
}
