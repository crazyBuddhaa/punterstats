import type { Metadata } from "next";
import { Target, CheckCircle2, ListChecks, Gauge, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { requireAuth } from "@/lib/auth/helpers";
import { getResolvedPredictions, getPredictionRecords } from "@/lib/dashboard/queries";
import { scoreCalibration, scoreCalibrationTrend } from "@/lib/calibration/scorer";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ResolvePredictionButton } from "@/components/dashboard/resolve-prediction-button";

export const metadata: Metadata = { title: "Calibration — Dashboard — PunterStat" };

const RESULT_LABEL: Record<string, string> = {
  home_win: "Home win",
  draw: "Draw",
  away_win: "Away win",
};

function formatDate(str: string | null) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function CalibrationPage() {
  const profile = await requireAuth();
  const [resolved, records] = await Promise.all([
    getResolvedPredictions(profile.userId),
    getPredictionRecords(profile.userId),
  ]);

  const summary = scoreCalibration(resolved);
  const trend = scoreCalibrationTrend(resolved);
  const pending = records.filter((r) => !r.actualResult);

  const trendCopy: Record<NonNullable<typeof trend.direction> | "none", { text: string; icon: typeof TrendingUp; color: string; bg: string }> = {
    improving: {
      text: "Your judgement is improving — recent predictions score better than your earlier ones.",
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    declining: {
      text: "Your recent predictions are less well-calibrated than your earlier ones — worth reviewing what changed.",
      icon: TrendingDown,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    flat: {
      text: "Your calibration has stayed steady between your earlier and recent predictions.",
      icon: Minus,
      color: "text-[#1e293b]/60",
      bg: "bg-slate-100",
    },
    none: {
      text: "Track a few more predictions to see whether your judgement is improving over time.",
      icon: Minus,
      color: "text-[#1e293b]/60",
      bg: "bg-slate-100",
    },
  };
  const trendInfo = trendCopy[trend.direction ?? "none"];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Calibration Engine</h1>
        <p className="mt-1 text-sm text-[#1e293b]/60">
          How well the model&apos;s predicted probabilities have matched real outcomes, based on
          predictions you&apos;ve tracked from Match Breakdown.
        </p>
      </div>

      {records.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No tracked predictions yet"
          description="Use “Track This Prediction” on a Match Breakdown analysis to start building your calibration history."
          actionLabel="Go to Match Breakdown"
          actionHref="/match-breakdown"
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Resolved Predictions"
              value={summary.sampleSize}
              icon={ListChecks}
              iconColor="text-teal-600"
              iconBg="bg-teal-50"
              note={pending.length > 0 ? `${pending.length} awaiting a result` : undefined}
            />
            <StatCard
              label="Accuracy"
              value={summary.sampleSize > 0 ? Math.round(summary.accuracy * 100) : "—"}
              suffix={summary.sampleSize > 0 ? "%" : undefined}
              icon={CheckCircle2}
              iconColor="text-emerald-600"
              iconBg="bg-emerald-50"
              note="Predicted outcome with the highest probability matched the result"
            />
            <StatCard
              label="Brier Score"
              value={summary.sampleSize > 0 ? summary.brierScore : "—"}
              icon={Gauge}
              iconColor="text-violet-600"
              iconBg="bg-violet-50"
              note="Lower is better — 0 is perfect, ~0.6-0.7 is typical for football"
            />
          </div>

          {summary.sampleSize > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-[#1e293b]/60 uppercase tracking-wide">
                Reliability Curve
              </h2>
              <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                <p className="mb-4 text-xs text-[#1e293b]/50">
                  For each probability range, how often that outcome actually happened vs. what the
                  model predicted on average. Close values mean the model is well-calibrated in that
                  range.
                </p>
                <div className="space-y-3">
                  {summary.calibrationCurve.map((b) => (
                    <div key={b.bucketLabel}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium text-[#0f172a]">{b.bucketLabel}</span>
                        <span className="text-[#1e293b]/50">
                          {b.sampleSize === 0
                            ? "no data"
                            : `predicted ${Math.round(b.predictedAvg * 100)}% · actual ${Math.round(
                                b.actualFrequency * 100,
                              )}% (n=${b.sampleSize})`}
                        </span>
                      </div>
                      <div className="relative h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-teal-200"
                          style={{ width: `${b.predictedAvg * 100}%` }}
                        />
                        <div
                          className="absolute inset-y-0 left-0 w-0.5 bg-teal-700"
                          style={{ left: `${b.actualFrequency * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {summary.sampleSize > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-[#1e293b]/60 uppercase tracking-wide">
                Brier Score Trend
              </h2>
              <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                <div className={`mb-4 flex items-start gap-3 rounded-xl px-4 py-3 ${trendInfo.bg}`}>
                  <trendInfo.icon className={`mt-0.5 h-4 w-4 shrink-0 ${trendInfo.color}`} />
                  <p className={`text-sm ${trendInfo.color}`}>{trendInfo.text}</p>
                </div>

                {trend.direction !== null && (
                  <div className="mb-4 grid grid-cols-2 gap-4 text-center">
                    <div className="rounded-xl bg-slate-50 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#1e293b]/40">
                        Earlier half
                      </p>
                      <p className="mt-1 text-lg font-bold text-[#0f172a]">{trend.earlierBrierScore}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#1e293b]/40">
                        Recent half
                      </p>
                      <p className="mt-1 text-lg font-bold text-[#0f172a]">{trend.recentBrierScore}</p>
                    </div>
                  </div>
                )}

                {trend.points.length > 1 && (
                  <>
                    <p className="mb-2 text-xs text-[#1e293b]/50">
                      Brier score per group of 5 resolved predictions, in order tracked (lower is better).
                    </p>
                    <div className="flex items-end gap-2" style={{ height: 80 }}>
                      {trend.points.map((p) => (
                        <div key={p.label} className="flex flex-1 flex-col items-center gap-1">
                          <div
                            className="w-full rounded-t bg-violet-300"
                            style={{ height: `${Math.max(6, (1 - p.brierScore / 2) * 64)}px` }}
                            title={`${p.label}: Brier ${p.brierScore} (n=${p.sampleSize})`}
                          />
                          <span className="text-[9px] text-[#1e293b]/40">{p.label}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-sm font-semibold text-[#1e293b]/60 uppercase tracking-wide">
              Tracked Predictions
            </h2>
            <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white">
              {records.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#0f172a]">
                      {r.homeTeam} vs {r.awayTeam}
                    </p>
                    <p className="text-xs text-[#1e293b]/50">
                      {formatDate(r.matchDate ?? r.createdAt)} · predicted{" "}
                      {Math.round(r.predictedHomeWinProb * 100)}% / {Math.round(r.predictedDrawProb * 100)}%
                      / {Math.round(r.predictedAwayWinProb * 100)}%
                    </p>
                  </div>
                  {r.actualResult ? (
                    <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-[#1e293b]/70">
                      {RESULT_LABEL[r.actualResult]}
                    </span>
                  ) : (
                    <div className="shrink-0">
                      <ResolvePredictionButton predictionId={r.id} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
