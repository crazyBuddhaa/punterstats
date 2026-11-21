"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pct } from "@/lib/bet-assist/calculators";
import { cn } from "@/lib/utils";

const naira = (n: number) =>
  `${n < 0 ? "-" : ""}₦${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

function parseNum(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export interface CashOutPrefill {
  stake?: number;
  combinedOdds?: number;
  winProbPct?: number;
}

export function CashOutEvaluator({ prefill }: { prefill?: CashOutPrefill }) {
  const [stake, setStake] = useState(() => (prefill?.stake && prefill.stake > 0 ? String(prefill.stake) : "5000"));
  const [originalOdds, setOriginalOdds] = useState(() =>
    prefill?.combinedOdds && prefill.combinedOdds > 1 ? prefill.combinedOdds.toFixed(2) : "6.00",
  );
  const [cashOutOffer, setCashOutOffer] = useState("14500");
  const [currentWinProb, setCurrentWinProb] = useState(() =>
    prefill?.winProbPct && prefill.winProbPct > 0 && prefill.winProbPct <= 100
      ? prefill.winProbPct.toFixed(1)
      : "55",
  );

  const s = parseNum(stake);
  const o = parseNum(originalOdds);
  const offer = parseNum(cashOutOffer);
  const p = parseNum(currentWinProb) / 100;
  const valid = s > 0 && o > 1 && offer >= 0 && p > 0 && p <= 1;

  const fullPayout = valid ? s * o : 0;
  const fairValue = valid ? fullPayout * p : 0;
  const diff = valid ? offer - fairValue : 0;
  const feePct = valid && fairValue > 0 ? Math.max(0, (fairValue - offer) / fairValue) : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-900">Cash-Out Evaluator</h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Bookmakers usually build an extra 8%–18% fee into live cash-out offers. Enter your ticket details and the
            offer to see whether taking the cash-out or letting it ride is the stronger move.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="co-stake" className="text-xs font-medium text-slate-700">
              Original stake (₦)
            </Label>
            <Input
              id="co-stake"
              inputMode="decimal"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="co-odds" className="text-xs font-medium text-slate-700">
              Original combined odds
            </Label>
            <Input
              id="co-odds"
              inputMode="decimal"
              value={originalOdds}
              onChange={(e) => setOriginalOdds(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="co-offer" className="text-xs font-medium text-slate-700">
              Bookmaker cash-out offer (₦)
            </Label>
            <Input
              id="co-offer"
              inputMode="decimal"
              value={cashOutOffer}
              onChange={(e) => setCashOutOffer(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="co-prob" className="text-xs font-medium text-slate-700">
              Live chance ticket still wins (%)
            </Label>
            <Input
              id="co-prob"
              inputMode="decimal"
              value={currentWinProb}
              onChange={(e) => setCurrentWinProb(e.target.value)}
            />
            <p className="text-[11px] text-slate-500">
              Tip: for 1 leg left, divide 100 by the live decimal odds (e.g. odds 1.80 → 55.6%).
            </p>
          </div>
        </div>

        {valid ? (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                <p className="text-[11px] font-medium text-slate-500">Full payout if it wins</p>
                <p className="mt-1 whitespace-nowrap text-base sm:text-lg font-bold tabular-nums text-slate-900">
                  {naira(fullPayout)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                <p className="text-[11px] font-medium text-slate-500">Fair value (let it ride)</p>
                <p className="mt-1 whitespace-nowrap text-base sm:text-lg font-bold tabular-nums text-slate-900">
                  {naira(fairValue)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                <p className="text-[11px] font-medium text-slate-500">Offer vs fair value</p>
                <p
                  className={cn(
                    "mt-1 whitespace-nowrap text-base sm:text-lg font-bold tabular-nums",
                    diff >= 0 ? "text-emerald-600" : "text-rose-600",
                  )}
                >
                  {diff >= 0 ? "+" : ""}
                  {naira(diff)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                <p className="text-[11px] font-medium text-slate-500">Bookie cash-out fee</p>
                <p
                  className={cn(
                    "mt-1 whitespace-nowrap text-base sm:text-lg font-bold tabular-nums",
                    feePct > 0.08 ? "text-rose-600" : "text-slate-900",
                  )}
                >
                  {pct(feePct, 1)}
                </p>
              </div>
            </div>

            <p
              className={cn(
                "rounded-xl border p-3.5 text-xs sm:text-sm leading-relaxed",
                diff >= 0
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-amber-200 bg-amber-50 text-amber-900",
              )}
            >
              {diff >= 0 ? (
                <>
                  <strong>Good offer:</strong> Taking {naira(offer)} beats the ticket&apos;s fair value (
                  {naira(fairValue)}) by <strong>{naira(diff)}</strong>.
                </>
              ) : (
                <>
                  <strong>Bookie is taking a {pct(feePct, 1)} cut:</strong> Cashing out gives up{" "}
                  <strong>{naira(Math.abs(diff))}</strong> in value compared to letting the ticket ride (
                  {naira(fairValue)}). Only take it if locking in{" "}
                  <strong>{naira(offer - s)}</strong> {offer >= s ? "profit" : "back"} protects your bankroll.
                </>
              )}
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            Enter a valid stake, odds above 1.00, cash-out offer, and live win chance between 1% and 100%.
          </p>
        )}
      </div>
    </div>
  );
}
