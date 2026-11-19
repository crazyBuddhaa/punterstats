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
  if (!result) return <span className="text-slate-400">—</span>;
  const cls =
    result === "H"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : result === "A"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-slate-100 text-slate-600 border-slate-200";
  const label = result === "H" ? "H" : result === "A" ? "A" : "D";
  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

function ScoreCell({ home, away }: { home: number | null; away: number | null }) {
  if (home === null || away === null) return <span className="text-slate-400">—</span>;
  return (
    <span className="font-bold tabular-nums text-slate-950">
      {home} – {away}
    </span>
  );
}

export function ResultsTable({ matches, total, page, totalPages, baseHref }: Props) {
  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-sm text-slate-500 shadow-sm">
        <span className="mb-3 text-3xl">⚽</span>
        No matches found. Try adjusting your filters.
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
      <p className="text-sm text-slate-500">
        Showing {(page - 1) * 25 + 1}–{Math.min(page * 25, total)} of{" "}
        <span className="font-semibold text-slate-900">{total.toLocaleString()}</span> matches
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-600">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">League</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Season</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600">Home</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-600">FT</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-600">Res</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-600">HT</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Away</th>
              <th className="whitespace-nowrap px-4 py-3 text-center font-semibold text-slate-600">Odds H/D/A</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {matches.map((m) => (
              <tr
                key={m.id}
                className="transition-colors hover:bg-slate-50/70"
              >
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-600">
                  {new Date(m.match_date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                  <span className="inline-flex items-center rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-xs text-slate-600">
                    {m.league_code}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{m.season}</td>
                <td className="px-4 py-3 text-right font-medium text-slate-900">{m.home_team}</td>
                <td className="px-4 py-3 text-center">
                  <ScoreCell home={m.home_goals} away={m.away_goals} />
                </td>
                <td className="px-4 py-3 text-center">
                  <ResultBadge result={m.result} />
                </td>
                <td className="px-4 py-3 text-center text-xs tabular-nums text-slate-500">
                  {m.ht_home_goals !== null && m.ht_away_goals !== null
                    ? `${m.ht_home_goals}–${m.ht_away_goals}`
                    : "—"}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{m.away_team}</td>
                <td className="whitespace-nowrap px-4 py-3 text-center text-xs tabular-nums text-slate-500">
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
        <div className="flex items-center justify-center gap-2 pt-2">
          {page > 1 && (
            <Link
              href={pageHref(page - 1)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={pageHref(page + 1)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
