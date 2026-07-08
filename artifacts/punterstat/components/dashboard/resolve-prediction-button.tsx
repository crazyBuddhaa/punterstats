"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { resolvePrediction } from "@/lib/calibration/actions";

const OPTIONS: Array<{ value: "home_win" | "draw" | "away_win"; label: string }> = [
  { value: "home_win", label: "Home win" },
  { value: "draw", label: "Draw" },
  { value: "away_win", label: "Away win" },
];

export function ResolvePredictionButton({ predictionId }: { predictionId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSelect(result: "home_win" | "draw" | "away_win") {
    startTransition(async () => {
      const res = await resolvePrediction(predictionId, result);
      if (!res.success) setError(res.error ?? "Something went wrong.");
    });
  }

  if (isPending) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-[#1e293b]/50">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-1.5">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            className="rounded-md border border-border px-2 py-1 text-[11px] font-medium text-[#1e293b]/70 transition hover:border-teal-400 hover:text-teal-700"
          >
            {opt.label}
          </button>
        ))}
      </div>
      {error && <p className="text-[11px] text-rose-600">{error}</p>}
    </div>
  );
}
