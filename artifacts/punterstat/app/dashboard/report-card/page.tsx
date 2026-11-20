import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { requireAuth } from "@/lib/auth/helpers";
import { getEffectiveTierForProfile, hasPlanAccess } from "@/lib/auth/access";
import { getJournal } from "@/lib/bet-assist/journal-actions";
import { computeReportCard } from "@/lib/report-card/metrics";
import { trainPunterModel } from "@/lib/model/punter-model";
import {
  ReportCardView,
  type ReportCardFreeData,
  type ReportCardPremiumData,
} from "@/components/report-card/report-card-view";
import { QuickAddBetModal } from "@/components/report-card/quick-add-bet-modal";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Betting Report Card — Dashboard — PunterStat",
  description:
    "Personal analytics over your logged bets: ROI confidence intervals, closing-line value, probability calibration, and leak detection.",
};

interface Props {
  searchParams: Promise<{ range?: string }>;
}

function filterBetsByRange<T extends { placedAt: string }>(bets: T[], range: "all" | "30d"): T[] {
  if (range !== "30d") return bets;
  const cutoff = new Date().getTime() - 30 * 86_400_000;
  return bets.filter((b) => new Date(b.placedAt).getTime() >= cutoff);
}

const MATURITY_BADGE: Record<string, { label: string; className: string }> = {
  cold: { label: "Cold (<10 settled)", className: "bg-slate-100 text-slate-700" },
  warming: { label: "Warming (10–29)", className: "bg-sky-100 text-sky-800" },
  active: { label: "Active (30–99)", className: "bg-teal-100 text-teal-800" },
  mature: { label: "Mature (100+)", className: "bg-emerald-100 text-emerald-800" },
};

const fmtSignedPct = (v: number) => `${v >= 0 ? "+" : ""}${(v * 100).toFixed(1)}%`;

