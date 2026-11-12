"use client";

import { useState, useTransition } from "react";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { updateWeeklyReportPreference } from "@/lib/report-card/actions";

interface WeeklyReportToggleProps {
  initialEnabled: boolean;
}

export function WeeklyReportToggle({ initialEnabled }: WeeklyReportToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const handleToggle = (next: boolean) => {
    const previous = enabled;
    setEnabled(next);
    setStatus(null);

    startTransition(async () => {
      const res = await updateWeeklyReportPreference(next);
      if (!res.success) {
        setEnabled(previous);
        setStatus({ ok: false, message: res.error ?? "Could not update preference." });
        return;
      }
      setStatus({
        ok: true,
        message: next
          ? "Weekly Betting Report Card email enabled."
          : "Weekly Betting Report Card email turned off.",
      });
    });
  };

  return (
    <div className="max-w-xl rounded-2xl border border-border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-xl bg-teal-50 p-2 text-teal-600">
            <Mail className="h-4 w-4" />
          </div>
          <div>
            <Label htmlFor="weekly-report-switch" className="text-base font-semibold text-[#0f172a]">
              Weekly Betting Report Card email
            </Label>
            <p className="mt-1 text-xs leading-relaxed text-[#1e293b]/60">
              Sent on Mondays at 06:00 UTC when you have logged at least one bet in the past 14 days.
              Includes your 7-day vs prior 7-day numbers, your top leak, and a Betting Academy lesson link.
            </p>
          </div>
        </div>

        <Switch
          id="weekly-report-switch"
          checked={enabled}
          disabled={pending}
          onCheckedChange={handleToggle}
          aria-label="Receive weekly Betting Report Card email"
        />
      </div>

      {status && (
        <p
          className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${
            status.ok ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {status.ok ? (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          )}
          {status.message}
        </p>
      )}
    </div>
  );
}
