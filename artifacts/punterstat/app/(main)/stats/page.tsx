import Link from "next/link";
import { BarChart2, GitCompare, Database } from "lucide-react";
import { getUserProfile } from "@/lib/auth/helpers";
import { getLeagueBenchmarks } from "@/lib/historical-stats/queries";

export const metadata = { title: "Historical Stats | PunterStat" };

const tools = [
  {
    href: "/stats/results",
    icon: BarChart2,
    title: "Match Results Browser",
    description:
      "Browse 20+ years of match results across European leagues. Filter by league, season, team, or result to spot BTTS and Over/Under trends.",
    badge: "20+ years of data",
  },
  {
    href: "/stats/head-to-head",
    icon: GitCompare,
    title: "Head-to-Head Stats",
    description:
      "Compare any two teams across their full historical record — wins, goals, BTTS %, Over 1.5 / 2.5 %, and every past meeting.",
    badge: "All-time records",
  },
];

export default async function StatsPage() {
  const [profile, benchmarks] = await Promise.all([
    getUserProfile(),
    getLeagueBenchmarks(),
  ]);
  const isLoggedIn = Boolean(profile);

  if (isLoggedIn) {
    return (
      <div className="space-y-6 py-2">
        <div>
          <h1 className="text-xl font-bold text-[#0f172a] sm:text-2xl">Stats Centre</h1>
          <p className="mt-1 text-xs text-[#1e293b]/55">
            Explore historical European football results, head-to-head betting trends, and league scoring benchmarks.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {tools.map(({ href, icon: Icon, title, description, badge }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col gap-3 rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:border-[#3D2DFF]/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3D2DFF]/10 text-[#3D2DFF]">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-[#1e293b]/60">
                  {badge}
                </span>
              </div>
              <div>
                <h2 className="font-semibold text-[#0f172a] group-hover:text-[#3D2DFF] transition-colors">
                  {title}
                </h2>
                <p className="mt-1 text-xs text-[#1e293b]/60 leading-relaxed">{description}</p>
              </div>
              <div className="mt-auto pt-1 text-xs font-semibold text-[#3D2DFF]">Open tool →</div>
            </Link>
          ))}
        </div>

        {benchmarks.length > 0 && (
          <section className="overflow-x-auto rounded-2xl border border-border bg-white p-5 shadow-sm">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-semibold text-[#0f172a]">Top European League Benchmarks</h2>
              <span className="text-xs text-[#1e293b]/50">Recent matches from historical dataset</span>
            </div>
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs text-[#1e293b]/50">
                <tr>
                  <th className="pb-2.5 font-medium">League</th>
                  <th className="pb-2.5 text-right font-medium">Sample</th>
                  <th className="pb-2.5 text-right font-medium">Avg Goals</th>
                  <th className="pb-2.5 text-right font-medium">Home Win %</th>
                  <th className="pb-2.5 text-right font-medium">BTTS %</th>
                  <th className="pb-2.5 text-right font-medium">Over 2.5 %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border tabular-nums">
                {benchmarks.map((b) => (
                  <tr key={b.code} className="hover:bg-slate-50/70">
                    <td className="py-2.5 font-medium text-[#0f172a]">
                      <Link href={`/stats/results?league=${b.code}`} className="hover:text-[#3D2DFF] hover:underline">
                        {b.name}
                      </Link>
                    </td>
                    <td className="py-2.5 text-right text-xs text-[#1e293b]/55">{b.matches.toLocaleString()}</td>
                    <td className="py-2.5 text-right font-semibold text-[#0f172a]">{b.avgGoals.toFixed(2)}</td>
                    <td className="py-2.5 text-right text-[#1e293b]/80">{b.homeWinPct.toFixed(1)}%</td>
                    <td className="py-2.5 text-right text-[#1e293b]/80">{b.bttsPct.toFixed(1)}%</td>
                    <td className="py-2.5 text-right text-[#1e293b]/80">{b.over25Pct.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f172a] py-16 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#3D2DFF]/30 bg-[#3D2DFF]/10 px-4 py-1.5 text-sm text-[#7B7BFF]">
            <Database className="h-3.5 w-3.5" />
            Historical Data
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Stats Centre</h1>
          <p className="text-lg text-white/50 max-w-xl mx-auto">
            Explore two decades of European football results — from the Premier League to
            the Bundesliga, with BTTS, Over 2.5, ELO ratings, and historical market odds.
          </p>
        </div>

        {/* Tool cards */}
        <div className="grid gap-6 sm:grid-cols-2">
          {tools.map(({ href, icon: Icon, title, description, badge }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-[#3D2DFF]/50 hover:bg-white/[0.06]"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#3D2DFF]/15 border border-[#3D2DFF]/20 group-hover:bg-[#3D2DFF]/25 transition-colors">
                  <Icon className="h-5 w-5 text-[#7B7BFF]" />
                </div>
                <span className="rounded-full bg-white/8 border border-white/10 px-2.5 py-1 text-xs text-white/50">
                  {badge}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-1.5 group-hover:text-[#7B7BFF] transition-colors">
                  {title}
                </h2>
                <p className="text-sm text-white/50 leading-relaxed">{description}</p>
              </div>
              <div className="mt-auto pt-2 flex items-center text-sm text-[#7B7BFF] font-medium">
                Open tool →
              </div>
            </Link>
          ))}
        </div>

        {benchmarks.length > 0 && (
          <div className="mt-10 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="mb-4 text-base font-semibold text-white">Top European League Benchmarks</h2>
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 text-left text-xs text-white/45">
                <tr>
                  <th className="pb-2.5 font-medium">League</th>
                  <th className="pb-2.5 text-right font-medium">Avg Goals</th>
                  <th className="pb-2.5 text-right font-medium">Home Win %</th>
                  <th className="pb-2.5 text-right font-medium">BTTS %</th>
                  <th className="pb-2.5 text-right font-medium">Over 2.5 %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 tabular-nums">
                {benchmarks.map((b) => (
                  <tr key={b.code}>
                    <td className="py-2.5 font-medium text-white">
                      <Link href={`/stats/results?league=${b.code}`} className="hover:text-[#7B7BFF] hover:underline">
                        {b.name}
                      </Link>
                    </td>
                    <td className="py-2.5 text-right text-white font-semibold">{b.avgGoals.toFixed(2)}</td>
                    <td className="py-2.5 text-right text-white/70">{b.homeWinPct.toFixed(1)}%</td>
                    <td className="py-2.5 text-right text-white/70">{b.bttsPct.toFixed(1)}%</td>
                    <td className="py-2.5 text-right text-white/70">{b.over25Pct.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Data note */}
        <p className="mt-10 text-center text-xs text-white/30 leading-relaxed">
          Data sourced from uploaded CSV datasets. Leagues covered include Premier League,
          Championship, La Liga, Bundesliga, Serie A, Ligue 1, and more.
        </p>
      </div>
    </main>
  );
}
