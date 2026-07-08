import type { Metadata } from "next";
import { BookOpen, Globe } from "lucide-react";
import { LeagueCard } from "@/components/league-glossary/league-card";
import { getLeagues, getTeamCount } from "@/lib/league-glossary/queries";

export const metadata: Metadata = {
  title: "League Glossary",
  description:
    "In-depth statistical profiles of Europe's top football leagues — playing styles, goals, home advantage, parity, and team breakdowns.",
};

export default async function LeagueGlossaryPage() {
  const leagues = await getLeagues();

  const leaguesWithCount = await Promise.all(
    leagues.map(async (league) => ({
      league,
      teamCount: await getTeamCount(league.id),
    }))
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Hero */}
      <section className="bg-[#0f172a] px-4 py-16 sm:py-20">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5">
            <Globe className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              League Glossary
            </span>
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            How Europe&apos;s Top Leagues Actually Work
          </h1>
          <p className="mt-4 text-base text-white/60 leading-relaxed max-w-xl mx-auto">
            Statistical profiles of the major leagues — playing styles, goal
            averages, home advantage, over/under trends, squad fatigue
            patterns, and full team breakdowns.
          </p>
          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-amber-500/70">
            {leagues.length} {leagues.length === 1 ? "League" : "Leagues"} · 2024–25 Season
          </p>
        </div>
      </section>

      {/* What you'll learn */}
      <section className="border-b border-border/60 bg-white px-4 py-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Playing styles",
                desc: "How each league shapes the football played within it",
              },
              {
                label: "Goals & xG",
                desc: "Average totals and expected goals trends per division",
              },
              {
                label: "Home advantage",
                desc: "Quantified home-field lift and win-rate breakdowns",
              },
              {
                label: "Team profiles",
                desc: "Formation, style, home/away records, and xG per club",
              },
            ].map((item) => (
              <div key={item.label} className="flex gap-3">
                <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0f172a]">{item.label}</p>
                  <p className="text-xs text-[#1e293b]/50 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leagues grid */}
      <section className="container mx-auto max-w-6xl px-4 py-12">
        {leaguesWithCount.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
            <BookOpen className="mb-4 h-12 w-12 text-[#1e293b]/20" />
            <h2 className="mb-2 text-lg font-semibold text-[#0f172a]">No leagues yet</h2>
            <p className="text-sm text-[#1e293b]/50">
              League profiles are being prepared. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {leaguesWithCount.map(({ league, teamCount }) => (
              <LeagueCard key={league.id} league={league} teamCount={teamCount} />
            ))}
          </div>
        )}
      </section>

      {/* Educational disclaimer */}
      <section className="border-t border-border/60 bg-white px-4 py-8">
        <div className="container mx-auto max-w-3xl text-center">
          <p className="text-xs text-[#1e293b]/40 leading-relaxed">
            All statistics are for educational purposes only. Figures are
            derived from published 2024–25 season data and are intended to
            illustrate how leagues differ — not to guide betting decisions.
            PunterStat does not facilitate gambling of any kind.
          </p>
        </div>
      </section>
    </div>
  );
}
