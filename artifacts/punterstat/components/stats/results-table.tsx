import Link from "next/link";
import type { HistoricalMatch } from "@/lib/historical-stats/types";

interface Props {
  matches: HistoricalMatch[];
  total: number;
  page: number;
  totalPages: number;
  baseHref: string;
}

function ResultBadge({ result }: { result: string | null }) {
  if (!result) return <span className="text-slate-300">—</span>;
  const cls =
    result === "H"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : result === "A"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-slate-100 text-slate-600 border-slate-200";
  const label = result === "H" ? "H" : result === "A" ? "A" : "D";
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${cls}`}>
      {label}
    </span>
  );
}

function ScoreCell({ home, away }: { home: number | null; away: number | null }) {
  if (home === null || away === null) return <span className="text-slate-300">—</span>;
  return (
    <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 tabular-nums font-bold text-slate-900">
      {home} – {away}
    </span>
  );
}

export function ResultsTable({ matches, total, page, totalPages, baseHref }: Props) {
  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
        <p className="text-sm font-medium text-slate-700">No matches found</p>
        <p className="mt-1 text-xs text-slate-500">
          Try selecting a team from the autocomplete list or broadening your league/season filters.
        </p>
      </div>
    );
  }

  function pageHref(p: number) {
    const u = new URL(baseHref, "http://x");
    u.searchParams.set("page", String(p));
    return `${u.pathname}?${u.searchParams.toString()}`;
  }

  return (
    <div className="space-y-4">
      {/* Count */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <p>
          Showing <span className="font-semibold text-slate-900">{(page - 1) * 25 + 1}–{Math.min(page * 25, total)}</span> of{" "}
          <span className="font-semibold text-slate-900">{total.toLocaleString()}</span> matches
        </p>
        {totalPages > 1 && (
          <p>
            Page {page} of {totalPages.toLocaleString()}
          </p>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 text-left whitespace-nowrap">Date</th>
              <th className="px-4 py-3 text-left">League</th>
              <th className="px-4 py-3 text-left">Season</th>
              <th className="px-4 py-3 text-right">Home</th>
              <th className="px-4 py-3 text-center">FT</th>
              <th className="px-4 py-3 text-center">Res</th>
              <th className="px-4 py-3 text-center">HT</th>
              <th className="px-4 py-3 text-left">Away</th>
              <th className="px-4 py-3 text-center whitespace-nowrap">Odds H / D / A</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {matches.map((m) => (
              <tr
                key={m.id}
                className="transition-colors hover:bg-slate-50/80"
              >
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap tabular-nums">
                  {new Date(m.match_date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] font-mono font-medium text-slate-600">
                    {m.league_code}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{m.season}</td>
                <td className="px-4 py-3 text-right font-semibold text-slate-900">{m.home_team}</td>
                <td className="px-4 py-3 text-center">
                  <ScoreCell home={m.home_goals} away={m.away_goals} />
                </td>
                <td className="px-4 py-3 text-center">
                  <ResultBadge result={m.result} />
                </td>
                <td className="px-4 py-3 text-center text-xs text-slate-400 tabular-nums">
                  {m.ht_home_goals !== null && m.ht_away_goals !== null
                    ? `${m.ht_home_goals}–${m.ht_away_goals}`
                    : "—"}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-900">{m.away_team}</td>
                <td className="px-4 py-3 text-center text-xs tabular-nums text-slate-500 whitespace-nowrap">
                  {m.avg_home_odds && m.avg_draw_odds && m.avg_away_odds
                    ? `${m.avg_home_odds.toFixed(2)} / ${m.avg_draw_odds.toFixed(2)} / ${m.avg_away_odds.toFixed(2)}`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          {page > 1 ? (
            <Link
              href={pageHref(page - 1)}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              ← Previous
            </Link>
          ) : (
            <span className="rounded-lg border border-slate-100 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-300">
              ← Previous
            </span>
          )}
          <span className="text-xs font-medium text-slate-500 tabular-nums">
            Page {page} of {totalPages.toLocaleString()}
          </span>
          {page < totalPages ? (
            <Link
              href={pageHref(page + 1)}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Next →
            </Link>
          ) : (
            <span className="rounded-lg border border-slate-100 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-300">
              Next →
            </span>
          )}
        </div>
      )}
    </div>
  );
}
