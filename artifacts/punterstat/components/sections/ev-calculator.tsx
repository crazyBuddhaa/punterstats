"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Small teaching widget: turn decimal odds into implied probability and
 * compare it with the learner's own estimate to get expected value.
 *   implied = 1 / odds
 *   EV (per unit staked) = p × odds − 1
 */
export function EvCalculator({ className }: { className?: string }) {
  const oddsId = useId();
  const probId = useId();
  const [odds, setOdds] = useState(2.1);
  const [estimate, setEstimate] = useState(52);

  const implied = 100 / odds;
  const edge = estimate - implied;
  const ev = (estimate / 100) * odds - 1;
  const evPct = ev * 100;
  const tone =
    Math.abs(evPct) < 0.05 ? "neutral" : evPct > 0 ? "positive" : "negative";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-brand-ink p-6 text-white shadow-[0_30px_60px_-30px_rgba(11,17,32,0.8)] sm:p-7",
        className
      )}
    >
      <div className="bg-grid-ink pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-blue/30 blur-3xl" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-brand-muted">
            Expected value calculator
          </p>
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="h-2 w-2 rounded-full bg-brand-mint/80" />
          </span>
        </div>

        {/* Inputs */}
        <div className="mt-6 space-y-5">
          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor={oddsId} className="text-sm text-slate-300">
                Decimal odds
              </label>
              <span className="tabular font-mono text-lg font-semibold">
                {odds.toFixed(2)}
              </span>
            </div>
            <input
              id={oddsId}
              type="range"
              min={1.2}
              max={6}
              step={0.05}
              value={odds}
              onChange={(e) => setOdds(Number(e.target.value))}
              className="mt-2 w-full cursor-pointer accent-brand-blue"
            />
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor={probId} className="text-sm text-slate-300">
                Your probability estimate
              </label>
              <span className="tabular font-mono text-lg font-semibold">
                {estimate}%
              </span>
            </div>
            <input
              id={probId}
              type="range"
              min={1}
              max={99}
              step={1}
              value={estimate}
              onChange={(e) => setEstimate(Number(e.target.value))}
              className="mt-2 w-full cursor-pointer accent-brand-violet"
            />
          </div>
        </div>

        {/* Comparison bars */}
        <div className="mt-7 space-y-3">
          <Bar
            label="Price implies"
            value={implied}
            className="bg-slate-400/70"
          />
          <Bar
            label="You estimate"
            value={estimate}
            className="bg-gradient-to-r from-brand-blue to-brand-violet"
          />
        </div>

        {/* Results */}
        <dl className="mt-7 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-brand-muted">
              Edge
            </dt>
            <dd className="tabular mt-1 font-mono text-xl font-semibold">
              {edge >= 0 ? "+" : "−"}
              {Math.abs(edge).toFixed(1)} pts
            </dd>
          </div>
          <div
            className={cn(
              "rounded-xl border p-4 transition-colors",
              tone === "positive" && "border-brand-mint/40 bg-brand-mint/10",
              tone === "negative" && "border-rose-400/40 bg-rose-400/10",
              tone === "neutral" && "border-white/[0.08] bg-white/[0.03]"
            )}
          >
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-brand-muted">
              Expected value
            </dt>
            <dd
              className={cn(
                "tabular mt-1 font-mono text-xl font-semibold",
                tone === "positive" && "text-brand-mint",
                tone === "negative" && "text-rose-300"
              )}
            >
              {evPct >= 0 ? "+" : "−"}
              {Math.abs(evPct).toFixed(1)}%
            </dd>
          </div>
        </dl>

        <p className="mt-5 font-mono text-[11px] leading-relaxed text-slate-400">
          {(estimate / 100).toFixed(2)} × {odds.toFixed(2)} − 1 ={" "}
          {ev >= 0 ? "+" : "−"}
          {Math.abs(ev).toFixed(3)} per unit staked, on average
        </p>
      </div>
    </div>
  );
}

function Bar({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span className="tabular font-mono">{value.toFixed(1)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300",
            className
          )}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}
