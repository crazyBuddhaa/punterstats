"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, CheckCircle2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addBet } from "@/lib/bet-assist/journal-actions";
import { cn } from "@/lib/utils";

const MARKETS = [
  "1X2",
  "Double chance",
  "Over/Under",
  "BTTS",
  "Asian handicap",
  "Correct score",
  "Player prop",
  "Other",
];

const BOOKMAKER_PRESETS = ["SportyBet", "Bet9ja", "BetKing", "1xBet", "MSport", "Pinnacle"];

interface AccaLeg {
  selection: string;
  odds: string;
}

interface QuickAddBetModalProps {
  triggerLabel?: string;
  variant?: "teal" | "default" | "outline";
}

export function QuickAddBetModal({
  triggerLabel = "Quick-log a bet",
  variant = "teal",
}: QuickAddBetModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [betType, setBetType] = useState<"single" | "accumulator">("single");
  const [legs, setLegs] = useState<AccaLeg[]>([
    { selection: "", odds: "" },
    { selection: "", odds: "" },
  ]);

  const [form, setForm] = useState({
    eventName: "",
    selection: "",
    odds: "",
    stake: "",
    market: "1X2",
    bookmaker: "",
    yourProb: "",
    legCount: "2",
  });

  const setField =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const validLegs = legs.filter((l) => Number(l.odds) > 1);
  const computedOdds =
    validLegs.length >= 2
      ? Number(validLegs.reduce((acc, l) => acc * Number(l.odds), 1).toFixed(2))
      : null;

  const reset = () => {
    setForm({
      eventName: "",
      selection: "",
      odds: "",
      stake: "",
      market: "1X2",
      bookmaker: "",
      yourProb: "",
      legCount: "2",
    });
    setLegs([
      { selection: "", odds: "" },
      { selection: "", odds: "" },
    ]);
    setBetType("single");
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let eventName = form.eventName.trim();
    let selection = form.selection.trim();
    let odds = Number(form.odds);
    let legCount = 1;
    let market = form.market;

    if (betType === "accumulator") {
      market = "Accumulator";
      if (computedOdds !== null) {
        odds = computedOdds;
        legCount = validLegs.length;
        if (!eventName) eventName = `${legCount}-leg accumulator`;
        if (!selection) {
          selection = validLegs
            .map((l, idx) => l.selection.trim() || `Leg ${idx + 1} @ ${l.odds}`)
            .join(" + ")
            .slice(0, 190);
        }
      } else {
        legCount = Math.max(2, Math.round(Number(form.legCount) || 2));
        if (!eventName) eventName = `${legCount}-leg accumulator`;
        if (!selection) {
          setError("Add at least 2 legs with odds > 1.00, or enter a selection & combined odds.");
          return;
        }
      }
    }

    if (!(odds > 1)) {
      setError("Odds must be greater than 1.00.");
      return;
    }

    startTransition(async () => {
      const res = await addBet({
        eventName,
        selection,
        market,
        bookmaker: form.bookmaker.trim() || null,
        odds,
        stake: Number(form.stake),
        yourProb: form.yourProb.trim() ? Number(form.yourProb) / 100 : null,
        legCount,
      });

      if (!res.success) {
        setError(res.error ?? "Could not save bet");
        return;
      }

      reset();
      setSavedToast(true);
      setTimeout(() => {
        setSavedToast(false);
        setOpen(false);
      }, 600);
      router.refresh();
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <DialogTrigger asChild>
        <Button variant={variant} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick-log a bet</DialogTitle>
          <DialogDescription>
            Log a single or accumulator in seconds. You can settle results and add closing odds in Bet Tracker.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Single / Accumulator toggle */}
          <div className="inline-flex w-full rounded-lg border border-border bg-slate-50 p-0.5">
            {(["single", "accumulator"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setBetType(t)}
                className={cn(
                  "flex-1 rounded-md py-1.5 text-xs font-medium capitalize transition",
                  betType === t ? "bg-[#3D2DFF] text-white shadow-sm" : "text-[#1e293b]/60 hover:text-[#0f172a]",
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {betType === "single" ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="qa-event" className="text-xs font-medium text-[#0f172a]">
                  Event / Match *
                </Label>
                <Input
                  id="qa-event"
                  required
                  autoFocus
                  value={form.eventName}
                  onChange={setField("eventName")}
                  placeholder="e.g. Arsenal v Chelsea"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="qa-selection" className="text-xs font-medium text-[#0f172a]">
                  Selection *
                </Label>
                <Input
                  id="qa-selection"
                  required
                  value={form.selection}
                  onChange={setField("selection")}
                  placeholder="e.g. Arsenal to win"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="qa-odds" className="text-xs font-medium text-[#0f172a]">
                    Decimal odds *
                  </Label>
                  <Input
                    id="qa-odds"
                    required
                    inputMode="decimal"
                    value={form.odds}
                    onChange={setField("odds")}
                    placeholder="2.10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="qa-stake" className="text-xs font-medium text-[#0f172a]">
                    Stake (₦) *
                  </Label>
                  <Input
                    id="qa-stake"
                    required
                    inputMode="decimal"
                    value={form.stake}
                    onChange={setField("stake")}
                    placeholder="1000"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2 rounded-xl border border-border bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#0f172a]">
                    Legs {computedOdds ? `(${validLegs.length} · ${computedOdds.toFixed(2)}x)` : ""}
                  </span>
                  {legs.length < 20 && (
                    <button
                      type="button"
                      onClick={() => setLegs((prev) => [...prev, { selection: "", odds: "" }])}
                      className="text-xs font-medium text-[#3D2DFF] hover:underline"
                    >
                      + Add leg
                    </button>
                  )}
                </div>
                {legs.map((leg, i) => (
                  <div key={i} className="grid grid-cols-[1fr_76px_auto] items-center gap-1.5">
                    <Input
                      value={leg.selection}
                      onChange={(e) =>
                        setLegs((prev) => prev.map((l, j) => (j === i ? { ...l, selection: e.target.value } : l)))
                      }
                      placeholder={`Leg ${i + 1} pick`}
                      className="h-8 bg-white text-xs"
                    />
                    <Input
                      inputMode="decimal"
                      value={leg.odds}
                      onChange={(e) =>
                        setLegs((prev) => prev.map((l, j) => (j === i ? { ...l, odds: e.target.value } : l)))
                      }
                      placeholder="Odds"
                      className="h-8 bg-white text-xs tabular-nums"
                    />
                    {legs.length > 2 ? (
                      <button
                        type="button"
                        onClick={() => setLegs((prev) => prev.filter((_, j) => j !== i))}
                        className="p-1 text-[#1e293b]/40 hover:text-rose-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <span className="w-5" />
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="qa-acca-odds" className="text-xs font-medium text-[#0f172a]">
                    Combined odds *
                  </Label>
                  <Input
                    id="qa-acca-odds"
                    required={computedOdds === null}
                    inputMode="decimal"
                    value={computedOdds !== null ? computedOdds.toFixed(2) : form.odds}
                    readOnly={computedOdds !== null}
                    onChange={setField("odds")}
                    placeholder="5.80"
                    className={computedOdds !== null ? "bg-slate-50 font-semibold" : ""}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="qa-acca-stake" className="text-xs font-medium text-[#0f172a]">
                    Stake (₦) *
                  </Label>
                  <Input
                    id="qa-acca-stake"
                    required
                    inputMode="decimal"
                    value={form.stake}
                    onChange={setField("stake")}
                    placeholder="1000"
                  />
                </div>
              </div>

              {computedOdds === null && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="qa-acca-legs" className="text-xs font-medium text-[#0f172a]">
                      Legs *
                    </Label>
                    <Input
                      id="qa-acca-legs"
                      type="number"
                      min={2}
                      max={50}
                      value={form.legCount}
                      onChange={setField("legCount")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="qa-acca-sel" className="text-xs font-medium text-[#0f172a]">
                      Slip summary *
                    </Label>
                    <Input
                      id="qa-acca-sel"
                      required
                      value={form.selection}
                      onChange={setField("selection")}
                      placeholder="5-fold EPL"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Quick bookmaker chips */}
          <div className="flex flex-wrap gap-1.5">
            {BOOKMAKER_PRESETS.map((bm) => (
              <button
                key={bm}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, bookmaker: prev.bookmaker === bm ? "" : bm }))}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition",
                  form.bookmaker === bm
                    ? "border-teal-600 bg-teal-50 text-teal-700"
                    : "border-border bg-white text-[#1e293b]/60 hover:border-slate-300",
                )}
              >
                {bm}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            className="text-xs font-medium text-[#3D2DFF] hover:underline"
          >
            {showMore ? "Hide optional fields" : "+ Market, bookmaker & your probability (optional)"}
          </button>

          {showMore && (
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
              {betType === "single" && (
                <div className="space-y-1">
                  <Label htmlFor="qa-market" className="text-[11px] text-[#1e293b]/60">
                    Market
                  </Label>
                  <select
                    id="qa-market"
                    value={form.market}
                    onChange={setField("market")}
                    className="flex h-9 w-full rounded-md border border-input bg-white px-2.5 text-xs"
                  >
                    {MARKETS.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="space-y-1">
                <Label htmlFor="qa-bookmaker" className="text-[11px] text-[#1e293b]/60">
                  Bookmaker
                </Label>
                <Input
                  id="qa-bookmaker"
                  className="h-9 bg-white text-xs"
                  value={form.bookmaker}
                  onChange={setField("bookmaker")}
                  placeholder="SportyBet"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="qa-prob" className="text-[11px] text-[#1e293b]/60">
                  Your chance %
                </Label>
                <Input
                  id="qa-prob"
                  className="h-9 bg-white text-xs"
                  inputMode="decimal"
                  value={form.yourProb}
                  onChange={setField("yourProb")}
                  placeholder="e.g. 55"
                />
              </div>
            </div>
          )}

          {error && <p className="text-xs text-rose-600">{error}</p>}

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="teal" size="sm" disabled={pending || savedToast}>
              {savedToast ? (
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Saved
                </span>
              ) : pending ? (
                "Saving…"
              ) : (
                "Save bet"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
