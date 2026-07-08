"use client";

import { useState } from "react";
import { ChevronDown, AlertTriangle, Calculator, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BetTypeEntry } from "@/lib/option-glossary/types";

interface GlossaryEntryProps {
  entry: BetTypeEntry;
  defaultOpen?: boolean;
}

export function GlossaryEntry({ entry, defaultOpen = false }: GlossaryEntryProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn(
      "rounded-2xl border bg-white transition-shadow duration-200",
      open ? "border-emerald-200 shadow-md" : "border-border shadow-sm hover:border-emerald-100 hover:shadow"
    )}>
      {/* Header — always visible */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-4 p-5 text-left"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-[#0f172a] leading-snug">{entry.name}</h3>
          <p className={cn(
            "mt-1.5 text-sm text-[#1e293b]/60 leading-relaxed",
            open ? "" : "line-clamp-2"
          )}>
            {entry.explanation}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0 text-[#1e293b]/30 transition-transform duration-200",
            open && "rotate-180 text-emerald-500"
          )}
        />
      </button>

      {/* Expanded content */}
      {open && (
        <div className="border-t border-border/60 px-5 pb-5 pt-4 space-y-5">

          {/* Worked Example */}
          <div className="rounded-xl bg-[#0f172a]/[0.03] border border-[#0f172a]/[0.06] p-4">
            <div className="mb-2.5 flex items-center gap-2">
              <Calculator className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Worked example
              </span>
            </div>
            <p className="text-sm text-[#1e293b]/80 leading-relaxed whitespace-pre-line">
              {entry.workedExample}
            </p>
          </div>

          {/* Volatility Note */}
          <div className="rounded-xl bg-amber-50/70 border border-amber-100 p-4">
            <div className="mb-2.5 flex items-center gap-2">
              <BarChart2 className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                Volatility &amp; variance
              </span>
            </div>
            <p className="text-sm text-[#1e293b]/80 leading-relaxed">
              {entry.volatilityNote}
            </p>
          </div>

          {/* Common Misreadings */}
          {entry.commonMisreadings.length > 0 && (
            <div className="rounded-xl bg-rose-50/60 border border-rose-100 p-4">
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                <span className="text-xs font-semibold uppercase tracking-wide text-rose-600">
                  Common misreadings
                </span>
              </div>
              <ul className="space-y-2">
                {entry.commonMisreadings.map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-[#1e293b]/75 leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
