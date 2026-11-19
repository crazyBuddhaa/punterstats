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

interface Props {
  searchParams: Promise<{ range?: string }>;
}

function filterBetsByRange<T extends { placedAt: string }>(bets: T[], range: "all" | "30d"): T[] {
  if (range !== "30d") return bets;
  const cutoff = new Date().getTime() - 30 * 86_400_000;
  return bets.filter((b) => new Date(b.placedAt).getTime() >= cutoff);
}

export default async function ReportCardPage({ searchParams }: Props) {
  const { range: rawRange } = await searchParams;
  const range: "all" | "30d" = rawRange === "30d" ? "30d" : "all";

  const profile = await requireAuth();
  const isPremium = hasTierAccess(profile, "premium");
  const allBets = await getJournal();
  const bets = filterBetsByRange(allBets, range);

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

      <ReportCardView freeData={freeData} premiumData={premiumData} />
    </div>
  );
}
