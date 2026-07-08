"use client";

import { useTransition, useState } from "react";
import { Loader2 } from "lucide-react";
import { toggleFeatureFlag } from "@/lib/admin/actions";
import type { FeatureFlag } from "@/lib/admin/queries";

export function FlagToggle({ flag }: { flag: FeatureFlag }) {
  const [enabled, setEnabled] = useState(flag.enabled);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const next = !enabled;
    setEnabled(next);
    startTransition(async () => {
      const result = await toggleFeatureFlag(flag.key, next);
      if (!result.success) {
        setEnabled(!next); // revert
        alert(result.error ?? "Failed to update flag.");
      }
    });
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-white px-5 py-4">
      <div className="min-w-0 flex-1">
        <p className="font-mono text-sm font-semibold text-[#0f172a]">{flag.key}</p>
        {flag.description && (
          <p className="mt-0.5 text-sm text-[#1e293b]/60">{flag.description}</p>
        )}
        <p className="mt-1 text-[11px] text-[#1e293b]/40">
          Last updated {new Date(flag.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </div>

      <div className="ml-6 flex items-center gap-2.5">
        {isPending && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
        <button
          onClick={handleToggle}
          disabled={isPending}
          aria-pressed={enabled}
          className={`relative inline-flex h-6 w-11 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            enabled ? "bg-violet-600" : "bg-slate-200"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out mt-0.5 ${
              enabled ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
        <span
          className={`w-14 text-center text-xs font-semibold ${
            enabled ? "text-violet-600" : "text-slate-400"
          }`}
        >
          {enabled ? "Enabled" : "Disabled"}
        </span>
      </div>
    </div>
  );
}
