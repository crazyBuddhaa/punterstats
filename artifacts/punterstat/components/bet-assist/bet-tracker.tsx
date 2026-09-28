"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  betProfit,
  BET_STATUSES,
  journalStats,
  STATUS_LABELS,
  type BetStatus,
  type JournalBet,
} from "@/lib/bet-assist/journal";
import { addBet, deleteBet, settleBet } from "@/lib/bet-assist/journal-actions";
import { pct } from "@/lib/bet-assist/calculators";
import { cn } from "@/lib/utils";

export interface TrackerPrefill {
  event?: string;
  selection?: string;
  odds?: string;
  prob?: string;
  bookmaker?: string;
  market?: string;
}

const MARKETS = ["1X2", "Double chance", "Over/Under", "BTTS", "Asian handicap", "Correct score", "Accumulator", "Player prop", "Other"];

const money = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });

function StatTile({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "good" | "bad" }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <p className="text-xs font-medium text-[#1e293b]/55">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-bold tabular-nums text-[#0f172a]",
          tone === "good" && "text-emerald-600",
          tone === "bad" && "text-rose-600",
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-[#1e293b]/50">{sub}</p>}
    </div>
  );
}

function CurveTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 text-xs shadow-md">
      <p className="text-[#1e293b]/50">{label}</p>
      <p className="font-semibold tabular-nums text-[#0f172a]">
        {v >= 0 ? "+" : ""}
        {money(v)}
      </p>
    </div>
  );
}

