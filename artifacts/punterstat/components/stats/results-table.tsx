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
  if (!result) return <span className="text-white/30">—</span>;
  const cls =
    result === "H"
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
      : result === "A"
      ? "bg-red-500/15 text-red-400 border-red-500/30"
      : "bg-white/10 text-white/60 border-white/20";
  const label = result === "H" ? "H" : result === "A" ? "A" : "D";
  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

function ScoreCell({ home, away }: { home: number | null; away: number | null }) {
  if (home === null || away === null) return <span className="text-white/30">—</span>;
  return (
    <span className="tabular-nums font-bold text-white">
      {home} – {away}
    </span>
  );
}

export function ResultsTable({ matches, total, page, totalPages, baseHref }: Props) {
  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/40 text-sm">
        <span className="text-4xl mb-3">⚽</span>
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
      <p className="text-sm text-white/40">
        Showing {(page - 1) * 25 + 1}–{Math.min(page * 25, total)} of{" "}
        <span className="text-white/70">{total.toLocaleString()}</span> matches
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03]">
              <th className="px-4 py-3 text-left font-medium text-white/50 whitespace-nowrap">Date</th>
              <th className="px-4 py-3 text-left font-medium text-white/50">League</th>
              <th className="px-4 py-3 text-left font-medium text-white/50">Season</th>
              <th className="px-4 py-3 text-right font-medium text-white/50">Home</th>
              <th className="px-4 py-3 text-center font-medium text-white/50">FT</th>
              <th className="px-4 py-3 text-center font-medium text-white/50">Res</th>
              <th className="px-4 py-3 text-center font-medium text-white/50">HT</th>
              <th className="px-4 py-3 text-left font-medium text-white/50">Away</th>
              <th className="px-4 py-3 text-center font-medium text-white/50 whitespace-nowrap">Odds H/D/A</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {matches.map((m) => (
              <tr
                key={m.id}
                className="hover:bg-white/[0.03] transition-colors"
              >
                <td className="px-4 py-3 text-white/60 whitespace-nowrap tabular-nums">
                  {new Date(m.match_date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 text-white/70 whitespace-nowrap">
                  <span className="inline-flex items-center rounded bg-white/8 border border-white/10 px-1.5 py-0.5 text-xs font-mono text-white/60">
                    {m.league_code}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/50 whitespace-nowrap text-xs">{m.season}</td>
                <td className="px-4 py-3 text-right font-medium text-white">{m.home_team}</td>
                <td className="px-4 py-3 text-center">
                  <ScoreCell home={m.home_goals} away={m.away_goals} />
                </td>
                <td className="px-4 py-3 text-center">
                  <ResultBadge result={m.result} />
                </td>
                <td className="px-4 py-3 text-center text-xs text-white/40 tabular-nums">
                  {m.ht_home_goals !== null && m.ht_away_goals !== null
                    ? `${m.ht_home_goals}–${m.ht_away_goals}`
                    : "—"}
                </td>
                <td className="px-4 py-3 font-medium text-white">{m.away_team}</td>
                <td className="px-4 py-3 text-center text-xs tabular-nums text-white/50 whitespace-nowrap">
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
              className="rounded-md border border-white/10 px-3 py-1.5 text-sm text-white/60 hover:bg-white/8 hover:text-white transition-colors"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-white/40">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={pageHref(page + 1)}
              className="rounded-md border border-white/10 px-3 py-1.5 text-sm text-white/60 hover:bg-white/8 hover:text-white transition-colors"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
