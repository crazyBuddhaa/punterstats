import { Suspense } from "react";
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
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <p className="text-[11px] text-white/45">{s.label}</p>
              <p className="mt-0.5 text-lg font-bold tabular-nums text-white">{s.value}</p>
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
    <main className={isLoggedIn ? "rounded-2xl bg-[#0f172a] p-5 sm:p-6 shadow-sm" : "min-h-screen bg-[#0f172a] py-10 px-4"}>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <a href="/stats" className="text-sm text-[#7B7BFF] hover:underline mb-2 inline-block">
            ← Stats Centre
          </a>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Match Results</h1>
          <p className="mt-1 text-sm text-white/50">
            Filter by league, season, or team to explore historical results and goal trends.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-24 text-white/40 text-sm">
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
