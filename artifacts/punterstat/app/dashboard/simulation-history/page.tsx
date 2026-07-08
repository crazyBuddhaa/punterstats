import type { Metadata } from "next";
import Link from "next/link";
import { FlaskConical, TrendingUp, TrendingDown, Dices, BarChart2, Zap } from "lucide-react";
import { requireAuth } from "@/lib/auth/helpers";
import { getSimulationSessions } from "@/lib/dashboard/queries";
import { EmptyState } from "@/components/dashboard/empty-state";

export const metadata: Metadata = { title: "Simulation History — Dashboard — PunterStat" };

function formatDate(str: string) {
  return new Date(str).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function SimulationHistoryPage() {
  const profile = await requireAuth();
  const sessions = await getSimulationSessions(profile.userId);

  const betSessions = sessions.filter((s) => s.type === "bet");
  const probSessions = sessions.filter((s) => s.type === "probability");

  const totalBets = betSessions.reduce((sum, s) => sum + s.totalBets, 0);
  const totalPL = betSessions.reduce((sum, s) => sum + (s.virtualBalance - s.startingBalance), 0);
  const avgROI =
    betSessions.length > 0
      ? betSessions.reduce((sum, s) => sum + s.roi, 0) / betSessions.length
      : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Simulation History</h1>
        <p className="mt-1 text-sm text-[#1e293b]/60">
          All your simulation sessions — {sessions.length} total.
        </p>
      </div>

      {/* Spot The Value CTA */}
      <Link
        href="/spot-the-value"
        className="flex items-center justify-between rounded-xl border border-[#3D2DFF]/20 bg-[#3D2DFF]/5 px-5 py-3.5 text-sm text-[#3D2DFF] transition hover:bg-[#3D2DFF]/10"
      >
        <span className="flex items-center gap-2.5">
          <Zap className="h-4 w-4 shrink-0" />
          <span>
            <span className="font-semibold">New: Spot The Value</span>
            <span className="ml-1.5 text-[#3D2DFF]/70">
              — compare your model probabilities against live market odds to find value gaps.
            </span>
          </span>
        </span>
        <span className="shrink-0 text-xs font-medium">Try it →</span>
      </Link>

      {sessions.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title="No simulations yet"
          description="Run the Bet Simulator to practice placing bets with a virtual balance. Sessions are saved here."
          actionLabel="Open Simulation Engine"
          actionHref="/simulation-engine"
        />
      ) : (
        <>
          {/* Summary stats */}
          {betSessions.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-white p-5 text-center shadow-sm">
                <p className="text-2xl font-bold text-[#0f172a]">{totalBets}</p>
                <p className="mt-0.5 text-sm text-[#1e293b]/60">Total bets placed</p>
              </div>
              <div className="rounded-2xl border border-border bg-white p-5 text-center shadow-sm">
                <p
                  className={`text-2xl font-bold ${
                    totalPL >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {totalPL >= 0 ? "+" : ""}
                  {totalPL.toFixed(0)} ₦
                </p>
                <p className="mt-0.5 text-sm text-[#1e293b]/60">Total virtual P&amp;L</p>
              </div>
              <div className="rounded-2xl border border-border bg-white p-5 text-center shadow-sm">
                <p
                  className={`text-2xl font-bold ${
                    avgROI >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {avgROI >= 0 ? "+" : ""}
                  {avgROI.toFixed(1)}%
                </p>
                <p className="mt-0.5 text-sm text-[#1e293b]/60">Average ROI</p>
              </div>
            </div>
          )}

          {/* Bet simulator sessions */}
          {betSessions.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Dices className="h-4 w-4 text-violet-600" />
                <h2 className="font-semibold text-[#0f172a]">Bet Simulator Sessions</h2>
              </div>
              <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white">
                {betSessions.map((s) => {
                  const pl = s.virtualBalance - s.startingBalance;
                  const positive = pl >= 0;
                  return (
                    <div key={s.id} className="flex items-center justify-between px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-[#0f172a]">
                          Session · {s.totalBets} bet{s.totalBets !== 1 ? "s" : ""}
                        </p>
                        <p className="text-xs text-[#1e293b]/50">{formatDate(s.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-[#1e293b]/50">Balance</p>
                          <p className="text-sm font-semibold text-[#0f172a]">
                            ₦{s.virtualBalance.toFixed(0)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[#1e293b]/50">P&amp;L</p>
                          <p
                            className={`flex items-center gap-1 text-sm font-bold ${
                              positive ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {positive ? (
                              <TrendingUp className="h-3.5 w-3.5" />
                            ) : (
                              <TrendingDown className="h-3.5 w-3.5" />
                            )}
                            {positive ? "+" : ""}
                            {pl.toFixed(0)} ₦
                          </p>
                        </div>
                        <div className="text-right hidden md:block">
                          <p className="text-xs text-[#1e293b]/50">ROI</p>
                          <p
                            className={`text-sm font-semibold ${
                              s.roi >= 0 ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {s.roi >= 0 ? "+" : ""}
                            {s.roi}%
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Probability simulator sessions */}
          {probSessions.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-teal-600" />
                <h2 className="font-semibold text-[#0f172a]">Probability Simulator Sessions</h2>
              </div>
              <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white">
                {probSessions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-[#0f172a]">Monte Carlo run</p>
                      <p className="text-xs text-[#1e293b]/50">{formatDate(s.createdAt)}</p>
                    </div>
                    <Link
                      href="/simulation-engine/probability-simulator"
                      className="text-xs font-medium text-teal-600 hover:text-teal-700"
                    >
                      Run again →
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
