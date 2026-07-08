import Link from "next/link";
import { BarChart2, GitCompare, Database } from "lucide-react";

export const metadata = { title: "Historical Stats | PunterStat" };

const tools = [
  {
    href: "/stats/results",
    icon: BarChart2,
    title: "Match Results Browser",
    description:
      "Browse 20+ years of match results across European leagues. Filter by league, season, team, or result to find exactly what you need.",
    badge: "20+ years of data",
  },
  {
    href: "/stats/head-to-head",
    icon: GitCompare,
    title: "Head-to-Head Stats",
    description:
      "Compare any two teams across their full historical record. See wins, goals, form trends, and every meeting between them.",
    badge: "All-time records",
  },
];

export default function StatsPage() {
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
            the Bundesliga, with ELO ratings, market odds, and calibrated probabilities.
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

        {/* Data note */}
        <p className="mt-10 text-center text-xs text-white/30 leading-relaxed">
          Data sourced from uploaded CSV datasets. Leagues covered include Premier League,
          Championship, La Liga, Bundesliga, Serie A, Ligue 1, and more.
        </p>
      </div>
    </main>
  );
}
