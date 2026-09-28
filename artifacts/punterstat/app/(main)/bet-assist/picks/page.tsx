import type { Metadata } from "next";
import Link from "next/link";
import { Target } from "lucide-react";
import { ToolHero } from "@/components/bet-assist/tool-hero";
import { ResponsibleGamblingNote, ResponsibleGamblingStrip } from "@/components/bet-assist/responsible-gambling";
import { PicksBoard } from "@/components/bet-assist/picks-board";
import { getPicks, PICK_LEAGUES } from "@/lib/bet-assist/picks-server";
import { MIN_EDGE, MIN_BOOKMAKERS, RATINGS_WEIGHT } from "@/lib/bet-assist/picks";
import { getCurrentTier } from "@/lib/auth/access";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Data-Driven Football Picks — PunterStat",
  description:
    "Model probabilities for upcoming football fixtures built from bookmaker consensus and team form, with value flags where the best available price beats fair odds.",
};

const FREE_PICK_LIMIT = 3;

export default async function PicksPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const league = PICK_LEAGUES.find((l) => l.key === params.league) ?? PICK_LEAGUES[0];

  const [result, tier] = await Promise.all([getPicks(league.key), getCurrentTier()]);
  const unlimited = tier === "premium" || tier === "admin";

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <ToolHero
        icon={Target}
        title="Data-Driven Picks"
        description="Our model estimates the true chance of every outcome, then shops every bookmaker for a price that beats it. When the best price is longer than fair odds, it's flagged as value."
      />
      <ResponsibleGamblingStrip />

      <div className="container mx-auto max-w-5xl space-y-10 px-4 py-10">
        {/* League selector */}
        <nav className="flex flex-wrap gap-2" aria-label="Leagues">
          {PICK_LEAGUES.map((l) => (
            <Link
              key={l.key}
              href={`/bet-assist/picks?league=${l.key}`}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition",
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
        <section className="rounded-2xl border border-border bg-white p-7 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-[#0f172a]">How the model works</h2>
          <ol className="space-y-4 text-sm leading-relaxed text-[#1e293b]/70">
            <li>
              <strong className="text-[#0f172a]">1. Market consensus.</strong> We strip the margin out of every
              bookmaker&apos;s 1X2 prices and average them, giving extra weight to sharp books and exchanges (Pinnacle,
              Betfair, Matchbook, Smarkets) whose prices track true probability most closely.
            </li>
            <li>
              <strong className="text-[#0f172a]">2. Team form.</strong> Where we hold recent results for both teams, a
              time-weighted attack/defence rating model (Poisson) produces an independent estimate that is blended in
              at {Math.round(RATINGS_WEIGHT * 100)}%.
              {result.success && !result.ratingsAvailable && " Form data isn't available for this competition, so it uses consensus only."}
            </li>
            <li>
              <strong className="text-[#0f172a]">3. Price shopping.</strong> We compare the model&apos;s chance with the
              best available price. A pick is flagged only when the edge is at least {Math.round(MIN_EDGE * 100)}% and
              at least {MIN_BOOKMAKERS} bookmakers are pricing the match.
            </li>
            <li>
              <strong className="text-[#0f172a]">4. Staking.</strong> Suggested stakes use quarter Kelly, capped at 2%
              of bankroll, so no single pick can hurt you badly.
            </li>
          </ol>
          <p className="mt-5 rounded-lg bg-slate-50 p-4 text-xs leading-relaxed text-[#1e293b]/60">
            Edges are small and results are noisy: a +4% edge still loses often and can take hundreds of bets to show.
            Prices move — always check the odds you&apos;re actually getting. Picks are model output, not
            guarantees. Log your bets in the{" "}
            <Link href="/dashboard/bet-tracker" className="font-medium text-[#3D2DFF] hover:underline">
              Bet Tracker
            </Link>{" "}
            to see how they perform for you.
          </p>
        </section>

        <ResponsibleGamblingNote />
      </div>
    </div>
  );
}
