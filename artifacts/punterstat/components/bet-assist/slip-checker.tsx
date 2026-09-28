"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { assessSlip, type SlipAssessment, type SlipRisk } from "@/lib/bet-assist/slip";
import { pct } from "@/lib/bet-assist/calculators";
import { cn } from "@/lib/utils";

interface LegDraft {
  event: string;
  selection: string;
  odds: string;
  yourProb: string;
}

const EMPTY_LEG: LegDraft = { event: "", selection: "", odds: "", yourProb: "" };

const SAMPLE: LegDraft[] = [
  { event: "Arsenal v Everton", selection: "Arsenal to win", odds: "1.30", yourProb: "" },
  { event: "Chelsea v Fulham", selection: "Chelsea to win", odds: "1.55", yourProb: "" },
  { event: "Liverpool v Brentford", selection: "Over 2.5 goals", odds: "1.62", yourProb: "" },
  { event: "Newcastle v Wolves", selection: "Newcastle to win", odds: "1.70", yourProb: "" },
];

const RISK_STYLE: Record<SlipRisk, { label: string; className: string; blurb: string }> = {
  low: { label: "Low risk", className: "bg-emerald-50 text-emerald-700 border-emerald-200", blurb: "More likely to win than lose." },
  moderate: { label: "Moderate risk", className: "bg-sky-50 text-sky-700 border-sky-200", blurb: "Wins roughly one time in two to four." },
  high: { label: "High risk", className: "bg-amber-50 text-amber-800 border-amber-200", blurb: "Expect to lose this most of the time." },
  very_high: { label: "Very high risk", className: "bg-rose-50 text-rose-700 border-rose-200", blurb: "A long shot — it will usually lose." },
};

