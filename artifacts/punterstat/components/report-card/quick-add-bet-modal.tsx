"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, CheckCircle2 } from "lucide-react";
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

const MARKETS = [
  "1X2",
  "Double chance",
  "Over/Under",
  "BTTS",
  "Asian handicap",
  "Correct score",
  "Accumulator",
  "Player prop",
  "Other",
];

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

  const [form, setForm] = useState({
    eventName: "",
    selection: "",
    odds: "",
    stake: "",
    market: "1X2",
    bookmaker: "",
    yourProb: "",
    legCount: "1",
  });

  const setField =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const reset = () => {
    setForm({
      eventName: "",
      selection: "",
      odds: "",
      stake: "",
      market: "1X2",
      bookmaker: "",
      yourProb: "",
      legCount: "1",
    });
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const parsedLegs = form.legCount.trim() ? Number(form.legCount) : undefined;
      const res = await addBet({
        eventName: form.eventName,
        selection: form.selection,
        market: form.market,
        bookmaker: form.bookmaker.trim() || null,
        odds: Number(form.odds),
        stake: Number(form.stake),
        yourProb: form.yourProb.trim() ? Number(form.yourProb) / 100 : null,
        legCount: parsedLegs && Number.isFinite(parsedLegs) ? Math.round(parsedLegs) : undefined,
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick-log a bet</DialogTitle>
          <DialogDescription>
            Enter the 4 essentials in seconds. You can settle the result and add closing odds later in Bet Tracker.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                Stake *
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

          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            className="text-xs font-medium text-[#3D2DFF] hover:underline"
          >
            {showMore ? "Hide optional fields" : "+ Market, legs, bookmaker & your probability (optional)"}
          </button>

          {showMore && (
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-4">
              <div className="space-y-1">
                <Label htmlFor="qa-market" className="text-[11px] text-[#1e293b]/60">
                  Market
                </Label>
                <select
                  id="qa-market"
                  value={form.market}
                  onChange={setField("market")}
                  className="flex h-9 w-full rounded-md border border-input bg-white px-2 text-xs"
                >
                  {MARKETS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="qa-legs" className="text-[11px] text-[#1e293b]/60">
                  Legs
                </Label>
                <Input
                  id="qa-legs"
                  type="number"
                  min={1}
                  max={50}
                  inputMode="numeric"
                  className="h-9 bg-white text-xs"
                  value={form.legCount}
                  onChange={setField("legCount")}
                  placeholder="1"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="qa-bookmaker" className="text-[11px] text-[#1e293b]/60">
                  Bookmaker
                </Label>
                <Input
                  id="qa-bookmaker"
                  className="h-9 bg-white text-xs"
                  value={form.bookmaker}
                  onChange={setField("bookmaker")}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="qa-prob" className="text-[11px] text-[#1e293b]/60">
                  Your chance %
                </Label>
                <Input
                  id="qa-prob"
                  inputMode="decimal"
                  className="h-9 bg-white text-xs"
                  value={form.yourProb}
                  onChange={setField("yourProb")}
                  placeholder="e.g. 52"
                />
              </div>
            </div>
          )}

          {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
          {savedToast && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              Bet logged!
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" variant="teal" size="sm" disabled={pending}>
              {pending ? "Saving…" : "Save bet"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
