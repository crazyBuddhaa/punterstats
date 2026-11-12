"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Info,
  Lock,
  ShieldAlert,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsibleGamblingNote } from "@/components/bet-assist/responsible-gambling";
import { betProfit, STATUS_LABELS, type JournalBet } from "@/lib/bet-assist/journal";
import { pct } from "@/lib/bet-assist/calculators";
import {
  MIN_SETTLED_FOR_VERDICT,
  type BehaviourFlags,
  type ClvSummary,
  type ExpectedVsActualSummary,
  type ReportCard,
  type ReportCardCalibration,
  type ReportCardVerdict,
  type RoiConfidenceInterval,
  type SegmentBreakdown,
} from "@/lib/report-card/metrics";
import type { ReportCardLeak } from "@/lib/report-card/leaks";
import { QuickAddBetModal } from "./quick-add-bet-modal";
import { PrivacyControls } from "./privacy-controls";
import { cn } from "@/lib/utils";

const CalibrationChart = dynamic(() => import("./calibration-chart"), {
  ssr: false,
  loading: () => <div className="h-[260px] w-full animate-pulse rounded-xl bg-slate-100" />,
});

const money = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Data sent to both Free and Premium tiers.
 * Note: For free users, `premium` is null so premium-only computed metrics
 * are never serialized to the client.
 */
export interface ReportCardFreeData {
  totalBets: number;
  settledBets: number;
  pendingBets: number;
  voidBets: number;
  wins: number;
  losses: number;
  staked: number;
  profit: number;
  roi: number;
  roiInterval: RoiConfidenceInterval;
  strikeRate: number;
  breakEvenRate: number;
  strikeVsBreakEven: number;
  verdict: ReportCardVerdict;
  verdictTitle: string;
  verdictExplanation: string;
  recentBets: JournalBet[];
}

export interface ReportCardPremiumData {
  maxDrawdown: number;
  clv: ClvSummary;
  calibration: ReportCardCalibration;
  expectedVsActual: ExpectedVsActualSummary;
  breakdowns: ReportCard["breakdowns"];
  behaviourFlags: BehaviourFlags;
  leaks: ReportCardLeak[];
}

interface ReportCardViewProps {
  freeData: ReportCardFreeData;
  premiumData: ReportCardPremiumData | null;
}

const VERDICT_STYLE: Record<
  ReportCardVerdict,
  {
    badge: string;
    border: string;
    bg: string;
    text: string;
    icon: typeof Clock;
  }
> = {
  too_early: {
    badge: "Sample Building (<50 settled)",
    border: "border-slate-200",
    bg: "bg-slate-50",
    text: "text-slate-800",
    icon: Clock,
  },
  no_edge_yet: {
    badge: "Inconclusive Signal",
    border: "border-amber-200",
    bg: "bg-amber-50/70",
    text: "text-amber-900",
    icon: Info,
  },
  early_skill_signs: {
    badge: "Positive CLV Signal",
    border: "border-teal-200",
    bg: "bg-teal-50/70",
    text: "text-teal-900",
    icon: CheckCircle2,
  },
  losing_to_margin: {
    badge: "Margin Drag Detected",
    border: "border-rose-200",
    bg: "bg-rose-50/70",
    text: "text-rose-900",
    icon: TrendingDown,
  },
};

