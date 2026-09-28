"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
            Lower-margin bookmakers give you more of every winning bet back.
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
          <p className="font-semibold text-[#0f172a]">Kelly staking</p>
          <p className="mt-1">
            Kelly sizes a bet in proportion to your edge. Full Kelly is very aggressive and assumes your probability
            is exactly right — most professionals use <strong>quarter or half Kelly</strong> to survive estimation
            error. No edge means no bet.
          </p>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Decimal odds" value={odds} onChange={(e) => setOdds(e.target.value)} />
        <Field label="Your win probability (%)" value={prob} onChange={(e) => setProb(e.target.value)} />
        <Field label="Bankroll" value={bankroll} onChange={(e) => setBankroll(e.target.value)} />
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Edge (EV per unit)" value={`${ev >= 0 ? "+" : ""}${pct(ev)}`} tone={ev > 0 ? "good" : "bad"} />
          <Stat label="Break-even chance" value={pct(1 / o)} />
          <Stat label="Stake % of bankroll" value={pct(k.fraction, 2)} />
          <Stat label="Suggested stake" value={k.stake.toLocaleString()} tone={k.stake > 0 ? "good" : "neutral"} />
        </div>
      ) : (
        <p className="text-sm text-rose-600">Enter odds &gt; 1, a probability between 0 and 100, and a bankroll.</p>
      )}
      {valid && ev <= 0 && (
        <p className="rounded-lg bg-slate-100 p-3 text-sm text-[#1e293b]/70">
          At these numbers there is no edge — Kelly says don&apos;t bet. You&apos;d need at least {pct(1 / o)} win
          probability just to break even.
        </p>
      )}
    </Panel>
  );
}

// ── Accumulator ──────────────────────────────────────────────────────────────

function AccaCalc() {
  const [legs, setLegs] = useState(["1.80", "2.00", "1.65"]);
  const [stake, setStake] = useState("1000");
  const res = accumulator(legs.map(num), num(stake));

  return (
    <Panel
      explainer={
        <>
          <p className="font-semibold text-[#0f172a]">Why accas are expensive</p>
          <p className="mt-1">
            Odds multiply — but so does the bookmaker&apos;s margin. Five legs at a 5% margin each means you&apos;re
            paying roughly <strong>28%</strong> in margin on the combined price. Big returns come with very long odds
            against.
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
        <Field label="Stake" value={stake} onChange={(e) => setStake(e.target.value)} />
      </div>
      {res ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Combined odds" value={res.combinedOdds.toFixed(2)} />
          <Stat label="Potential return" value={res.returns.toLocaleString()} />
          <Stat label="Profit if it lands" value={res.profit.toLocaleString()} tone="good" />
          <Stat label="Implied chance" value={pct(res.impliedProb, 2)} />
          <Stat label="Lands about 1 in" value={Math.round(1 / res.impliedProb).toLocaleString()} />
          <Stat label="Compounded margin (~5%/leg)" value={pct(res.compoundedMargin)} tone="bad" />
        </div>
      ) : (
        <p className="text-sm text-rose-600">Every leg needs odds greater than 1.00.</p>
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
            less than 100% implied, backing all outcomes locks in a profit. Arbs are rare, small and short-lived, and
            bookmakers may limit accounts that take them.
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
      <Field label="Total stake" value={total} onChange={(e) => setTotal(e.target.value)} />
      {res ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="Combined implied" value={pct(res.book, 2)} tone={res.isArb ? "good" : "bad"} />
            <Stat label="Guaranteed return" value={`${res.profitPct >= 0 ? "+" : ""}${pct(res.profitPct, 2)}`} tone={res.isArb ? "good" : "bad"} />
            <Stat label="Payout (any result)" value={res.payout.toLocaleString()} />
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {res.stakes.map((s, i) => (
              <p key={i} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                Stake on outcome {i + 1}: <strong className="tabular-nums">{s.toLocaleString()}</strong>
              </p>
            ))}
          </div>
          {!res.isArb && (
            <p className="text-sm text-[#1e293b]/60">
              No arbitrage — these prices sum to more than 100%. Staking this way would lose{" "}
              {pct(-res.profitPct, 2)} whatever happens.
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-rose-600">Enter odds greater than 1.00 and a stake.</p>
      )}
    </Panel>
  );
}

export function BetCalculators() {
  return (
    <Tabs defaultValue="kelly" className="w-full">
      <TabsList className="mb-6 flex h-auto flex-wrap justify-start gap-1">
        <TabsTrigger value="kelly">EV &amp; Kelly stake</TabsTrigger>
        <TabsTrigger value="acca">Accumulator</TabsTrigger>
        <TabsTrigger value="margin">Margin &amp; fair odds</TabsTrigger>
        <TabsTrigger value="convert">Odds converter</TabsTrigger>
        <TabsTrigger value="arb">Arbitrage</TabsTrigger>
      </TabsList>
      <TabsContent value="kelly"><KellyCalc /></TabsContent>
      <TabsContent value="acca"><AccaCalc /></TabsContent>
      <TabsContent value="margin"><MarginCalc /></TabsContent>
      <TabsContent value="convert"><OddsConverter /></TabsContent>
      <TabsContent value="arb"><ArbCalc /></TabsContent>
    </Tabs>
  );
}
