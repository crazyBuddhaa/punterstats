"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportBetsCsv, deleteAllBets } from "@/lib/report-card/actions";

interface PrivacyControlsProps {
  hasBets: boolean;
}

export function PrivacyControls({ hasBets }: PrivacyControlsProps) {
  const router = useRouter();
  const [exporting, startExport] = useTransition();
  const [deleting, startDelete] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const handleExport = () => {
    setFeedback(null);
    startExport(async () => {
      const res = await exportBetsCsv();
      if (!res.success || res.csv === undefined) {
        setFeedback({ type: "err", text: res.error ?? "Could not export bets." });
        return;
      }

      const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename ?? "punterstat-bets.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setFeedback({
        type: "ok",
        text: `Exported ${res.count ?? 0} bet${res.count === 1 ? "" : "s"} to CSV.`,
      });
    });
  };

  const handleDeleteAll = () => {
    setFeedback(null);
    startDelete(async () => {
      const res = await deleteAllBets();
      if (!res.success) {
        setFeedback({ type: "err", text: res.error ?? "Could not delete bets." });
        return;
      }
      setConfirmDelete(false);
      setFeedback({ type: "ok", text: "All logged bets have been permanently deleted." });
      router.refresh();
    });
  };

  return (
    <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#0f172a]">Your data &amp; privacy</h2>
          <p className="mt-1 text-xs text-[#1e293b]/60">
            Your bet journal is private to your account. You can export a full CSV copy or permanently delete all logged bets at any time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={exporting || !hasBets}
            onClick={handleExport}
            className="gap-1.5"
          >
            <Download className="h-4 w-4" />
            {exporting ? "Exporting…" : "Export my bets (CSV)"}
          </Button>

          {!confirmDelete ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={deleting || !hasBets}
              onClick={() => setConfirmDelete(true)}
              className="gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
            >
              <Trash2 className="h-4 w-4" />
              Delete all my bets
            </Button>
          ) : (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5">
              <span className="flex items-center gap-1 text-xs font-medium text-rose-800">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                Delete every bet permanently?
              </span>
              <Button
                type="button"
                size="sm"
                disabled={deleting}
                onClick={handleDeleteAll}
                className="h-7 bg-rose-600 px-2.5 text-xs text-white hover:bg-rose-700"
              >
                {deleting ? "Deleting…" : "Yes, delete all"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={deleting}
                onClick={() => setConfirmDelete(false)}
                className="h-7 px-2.5 text-xs"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {feedback && (
        <p
          className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${
            feedback.type === "ok" ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {feedback.type === "ok" && <CheckCircle2 className="h-4 w-4" />}
          {feedback.text}
        </p>
      )}
    </section>
  );
}
