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

  return (
    <main className={isLoggedIn ? "space-y-6 py-2" : "min-h-screen bg-[#f8fafc] px-4 py-12 sm:py-16"}>
      <div className={isLoggedIn ? "space-y-6" : "mx-auto max-w-4xl space-y-8"}>
        {/* Header */}
        <div className={isLoggedIn ? "" : "text-center"}>
          {!isLoggedIn && (
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-semibold text-teal-800">
              <Database className="h-3.5 w-3.5" />
              Historical Data
            </div>
          )}
          <h1
            className={
              isLoggedIn
                ? "text-xl font-bold text-slate-950 sm:text-2xl"
                : "text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl"
            }
          >
            Stats Centre
          </h1>
          <p
            className={
              isLoggedIn
                ? "mt-1 text-xs text-slate-500"
                : "mx-auto mt-3 max-w-xl text-base leading-relaxed text-slate-600"
            }
          >
            Explore two decades of European football results — from the Premier League to
            the Bundesliga, with BTTS, Over 2.5, ELO ratings, and historical market odds.
          </p>
        </div>

        {/* Tool cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {tools.map(({ href, icon: Icon, title, description, badge }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col gap-3.5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-200 bg-teal-50 text-teal-700">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                  {badge}
                </span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-950 transition-colors group-hover:text-teal-700">
                  {title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{description}</p>
              </div>
              <div className="mt-auto pt-1 text-xs font-semibold text-teal-700">
                Open tool →
              </div>
            </Link>
          ))}
        </div>

        {benchmarks.length > 0 && (
          <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-semibold text-slate-950">Top European League Benchmarks</h2>
              <span className="text-xs text-slate-500">Recent matches from historical dataset</span>
            </div>
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 text-left text-xs text-slate-500">
                <tr>
                  <th className="pb-2.5 font-medium">League</th>
                  <th className="pb-2.5 text-right font-medium">Sample</th>
                  <th className="pb-2.5 text-right font-medium">Avg Goals</th>
                  <th className="pb-2.5 text-right font-medium">Home Win %</th>
                  <th className="pb-2.5 text-right font-medium">BTTS %</th>
                  <th className="pb-2.5 text-right font-medium">Over 2.5 %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 tabular-nums">
                {benchmarks.map((b) => (
                  <tr key={b.code} className="hover:bg-slate-50/70">
                    <td className="py-2.5 font-medium text-slate-900">
                      <Link href={`/stats/results?league=${b.code}`} className="hover:text-teal-700 hover:underline">
                        {b.name}
                      </Link>
                    </td>
                    <td className="py-2.5 text-right text-xs text-slate-500">{b.matches.toLocaleString()}</td>
                    <td className="py-2.5 text-right font-semibold text-slate-950">{b.avgGoals.toFixed(2)}</td>
                    <td className="py-2.5 text-right text-slate-700">{b.homeWinPct.toFixed(1)}%</td>
                    <td className="py-2.5 text-right text-slate-700">{b.bttsPct.toFixed(1)}%</td>
                    <td className="py-2.5 text-right text-slate-700">{b.over25Pct.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {!isLoggedIn && (
          <p className="text-center text-xs leading-relaxed text-slate-400">
            Leagues covered include Premier League, Championship, La Liga, Bundesliga, Serie A, Ligue 1, and more.
          </p>
        )}
      </div>
    </main>
  );
}
