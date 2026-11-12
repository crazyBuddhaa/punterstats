import type { Metadata } from "next";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/helpers";
import { hasTierAccess } from "@/lib/auth/access";
import { getJournal } from "@/lib/bet-assist/journal-actions";
import { computeReportCard } from "@/lib/report-card/metrics";
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

export default async function ReportCardPage() {
  const profile = await requireAuth();
  const isPremium = hasTierAccess(profile, "premium");
  const bets = await getJournal();
  const card = computeReportCard(bets);

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

        <div className="flex items-center gap-2.5">
          <QuickAddBetModal />
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/bet-tracker">Bet Tracker</Link>
          </Button>
        </div>
      </div>

      <ReportCardView freeData={freeData} premiumData={premiumData} />
    </div>
  );
}
