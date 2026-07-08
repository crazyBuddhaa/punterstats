import { Suspense } from "react";
import { getResults, getLeagues, getSeasons } from "@/lib/historical-stats/queries";
import { ResultsFilters } from "@/components/stats/results-filters";
import { ResultsTable } from "@/components/stats/results-table";

export const metadata = { title: "Match Results | PunterStat" };

interface Props {
  searchParams: Promise<Record<string, string>>;
}

async function ResultsSection({ searchParams }: { searchParams: Record<string, string> }) {
  const league   = searchParams.league   ?? "";
  const season   = searchParams.season   ?? "";
  const team     = searchParams.team     ?? "";
  const result   = searchParams.result   ?? "";
  const page     = Math.max(1, parseInt(searchParams.page ?? "1", 10));

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
  const sp = await searchParams;

  return (
    <main className="min-h-screen bg-[#0f172a] py-10 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <a href="/stats" className="text-sm text-[#7B7BFF] hover:underline mb-2 inline-block">
            ← Stats Centre
          </a>
          <h1 className="text-3xl font-bold text-white">Match Results</h1>
          <p className="mt-1 text-white/50">
            Filter by league, season, or team to explore historical results.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-24 text-white/40 text-sm">
              Loading results…
            </div>
          }
        >
          <ResultsSection searchParams={sp} />
        </Suspense>
      </div>
    </main>
  );
}
