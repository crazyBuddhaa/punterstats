import type { Metadata } from "next";
import Link from "next/link";
import { Target } from "lucide-react";
import { ResponsibleGamblingNote, ResponsibleGamblingStrip } from "@/components/bet-assist/responsible-gambling";
import { PicksBoard } from "@/components/bet-assist/picks-board";
import { getPicks, PICK_LEAGUES } from "@/lib/bet-assist/picks-server";
import { MIN_EDGE, MIN_BOOKMAKERS, RATINGS_WEIGHT } from "@/lib/bet-assist/picks";
import { getCurrentTier } from "@/lib/auth/access";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Data-Driven Picks — Dashboard | PunterStat",
  description:
    "Model probabilities for upcoming football fixtures built from bookmaker consensus and team form, with value flags where the best available price beats fair odds.",
};

const FREE_PICK_LIMIT = 3;

export default async function DashboardPicksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const league = PICK_LEAGUES.find((l) => l.key === params.league) ?? PICK_LEAGUES[0];

  const [result, tier] = await Promise.all([getPicks(league.key), getCurrentTier()]);
  const unlimited = tier === "premium" || tier === "admin";

  return (
    <div className="space-y-8">
      {/* Dashboard Section Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[#3D2DFF]" />
            <h1 className="text-2xl font-bold text-[#0f172a]">Data-Driven Picks</h1>
          </div>
          <p className="mt-1 text-sm text-[#1e293b]/60">
            Model probabilities against bookmaker consensus. Highlighted where best available prices beat fair market odds.
          </p>
        </div>
      </div>

      <ResponsibleGamblingStrip />

      {/* League selector */}
      <nav className="flex flex-wrap gap-2" aria-label="Leagues">
        {PICK_LEAGUES.map((l) => (
          <Link
            key={l.key}
            href={`/dashboard/picks?league=${l.key}`}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-semibold transition",
              l.key === league.key
                ? "border-[#3D2DFF] bg-[#3D2DFF] text-white"
                : "border-border bg-white text-[#1e293b]/70 hover:border-[#3D2DFF]/40",
            )}
          >
            {l.label}
          </Link>
        ))}
      </nav>

      {!result.success ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          Live odds are unavailable right now ({result.error}). Picks need live bookmaker prices — please try again
          shortly.
        </div>
      ) : result.picks.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-6 text-sm text-[#1e293b]/60">
          No upcoming {league.label} fixtures with prices yet. Try another league.
        </div>
      ) : (
        <PicksBoard picks={result.picks} freeLimit={unlimited ? null : FREE_PICK_LIMIT} />
      )}

      {/* Method */}
      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-bold text-[#0f172a]">How the model works</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs leading-relaxed text-[#1e293b]/70">
          <div className="rounded-xl bg-slate-50 p-3.5">
            <strong className="block text-[#0f172a] mb-1 font-semibold">1. Market consensus</strong>
            Strip margins out of bookmaker 1X2 odds, weighted heavily towards sharp exchanges.
          </div>
          <div className="rounded-xl bg-slate-50 p-3.5">
            <strong className="block text-[#0f172a] mb-1 font-semibold">2. Team form</strong>
            Time-weighted attack/defence Poisson rating model blended in at {Math.round(RATINGS_WEIGHT * 100)}%.
            {result.success && !result.ratingsAvailable && " (Consensus-only for this league)"}
          </div>
          <div className="rounded-xl bg-slate-50 p-3.5">
            <strong className="block text-[#0f172a] mb-1 font-semibold">3. Price shopping</strong>
            Edge flagged only when probability advantage is &ge;{Math.round(MIN_EDGE * 100)}% across {MIN_BOOKMAKERS}+ books.
          </div>
          <div className="rounded-xl bg-slate-50 p-3.5">
            <strong className="block text-[#0f172a] mb-1 font-semibold">4. Staking</strong>
            Quarter Kelly recommendation capped at 2% bankroll protection.
          </div>
        </div>
        <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-[#1e293b]/60">
          Edges are statistical estimates, not guarantees. Always verify live prices. Log bets in your{" "}
          <Link href="/dashboard/bet-tracker" className="font-semibold text-[#3D2DFF] hover:underline">
            Bet Tracker
          </Link>{" "}
          to monitor actual performance over time.
        </p>
      </section>

      <ResponsibleGamblingNote />
    </div>
  );
}