function AddBetForm({ prefill }: { prefill: TrackerPrefill }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    eventName: prefill.event ?? "",
    selection: prefill.selection ?? "",
    market: prefill.market && MARKETS.includes(prefill.market) ? prefill.market : "1X2",
    bookmaker: prefill.bookmaker ?? "",
    odds: prefill.odds ?? "",
    stake: "",
    yourProb: prefill.prob ?? "",
    notes: "",
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await addBet({
        eventName: form.eventName,
        selection: form.selection,
        market: form.market,
        bookmaker: form.bookmaker || null,
        odds: Number(form.odds),
        stake: Number(form.stake),
        yourProb: form.yourProb.trim() ? Number(form.yourProb) / 100 : null,
        notes: form.notes || null,
      });
      if (!res.success) {
        setError(res.error ?? "Could not save bet");
        return;
      }
      setForm({ eventName: "", selection: "", market: "1X2", bookmaker: "", odds: "", stake: "", yourProb: "", notes: "" });
      router.replace("/dashboard/bet-tracker");
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-[#0f172a]">Log a bet</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs text-[#1e293b]/60">Match / event *</Label>
          <Input required value={form.eventName} onChange={set("eventName")} placeholder="Arsenal v Chelsea" />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs text-[#1e293b]/60">Selection *</Label>
          <Input required value={form.selection} onChange={set("selection")} placeholder="Arsenal to win" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-[#1e293b]/60">Market</Label>
          <select
            value={form.market}
            onChange={set("market")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {MARKETS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-[#1e293b]/60">Bookmaker</Label>
          <Input value={form.bookmaker} onChange={set("bookmaker")} placeholder="Optional" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-[#1e293b]/60">Decimal odds *</Label>
          <Input required inputMode="decimal" value={form.odds} onChange={set("odds")} placeholder="2.10" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-[#1e293b]/60">Stake *</Label>
          <Input required inputMode="decimal" value={form.stake} onChange={set("stake")} placeholder="1000" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-[#1e293b]/60">Your chance % (optional)</Label>
          <Input inputMode="decimal" value={form.yourProb} onChange={set("yourProb")} placeholder="e.g. 52" />
        </div>
        <div className="space-y-1 sm:col-span-2 lg:col-span-3">
          <Label className="text-xs text-[#1e293b]/60">Notes</Label>
          <Input value={form.notes} onChange={set("notes")} placeholder="Why you took it (optional)" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" variant="teal" disabled={pending}>
          {pending ? "Saving…" : "Add bet"}
        </Button>
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>
    </form>
  );
}

function SettleControls({ bet }: { bet: JournalBet }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<BetStatus>(bet.status);
  const [cashout, setCashout] = useState(bet.cashoutAmount?.toString() ?? "");
  const [closing, setClosing] = useState(bet.closingOdds?.toString() ?? "");
  const [error, setError] = useState<string | null>(null);

  const dirty =
    status !== bet.status ||
    (status === "cashed_out" && cashout !== (bet.cashoutAmount?.toString() ?? "")) ||
    closing !== (bet.closingOdds?.toString() ?? "");

  const save = () =>
    start(async () => {
      const res = await settleBet({
        id: bet.id,
        status,
        cashoutAmount: cashout.trim() ? Number(cashout) : null,
        closingOdds: closing.trim() ? Number(closing) : null,
      });
      if (!res.success) setError(res.error ?? "Update failed");
      else {
        setError(null);
        router.refresh();
      }
    });

  const remove = () =>
    start(async () => {
      const res = await deleteBet(bet.id);
      if (res.success) router.refresh();
      else setError(res.error ?? "Delete failed");
    });

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <select
        aria-label="Result"
        value={status}
        onChange={(e) => setStatus(e.target.value as BetStatus)}
        className="h-8 rounded-md border border-input bg-background px-2 text-xs"
      >
        {BET_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      {status === "cashed_out" && (
        <Input className="h-8 w-24 text-xs" placeholder="Cash-out" inputMode="decimal" value={cashout} onChange={(e) => setCashout(e.target.value)} />
      )}
      <Input
        className="h-8 w-20 text-xs"
        placeholder="Close"
        title="Closing odds (optional) — for closing-line value"
        inputMode="decimal"
        value={closing}
        onChange={(e) => setClosing(e.target.value)}
      />
      {dirty && (
        <Button size="sm" variant="teal" className="h-8" disabled={pending} onClick={save}>
          Save
        </Button>
      )}
      <button aria-label="Delete bet" disabled={pending} onClick={remove} className="p-1 text-[#1e293b]/35 hover:text-rose-600">
        <Trash2 className="h-4 w-4" />
      </button>
      {error && <p className="w-full text-right text-xs text-rose-600">{error}</p>}
    </div>
  );
}

export function BetTracker({ bets, prefill }: { bets: JournalBet[]; prefill: TrackerPrefill }) {
  const stats = useMemo(() => journalStats(bets), [bets]);
  const [filter, setFilter] = useState<"all" | "pending" | "settled">("all");
  const visible = bets.filter((b) =>
    filter === "all" ? true : filter === "pending" ? b.status === "pending" : b.status !== "pending",
  );

  return (
    <div className="space-y-8">
      <AddBetForm key={JSON.stringify(prefill)} prefill={prefill} />

      {bets.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile
              label="Profit / loss"
              value={`${stats.profit >= 0 ? "+" : ""}${money(stats.profit)}`}
              sub={`${stats.settledBets} settled · ${money(stats.staked)} staked`}
              tone={stats.profit >= 0 ? "good" : "bad"}
            />
            <StatTile label="ROI" value={`${stats.roi >= 0 ? "+" : ""}${pct(stats.roi)}`} sub="Profit ÷ total staked" tone={stats.roi >= 0 ? "good" : "bad"} />
            <StatTile
              label="Strike rate"
              value={pct(stats.strikeRate)}
              sub={stats.avgOdds ? `Break-even at avg odds ${stats.avgOdds.toFixed(2)}: ${pct(stats.breakEvenRate)}` : undefined}
            />
            <StatTile
              label="Closing-line value"
              value={stats.avgClv === null ? "—" : `${stats.avgClv >= 0 ? "+" : ""}${pct(stats.avgClv)}`}
              sub={stats.clvSamples ? `${stats.clvSamples} bets with closing odds` : "Add closing odds to track"}
              tone={stats.avgClv === null ? undefined : stats.avgClv >= 0 ? "good" : "bad"}
            />
          </div>

          {stats.curve.length >= 2 && (
            <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-[#0f172a]">Cumulative profit</h2>
              <p className="mb-4 text-xs text-[#1e293b]/50">
                After each settled bet · longest losing run: {stats.longestLosingRun}
                {stats.pendingBets > 0 && ` · ${stats.pendingBets} pending (${money(stats.pendingStake)} at stake)`}
              </p>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={stats.curve} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} minTickGap={24} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} width={56} />
                  <ReferenceLine y={0} stroke="#94a3b8" />
                  <Tooltip content={<CurveTooltip />} cursor={{ stroke: "#cbd5e1" }} />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#3D2DFF"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </section>
          )}

          {stats.byMarket.length > 1 && (
            <section className="overflow-x-auto rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h2 className="mb-3 font-semibold text-[#0f172a]">By market</h2>
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-[#1e293b]/50">
                  <tr>
                    <th className="pb-2">Market</th>
                    <th className="pb-2 text-right">Bets</th>
                    <th className="pb-2 text-right">Staked</th>
                    <th className="pb-2 text-right">Profit</th>
                    <th className="pb-2 text-right">ROI</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {stats.byMarket.map((m) => (
                    <tr key={m.market} className="border-t border-border">
                      <td className="py-2">{m.market}</td>
                      <td className="py-2 text-right">{m.bets}</td>
                      <td className="py-2 text-right">{money(m.staked)}</td>
                      <td className={cn("py-2 text-right", m.profit >= 0 ? "text-emerald-600" : "text-rose-600")}>{money(m.profit)}</td>
                      <td className="py-2 text-right">{pct(m.roi)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          <section className="rounded-2xl border border-border bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-6 py-4">
              <h2 className="font-semibold text-[#0f172a]">Your bets</h2>
              <div className="flex gap-1">
                {(["all", "pending", "settled"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium capitalize",
                      filter === f ? "bg-[#3D2DFF] text-white" : "text-[#1e293b]/60 hover:bg-slate-100",
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <ul className="divide-y divide-border">
              {visible.map((b) => {
                const p = betProfit(b);
                return (
                  <li key={b.id} className="grid gap-3 px-6 py-4 md:grid-cols-[1fr_auto] md:items-center">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[#0f172a]">{b.selection}</p>
                      <p className="truncate text-xs text-[#1e293b]/50">
                        {b.eventName} · {b.market}
                        {b.bookmaker && ` · ${b.bookmaker}`} ·{" "}
                        {new Date(b.placedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </p>
                      <p className="mt-1 text-xs tabular-nums text-[#1e293b]/70">
                        {money(b.stake)} @ {b.odds.toFixed(2)}
                        {b.yourProb !== null && ` · your chance ${pct(b.yourProb, 0)}`}
                        {b.status !== "pending" && (
                          <span className={cn("ml-2 font-semibold", p >= 0 ? "text-emerald-600" : "text-rose-600")}>
                            {p >= 0 ? "+" : ""}
                            {money(p)}
                          </span>
                        )}
                      </p>
                    </div>
                    <SettleControls key={`${b.status}-${b.closingOdds}-${b.cashoutAmount}`} bet={b} />
                  </li>
                );
              })}
              {visible.length === 0 && <li className="px-6 py-8 text-center text-sm text-[#1e293b]/50">No bets here.</li>}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