function Metric({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "good" | "bad" }) {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#1e293b]/50">{label}</p>
      <p
        className={cn(
          "mt-1 text-xl font-bold tabular-nums text-[#0f172a]",
          tone === "good" && "text-emerald-600",
          tone === "bad" && "text-rose-600",
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[11px] text-[#1e293b]/50">{sub}</p>}
    </div>
  );
}

export function SlipChecker() {
  const [legs, setLegs] = useState<LegDraft[]>([{ ...EMPTY_LEG }, { ...EMPTY_LEG }]);
  const [stake, setStake] = useState("1000");
  const [result, setResult] = useState<SlipAssessment | null>(null);
  const [error, setError] = useState<string | null>(null);

  const update = (i: number, patch: Partial<LegDraft>) => {
    setLegs(legs.map((l, j) => (j === i ? { ...l, ...patch } : l)));
    setResult(null);
  };

  const check = () => {
    const parsed = legs
      .filter((l) => l.odds.trim() !== "")
      .map((l) => ({
        selection: l.selection.trim() || "Selection",
        event: l.event.trim() || undefined,
        decimalOdds: Number(l.odds),
        yourProb: l.yourProb.trim() ? Number(l.yourProb) / 100 : null,
      }));
    if (parsed.some((l) => !(l.decimalOdds > 1))) {
      setError("Every leg needs decimal odds greater than 1.00.");
      return;
    }
    const r = assessSlip(parsed, Number(stake));
    if (!r) {
      setError("Add at least one leg with odds and a stake above 0.");
      return;
    }
    setError(null);
    setResult(r);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      {/* Input */}
      <div className="space-y-4 rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[#0f172a]">Your slip</h2>
          <button
            className="text-xs font-medium text-[#3D2DFF] hover:underline"
            onClick={() => {
              setLegs(SAMPLE.map((l) => ({ ...l })));
              setResult(null);
            }}
          >
            Load example acca
          </button>
        </div>

        {legs.map((l, i) => (
          <div key={i} className="rounded-xl border border-border bg-[#f8fafc] p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold text-[#1e293b]/60">Leg {i + 1}</p>
              {legs.length > 1 && (
                <button
                  aria-label={`Remove leg ${i + 1}`}
                  className="text-[#1e293b]/40 hover:text-rose-600"
                  onClick={() => {
                    setLegs(legs.filter((_, j) => j !== i));
                    setResult(null);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-[11px] text-[#1e293b]/60">Match / event</Label>
                <Input value={l.event} placeholder="Arsenal v Everton" onChange={(e) => update(i, { event: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-[#1e293b]/60">Selection</Label>
                <Input value={l.selection} placeholder="Arsenal to win" onChange={(e) => update(i, { selection: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-[#1e293b]/60">Decimal odds</Label>
                <Input inputMode="decimal" value={l.odds} placeholder="1.80" onChange={(e) => update(i, { odds: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-[#1e293b]/60">Your chance % (optional)</Label>
                <Input inputMode="decimal" value={l.yourProb} placeholder="e.g. 60" onChange={(e) => update(i, { yourProb: e.target.value })} />
              </div>
            </div>
          </div>
        ))}

        {legs.length < 20 && (
          <Button variant="outline" size="sm" onClick={() => setLegs([...legs, { ...EMPTY_LEG }])}>
            <Plus className="mr-1 h-4 w-4" /> Add leg
          </Button>
        )}

        <div className="flex items-end gap-3 border-t border-border pt-4">
          <div className="flex-1 space-y-1">
            <Label className="text-[11px] text-[#1e293b]/60">Stake</Label>
            <Input inputMode="decimal" value={stake} onChange={(e) => { setStake(e.target.value); setResult(null); }} />
          </div>
          <Button variant="teal" onClick={check}>
            Check slip
          </Button>
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>

      {/* Result */}
      <div className="space-y-4">
        {!result ? (
          <div className="flex h-full min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-border bg-white p-8 text-center text-sm text-[#1e293b]/50">
            Enter your legs and press <strong className="mx-1">Check slip</strong> to see what the price really
            implies.
          </div>
        ) : (
          <>
            <div className={cn("rounded-2xl border p-5", RISK_STYLE[result.risk].className)}>
              <p className="text-lg font-bold">{RISK_STYLE[result.risk].label}</p>
              <p className="text-sm opacity-80">
                {RISK_STYLE[result.risk].blurb}{" "}
                {Number.isFinite(result.oneWinEvery) && result.oneWinEvery > 1 && (
                  <>Expect it to land about <strong>1 time in {result.oneWinEvery}</strong>.</>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Metric label="Combined odds" value={result.combinedOdds.toFixed(2)} />
              <Metric
                label="Potential return"
                value={result.potentialReturn.toLocaleString()}
                sub={`Profit ${result.potentialProfit.toLocaleString()}`}
              />
              <Metric label="Price implies" value={pct(result.impliedProb, 2)} sub="1 ÷ combined odds" />
              <Metric
                label={result.evSource === "yours" ? "Your estimate" : "Est. true chance"}
                value={pct(result.yourProb ?? result.fairProb, 2)}
                sub={result.evSource === "yours" ? "From your leg probabilities" : "After removing ~5% margin per leg"}
              />
              <Metric
                label="Expected value"
                value={`${result.ev >= 0 ? "+" : ""}${pct(result.ev)}`}
                sub={`≈ ${result.expectedReturnOnStake.toLocaleString()} per slip on average`}
                tone={result.ev >= 0 ? "good" : "bad"}
              />
              <Metric label="Margin you're paying" value={pct(result.compoundedMargin)} sub={`${result.legs.length} leg${result.legs.length > 1 ? "s" : ""} compounded`} tone={result.compoundedMargin > 0.15 ? "bad" : undefined} />
            </div>

            {result.warnings.length > 0 && (
              <div className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                {result.warnings.map((w) => (
                  <p key={w} className="flex gap-2 text-sm text-amber-900">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    {w}
                  </p>
                ))}
              </div>
            )}
            {result.positives.length > 0 && (
              <div className="space-y-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                {result.positives.map((w) => (
                  <p key={w} className="flex gap-2 text-sm text-emerald-900">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    {w}
                  </p>
                ))}
              </div>
            )}

            <div className="overflow-x-auto rounded-2xl border border-border bg-white p-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-[#1e293b]/50">
                    <th className="pb-2">Leg</th>
                    <th className="pb-2 text-right">Odds</th>
                    <th className="pb-2 text-right">Implied</th>
                    <th className="pb-2 text-right">Your EV</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {result.legs.map((l, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="py-2">
                        <p className="font-medium text-[#0f172a]">{l.selection}</p>
                        {l.event && <p className="text-xs text-[#1e293b]/50">{l.event}</p>}
                      </td>
                      <td className="py-2 text-right">{l.decimalOdds.toFixed(2)}</td>
                      <td className="py-2 text-right">{pct(l.impliedProb)}</td>
                      <td className={cn("py-2 text-right", l.ev !== null && (l.ev >= 0 ? "text-emerald-600" : "text-rose-600"))}>
                        {l.ev === null ? "—" : `${l.ev >= 0 ? "+" : ""}${pct(l.ev)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-[#1e293b]/50">
              Placing this bet?{" "}
              <Link href="/dashboard/bet-tracker" className="font-medium text-[#3D2DFF] hover:underline">
                Log it in your Bet Tracker
              </Link>{" "}
              to measure your real results over time.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
