"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Download, FileSpreadsheet, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  parseBetsCsv,
  SAMPLE_BETS_CSV,
  type CsvImportParseResult,
} from "@/lib/bet-assist/csv-import";
import { bulkImportBets } from "@/lib/bet-assist/journal-actions";
import { STATUS_LABELS } from "@/lib/bet-assist/journal";

const BOOKMAKER_SOURCES = [
  { value: "SportyBet", label: "SportyBet" },
  { value: "Bet9ja", label: "Bet9ja" },
  { value: "Football.com", label: "Football.com" },
  { value: "BetKing", label: "BetKing" },
  { value: "1xBet", label: "1xBet" },
  { value: "MSport", label: "MSport" },
  { value: "Betway", label: "Betway" },
  { value: "Pinnacle", label: "Pinnacle" },
  { value: "__csv__", label: "Mixed (use CSV bookmaker column)" },
  { value: "__other__", label: "Other bookmaker..." },
];

export interface BookmakerSummary {
  bookmaker: string;
  count: number;
}

export function BetCsvImportPanel({
  onClose,
  bookmakerCounts,
  className,
}: {
  onClose?: () => void;
  bookmakerCounts?: BookmakerSummary[];
  className?: string;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [pending, start] = useTransition();
  const [sourceChoice, setSourceChoice] = useState("SportyBet");
  const [customBookie, setCustomBookie] = useState("");
  const [rawText, setRawText] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsed, setParsed] = useState<CsvImportParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importedMsg, setImportedMsg] = useState<string | null>(null);

  const resolveBookieConfig = (choice: string, custom: string) => {
    if (choice === "__csv__") {
      return { defaultBookmaker: undefined, overrideBookmaker: false };
    }
    const name = choice === "__other__" ? custom.trim() : choice;
    return {
      defaultBookmaker: name || undefined,
      overrideBookmaker: Boolean(name),
    };
  };

  const reparse = (text: string, choice: string, custom: string) => {
    setError(null);
    setImportedMsg(null);
    const cfg = resolveBookieConfig(choice, custom);
    setParsed(parseBetsCsv(text, cfg));
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("CSV file is too large (max 2 MB).");
      return;
    }
    const text = await file.text();
    setFileName(file.name);
    setRawText(text);
    reparse(text, sourceChoice, customBookie);
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_BETS_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "punterstat-bet-history-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!parsed || parsed.rows.length === 0) return;
    setError(null);
    const cfg = resolveBookieConfig(sourceChoice, customBookie);
    start(async () => {
      const res = await bulkImportBets(parsed.rows);
      if (!res.success) {
        setError(res.error ?? "Failed to import bets.");
        return;
      }
      const n = res.imported ?? parsed.rows.length;
      const tag = cfg.defaultBookmaker ? ` (${cfg.defaultBookmaker})` : "";
      setImportedMsg(
        `Imported ${n} bet${n === 1 ? "" : "s"}${tag} — now live across Bet Tracker, Report Card, and Recommendations.`
      );
      setParsed(null);
      setRawText(null);
      setFileName(null);
      router.refresh();
    });
  };

  return (
    <div
      className={
        className ??
        "rounded-2xl border border-teal-200 bg-white p-5 shadow-sm space-y-4"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-[#0f172a]">
            <FileSpreadsheet className="h-4 w-4 text-teal-600" />
            Betting History &amp; Bookmaker Data (CSV)
          </h3>
          <p className="mt-0.5 text-xs text-[#1e293b]/60">
            Upload your betting history per bookmaker (SportyBet, Bet9ja, Football.com, etc.). Your uploaded data powers{" "}
            <span className="font-medium text-[#0f172a]">Bet Tracker</span>,{" "}
            <span className="font-medium text-[#0f172a]">Weekly Report Card &amp; Leak Detector</span>, and{" "}
            <span className="font-medium text-[#0f172a]">Learning Recommendations</span>.
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#1e293b]/45 hover:bg-slate-100 hover:text-[#0f172a]"
            aria-label="Close import panel"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Connected bookmakers summary */}
      {bookmakerCounts && bookmakerCounts.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-[#1e293b]/50 mr-1">Synced bookies:</span>
          {bookmakerCounts.map((b) => (
            <span
              key={b.bookmaker}
              className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50/70 px-2.5 py-0.5 text-[11px] font-semibold text-teal-800"
            >
              {b.bookmaker}
              <span className="text-teal-600/80 tabular-nums">· {b.count}</span>
            </span>
          ))}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="bookie-source" className="text-xs">
            Bookmaker Source
          </Label>
          <select
            id="bookie-source"
            value={sourceChoice}
            onChange={(e) => {
              const next = e.target.value;
              setSourceChoice(next);
              if (rawText) reparse(rawText, next, customBookie);
            }}
            className="h-9 w-full rounded-lg border border-border bg-white px-2.5 text-xs text-[#0f172a] focus:border-teal-600 focus:outline-none"
          >
            {BOOKMAKER_SOURCES.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
          {sourceChoice === "__other__" && (
            <Input
              value={customBookie}
              onChange={(e) => {
                setCustomBookie(e.target.value);
                if (rawText) reparse(rawText, sourceChoice, e.target.value);
              }}
              placeholder="Enter bookmaker name (e.g. BetPawa)"
              className="h-8 text-xs"
            />
          )}
        </div>

        <div className="flex items-end justify-start sm:justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={downloadSample} className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> Sample CSV
          </Button>
          <Button
            type="button"
            variant="teal"
            size="sm"
            onClick={() => fileRef.current?.click()}
            className="gap-1.5"
          >
            <Upload className="h-3.5 w-3.5" /> Choose CSV File
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              void handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </p>
      )}

      {importedMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-medium text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          {importedMsg}
        </div>
      )}

      {parsed && (
        <div className="space-y-3 rounded-xl border border-border bg-slate-50/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <p className="font-semibold text-[#0f172a]">
              {fileName} —{" "}
              <span className="text-emerald-700">{parsed.rows.length} ready</span>
              {parsed.skipped.length > 0 && (
                <span className="text-amber-700"> · {parsed.skipped.length} skipped</span>
              )}
            </p>
            <Button
              type="button"
              variant="teal"
              size="sm"
              disabled={pending || parsed.rows.length === 0}
              onClick={handleImport}
              className="gap-1.5"
            >
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              Import {parsed.rows.length} Bet{parsed.rows.length === 1 ? "" : "s"}
            </Button>
          </div>

          {parsed.rows.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-border bg-white">
              <table className="w-full text-left text-[11px]">
                <thead className="border-b border-border bg-slate-50 text-[#1e293b]/60">
                  <tr>
                    <th className="px-2.5 py-1.5 font-semibold">Event</th>
                    <th className="px-2.5 py-1.5 font-semibold">Selection</th>
                    <th className="px-2.5 py-1.5 font-semibold">Bookie</th>
                    <th className="px-2.5 py-1.5 font-semibold text-right">Odds</th>
                    <th className="px-2.5 py-1.5 font-semibold text-right">Stake</th>
                    <th className="px-2.5 py-1.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {parsed.rows.slice(0, 5).map((r, i) => (
                    <tr key={`${r.eventName}-${i}`}>
                      <td className="px-2.5 py-1.5 font-medium text-[#0f172a] max-w-[160px] truncate">{r.eventName}</td>
                      <td className="px-2.5 py-1.5 text-[#1e293b]/75 max-w-[120px] truncate">{r.selection}</td>
                      <td className="px-2.5 py-1.5">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-[#0f172a]">
                          {r.bookmaker ?? "—"}
                        </span>
                      </td>
                      <td className="px-2.5 py-1.5 text-right tabular-nums">{r.odds.toFixed(2)}</td>
                      <td className="px-2.5 py-1.5 text-right tabular-nums">₦{r.stake.toLocaleString()}</td>
                      <td className="px-2.5 py-1.5">{STATUS_LABELS[r.status]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsed.rows.length > 5 && (
                <p className="border-t border-border bg-slate-50 px-2.5 py-1 text-[10px] text-[#1e293b]/50">
                  Showing first 5 of {parsed.rows.length} valid rows.
                </p>
              )}
            </div>
          )}

          {parsed.skipped.length > 0 && (
            <div className="text-[11px] text-amber-800 space-y-0.5">
              <p className="font-semibold">Skipped rows:</p>
              {parsed.skipped.slice(0, 3).map((s) => (
                <p key={`${s.line}-${s.reason}`}>
                  Line {s.line}: {s.reason}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