function BreakdownTable({
  rows,
  firstColLabel,
}: {
  rows: SegmentBreakdown[];
  firstColLabel: string;
}) {
  if (rows.length === 0) {
    return <p className="py-6 text-center text-xs text-[#1e293b]/50">No settled bets in this view yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border text-left text-xs text-[#1e293b]/50">
          <tr>
            <th className="pb-2.5 font-medium">{firstColLabel}</th>
            <th className="pb-2.5 text-right font-medium">Settled</th>
            <th className="pb-2.5 text-right font-medium">Strike vs B/E</th>
            <th className="pb-2.5 text-right font-medium">Staked</th>
            <th className="pb-2.5 text-right font-medium">Net P/L</th>
            <th className="pb-2.5 text-right font-medium">ROI</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border tabular-nums">
          {rows.map((r) => (
            <tr key={r.key} className={cn(r.bets === 0 && "opacity-45")}>
              <td className="py-2.5 font-medium text-[#0f172a]">{r.label}</td>
              <td className="py-2.5 text-right text-[#1e293b]/80">{r.bets}</td>
              <td className="py-2.5 text-right text-xs text-[#1e293b]/70">
                {r.bets > 0 ? `${pct(r.strikeRate)} vs ${pct(r.breakEvenRate)}` : "—"}
              </td>
              <td className="py-2.5 text-right text-[#1e293b]/80">{money(r.staked)}</td>
              <td
                className={cn(
                  "py-2.5 text-right font-medium",
                  r.bets === 0
                    ? "text-[#1e293b]/40"
                    : r.profit >= 0
                      ? "text-emerald-600"
                      : "text-rose-600",
                )}
              >
                {r.bets > 0 ? `${r.profit >= 0 ? "+" : ""}${money(r.profit)}` : "—"}
              </td>
              <td
                className={cn(
                  "py-2.5 text-right font-semibold",
                  r.bets === 0
                    ? "text-[#1e293b]/40"
                    : r.roi >= 0
                      ? "text-emerald-600"
                      : "text-rose-600",
                )}
              >
                {r.bets > 0 ? `${r.roi >= 0 ? "+" : ""}${pct(r.roi)}` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ReportCardView({ freeData, premiumData }: ReportCardViewProps) {
  const [breakdownTab, setBreakdownTab] = useState<
    "market" | "odds" | "bookmaker" | "stake" | "type"
  >("market");

  const vStyle = VERDICT_STYLE[freeData.verdict];
  const VerdictIcon = vStyle.icon;

  if (freeData.totalBets === 0) {
    return (
      <div className="space-y-8">
        <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-[#0f172a]">
            Your Betting Report Card starts with your first logged bet
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-[#1e293b]/65">
            Memory flatters winners and forgets the price you paid. Logging your bets lets you measure
            ROI with confidence intervals, compare your strike rate against implied break-even, and check
            whether you beat the closing line.
          </p>

          <div className="mx-auto mt-6 grid max-w-2xl gap-3 text-left sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-slate-50/70 p-4">
              <p className="text-xs font-semibold text-[#0f172a]">1. Log when you place</p>
              <p className="mt-1 text-xs text-[#1e293b]/60">
                Record the event, selection, decimal odds, and stake in under 10 seconds.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-slate-50/70 p-4">
              <p className="text-xs font-semibold text-[#0f172a]">2. Add your probability</p>
              <p className="mt-1 text-xs text-[#1e293b]/60">
                Include your own chance % so the calibration curve can score your estimates.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-slate-50/70 p-4">
              <p className="text-xs font-semibold text-[#0f172a]">3. Record closing odds</p>
              <p className="mt-1 text-xs text-[#1e293b]/60">
                Enter kick-off closing odds when settling to measure Closing-Line Value (CLV).
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <QuickAddBetModal triggerLabel="Log your first bet" variant="teal" />
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/bet-tracker">Open full Bet Tracker →</Link>
            </Button>
          </div>
        </div>

        <ResponsibleGamblingNote />
      </div>
    );
  }

  const progressPct = Math.min(
    100,
    Math.round((freeData.settledBets / MIN_SETTLED_FOR_VERDICT) * 100),
  );

  return (
    <div className="space-y-8">
      {/* Verdict banner */}
      <section className={cn("rounded-2xl border p-6 shadow-sm", vStyle.border, vStyle.bg)}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="mt-0.5 rounded-xl bg-white/80 p-2.5 shadow-sm">
              <VerdictIcon className={cn("h-5 w-5", vStyle.text)} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#0f172a]">
                  {vStyle.badge}
                </span>
                <span className="text-xs text-[#1e293b]/60">
                  {freeData.settledBets} settled · {freeData.pendingBets} pending
                  {freeData.voidBets > 0 ? ` · ${freeData.voidBets} void (excluded)` : ""}
                </span>
              </div>
              <h2 className={cn("mt-1.5 text-xl font-bold", vStyle.text)}>
                {freeData.verdictTitle}
              </h2>
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[#1e293b]/80">
                {freeData.verdictExplanation}
              </p>
            </div>
          </div>

          {freeData.verdict === "too_early" && (
            <div className="w-full sm:w-56">
              <div className="mb-1 flex justify-between text-xs font-medium text-[#1e293b]/70">
                <span>Sample progress</span>
                <span>
                  {freeData.settledBets} / {MIN_SETTLED_FOR_VERDICT}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/80">
                <div
                  className="h-full rounded-full bg-teal-600 transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* KPI Row */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: ROI + bootstrap CI (all tiers) */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-[#1e293b]/55">ROI (Yield)</p>
          <p
            className={cn(
              "mt-1 text-2xl font-bold tabular-nums",
              freeData.roi >= 0 ? "text-emerald-600" : "text-rose-600",
            )}
          >
            {freeData.roi >= 0 ? "+" : ""}
            {pct(freeData.roi)}
          </p>
          <p className="mt-1 text-xs tabular-nums text-[#1e293b]/55">
            95% CI: [{pct(freeData.roiInterval.lower)}, {pct(freeData.roiInterval.upper)}]
          </p>
          <p className="mt-0.5 text-[11px] text-[#1e293b]/45">
            {freeData.profit >= 0 ? "+" : ""}
            {money(freeData.profit)} on {money(freeData.staked)} staked
          </p>
        </div>

        {/* KPI 2: Strike rate vs break-even (all tiers) */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-[#1e293b]/55">Strike Rate vs Break-Even</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[#0f172a]">
            {pct(freeData.strikeRate)}
          </p>
          <p className="mt-1 text-xs tabular-nums text-[#1e293b]/55">
            Mean implied B/E: {pct(freeData.breakEvenRate)}
          </p>
          <p
            className={cn(
              "mt-0.5 text-[11px] font-medium tabular-nums",
              freeData.strikeVsBreakEven >= 0 ? "text-emerald-600" : "text-rose-600",
            )}
          >
            {freeData.strikeVsBreakEven >= 0 ? "+" : ""}
            {pct(freeData.strikeVsBreakEven)} vs mean 1/odds
          </p>
        </div>

        {/* KPI 3: CLV (Premium only) */}
        {premiumData ? (
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-[#1e293b]/55">Closing-Line Value (CLV)</p>
            <p
              className={cn(
                "mt-1 text-2xl font-bold tabular-nums text-[#0f172a]",
                premiumData.clv.mean !== null &&
                  (premiumData.clv.mean >= 0 ? "text-emerald-600" : "text-rose-600"),
              )}
            >
              {premiumData.clv.mean === null
                ? "—"
                : `${premiumData.clv.mean >= 0 ? "+" : ""}${pct(premiumData.clv.mean)}`}
            </p>
            <p className="mt-1 text-xs text-[#1e293b]/55">
              {premiumData.clv.sampleCount > 0
                ? `${premiumData.clv.sampleCount} bet${premiumData.clv.sampleCount === 1 ? "" : "s"} with closing odds`
                : "Log closing odds to measure"}
            </p>
            {premiumData.clv.positiveShare !== null && (
              <p className="mt-0.5 text-[11px] text-[#1e293b]/45">
                Beat close on {pct(premiumData.clv.positiveShare, 0)} of tracked bets
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-slate-50/70 p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-[#1e293b]/55">Closing-Line Value (CLV)</p>
              <Lock className="h-3.5 w-3.5 text-[#1e293b]/40" />
            </div>
            <p className="mt-2 text-sm font-semibold text-[#0f172a]">Premium metric</p>
            <p className="mt-0.5 text-xs text-[#1e293b]/55">
              Upgrade to see CLV and closing-implied expected profit.
            </p>
          </div>
        )}

        {/* KPI 4: Max Drawdown (Premium only) */}
        {premiumData ? (
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-[#1e293b]/55">Max Drawdown</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-rose-600">
              {premiumData.maxDrawdown > 0 ? `-${money(premiumData.maxDrawdown)}` : money(0)}
            </p>
            <p className="mt-1 text-xs text-[#1e293b]/55">
              Largest peak-to-trough drop
            </p>
            <p className="mt-0.5 text-[11px] text-[#1e293b]/45">
              Across {freeData.settledBets} settled bets
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-slate-50/70 p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-[#1e293b]/55">Max Drawdown</p>
              <Lock className="h-3.5 w-3.5 text-[#1e293b]/40" />
            </div>
            <p className="mt-2 text-sm font-semibold text-[#0f172a]">Premium metric</p>
            <p className="mt-0.5 text-xs text-[#1e293b]/55">
              Upgrade to unlock drawdown, leaks, and full breakdowns.
            </p>
          </div>
        )}
      </section>

      {/* Premium Analytics vs Free Upgrade Gate */}
      {premiumData ? (
        <>
          {/* Expected vs Actual + Behaviour Flags */}
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold text-[#0f172a]">
                  Expected vs Actual Profit
                </h2>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900">
                  Approximate
                </span>
              </div>
              <p className="mt-1 text-xs text-[#1e293b]/55">
                {premiumData.expectedVsActual.approximationNote}
              </p>

              {premiumData.expectedVsActual.sampleSize === 0 ? (
                <div className="mt-5 rounded-xl bg-slate-50 p-4 text-xs text-[#1e293b]/60">
                  Add closing odds when settling bets to compare your actual profit against
                  closing-implied expectation.
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[11px] font-medium text-[#1e293b]/50">
                      Closing-implied EV
                    </p>
                    <p className="mt-1 text-lg font-bold tabular-nums text-[#0f172a]">
                      {(premiumData.expectedVsActual.expectedProfit ?? 0) >= 0 ? "+" : ""}
                      {money(premiumData.expectedVsActual.expectedProfit ?? 0)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[11px] font-medium text-[#1e293b]/50">
                      Actual profit (n={premiumData.expectedVsActual.sampleSize})
                    </p>
                    <p
                      className={cn(
                        "mt-1 text-lg font-bold tabular-nums",
                        (premiumData.expectedVsActual.actualProfit ?? 0) >= 0
                          ? "text-emerald-600"
                          : "text-rose-600",
                      )}
                    >
                      {(premiumData.expectedVsActual.actualProfit ?? 0) >= 0 ? "+" : ""}
                      {money(premiumData.expectedVsActual.actualProfit ?? 0)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[11px] font-medium text-[#1e293b]/50">
                      Variance vs close
                    </p>
                    <p
                      className={cn(
                        "mt-1 text-lg font-bold tabular-nums",
                        (premiumData.expectedVsActual.delta ?? 0) >= 0
                          ? "text-emerald-600"
                          : "text-rose-600",
                      )}
                    >
                      {(premiumData.expectedVsActual.delta ?? 0) >= 0 ? "+" : ""}
                      {money(premiumData.expectedVsActual.delta ?? 0)}
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Behaviour Flags */}
            <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-[#0f172a]">Staking &amp; Structure Discipline</h2>
              <p className="mt-1 text-xs text-[#1e293b]/55">
                Automated checks for stake jumps after losing streaks, stake spikes, and accumulator exposure.
              </p>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-[#0f172a]">
                      Post-loss-streak stake increases (chasing)
                    </p>
                    <p className="text-xs text-[#1e293b]/55">
                      Stake ≥ 1.5× after 2+ consecutive losses
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      premiumData.behaviourFlags.chasing.detected
                        ? "bg-rose-100 text-rose-700"
                        : "bg-emerald-100 text-emerald-700",
                    )}
                  >
                    {premiumData.behaviourFlags.chasing.detected
                      ? `${premiumData.behaviourFlags.chasing.instances} flagged`
                      : "None"}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-[#0f172a]">
                      Stake spikes (&gt;3× median stake)
                    </p>
                    <p className="text-xs text-[#1e293b]/55">
                      Median stake: {money(premiumData.behaviourFlags.stakeSpikes.medianStake)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      premiumData.behaviourFlags.stakeSpikes.detected
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-700",
                    )}
                  >
                    {premiumData.behaviourFlags.stakeSpikes.detected
                      ? `${premiumData.behaviourFlags.stakeSpikes.count} spike${premiumData.behaviourFlags.stakeSpikes.count === 1 ? "" : "s"} (max ${premiumData.behaviourFlags.stakeSpikes.maxSpikeRatio}×)`
                      : "None"}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-[#0f172a]">Long-accumulator share</p>
                    <p className="text-xs text-[#1e293b]/55">
                      All accumulators: {pct(premiumData.behaviourFlags.longAccumulatorShare.accumulatorShare, 0)} (
                      {premiumData.behaviourFlags.longAccumulatorShare.accumulatorCount} bets)
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-[#0f172a]">
                    {pct(premiumData.behaviourFlags.longAccumulatorShare.share, 0)} (
                    {premiumData.behaviourFlags.longAccumulatorShare.count})
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Detected Leaks */}
          <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-semibold text-[#0f172a]">Detected Leaks &amp; Recommended Reading</h2>
                <p className="mt-0.5 text-xs text-[#1e293b]/55">
                  Each rule requires at least 15 settled bets in the relevant segment before firing.
                </p>
              </div>
            </div>

            {premiumData.leaks.length === 0 ? (
              <div className="mt-4 rounded-xl bg-slate-50 p-5 text-sm text-[#1e293b]/65">
                No segment leaks flagged yet (rules require at least 15 bets per segment). Keep logging bets,
                probabilities, and closing odds to sharpen diagnostics.
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {premiumData.leaks.map((leak) => (
                  <li
                    key={leak.id}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-slate-50/60 p-4 sm:flex-row sm:items-center"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          className={cn(
                            "h-4 w-4 shrink-0",
                            leak.severity === "high"
                              ? "text-rose-600"
                              : leak.severity === "medium"
                                ? "text-amber-600"
                                : "text-slate-500",
                          )}
                        />
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                            leak.severity === "high"
                              ? "bg-rose-100 text-rose-700"
                              : leak.severity === "medium"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-200 text-slate-700",
                          )}
                        >
                          {leak.severity} priority · n={leak.sampleSize}
                        </span>
                      </div>
                      <p className="text-sm text-[#0f172a]">{leak.message}</p>
                    </div>

                    <Link
                      href={leak.lessonHref}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-800 transition hover:bg-teal-100"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      {leak.lessonTitle}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Calibration Chart */}
          <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-[#0f172a]">
                  Probability Calibration (Your Chance %)
                </h2>
                <p className="mt-0.5 text-xs text-[#1e293b]/55">
                  Compares your estimated chance against how often those bets actually won across 5 probability buckets.
                </p>
              </div>
              {premiumData.calibration.sampleSize > 0 && (
                <div className="flex gap-4 text-right">
                  <div>
                    <p className="text-[11px] text-[#1e293b]/50">Brier score (3-way / binary)</p>
                    <p className="text-sm font-bold tabular-nums text-[#0f172a]">
                      {premiumData.calibration.brierScore.toFixed(3)} /{" "}
                      {premiumData.calibration.binaryBrierScore.toFixed(3)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#1e293b]/50">Sample</p>
                    <p className="text-sm font-bold tabular-nums text-[#0f172a]">
                      {premiumData.calibration.sampleSize} bets
                    </p>
                  </div>
                </div>
              )}
            </div>

            {premiumData.calibration.sampleSize === 0 ? (
              <div className="rounded-xl bg-slate-50 p-6 text-center text-xs text-[#1e293b]/60">
                Include &ldquo;Your chance %&rdquo; when logging bets to unlock your Brier score and reliability chart.
              </div>
            ) : (
              <CalibrationChart buckets={premiumData.calibration.userProbBuckets} />
            )}
          </section>

          {/* Breakdown Tables */}
          <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-[#0f172a]">Performance Breakdowns</h2>
                <p className="mt-0.5 text-xs text-[#1e293b]/55">
                  Slice your settled record by market, odds band, bookmaker, stake tertile, or bet type.
                </p>
              </div>

              <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
                {(
                  [
                    { id: "market", label: "Market" },
                    { id: "odds", label: "Odds Band" },
                    { id: "bookmaker", label: "Bookmaker" },
                    { id: "stake", label: "Stake Tertile" },
                    { id: "type", label: "Single vs Acca" },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setBreakdownTab(t.id)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                      breakdownTab === t.id
                        ? "bg-white text-[#0f172a] shadow-sm"
                        : "text-[#1e293b]/60 hover:text-[#0f172a]",
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {breakdownTab === "market" && (
              <BreakdownTable rows={premiumData.breakdowns.byMarket} firstColLabel="Market" />
            )}
            {breakdownTab === "odds" && (
              <BreakdownTable rows={premiumData.breakdowns.byOddsBand} firstColLabel="Odds Band" />
            )}
            {breakdownTab === "bookmaker" && (
              <BreakdownTable rows={premiumData.breakdowns.byBookmaker} firstColLabel="Bookmaker" />
            )}
            {breakdownTab === "stake" && (
              <BreakdownTable
                rows={premiumData.breakdowns.byStakeTertile}
                firstColLabel="Stake Tertile"
              />
            )}
            {breakdownTab === "type" && (
              <div className="space-y-3">
                <BreakdownTable rows={premiumData.breakdowns.byBetType} firstColLabel="Bet Type" />
                <p className="text-[11px] text-[#1e293b]/50">
                  Note: {premiumData.breakdowns.betTypeNote}
                </p>
              </div>
            )}
          </section>
        </>
      ) : (
        /* Free-tier upgrade gate — no premium computed numbers exist in DOM */
        <section className="relative overflow-hidden rounded-2xl border border-teal-200 bg-gradient-to-br from-white via-teal-50/30 to-indigo-50/30 p-8 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600/10 text-teal-700">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-[#0f172a]">
            Unlock Full Report Card Diagnostics with Premium
          </h2>
          <p className="mx-auto mt-1.5 max-w-xl text-sm text-[#1e293b]/65">
            Free accounts include your overall verdict, ROI confidence interval, strike rate vs break-even,
            and your last 30 logged bets. Upgrade to Premium to unlock:
          </p>
          <ul className="mx-auto mt-4 grid max-w-2xl gap-2 text-left text-xs text-[#1e293b]/80 sm:grid-cols-2">
            <li className="rounded-lg border border-border bg-white/80 px-3 py-2">
              • Closing-Line Value (CLV) &amp; expected vs actual profit
            </li>
            <li className="rounded-lg border border-border bg-white/80 px-3 py-2">
              • Probability calibration curve &amp; Brier scoring
            </li>
            <li className="rounded-lg border border-border bg-white/80 px-3 py-2">
              • Market, odds band, bookmaker &amp; stake tertile breakdowns
            </li>
            <li className="rounded-lg border border-border bg-white/80 px-3 py-2">
              • Automated leak detection linked to Betting Academy lessons
            </li>
          </ul>
          <div className="mt-6">
            <Button variant="teal" asChild>
              <Link href="/pricing">View Premium plans →</Link>
            </Button>
          </div>
        </section>
      )}

      {/* Recent 30 Bets */}
      <section className="rounded-2xl border border-border bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-6 py-4">
          <div>
            <h2 className="font-semibold text-[#0f172a]">
              Last {Math.min(30, freeData.recentBets.length)} Logged Bets
            </h2>
            <p className="text-xs text-[#1e293b]/50">
              Showing up to 30 most recent bets. Manage statuses and closing odds in Bet Tracker.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/bet-tracker">Manage in Bet Tracker →</Link>
          </Button>
        </div>
        <ul className="divide-y divide-border">
          {freeData.recentBets.map((b) => {
            const p = betProfit(b);
            return (
              <li
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-[#0f172a]">{b.selection}</p>
                  <p className="truncate text-xs text-[#1e293b]/55">
                    {b.eventName} · {b.market}
                    {(b.legCount ?? 1) > 1 ? ` (${b.legCount} legs)` : ""}
                    {b.bookmaker ? ` · ${b.bookmaker}` : ""} ·{" "}
                    {new Date(b.placedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3 tabular-nums">
                  <span className="text-xs text-[#1e293b]/70">
                    {money(b.stake)} @ {b.odds.toFixed(2)}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-[#1e293b]/75">
                    {STATUS_LABELS[b.status]}
                  </span>
                  {b.status !== "pending" && (
                    <span
                      className={cn(
                        "min-w-[68px] text-right text-xs font-semibold",
                        p >= 0 ? "text-emerald-600" : "text-rose-600",
                      )}
                    >
                      {p >= 0 ? "+" : ""}
                      {money(p)}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Privacy & Data Controls */}
      <PrivacyControls hasBets={freeData.totalBets > 0} />

      {/* Responsible Gambling Note */}
      <ResponsibleGamblingNote />
    </div>
  );
}