export default async function ReportCardPage({ searchParams }: Props) {
  const { range: rawRange } = await searchParams;
  const range: "all" | "30d" = rawRange === "30d" ? "30d" : "all";

  const profile = await requireAuth();
  const tier = await getEffectiveTierForProfile(profile);
  const isPremium = hasPlanAccess(tier, "premium");
  const allBets = await getJournal();
  const bets = filterBetsByRange(allBets, range);

  const card = computeReportCard(bets);
  const punterModel = trainPunterModel(bets);

  const freeData: ReportCardFreeData = {
    totalBets: card.totalBets,
    settledBets: card.settledBets,
    pendingBets: card.pendingBets,
    voidBets: card.voidBets,
    wins: card.wins,
    losses: card.losses,
    staked: card.staked,
    profit: card.profit,
    roi: card.roi,
    roiInterval: card.roiInterval,
    strikeRate: card.strikeRate,
    breakEvenRate: card.breakEvenRate,
    strikeVsBreakEven: card.strikeVsBreakEven,
    verdict: card.verdict,
    verdictTitle: card.verdictTitle,
    verdictExplanation: card.verdictExplanation,
    detectedLeakCount: card.leaks.length,
    recentBets: bets.slice(0, 30),
  };

  // Never serialize premium-only computed fields to the client for free-tier users
  const premiumData: ReportCardPremiumData | null = isPremium
    ? {
        maxDrawdown: card.maxDrawdown,
        clv: card.clv,
        calibration: card.calibration,
        expectedVsActual: card.expectedVsActual,
        breakdowns: card.breakdowns,
        behaviourFlags: card.behaviourFlags,
        leaks: card.leaks,
      }
    : null;

  const maturityInfo = MATURITY_BADGE[punterModel.maturity] ?? MATURITY_BADGE.cold;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Betting Report Card</h1>
          <p className="mt-1 text-sm text-[#1e293b]/60">
            Honest, personal analytics over your logged bet journal — measuring price quality, calibration,
            and structural leaks. No tips, no bet recommendations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {allBets.length > 0 && (
            <div className="inline-flex rounded-lg border border-border bg-white p-0.5 shadow-sm">
              <Link
                href="/dashboard/report-card"
                className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                  range === "all"
                    ? "bg-[#0f172a] text-white"
                    : "text-[#1e293b]/60 hover:text-[#0f172a]"
                }`}
              >
                All time
              </Link>
              <Link
                href="/dashboard/report-card?range=30d"
                className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                  range === "30d"
                    ? "bg-[#0f172a] text-white"
                    : "text-[#1e293b]/60 hover:text-[#0f172a]"
                }`}
              >
                Last 30 days
              </Link>
            </div>
          )}
          <QuickAddBetModal />
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/bet-tracker">Bet Tracker</Link>
          </Button>
        </div>
      </div>

      {punterModel.settledBets > 0 && (
        <section className="rounded-2xl border border-teal-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-teal-600" />
              <h2 className="text-sm font-bold text-[#0f172a]">
                Personal Behavior Model (Empirical Bayes)
              </h2>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${maturityInfo.className}`}>
                {maturityInfo.label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Link href="/bet-assist/slip-checker" className="font-semibold text-teal-700 hover:underline">
                Score a slip with this model →
              </Link>
              <span className="text-slate-300">|</span>
              <Link href="/dashboard/profile" className="text-[#1e293b]/60 hover:text-[#0f172a] hover:underline">
                Upload more CSV history
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border bg-slate-50/70 p-3.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#1e293b]/50">
                Shrunk Expected ROI
              </p>
              <p
                className={`mt-1 text-lg font-bold tabular-nums ${
                  punterModel.overallShrunkRoi >= 0 ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {fmtSignedPct(punterModel.overallShrunkRoi)}
              </p>
              <p className="mt-0.5 text-[11px] text-[#1e293b]/55">
                Raw: {fmtSignedPct(punterModel.overallRawRoi)} ({punterModel.settledBets} bets)
              </p>
            </div>

            <div className="rounded-xl border border-border bg-slate-50/70 p-3.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#1e293b]/50">
                Tilt Risk Score
              </p>
              <p
                className={`mt-1 text-lg font-bold tabular-nums ${
                  punterModel.tilt.tiltLevel === "high"
                    ? "text-rose-700"
                    : punterModel.tilt.tiltLevel === "elevated"
                      ? "text-amber-700"
                      : "text-emerald-700"
                }`}
              >
                {punterModel.tilt.tiltRiskScore}/100{" "}
                <span className="text-xs font-semibold capitalize">({punterModel.tilt.tiltLevel})</span>
              </p>
              <p className="mt-0.5 text-[11px] text-[#1e293b]/55">
                {punterModel.tilt.postLossStakeRatio !== null
                  ? `Post-loss stake: ${punterModel.tilt.postLossStakeRatio.toFixed(2)}× median`
                  : `Current loss streak: ${punterModel.tilt.currentLossStreak}`}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-slate-50/70 p-3.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#1e293b]/50">
                Strongest Segment
              </p>
              {punterModel.bestSegment ? (
                <>
                  <p className="mt-1 text-sm font-bold text-[#0f172a] truncate">
                    {punterModel.bestSegment.label}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-emerald-700 tabular-nums">
                    {fmtSignedPct(punterModel.bestSegment.shrunkRoi)} shrunk ROI ({punterModel.bestSegment.bets} bets)
                  </p>
                </>
              ) : (
                <p className="mt-1 text-xs text-[#1e293b]/55">Needs 5+ bets in a segment</p>
              )}
            </div>

            <div className="rounded-xl border border-border bg-slate-50/70 p-3.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#1e293b]/50">
                Biggest Leak Segment
              </p>
              {punterModel.worstSegment ? (
                <>
                  <p className="mt-1 text-sm font-bold text-[#0f172a] truncate">
                    {punterModel.worstSegment.label}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-rose-700 tabular-nums">
                    {fmtSignedPct(punterModel.worstSegment.shrunkRoi)} shrunk ROI ({punterModel.worstSegment.bets} bets)
                  </p>
                </>
              ) : (
                <p className="mt-1 text-xs text-[#1e293b]/55">Needs 5+ bets in a segment</p>
              )}
            </div>
          </div>
        </section>
      )}

      <ReportCardView freeData={freeData} premiumData={premiumData} />
    </div>
  );
}
