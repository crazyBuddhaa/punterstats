import { Suspense } from "react";
import Link from "next/link";
import { getResults, getLeagues, getSeasons } from "@/lib/historical-stats/queries";
import { ResultsFilters } from "@/components/stats/results-filters";
import { ResultsTable } from "@/components/stats/results-table";

export const metadata = { title: "Match Results | PunterStat" };

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstString(value: string | string[] | undefined): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
}

async function ResultsSection({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp       = await searchParams;
  const league   = firstString(sp.league);
  const season   = firstString(sp.season);
  const team     = firstString(sp.team);
  const result   = firstString(sp.result);
  const page     = Math.max(1, parseInt(firstString(sp.page) || "1", 10));

  const [paged, leagues, seasons] = await Promise.all([
    getResults(
      {
        league: league || undefined,
        season: season || undefined,
        team:   team   || undefined,
        result: (result as "H" | "D" | "A") || undefined,
      },
      page,
      25
    ),
    getLeagues(),
    getSeasons(league || undefined),
  ]);

  const current = new URLSearchParams({
    ...(league ? { league } : {}),
    ...(season ? { season } : {}),
    ...(team   ? { team   } : {}),
    ...(result ? { result } : {}),
  });

  const withGoals = paged.data.filter((m) => m.home_goals !== null && m.away_goals !== null);
  const sampleStats =
    withGoals.length > 0
      ? {
          avgGoals: (
            withGoals.reduce((s, m) => s + m.home_goals! + m.away_goals!, 0) / withGoals.length
          ).toFixed(2),
          bttsPct: Math.round(
            (withGoals.filter((m) => m.home_goals! > 0 && m.away_goals! > 0).length / withGoals.length) * 100,
          ),
          over15Pct: Math.round(
            (withGoals.filter((m) => m.home_goals! + m.away_goals! >= 2).length / withGoals.length) * 100,
          ),
          over25Pct: Math.round(
            (withGoals.filter((m) => m.home_goals! + m.away_goals! >= 3).length / withGoals.length) * 100,
          ),
        }
      : null;

  return (
    <div className="space-y-6">
      <ResultsFilters
        leagues={leagues}
        seasons={seasons}
        selectedLeague={league}
        selectedSeason={season}
        selectedTeam={team}
        selectedResult={result}
      />
      {sampleStats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "BTTS (this page)", value: `${sampleStats.bttsPct}%` },
            { label: "Over 1.5 Goals", value: `${sampleStats.over15Pct}%` },
            { label: "Over 2.5 Goals", value: `${sampleStats.over25Pct}%` },
            { label: "Avg Goals / Match", value: sampleStats.avgGoals },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-[11px] font-medium text-slate-500">{s.label}</p>
              <p className="mt-0.5 text-lg font-bold tabular-nums text-slate-950">{s.value}</p>
            </div>
          ))}
        </div>
      )}
      <ResultsTable
        matches={paged.data}
        total={paged.total}
        page={paged.page}
        totalPages={paged.totalPages}
        baseHref={`/stats/results?${current.toString()}`}
      />
    </div>
  );
}

export default async function ResultsPage({ searchParams }: Props) {
  const { getUserProfile } = await import("@/lib/auth/helpers");
  const profile = await getUserProfile();
  const isLoggedIn = Boolean(profile);

  return (
    <main className={isLoggedIn ? "space-y-6 py-2" : "min-h-screen bg-[#f8fafc] px-4 py-10"}>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/stats" className="mb-2 inline-block text-xs font-semibold text-teal-700 hover:underline">
            ← Stats Centre
          </Link>
          <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">Match Results</h1>
          <p className="mt-1 text-sm text-slate-600">
            Filter by league, season, or team to explore historical results and goal trends.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-24 text-sm text-slate-500">
              Loading results…
            </div>
          }
        >
          <ResultsSection searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
