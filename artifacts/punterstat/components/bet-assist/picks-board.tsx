import Link from "next/link";
import { Lock, NotebookPen, TrendingUp } from "lucide-react";
import type { MatchPick, PickOutcome } from "@/lib/bet-assist/picks";
import { pct } from "@/lib/bet-assist/calculators";
import { cn } from "@/lib/utils";

const CONF_STYLE = {
  high: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-sky-50 text-sky-700 border-sky-200",
  low: "bg-slate-100 text-slate-600 border-slate-200",
} as const;

function kickoff(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  });
}

function trackerHref(m: MatchPick, o: PickOutcome) {
  const q = new URLSearchParams({
    event: `${m.homeTeam} v ${m.awayTeam}`,
    selection: o.outcome === "draw" ? "Draw" : `${o.label} to win`,
    odds: o.bestOdds.toFixed(2),
    prob: (o.modelProb * 100).toFixed(1),
    bookmaker: o.bestBookmaker,
    market: "1X2",
  });
  return `/dashboard/bet-tracker?${q.toString()}`;
}

function ValuePickCard({ m }: { m: MatchPick }) {
  const p = m.pick as PickOutcome;
  return (
    <div className="flex flex-col rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-[#1e293b]/50">{kickoff(m.commenceTime)}</p>
          <p className="mt-0.5 font-semibold text-[#0f172a]">
            {m.homeTeam} <span className="font-normal text-[#1e293b]/40">v</span> {m.awayTeam}
          </p>
        </div>
        <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase", CONF_STYLE[m.confidence])}>
          {m.confidence} confidence
        </span>
      </div>

      <div className="mt-4 rounded-xl bg-emerald-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Value selection</p>
        <p className="mt-1 text-lg font-bold text-[#0f172a]">
          {p.outcome === "draw" ? "Draw" : `${p.label} to win`}
        </p>
        <p className="text-sm text-[#1e293b]/70">
          Best price <strong className="tabular-nums">{p.bestOdds.toFixed(2)}</strong> at {p.bestBookmaker}
        </p>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <dt className="text-[#1e293b]/50">Model chance</dt>
          <dd className="mt-0.5 text-base font-bold tabular-nums text-[#0f172a]">{pct(p.modelProb)}</dd>
        </div>
        <div>
          <dt className="text-[#1e293b]/50">Fair odds</dt>
          <dd className="mt-0.5 text-base font-bold tabular-nums text-[#0f172a]">{p.fairOdds.toFixed(2)}</dd>
        </div>
        <div>
          <dt className="text-[#1e293b]/50">Edge</dt>
          <dd className="mt-0.5 text-base font-bold tabular-nums text-emerald-600">+{pct(p.ev)}</dd>
        </div>
      </dl>

      <p className="mt-3 text-xs text-[#1e293b]/55">
        Suggested stake: <strong>{pct(p.stakePct, 2)}</strong> of bankroll (quarter Kelly, capped at 2%). Loses{" "}
        {pct(1 - p.modelProb, 0)} of the time.
      </p>

      <Link
        href={trackerHref(m, p)}
        className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-[#0f172a] transition hover:border-[#3D2DFF]/40 hover:text-[#3D2DFF]"
      >
        <NotebookPen className="h-3.5 w-3.5" /> Log to Bet Tracker
      </Link>
    </div>
  );
}

function LockedCard({ count }: { count: number }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#3D2DFF]/30 bg-[#3D2DFF]/5 p-6 text-center">
      <Lock className="h-6 w-6 text-[#3D2DFF]" />
      <p className="mt-3 font-semibold text-[#0f172a]">
        {count} more value pick{count > 1 ? "s" : ""}
      </p>
      <p className="mt-1 text-sm text-[#1e293b]/60">Premium members see every value flag across all leagues.</p>
      <Link
        href="/pricing"
        className="mt-4 rounded-lg bg-[#3D2DFF] px-4 py-2 text-sm font-medium text-white hover:bg-[#3D2DFF]/90"
      >
        See plans
      </Link>
    </div>
  );
}

export function PicksBoard({
  picks,
  freeLimit,
}: {
  picks: MatchPick[];
  /** Max value picks to show; null = unlimited. */
  freeLimit: number | null;
}) {
  const valuePicks = picks.filter((p) => p.pick).sort((a, b) => (b.pick?.ev ?? 0) - (a.pick?.ev ?? 0));
  const shown = freeLimit === null ? valuePicks : valuePicks.slice(0, freeLimit);
  const hidden = valuePicks.length - shown.length;

  return (
    <div className="space-y-10">
      <section>
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-600" />
          <h2 className="text-xl font-bold text-[#0f172a]">Value picks</h2>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            {valuePicks.length}
          </span>
        </div>
        {valuePicks.length === 0 ? (
          <p className="rounded-2xl border border-border bg-white p-6 text-sm text-[#1e293b]/60">
            No prices currently beat the model by the 2% threshold in this league. That&apos;s normal — most markets
            are efficient most of the time. Check back closer to kick-off or try another league.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((m) => (
              <ValuePickCard key={m.eventId} m={m} />
            ))}
            {hidden > 0 && <LockedCard count={hidden} />}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-1 text-xl font-bold text-[#0f172a]">All fixtures — model probabilities</h2>
        <p className="mb-4 text-sm text-[#1e293b]/60">
          Model chance for each outcome, with the best available price in brackets. Green = price above fair value.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-[#f8fafc] text-left text-xs text-[#1e293b]/50">
              <tr>
                <th className="px-4 py-3">Fixture</th>
                <th className="px-3 py-3 text-center">Home</th>
                <th className="px-3 py-3 text-center">Draw</th>
                <th className="px-3 py-3 text-center">Away</th>
                <th className="px-3 py-3 text-right">Books</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {picks.map((m) => (
                <tr key={m.eventId} className="border-t border-border">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#0f172a]">
                      {m.homeTeam} v {m.awayTeam}
                    </p>
                    <p className="text-xs text-[#1e293b]/45">
                      {kickoff(m.commenceTime)}
                      {m.usedRatings && " · form model blended"}
                    </p>
                  </td>
                  {m.outcomes.map((o) => (
                    <td key={o.outcome} className="px-3 py-3 text-center">
                      <span
                        className={cn(
                          "inline-block rounded-md px-2 py-1",
                          o.ev >= 0.02 && m.pick ? "bg-emerald-50 font-semibold text-emerald-700" : "text-[#0f172a]",
                          m.favourite.outcome === o.outcome && "ring-1 ring-[#3D2DFF]/30",
                        )}
                      >
                        {pct(o.modelProb, 0)}
                        <span className="ml-1 text-xs text-[#1e293b]/45">({o.bestOdds.toFixed(2)})</span>
                      </span>
                    </td>
                  ))}
                  <td className="px-3 py-3 text-right text-xs text-[#1e293b]/50">
                    {m.bookmakerCount}
                    <span className="block">margin {pct(m.avgMargin)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
