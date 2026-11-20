"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  accumulator,
  arbitrage,
  convertOdds,
  expectedValue,
  kellyStake,
  marketMargin,
  pct,
  type OddsFormat,
} from "@/lib/bet-assist/calculators";
import { cn } from "@/lib/utils";

const num = (s: string) => {
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
};

const naira = (n: number) =>
  `${n < 0 ? "-" : ""}₦${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

function Field({
  label,
  hint,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-[#1e293b]/70">{label}</Label>
      <Input inputMode="decimal" {...props} />
      {hint && <p className="text-[11px] text-[#1e293b]/45">{hint}</p>}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" | "neutral" }) {
  return (
    <div className="rounded-xl border border-border bg-[#f8fafc] p-4">
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
    </div>
  );
}

function Panel({ children, explainer }: { children: React.ReactNode; explainer: React.ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-6 rounded-2xl border border-border bg-white p-6 shadow-sm">{children}</div>
      <aside className="rounded-2xl border border-[#3D2DFF]/15 bg-[#3D2DFF]/5 p-5 text-sm leading-relaxed text-[#1e293b]/70">
        {explainer}
      </aside>
    </div>
  );
}

// ── Odds converter ───────────────────────────────────────────────────────────

function OddsConverter() {
  const [format, setFormat] = useState<OddsFormat>("decimal");
  const [value, setValue] = useState("2.50");
  const out = convertOdds(value, format);

  return (
    <Panel
      explainer={
        <>
          <p className="font-semibold text-[#0f172a]">Implied probability</p>
          <p className="mt-1">
            Every price is a probability in disguise: <strong>1 ÷ decimal odds</strong>. Odds of 2.50 imply 40%. If
            you think the real chance is higher than that, the price may be value.
          </p>
        </>
      }
    >
      <div className="flex flex-wrap gap-2">
        {(["decimal", "fractional", "american"] as OddsFormat[]).map((f) => (
          <button
            key={f}
            onClick={() => {
              if (out) setValue(f === "decimal" ? String(out.decimal) : f === "fractional" ? out.fractional : out.american);
              setFormat(f);
            }}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium capitalize transition",
              format === f
                ? "border-[#3D2DFF] bg-[#3D2DFF] text-white"
                : "border-border text-[#1e293b]/60 hover:border-[#3D2DFF]/40",
            )}
          >
            {f}
          </button>
        ))}
      </div>
      <Field
        label={`Odds (${format})`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        hint={format === "fractional" ? "e.g. 6/4" : format === "american" ? "e.g. +150 or -200" : "e.g. 2.50"}
      />
      {out ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Decimal" value={out.decimal.toFixed(2)} />
          <Stat label="Fractional" value={out.fractional} />
          <Stat label="American" value={out.american} />
          <Stat label="Implied chance" value={pct(out.impliedProb)} />
        </div>
      ) : (
        <p className="text-sm text-rose-600">Enter valid odds.</p>
      )}
    </Panel>
  );
}

// ── Margin & fair odds ───────────────────────────────────────────────────────

function MarginCalc() {
  const [odds, setOdds] = useState(["2.10", "3.40", "3.60"]);
  const res = marketMargin(odds.map(num));

  return (
    <Panel
      explainer={
        <>
          <p className="font-semibold text-[#0f172a]">The overround</p>
          <p className="mt-1">
            Add up the implied probabilities of every outcome and you get more than 100%. The excess is the
            bookmaker&apos;s margin. Removing it gives the <strong>fair odds</strong> — the price with no house edge.
            Compare SportyBet, Bet9ja, and Pinnacle here to see which book charges less vig.
          </p>
        </>
      }
    >
      <div className="space-y-3">
        {odds.map((o, i) => (
          <div key={i} className="flex items-end gap-2">
            <div className="flex-1">
              <Field
                label={`Outcome ${i + 1} odds`}
                value={o}
                onChange={(e) => setOdds(odds.map((x, j) => (j === i ? e.target.value : x)))}
              />
            </div>
            {odds.length > 2 && (
              <Button variant="ghost" size="icon" aria-label="Remove outcome" onClick={() => setOdds(odds.filter((_, j) => j !== i))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        {odds.length < 6 && (
          <Button variant="outline" size="sm" onClick={() => setOdds([...odds, ""])}>
            <Plus className="mr-1 h-4 w-4" /> Add outcome
          </Button>
        )}
      </div>
      {res ? (
        <>
          <Stat label="Bookmaker margin" value={pct(res.margin, 2)} tone={res.margin > 0.07 ? "bad" : "neutral"} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[#1e293b]/50">
                  <th className="py-2">Outcome</th>
                  <th className="py-2 text-right">Offered</th>
                  <th className="py-2 text-right">Fair chance</th>
                  <th className="py-2 text-right">Fair odds</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {odds.map((o, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="py-2">Outcome {i + 1}</td>
                    <td className="py-2 text-right">{num(o).toFixed(2)}</td>
                    <td className="py-2 text-right">{pct(res.fairProbs[i])}</td>
                    <td className="py-2 text-right font-semibold">{res.fairOdds[i].toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="text-sm text-rose-600">Enter odds greater than 1.00 for every outcome.</p>
      )}
    </Panel>
  );
}

// ── EV & Kelly ───────────────────────────────────────────────────────────────

function KellyCalc() {
  const [odds, setOdds] = useState("2.20");
  const [prob, setProb] = useState("50");
  const [bankroll, setBankroll] = useState("100000");
  const [mult, setMult] = useState(0.25);

  const o = num(odds);
  const p = num(prob) / 100;
  const br = num(bankroll);
  const valid = o > 1 && p > 0 && p < 1 && br > 0;
  const ev = valid ? expectedValue(p, o) : 0;
  const k = valid ? kellyStake(p, o, br, mult) : null;

  return (
    <Panel
      explainer={
        <>
          <p className="font-semibold text-[#0f172a]">Kelly maths (illustrative, not advice)</p>
          <p className="mt-1">
            The Kelly formula calculates a theoretical bankroll fraction proportional to an estimated edge. Full Kelly
            is aggressive and assumes your probability is exact — in theory, <strong>quarter or half Kelly</strong>{" "}
            reduces variance from estimation error. All outputs are illustrative, not advice.
          </p>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Decimal odds" value={odds} onChange={(e) => setOdds(e.target.value)} />
        <Field label="Your win probability (%)" value={prob} onChange={(e) => setProb(e.target.value)} />
        <Field label="Bankroll (₦)" value={bankroll} onChange={(e) => setBankroll(e.target.value)} />
      </div>
      <div className="flex flex-wrap gap-2">
        {[
          { v: 1, l: "Full Kelly" },
          { v: 0.5, l: "Half" },
          { v: 0.25, l: "Quarter" },
          { v: 0.1, l: "Tenth" },
        ].map(({ v, l }) => (
          <button
            key={v}
            onClick={() => setMult(v)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition",
              mult === v ? "border-[#3D2DFF] bg-[#3D2DFF] text-white" : "border-border text-[#1e293b]/60",
            )}
          >
            {l}
          </button>
        ))}
      </div>
      {valid && k ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Edge (EV, illustrative)" value={`${ev >= 0 ? "+" : ""}${pct(ev)}`} tone={ev > 0 ? "good" : "bad"} />
            <Stat label="Break-even chance" value={pct(1 / o)} />
            <Stat label="Illustrative Kelly %" value={pct(k.fraction, 2)} />
            <Stat label="Illustrative stake" value={naira(k.stake)} tone={k.stake > 0 ? "good" : "neutral"} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <p className="text-[11px] text-[#1e293b]/50">
              Educational formula output — illustrative, not advice.
            </p>
            {k.stake > 0 && (
              <Button variant="teal" size="sm" asChild>
                <Link
                  href={`/dashboard/bet-tracker?${new URLSearchParams({
                    odds: o.toFixed(2),
                    stake: String(Math.round(k.stake)),
                    prob: String(num(prob)),
                  }).toString()}`}
                >
                  Log in Bet Tracker <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-rose-600">Enter odds &gt; 1, a probability between 0 and 100, and a bankroll.</p>
      )}
      {valid && ev <= 0 && (
        <p className="rounded-lg bg-slate-100 p-3 text-sm text-[#1e293b]/70">
          At these numbers expected value is non-positive, so the Kelly formula outputs ₦0 (illustrative, not advice).
          A win probability of at least {pct(1 / o)} is needed to break even at these odds.
        </p>
      )}
    </Panel>
  );
}

// ── Accumulator + Acca Bonus vs Margin ───────────────────────────────────────

function AccaCalc() {
  const [legs, setLegs] = useState(["1.80", "2.00", "1.65"]);
  const [stake, setStake] = useState("1000");
  const [bonusPct, setBonusPct] = useState("0");
  const res = accumulator(legs.map(num), num(stake));

  const bonus = Math.max(0, Number.isFinite(num(bonusPct)) ? num(bonusPct) : 0);
  const boostedProfit = res ? res.profit * (1 + bonus / 100) : 0;
  const boostedReturn = res ? num(stake) + boostedProfit : 0;
  // Fair probability assumes ~5% margin per leg; compare boosted payout to fair odds
  const fairProb = res ? res.impliedProb / Math.pow(1.05, legs.length) : 0;
  const boostedEv = res && num(stake) > 0 ? (fairProb * boostedReturn) / num(stake) - 1 : 0;

  return (
    <Panel
      explainer={
        <>
          <p className="font-semibold text-[#0f172a]">Acca bonuses vs compounded margin</p>
          <p className="mt-1">
            Odds multiply — but so does the bookmaker&apos;s margin. Five legs at ~5% margin each costs roughly{" "}
            <strong>28%</strong> in compounded vig. Enter SportyBet or Bet9ja&apos;s advertised{" "}
            <strong>acca bonus %</strong> to see whether the bonus actually offsets the margin drag (it almost never
            does on long tickets).
          </p>
        </>
      }
    >
      <div className="space-y-3">
        {legs.map((l, i) => (
          <div key={i} className="flex items-end gap-2">
            <div className="flex-1">
              <Field
                label={`Leg ${i + 1} odds`}
                value={l}
                onChange={(e) => setLegs(legs.map((x, j) => (j === i ? e.target.value : x)))}
              />
            </div>
            {legs.length > 1 && (
              <Button variant="ghost" size="icon" aria-label="Remove leg" onClick={() => setLegs(legs.filter((_, j) => j !== i))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        {legs.length < 20 && (
          <Button variant="outline" size="sm" onClick={() => setLegs([...legs, ""])}>
            <Plus className="mr-1 h-4 w-4" /> Add leg
          </Button>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Stake (₦)" value={stake} onChange={(e) => setStake(e.target.value)} />
          <Field
            label="Bookmaker acca bonus (%)"
            value={bonusPct}
            onChange={(e) => setBonusPct(e.target.value)}
            hint="e.g. 5, 10, 30 on SportyBet / Bet9ja"
          />
        </div>
      </div>
      {res ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="Combined odds" value={res.combinedOdds.toFixed(2)} />
            <Stat label={bonus > 0 ? `Return (+${bonus}% bonus)` : "Potential return"} value={naira(boostedReturn)} />
            <Stat label="Profit if it lands" value={naira(boostedProfit)} tone="good" />
            <Stat label="Implied chance" value={pct(res.impliedProb, 2)} />
            <Stat label="Lands about 1 in" value={Math.round(1 / res.impliedProb).toLocaleString()} />
            <Stat label="Compounded margin (~5%/leg)" value={pct(res.compoundedMargin)} tone="bad" />
          </div>

          {bonus > 0 && (
            <div
              className={cn(
                "rounded-xl border p-3.5 text-xs leading-relaxed",
                boostedEv >= 0
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-amber-200 bg-amber-50 text-amber-900",
              )}
            >
              <strong>Bonus reality check:</strong> With a {bonus}% bonus on {legs.length} legs, your estimated
              expected return is{" "}
              <strong>
                {boostedEv >= 0 ? "+" : ""}
                {pct(boostedEv, 1)}
              </strong>{" "}
              (assuming ~5% margin per leg).{" "}
              {boostedEv < 0
                ? "The bonus softens the blow, but the bookmaker's compounded margin still outweighs it."
                : "At this bonus level, the boost offsets a standard 5%/leg margin — verify each leg's actual vig."}
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="teal" size="sm" asChild>
              <Link
                href={`/dashboard/bet-tracker?${new URLSearchParams({
                  odds: res.combinedOdds.toFixed(2),
                  stake: stake.trim() || "1000",
                  market: "Accumulator",
                  legs: String(legs.length),
                  selection: `${legs.length}-leg accumulator`,
                }).toString()}`}
              >
                Log accumulator in Bet Tracker <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-rose-600">Every leg needs odds greater than 1.00.</p>
      )}
    </Panel>
  );
}

// ── Cash-Out Evaluator ───────────────────────────────────────────────────────

function CashOutCalc() {
  const [stake, setStake] = useState("2000");
  const [originalOdds, setOriginalOdds] = useState("4.50");
  const [cashOutOffer, setCashOutOffer] = useState("5200");
  const [currentWinProb, setCurrentWinProb] = useState("70");

  const s = num(stake);
  const o = num(originalOdds);
  const offer = num(cashOutOffer);
  const p = num(currentWinProb) / 100;
  const valid = s > 0 && o > 1 && offer >= 0 && p > 0 && p <= 1;

  const fullPayout = valid ? s * o : 0;
  const fairValue = valid ? fullPayout * p : 0;
  const diff = valid ? offer - fairValue : 0;
  const haircutPct = valid && fairValue > 0 ? (fairValue - offer) / fairValue : 0;

  return (
    <Panel
      explainer={
        <>
          <p className="font-semibold text-[#0f172a]">The hidden cash-out tax</p>
          <p className="mt-1">
            When SportyBet or Bet9ja offers early cash-out on a live ticket, they price in a{" "}
            <strong>second margin (usually 8%–18%)</strong> on top of the margin you already paid. Compare the offer
            against the ticket&apos;s true expected value (<strong>Full payout × live win chance</strong>) before
            clicking cash-out.
          </p>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Original stake (₦)" value={stake} onChange={(e) => setStake(e.target.value)} />
        <Field label="Original combined odds" value={originalOdds} onChange={(e) => setOriginalOdds(e.target.value)} />
        <Field label="Bookmaker cash-out offer (₦)" value={cashOutOffer} onChange={(e) => setCashOutOffer(e.target.value)} />
        <Field
          label="Live chance ticket still wins (%)"
          value={currentWinProb}
          onChange={(e) => setCurrentWinProb(e.target.value)}
          hint="Tip: check live odds for your remaining leg (1 ÷ live odds × 100)"
        />
      </div>

      {valid ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Full payout if it lands" value={naira(fullPayout)} />
            <Stat label="Fair value (let ride)" value={naira(fairValue)} />
            <Stat
              label="Cash-out vs fair"
              value={`${diff >= 0 ? "+" : ""}${naira(diff)}`}
              tone={diff >= 0 ? "good" : "bad"}
            />
            <Stat
              label="Cash-out haircut"
              value={pct(Math.max(0, haircutPct), 1)}
              tone={haircutPct > 0.08 ? "bad" : "neutral"}
            />
          </div>
          <p
            className={cn(
              "rounded-xl border p-3.5 text-xs leading-relaxed",
              diff >= 0
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-amber-200 bg-amber-50 text-amber-900",
            )}
          >
            {diff >= 0 ? (
              <>
                <strong>Above fair value:</strong> The {naira(offer)} offer beats the ticket&apos;s expected value (
                {naira(fairValue)}) by {naira(diff)}.
              </>
            ) : (
              <>
                <strong>Haircut of {pct(haircutPct, 1)}:</strong> Cashing out gives up{" "}
                <strong>{naira(Math.abs(diff))}</strong> in expected value compared to letting the ticket ride (
                {naira(fairValue)}). Only take it if locking in {naira(offer - s)} profit protects your bankroll.
              </>
            )}
          </p>
        </div>
      ) : (
        <p className="text-sm text-rose-600">Enter a valid stake, odds &gt; 1, offer, and live probability (1–100%).</p>
      )}
    </Panel>
  );
}

// ── Arbitrage ────────────────────────────────────────────────────────────────

function ArbCalc() {
  const [odds, setOdds] = useState(["2.10", "3.60", "4.20"]);
  const [total, setTotal] = useState("10000");
  const res = useMemo(() => arbitrage(odds.map(num), num(total)), [odds, total]);

  return (
    <Panel
      explainer={
        <>
          <p className="font-semibold text-[#0f172a]">Arbitrage</p>
          <p className="mt-1">
            When the <strong>best</strong> price for every outcome — usually from different bookmakers — adds up to
            less than 100% implied, the combined book is below 100%. Arbs are rare, small and short-lived, and
            bookmakers may limit accounts that take them. Outputs are illustrative, not advice.
          </p>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {odds.map((o, i) => (
          <Field
            key={i}
            label={`Best odds — outcome ${i + 1}`}
            value={o}
            onChange={(e) => setOdds(odds.map((x, j) => (j === i ? e.target.value : x)))}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setOdds(odds.length === 3 ? odds.slice(0, 2) : [...odds, ""])}>
          {odds.length === 3 ? "Switch to 2-way market" : "Switch to 3-way market"}
        </Button>
      </div>
      <Field label="Total amount (₦, illustrative)" value={total} onChange={(e) => setTotal(e.target.value)} />
      {res ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="Combined implied" value={pct(res.book, 2)} tone={res.isArb ? "good" : "bad"} />
            <Stat label="Theoretical margin" value={`${res.profitPct >= 0 ? "+" : ""}${pct(res.profitPct, 2)}`} tone={res.isArb ? "good" : "bad"} />
            <Stat label="Payout (any result)" value={naira(res.payout)} />
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {res.stakes.map((s, i) => (
              <p key={i} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                Illustrative split {i + 1}: <strong className="tabular-nums">{naira(s)}</strong>
              </p>
            ))}
          </div>
          {!res.isArb && (
            <p className="text-sm text-[#1e293b]/60">
              No arbitrage — these prices sum to more than 100%. Splitting across all outcomes would lose{" "}
              {pct(-res.profitPct, 2)} whatever happens.
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-rose-600">Enter odds greater than 1.00 and an amount.</p>
      )}
    </Panel>
  );
}

export function BetCalculators() {
  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-slate-600">
        Pick the calculator that matches what you&apos;re checking: <strong>Accumulator &amp; Bonus</strong> for multi-leg payouts,{" "}
        <strong>Cash-Out Evaluator</strong> to test a bookmaker&apos;s cash-out offer, <strong>Margin &amp; Fair Odds</strong> to see hidden bookmaker fees, or{" "}
        <strong>EV &amp; Kelly</strong> for stake sizing.
      </p>
      <Tabs defaultValue="acca" className="w-full">
        <TabsList className="mb-6 flex h-auto flex-wrap justify-start gap-1">
          <TabsTrigger value="acca">Accumulator &amp; Bonus</TabsTrigger>
          <TabsTrigger value="cashout">Cash-Out Evaluator</TabsTrigger>
          <TabsTrigger value="margin">Margin &amp; Fair Odds</TabsTrigger>
          <TabsTrigger value="convert">Odds Converter</TabsTrigger>
          <TabsTrigger value="kelly">EV &amp; Kelly</TabsTrigger>
          <TabsTrigger value="arb">Arbitrage</TabsTrigger>
        </TabsList>
        <TabsContent value="acca"><AccaCalc /></TabsContent>
        <TabsContent value="cashout"><CashOutCalc /></TabsContent>
        <TabsContent value="margin"><MarginCalc /></TabsContent>
        <TabsContent value="convert"><OddsConverter /></TabsContent>
        <TabsContent value="kelly"><KellyCalc /></TabsContent>
        <TabsContent value="arb"><ArbCalc /></TabsContent>
      </Tabs>
    </div>
  );
}
