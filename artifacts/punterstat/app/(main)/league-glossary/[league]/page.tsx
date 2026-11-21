import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Target, TrendingUp, ShieldCheck, Activity, Users, BarChart2, Zap } from "lucide-react";
import { TeamFilterGrid } from "@/components/league-glossary/team-filter-grid";
import { getUserProfile } from "@/lib/auth/helpers";
import { getLeagueBySlug, getTeamsByLeague } from "@/lib/league-glossary/queries";

interface Props {
  params: Promise<{ league: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { league: slug } = await params;
  const league = await getLeagueBySlug(slug);
  if (!league) return { title: "Not Found" };
  return {
    title: `${league.name} — League Glossary`,
    description: `Statistical profile of the ${league.name} — playing style, goals, home advantage, parity, and team breakdowns for the ${league.season} season.`,
  };
}

const STYLE_LABELS: Record<string, string> = {
  "possession-based": "Possession-based",
  direct: "Direct",
  "high-tempo": "High Tempo",
  "counter-attacking": "Counter-attacking",
  mixed: "Mixed",
};

const COUNTRY_FLAGS: Record<string, string> = {
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  Spain: "🇪🇸",
  Germany: "🇩🇪",
  France: "🇫🇷",
  Italy: "🇮🇹",
  Netherlands: "🇳🇱",
  Portugal: "🇵🇹",
};

const SLUG_TO_STATS_CODE: Record<string, string> = {
  "premier-league": "E0",
  "la-liga": "SP1",
  "serie-a": "I1",
  bundesliga: "D1",
  "ligue-1": "F1",
  eredivisie: "N1",
  "primeira-liga": "P1",
  championship: "E1",
};

export default async function LeagueDetailPage({ params }: Props) {
  const { league: slug } = await params;
  const [profile, league] = await Promise.all([
    getUserProfile(),
    getLeagueBySlug(slug),
  ]);
  if (!league) notFound();

  const teams = await getTeamsByLeague(league.id);
  const flag = COUNTRY_FLAGS[league.country] ?? "🌍";
  const styleLabel = STYLE_LABELS[league.playingStyle] ?? league.playingStyle;
  const isLoggedIn = Boolean(profile);
  const statsCode = SLUG_TO_STATS_CODE[slug];
  const statsHref = statsCode ? `/stats/results?league=${statsCode}` : "/stats/results";

  return (
    <div className={isLoggedIn ? "" : "min-h-screen bg-[#f8fafc]"}>
      {/* Compact dashboard header when logged in */}
      {isLoggedIn && (
        <div className="mb-6 space-y-4 py-2">
          <nav className="flex items-center gap-1.5 text-xs text-[#1e293b]/50">
            <Link href="/league-glossary" className="hover:text-[#0f172a] transition-colors">
              League Glossary
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-[#0f172a]">{league.name}</span>
          </nav>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#1e293b]/55">
                <span aria-hidden="true">{flag}</span>
                <span>{league.country} · {league.season}</span>
                <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                  {styleLabel}
                </span>
              </div>
              <h1 className="mt-1 text-2xl font-bold text-[#0f172a]">{league.name}</h1>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={statsHref}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-[#0f172a] shadow-sm transition hover:bg-slate-50"
              >
                <BarChart2 className="h-3.5 w-3.5 text-[#3D2DFF]" />
                Historical Results
              </Link>
              <Link
                href="/bet-analysis/screener"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#3D2DFF] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#3D2DFF]/90"
              >
                <Zap className="h-3.5 w-3.5" />
                Match Screener
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { value: league.avgGoalsPerGame?.toFixed(2) ?? "—", label: "Goals / game" },
              { value: league.homeWinPct != null ? `${league.homeWinPct}%` : "—", label: "Home wins" },
              { value: league.overPct != null ? `${league.overPct}%` : "—", label: `Over ${league.ouReferenceLine ?? 2.5}` },
              { value: league.parityScore != null ? league.parityScore.toFixed(0) : "—", label: "Parity score" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-white p-3.5 text-center shadow-sm">
                <p className="text-xl font-bold tabular-nums text-[#0f172a]">{stat.value}</p>
                <p className="text-xs text-[#1e293b]/55">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hero — shown only for signed-out visitors */}
      {!isLoggedIn && (
        <section className="bg-[#0f172a] px-4 py-12 sm:py-16">
          <div className="container mx-auto max-w-6xl">
            {/* Breadcrumb */}
            <nav className="mb-5 flex items-center gap-1.5 text-xs text-white/40">
              <Link href="/league-glossary" className="hover:text-white/70 transition-colors">
                League Glossary
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-white/70">{league.name}</span>
            </nav>

            <div className="flex flex-wrap items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-2xl" aria-hidden="true">{flag}</span>
                  <span className="text-sm text-white/50">{league.country} · {league.season}</span>
                </div>
                <h1 className="text-3xl font-bold text-white sm:text-4xl">{league.name}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-2.5">
                  <span className="inline-block rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
                    {styleLabel}
                  </span>
                  <Link
                    href={statsHref}
                    className="inline-flex items-center gap-1 text-xs font-medium text-white/60 hover:text-white transition"
                  >
                    <BarChart2 className="h-3.5 w-3.5" /> Historical Results →
                  </Link>
                  <Link
                    href="/bet-analysis/screener"
                    className="inline-flex items-center gap-1 text-xs font-medium text-teal-400 hover:text-teal-300 transition"
                  >
                    <Zap className="h-3.5 w-3.5" /> Match Screener →
                  </Link>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 w-full sm:w-auto mt-4 sm:mt-0">
              {[
                {
                  icon: Target,
                  value: league.avgGoalsPerGame?.toFixed(2) ?? "—",
                  label: "Goals / game",
                  color: "text-amber-400",
                },
                {
                  icon: TrendingUp,
                  value: league.homeWinPct != null ? `${league.homeWinPct}%` : "—",
                  label: "Home wins",
                  color: "text-emerald-400",
                },
                {
                  icon: Activity,
                  value: league.overPct != null ? `${league.overPct}%` : "—",
                  label: `Over ${league.ouReferenceLine ?? 2.5}`,
                  color: "text-blue-400",
                },
                {
                  icon: ShieldCheck,
                  value: league.parityScore != null ? league.parityScore.toFixed(0) : "—",
                  label: "Parity score",
                  color: "text-violet-400",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-center"
                >
                  <stat.icon className={`mx-auto mb-1 h-4 w-4 ${stat.color}`} />
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-[10px] text-white/40">{stat.label}</p>
                </div>
              ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Result split */}
      <section className="border-b border-border/60 bg-white px-4 py-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#1e293b]/40">
            Overall result split
          </h2>
          <div className="flex h-4 overflow-hidden rounded-full bg-border/30 w-full max-w-xl">
            {league.homeWinPct != null && (
              <div
                className="bg-emerald-500 flex items-center justify-center"
                style={{ width: `${league.homeWinPct}%` }}
                title={`Home win ${league.homeWinPct}%`}
              />
            )}
            {league.drawPct != null && (
              <div
                className="bg-amber-400"
                style={{ width: `${league.drawPct}%` }}
                title={`Draw ${league.drawPct}%`}
              />
            )}
            {league.awayWinPct != null && (
              <div
                className="bg-rose-400"
                style={{ width: `${league.awayWinPct}%` }}
                title={`Away win ${league.awayWinPct}%`}
              />
            )}
          </div>
          <div className="mt-2 flex gap-5 text-xs text-[#1e293b]/60">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Home win {league.homeWinPct?.toFixed(1)}%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
              Draw {league.drawPct?.toFixed(1)}%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-rose-400" />
              Away win {league.awayWinPct?.toFixed(1)}%
            </span>
          </div>
        </div>
      </section>

      {/* Narrative sections */}
      <section className="container mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-6 lg:grid-cols-2">
          {league.styleSummary && (
            <div className="rounded-2xl border border-border bg-white p-6">
              <h2 className="mb-3 text-sm font-bold text-[#0f172a]">Playing style</h2>
              <p className="text-sm text-[#1e293b]/70 leading-relaxed">{league.styleSummary}</p>
            </div>
          )}

          {league.xgTrend && (
            <div className="rounded-2xl border border-border bg-white p-6">
              <h2 className="mb-3 text-sm font-bold text-[#0f172a]">Goals &amp; xG trend</h2>
              <p className="text-sm text-[#1e293b]/70 leading-relaxed">{league.xgTrend}</p>
            </div>
          )}

          {league.fatiguePattern && (
            <div className="rounded-2xl border border-border bg-white p-6">
              <h2 className="mb-3 text-sm font-bold text-[#0f172a]">Fixture congestion &amp; fatigue</h2>
              <p className="text-sm text-[#1e293b]/70 leading-relaxed">{league.fatiguePattern}</p>
            </div>
          )}

          {league.parityNote && (
            <div className="rounded-2xl border border-border bg-white p-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#0f172a]">Competitive parity</h2>
                {league.parityScore != null && (
                  <div className="flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 border border-violet-100">
                    <ShieldCheck className="h-3 w-3 text-violet-500" />
                    <span className="text-xs font-bold text-violet-700">
                      {league.parityScore.toFixed(0)} / 100
                    </span>
                  </div>
                )}
              </div>
              <p className="text-sm text-[#1e293b]/70 leading-relaxed">{league.parityNote}</p>
            </div>
          )}
        </div>
      </section>

      {/* Teams */}
      <section className="container mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-6 flex items-center gap-3">
          <Users className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-bold text-[#0f172a]">
            Team profiles
            <span className="ml-2 text-sm font-normal text-[#1e293b]/40">
              ({teams.length} clubs)
            </span>
          </h2>
        </div>

        {teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
            <Users className="mb-4 h-10 w-10 text-[#1e293b]/20" />
            <h3 className="mb-1 text-base font-semibold text-[#0f172a]">No team profiles yet</h3>
            <p className="text-sm text-[#1e293b]/50">Team data for this league is being prepared.</p>
          </div>
        ) : (
          <TeamFilterGrid teams={teams} />
        )}
      </section>

      {/* Disclaimer */}
      {!isLoggedIn && (
        <section className="border-t border-border/60 bg-white px-4 py-8">
          <div className="container mx-auto max-w-3xl text-center">
            <p className="text-xs text-[#1e293b]/40 leading-relaxed">
              Statistics are for educational purposes only and reflect 2024–25
              season data at time of publication. PunterStat does not facilitate
              gambling of any kind.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
