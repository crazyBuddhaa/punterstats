"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  Loader2,
  Pencil,
  Plus,
  Ticket,
  Trash2,
  X,
} from "lucide-react";

const BetTrackerChart = dynamic(() => import("./bet-tracker-chart"), {
  ssr: false,
  loading: () => <div className="h-[240px] w-full animate-pulse rounded-xl bg-slate-100" />,
});
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  betProfit,
  BET_STATUSES,
  journalStats,
  STATUS_LABELS,
  type BetStatus,
  type JournalBet,
} from "@/lib/bet-assist/journal";
import { addBet, deleteBet, settleBet, updateBet } from "@/lib/bet-assist/journal-actions";
import { pct } from "@/lib/bet-assist/calculators";
import { cn } from "@/lib/utils";

export interface TrackerPrefill {
  event?: string;
  selection?: string;
  odds?: string;
  prob?: string;
  bookmaker?: string;
  market?: string;
  stake?: string;
  legs?: string;
}

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

const BOOKMAKER_PRESETS = ["SportyBet", "Bet9ja", "Football.com", "BetKing", "1xBet", "MSport", "Pinnacle"];

const CODE_BOOKMAKERS = [
  { key: "sportybet", label: "SportyBet (NG)", name: "SportyBet" },
  { key: "bet9ja", label: "Bet9ja", name: "Bet9ja" },
  { key: "football.com", label: "Football.com", name: "Football.com" },
  { key: "betking", label: "BetKing", name: "BetKing" },
  { key: "onexbet", label: "1xBet", name: "1xBet" },
  { key: "msport", label: "MSport", name: "MSport" },
  { key: "betway", label: "Betway", name: "Betway" },
  { key: "22bet", label: "22Bet", name: "22Bet" },
  { key: "sportybet_gh", label: "SportyBet (GH)", name: "SportyBet" },
  { key: "sportybet_ke", label: "SportyBet (KE)", name: "SportyBet" },
  { key: "sportybet_za", label: "SportyBet (ZA)", name: "SportyBet" },
  { key: "sportybet_tz", label: "SportyBet (TZ)", name: "SportyBet" },
];

const money = (n: number) =>
  `₦${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const signedMoney = (n: number) => `${n >= 0 ? "+" : "-"}${money(n)}`;

interface AccaLeg {
  event: string;
  selection: string;
  odds: string;
}

const EMPTY_LEG: AccaLeg = { event: "", selection: "", odds: "" };

function StatTile({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "good" | "bad" }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <p className="text-xs font-medium text-[#1e293b]/55">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-bold tabular-nums text-[#0f172a]",
          tone === "good" && "text-emerald-600",
          tone === "bad" && "text-rose-600",
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-[#1e293b]/50">{sub}</p>}
    </div>
  );
}

function AddBetForm({
  prefill,
  onSaved,
}: {
  prefill: TrackerPrefill;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const prefillIsAcca =
    prefill.market === "Accumulator" || (prefill.legs ? Number(prefill.legs) > 1 : false);

  const [betType, setBetType] = useState<"single" | "accumulator">(
    prefillIsAcca ? "accumulator" : "single",
  );
  const [legs, setLegs] = useState<AccaLeg[]>([
    { ...EMPTY_LEG },
    { ...EMPTY_LEG },
  ]);

  const [form, setForm] = useState({
    eventName: prefill.event ?? "",
    selection: prefill.selection ?? "",
    market: prefill.market && MARKETS.includes(prefill.market) ? prefill.market : "1X2",
    bookmaker: prefill.bookmaker ?? "",
    odds: prefill.odds ?? "",
    stake: prefill.stake ?? "",
    yourProb: prefill.prob ?? "",
    legCount: prefill.legs ?? (prefillIsAcca ? "2" : "1"),
    notes: "",
  });

  const [bookingCode, setBookingCode] = useState("");
  const [codeBookie, setCodeBookie] = useState("sportybet");
  const [decoding, setDecoding] = useState(false);
  const [decodeNotice, setDecodeNotice] = useState<string | null>(null);

  const loadBookingCode = async () => {
    const clean = bookingCode.trim().toUpperCase();
    if (!clean) {
      setError("Enter a booking code first (e.g. JQW6XN).");
      return;
    }
    setDecoding(true);
    setError(null);
    setDecodeNotice(null);
    try {
      const res = await fetch(
        `/api/bet-assist/decode-slip?code=${encodeURIComponent(clean)}&bookmaker=${encodeURIComponent(codeBookie)}`,
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Could not decode booking code.");
        return;
      }
      const rawLegs: { event: string; selection: string; odds: number; modelProb: number | null }[] =
        data.legs ?? [];
      if (rawLegs.length === 0) {
        setError("No readable selections with decimal odds found in that booking code.");
        return;
      }

      const bookieInfo = CODE_BOOKMAKERS.find((b) => b.key === codeBookie);
      const bookieName = bookieInfo?.name ?? codeBookie;
      const allMatched = rawLegs.every((l) => l.modelProb !== null && l.modelProb > 0);
      const combinedModelProb = allMatched
        ? rawLegs.reduce((acc, l) => acc * (l.modelProb as number), 1)
        : null;
      const probStr =
        combinedModelProb !== null && combinedModelProb > 0 && combinedModelProb < 1
          ? String(Math.round(combinedModelProb * 1000) / 10)
          : "";

      if (rawLegs.length === 1) {
        const leg = rawLegs[0];
        setBetType("single");
        setForm((f) => ({
          ...f,
          eventName: leg.event || f.eventName,
          selection: leg.selection || f.selection,
          odds: Number(leg.odds).toFixed(2),
          bookmaker: bookieName,
          market: "1X2",
          legCount: "1",
          yourProb: probStr || f.yourProb,
          notes: `Code: ${clean}`,
        }));
      } else {
        const combinedOdds = rawLegs.reduce((acc, l) => acc * Number(l.odds), 1);
        setBetType("accumulator");
        setLegs(
          rawLegs.slice(0, 25).map((l) => ({
            event: l.event ?? "",
            selection: l.selection ?? "",
            odds: Number(l.odds).toFixed(2),
          })),
        );
        setForm((f) => ({
          ...f,
          eventName: rawLegs
            .map((l) => l.event)
            .filter(Boolean)
            .join(" / ")
            .slice(0, 190),
          selection: rawLegs
            .map((l) => l.selection)
            .filter(Boolean)
            .join(" + ")
            .slice(0, 190),
          odds: combinedOdds.toFixed(2),
          bookmaker: bookieName,
          market: "Accumulator",
          legCount: String(rawLegs.length),
          yourProb: probStr || f.yourProb,
          notes: `Code: ${clean}`,
        }));
      }

      setDecodeNotice(
        `Loaded ${rawLegs.length} selection${rawLegs.length === 1 ? "" : "s"} from ${bookieInfo?.label ?? bookieName} (${clean})${
          probStr ? ` · Dixon-Coles v2.0 est. ${probStr}%` : ""
        }. Enter your stake and click Save bet.`,
      );
    } catch {
      setError("Network error while decoding booking code. Please try again.");
    } finally {
      setDecoding(false);
    }
  };

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm({ ...form, [k]: e.target.value });

  const updateLeg = (idx: number, patch: Partial<AccaLeg>) => {
    setLegs((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };

  // Compute combined odds from filled accumulator legs
  const validLegs = legs.filter((l) => Number(l.odds) > 1);
  const computedAccaOdds =
    validLegs.length > 0
      ? validLegs.reduce((acc, l) => acc * Number(l.odds), 1)
      : null;

  const effectiveOdds =
    betType === "accumulator" && computedAccaOdds !== null
      ? Number(computedAccaOdds.toFixed(2))
      : Number(form.odds);

  const effectiveStake = Number(form.stake);
  const potentialReturn =
    Number.isFinite(effectiveOdds) &&
    effectiveOdds > 1 &&
    Number.isFinite(effectiveStake) &&
    effectiveStake > 0
      ? effectiveOdds * effectiveStake
      : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let eventName = form.eventName.trim();
    let selection = form.selection.trim();
    let market = betType === "accumulator" ? "Accumulator" : form.market;
    let odds = Number(form.odds);
    let legCount = 1;

    if (betType === "accumulator") {
      market = "Accumulator";
      if (validLegs.length >= 2) {
        odds = Number(computedAccaOdds!.toFixed(2));
        legCount = validLegs.length;
        if (!eventName) {
          eventName =
            validLegs
              .map((l) => l.event.trim())
              .filter(Boolean)
              .join(" / ")
              .slice(0, 190) || `${legCount}-leg accumulator`;
        }
        if (!selection) {
          selection =
            validLegs
              .map((l) => l.selection.trim() || `${l.event.trim() || "Leg"} @ ${l.odds}`)
              .join(" + ")
              .slice(0, 190);
        }
      } else {
        // Allow quick manual combined-odds entry for an accumulator (e.g. from Slip Checker prefill or booking code)
        const parsedLegs = Number(form.legCount);
        legCount = Number.isFinite(parsedLegs) && parsedLegs >= 2 ? Math.round(parsedLegs) : 2;
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

    start(async () => {
      const res = await addBet({
        eventName,
        selection,
        market,
        bookmaker: form.bookmaker || null,
        odds,
        stake: Number(form.stake),
        yourProb: form.yourProb.trim() ? Number(form.yourProb) / 100 : null,
        legCount,
        notes: form.notes || null,
      });
      if (!res.success) {
        setError(res.error ?? "Could not save bet");
        return;
      }
      setForm({
        eventName: "",
        selection: "",
        market: "1X2",
        bookmaker: form.bookmaker, // keep last used bookmaker for speed
        odds: "",
        stake: "",
        yourProb: "",
        legCount: "1",
        notes: "",
      });
      setLegs([{ ...EMPTY_LEG }, { ...EMPTY_LEG }]);
      setBookingCode("");
      setDecodeNotice(null);
      onSaved?.();
      router.replace("/dashboard/bet-tracker");
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-[#0f172a]">Log a bet</h2>
        <div className="inline-flex rounded-lg border border-border bg-slate-50 p-0.5">
          {(["single", "accumulator"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setBetType(t);
                if (t === "accumulator") {
                  setForm((f) => ({ ...f, market: "Accumulator", legCount: Number(f.legCount) > 1 ? f.legCount : "2" }));
                } else {
                  setForm((f) => ({ ...f, market: f.market === "Accumulator" ? "1X2" : f.market, legCount: "1" }));
                }
              }}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium capitalize transition",
                betType === t
                  ? "bg-[#3D2DFF] text-white shadow-sm"
                  : "text-[#1e293b]/60 hover:text-[#0f172a]",
              )}
            >
              {t === "single" ? "Single" : "Accumulator"}
            </button>
          ))}
        </div>
      </div>

      {/* Load by Booking Code */}
      <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-3.5 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0f172a]">
            <Ticket className="h-3.5 w-3.5 text-teal-600" />
            Load by Booking Code
          </div>
          <span className="text-[11px] text-[#1e293b]/55">Auto-fills legs, odds &amp; bookmaker</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-[180px_1fr_auto]">
          <select
            aria-label="Booking code bookmaker"
            value={codeBookie}
            onChange={(e) => setCodeBookie(e.target.value)}
            className="h-9 rounded-md border border-input bg-white px-2.5 text-xs font-medium text-[#0f172a]"
          >
            {CODE_BOOKMAKERS.map((b) => (
              <option key={b.key} value={b.key}>
                {b.label}
              </option>
            ))}
          </select>
          <Input
            value={bookingCode}
            onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                loadBookingCode();
              }
            }}
            placeholder="Booking code (e.g. JQW6XN)"
            className="h-9 bg-white text-xs font-mono uppercase tracking-wider"
          />
          <Button
            type="button"
            variant="teal"
            size="sm"
            disabled={decoding}
            onClick={loadBookingCode}
            className="h-9 gap-1.5"
          >
            {decoding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ticket className="h-3.5 w-3.5" />}
            {decoding ? "Loading..." : "Load code"}
          </Button>
        </div>
        {decodeNotice && (
          <p className="text-xs font-medium text-teal-800">{decodeNotice}</p>
        )}
      </div>

      {/* Bookmaker quick presets */}
      <div className="space-y-1.5">
        <Label htmlFor="bet-bookmaker" className="text-xs text-[#1e293b]/60">
          Bookmaker
        </Label>
        <div className="flex flex-wrap items-center gap-1.5">
          {BOOKMAKER_PRESETS.map((bm) => (
            <button
              key={bm}
              type="button"
              onClick={() => setForm((f) => ({ ...f, bookmaker: f.bookmaker === bm ? "" : bm }))}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs font-medium transition",
                form.bookmaker === bm
                  ? "border-teal-600 bg-teal-50 text-teal-700"
                  : "border-border bg-white text-[#1e293b]/65 hover:border-slate-300",
              )}
            >
              {bm}
            </button>
          ))}
          <Input
            id="bet-bookmaker"
            value={form.bookmaker}
            onChange={set("bookmaker")}
            placeholder="Or type other..."
            className="h-7 w-36 text-xs"
          />
        </div>
      </div>

      {betType === "single" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="bet-event" className="text-xs text-[#1e293b]/60">Match / event *</Label>
            <Input id="bet-event" required value={form.eventName} onChange={set("eventName")} placeholder="Arsenal v Chelsea" />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="bet-selection" className="text-xs text-[#1e293b]/60">Selection *</Label>
            <Input id="bet-selection" required value={form.selection} onChange={set("selection")} placeholder="Arsenal to win" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="bet-market" className="text-xs text-[#1e293b]/60">Market</Label>
            <select
              id="bet-market"
              value={form.market}
              onChange={set("market")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {MARKETS.filter((m) => m !== "Accumulator").map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="bet-odds" className="text-xs text-[#1e293b]/60">Decimal odds *</Label>
            <Input id="bet-odds" required inputMode="decimal" value={form.odds} onChange={set("odds")} placeholder="2.10" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="bet-stake" className="text-xs text-[#1e293b]/60">Stake (₦) *</Label>
            <Input id="bet-stake" required inputMode="decimal" value={form.stake} onChange={set("stake")} placeholder="1000" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="bet-prob" className="text-xs text-[#1e293b]/60">Your chance % (optional)</Label>
            <Input id="bet-prob" inputMode="decimal" value={form.yourProb} onChange={set("yourProb")} placeholder="e.g. 52" />
          </div>
          <div className="space-y-1 sm:col-span-2 lg:col-span-4">
            <Label htmlFor="bet-notes" className="text-xs text-[#1e293b]/60">Notes</Label>
            <Input id="bet-notes" value={form.notes} onChange={set("notes")} placeholder="Why you took it (optional)" />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Accumulator leg builder */}
          <div className="space-y-2 rounded-xl border border-border bg-slate-50/70 p-3.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[#0f172a]">
                Accumulator legs ({validLegs.length >= 2 ? `${validLegs.length} legs · Combined ${computedAccaOdds!.toFixed(2)}` : `${legs.length} rows`})
              </p>
              {legs.length < 25 && (
                <button
                  type="button"
                  onClick={() => setLegs((prev) => [...prev, { ...EMPTY_LEG }])}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#3D2DFF] hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" /> Add leg
                </button>
              )}
            </div>

            <div className="space-y-2">
              {legs.map((leg, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_1fr_84px_auto] items-center gap-2">
                  <Input
                    value={leg.event}
                    onChange={(e) => updateLeg(idx, { event: e.target.value })}
                    placeholder={`Leg ${idx + 1} match`}
                    className="h-8 bg-white text-xs"
                  />
                  <Input
                    value={leg.selection}
                    onChange={(e) => updateLeg(idx, { selection: e.target.value })}
                    placeholder="Pick (e.g. Over 2.5)"
                    className="h-8 bg-white text-xs"
                  />
                  <Input
                    inputMode="decimal"
                    value={leg.odds}
                    onChange={(e) => updateLeg(idx, { odds: e.target.value })}
                    placeholder="Odds"
                    className="h-8 bg-white text-xs tabular-nums"
                  />
                  {legs.length > 2 ? (
                    <button
                      type="button"
                      aria-label={`Remove leg ${idx + 1}`}
                      onClick={() => setLegs((prev) => prev.filter((_, i) => i !== idx))}
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
            <p className="text-[11px] text-[#1e293b]/50">
              Fill leg odds above to auto-calculate combined odds, or enter combined odds &amp; leg count directly below.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <Label htmlFor="acca-odds" className="text-xs text-[#1e293b]/60">Combined odds *</Label>
              <Input
                id="acca-odds"
                inputMode="decimal"
                required={validLegs.length < 2}
                value={validLegs.length >= 2 ? computedAccaOdds!.toFixed(2) : form.odds}
                readOnly={validLegs.length >= 2}
                onChange={set("odds")}
                placeholder="6.50"
                className={validLegs.length >= 2 ? "bg-slate-50 font-semibold" : ""}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="acca-legs" className="text-xs text-[#1e293b]/60">Number of legs *</Label>
              <Input
                id="acca-legs"
                type="number"
                min={2}
                max={50}
                inputMode="numeric"
                value={validLegs.length >= 2 ? String(validLegs.length) : form.legCount}
                readOnly={validLegs.length >= 2}
                onChange={set("legCount")}
                className={validLegs.length >= 2 ? "bg-slate-50 font-semibold" : ""}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="acca-stake" className="text-xs text-[#1e293b]/60">Stake (₦) *</Label>
              <Input id="acca-stake" required inputMode="decimal" value={form.stake} onChange={set("stake")} placeholder="1000" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="acca-prob" className="text-xs text-[#1e293b]/60">Your chance % (optional)</Label>
              <Input id="acca-prob" inputMode="decimal" value={form.yourProb} onChange={set("yourProb")} placeholder="e.g. 15" />
            </div>
            {validLegs.length < 2 && (
              <>
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="acca-event" className="text-xs text-[#1e293b]/60">Slip title / booking code (optional)</Label>
                  <Input id="acca-event" value={form.eventName} onChange={set("eventName")} placeholder="e.g. Saturday EPL 5-fold (BC1234)" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="acca-selection" className="text-xs text-[#1e293b]/60">Summary of picks *</Label>
                  <Input id="acca-selection" required value={form.selection} onChange={set("selection")} placeholder="Arsenal + Liverpool + Over 2.5..." />
                </div>
              </>
            )}
            <div className="space-y-1 sm:col-span-2 lg:col-span-4">
              <Label htmlFor="acca-notes" className="text-xs text-[#1e293b]/60">Notes</Label>
              <Input id="acca-notes" value={form.notes} onChange={set("notes")} placeholder="Booking code or reasoning (optional)" />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <Button type="submit" variant="teal" disabled={pending}>
            {pending ? "Saving…" : betType === "accumulator" ? "Log accumulator" : "Log single bet"}
          </Button>
          {potentialReturn !== null && (
            <span className="text-xs text-[#1e293b]/60 tabular-nums">
              Potential return: <strong className="text-[#0f172a]">{money(potentialReturn)}</strong>
            </span>
          )}
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>
    </form>
  );
}

function EditBetRow({ bet, onDone }: { bet: JournalBet; onDone: () => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    eventName: bet.eventName,
    selection: bet.selection,
    market: MARKETS.includes(bet.market) ? bet.market : "Other",
    bookmaker: bet.bookmaker ?? "",
    odds: String(bet.odds),
    stake: String(bet.stake),
    legCount: String(bet.legCount ?? 1),
    yourProb: bet.yourProb !== null ? String(Math.round(bet.yourProb * 1000) / 10) : "",
    notes: bet.notes ?? "",
  });

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm({ ...form, [k]: e.target.value });

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await updateBet({
        id: bet.id,
        eventName: form.eventName,
        selection: form.selection,
        market: form.market,
        bookmaker: form.bookmaker || null,
        odds: Number(form.odds),
        stake: Number(form.stake),
        legCount: Math.max(1, Math.round(Number(form.legCount) || 1)),
        yourProb: form.yourProb.trim() ? Number(form.yourProb) / 100 : null,
        notes: form.notes || null,
      });
      if (!res.success) {
        setError(res.error ?? "Update failed");
        return;
      }
      onDone();
      router.refresh();
    });
  };

  return (
    <form onSubmit={save} className="space-y-3 bg-slate-50/80 px-6 py-4">
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <Input value={form.eventName} onChange={set("eventName")} placeholder="Match / event" className="h-8 bg-white text-xs sm:col-span-2" required />
        <Input value={form.selection} onChange={set("selection")} placeholder="Selection" className="h-8 bg-white text-xs sm:col-span-2" required />
        <select
          value={form.market}
          onChange={set("market")}
          className="h-8 rounded-md border border-input bg-white px-2 text-xs"
        >
          {MARKETS.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <Input value={form.bookmaker} onChange={set("bookmaker")} placeholder="Bookmaker" className="h-8 bg-white text-xs" />
        <Input inputMode="decimal" value={form.odds} onChange={set("odds")} placeholder="Odds" className="h-8 bg-white text-xs" required />
        <Input inputMode="decimal" value={form.stake} onChange={set("stake")} placeholder="Stake (₦)" className="h-8 bg-white text-xs" required />
        <Input type="number" min={1} max={50} value={form.legCount} onChange={set("legCount")} placeholder="Legs" className="h-8 bg-white text-xs" />
        <Input inputMode="decimal" value={form.yourProb} onChange={set("yourProb")} placeholder="Your chance %" className="h-8 bg-white text-xs" />
        <Input value={form.notes} onChange={set("notes")} placeholder="Notes" className="h-8 bg-white text-xs sm:col-span-2" />
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" variant="teal" className="h-7 text-xs" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
        <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={onDone}>
          Cancel
        </Button>
        {error && <span className="text-xs text-rose-600">{error}</span>}
      </div>
    </form>
  );
}

function SettleControls({ bet, onEdit }: { bet: JournalBet; onEdit: () => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<BetStatus>(bet.status);
  const [cashout, setCashout] = useState(bet.cashoutAmount?.toString() ?? "");
  const [closing, setClosing] = useState(bet.closingOdds?.toString() ?? "");
  const [error, setError] = useState<string | null>(null);

  const dirty =
    status !== bet.status ||
    (status === "cashed_out" && cashout !== (bet.cashoutAmount?.toString() ?? "")) ||
    closing !== (bet.closingOdds?.toString() ?? "");

  const quickSettle = (next: "won" | "lost") =>
    start(async () => {
      const res = await settleBet({
        id: bet.id,
        status: next,
        cashoutAmount: null,
        closingOdds: closing.trim() ? Number(closing) : null,
      });
      if (!res.success) setError(res.error ?? "Update failed");
      else {
        setStatus(next);
        setError(null);
        router.refresh();
      }
    });

  const save = () =>
    start(async () => {
      const res = await settleBet({
        id: bet.id,
        status,
        cashoutAmount: cashout.trim() ? Number(cashout) : null,
        closingOdds: closing.trim() ? Number(closing) : null,
      });
      if (!res.success) setError(res.error ?? "Update failed");
      else {
        setError(null);
        router.refresh();
      }
    });

  const remove = () =>
    start(async () => {
      const res = await deleteBet(bet.id);
      if (res.success) router.refresh();
      else setError(res.error ?? "Delete failed");
    });

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      {bet.status === "pending" && (
        <>
          <button
            type="button"
            disabled={pending}
            onClick={() => quickSettle("won")}
            title="Mark Won"
            className="inline-flex h-8 items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" /> Won
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => quickSettle("lost")}
            title="Mark Lost"
            className="inline-flex h-8 items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" /> Lost
          </button>
        </>
      )}

      <select
        aria-label="Result"
        value={status}
        onChange={(e) => setStatus(e.target.value as BetStatus)}
        className="h-8 rounded-md border border-input bg-background px-2 text-xs"
      >
        {BET_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      {status === "cashed_out" && (
        <Input
          aria-label="Cash-out amount"
          className="h-8 w-24 text-xs"
          placeholder="Cash-out ₦"
          inputMode="decimal"
          value={cashout}
          onChange={(e) => setCashout(e.target.value)}
        />
      )}
      <Input
        aria-label="Closing odds"
        className="h-8 w-20 text-xs"
        placeholder="Close"
        title="Closing odds (optional) — for closing-line value"
        inputMode="decimal"
        value={closing}
        onChange={(e) => setClosing(e.target.value)}
      />
      {dirty && (
        <Button size="sm" variant="teal" className="h-8" disabled={pending} onClick={save}>
          Save
        </Button>
      )}
      <button
        type="button"
        aria-label="Edit bet"
        disabled={pending}
        onClick={onEdit}
        className="p-1 text-[#1e293b]/40 hover:text-[#3D2DFF]"
        title="Edit bet"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        aria-label="Delete bet"
        disabled={pending}
        onClick={remove}
        className="p-1 text-[#1e293b]/35 hover:text-rose-600"
        title="Delete bet"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      {error && <p className="w-full text-right text-xs text-rose-600">{error}</p>}
    </div>
  );
}

function exportBetsCsv(bets: JournalBet[]) {
  const headers = [
    "Date",
    "Event",
    "Selection",
    "Market",
    "Legs",
    "Bookmaker",
    "Odds",
    "Stake (NGN)",
    "Status",
    "Profit (NGN)",
    "Closing Odds",
    "Your Prob %",
    "Notes",
  ];
  const esc = (v: string | number | null | undefined) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = bets.map((b) => [
    new Date(b.placedAt).toISOString().slice(0, 10),
    b.eventName,
    b.selection,
    b.market,
    b.legCount ?? 1,
    b.bookmaker ?? "",
    b.odds.toFixed(2),
    b.stake,
    b.status,
    b.status === "pending" ? "" : betProfit(b).toFixed(2),
    b.closingOdds ?? "",
    b.yourProb !== null ? (b.yourProb * 100).toFixed(1) : "",
    b.notes ?? "",
  ]);
  const csv = [headers, ...rows].map((r) => r.map(esc).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `punterstat-bets-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function BetTracker({ bets, prefill }: { bets: JournalBet[]; prefill: TrackerPrefill }) {
  const hasPrefill = Boolean(prefill.event || prefill.selection || prefill.odds);
  const [formOpen, setFormOpen] = useState(bets.length === 0 || hasPrefill);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [now] = useState(() => Date.now());
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "settled">("all");
  const [rangeFilter, setRangeFilter] = useState<"all" | "7d" | "30d" | "90d">("all");
  const [bookmakerFilter, setBookmakerFilter] = useState<string>("all");
  const [marketFilter, setMarketFilter] = useState<string>("all");

  const bookmakers = useMemo(() => {
    const set = new Set<string>();
    for (const b of bets) if (b.bookmaker) set.add(b.bookmaker);
    return Array.from(set).sort();
  }, [bets]);

  const markets = useMemo(() => {
    const set = new Set<string>();
    for (const b of bets) if (b.market) set.add(b.market);
    return Array.from(set).sort();
  }, [bets]);

  const filtered = useMemo(() => {
    const cutoff =
      rangeFilter === "7d"
        ? now - 7 * 86_400_000
        : rangeFilter === "30d"
          ? now - 30 * 86_400_000
          : rangeFilter === "90d"
            ? now - 90 * 86_400_000
            : 0;

    return bets.filter((b) => {
      if (statusFilter === "pending" && b.status !== "pending") return false;
      if (statusFilter === "settled" && b.status === "pending") return false;
      if (cutoff && new Date(b.placedAt).getTime() < cutoff) return false;
      if (bookmakerFilter !== "all" && (b.bookmaker ?? "") !== bookmakerFilter) return false;
      if (marketFilter !== "all" && b.market !== marketFilter) return false;
      return true;
    });
  }, [bets, now, statusFilter, rangeFilter, bookmakerFilter, marketFilter]);

  const stats = useMemo(() => journalStats(filtered), [filtered]);

  return (
    <div className="space-y-6">
      {/* Action bar: Log bet + Load Betcode + Export CSV */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {bets.length > 0 && (
            <Button
              type="button"
              variant={formOpen ? "outline" : "teal"}
              size="sm"
              onClick={() => setFormOpen((v) => !v)}
              className="gap-1.5"
            >
              {formOpen ? (
                <>
                  <ChevronUp className="h-4 w-4" /> Hide bet form
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Log a bet
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </>
              )}
            </Button>
          )}
          {!formOpen && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFormOpen(true)}
              className="gap-1.5"
            >
              <Ticket className="h-3.5 w-3.5 text-teal-600" /> Load Betcode
            </Button>
          )}
        </div>

        {bets.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => exportBetsCsv(filtered)}
            className="gap-1.5"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        )}
      </div>

      {formOpen && (
        <AddBetForm
          key={JSON.stringify(prefill)}
          prefill={prefill}
          onSaved={() => {
            if (bets.length > 0) setFormOpen(false);
          }}
        />
      )}

      {bets.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile
              label="Profit / loss"
              value={signedMoney(stats.profit)}
              sub={`${stats.settledBets} settled · ${money(stats.staked)} staked`}
              tone={stats.profit >= 0 ? "good" : "bad"}
            />
            <StatTile
              label="ROI"
              value={`${stats.roi >= 0 ? "+" : ""}${pct(stats.roi)}`}
              sub="Profit ÷ total staked"
              tone={stats.roi >= 0 ? "good" : "bad"}
            />
            <StatTile
              label="Strike rate"
              value={pct(stats.strikeRate)}
              sub={stats.avgOdds ? `Break-even at avg odds ${stats.avgOdds.toFixed(2)}: ${pct(stats.breakEvenRate)}` : undefined}
            />
            <StatTile
              label="Closing-line value"
              value={stats.avgClv === null ? "—" : `${stats.avgClv >= 0 ? "+" : ""}${pct(stats.avgClv)}`}
              sub={stats.clvSamples ? `${stats.clvSamples} bets with closing odds` : "Add closing odds to track"}
              tone={stats.avgClv === null ? undefined : stats.avgClv >= 0 ? "good" : "bad"}
            />
          </div>

          {stats.curve.length >= 2 && (
            <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-[#0f172a]">Cumulative profit (₦)</h2>
              <p className="mb-4 text-xs text-[#1e293b]/50">
                After each settled bet · longest losing run: {stats.longestLosingRun}
                {stats.pendingBets > 0 && ` · ${stats.pendingBets} pending (${money(stats.pendingStake)} at stake)`}
              </p>
              <BetTrackerChart data={stats.curve} />
            </section>
          )}

          {stats.byMarket.length > 1 && (
            <section className="overflow-x-auto rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h2 className="mb-3 font-semibold text-[#0f172a]">By market</h2>
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-[#1e293b]/50">
                  <tr>
                    <th className="pb-2">Market</th>
                    <th className="pb-2 text-right">Bets</th>
                    <th className="pb-2 text-right">Staked</th>
                    <th className="pb-2 text-right">Profit</th>
                    <th className="pb-2 text-right">ROI</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {stats.byMarket.map((m) => (
                    <tr key={m.market} className="border-t border-border">
                      <td className="py-2">{m.market}</td>
                      <td className="py-2 text-right">{m.bets}</td>
                      <td className="py-2 text-right">{money(m.staked)}</td>
                      <td className={cn("py-2 text-right", m.profit >= 0 ? "text-emerald-600" : "text-rose-600")}>
                        {signedMoney(m.profit)}
                      </td>
                      <td className="py-2 text-right">{pct(m.roi)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          <section className="rounded-2xl border border-border bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
              <h2 className="font-semibold text-[#0f172a]">
                Your bets <span className="text-xs font-normal text-[#1e293b]/50">({filtered.length})</span>
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                {/* Time range */}
                <div className="inline-flex rounded-full border border-border bg-slate-50 p-0.5">
                  {(["7d", "30d", "90d", "all"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRangeFilter(r)}
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium",
                        rangeFilter === r ? "bg-[#0f172a] text-white" : "text-[#1e293b]/60 hover:text-[#0f172a]",
                      )}
                    >
                      {r === "all" ? "All time" : r}
                    </button>
                  ))}
                </div>

                {/* Bookmaker filter */}
                {bookmakers.length > 0 && (
                  <select
                    aria-label="Filter by bookmaker"
                    value={bookmakerFilter}
                    onChange={(e) => setBookmakerFilter(e.target.value)}
                    className="h-7 rounded-full border border-border bg-white px-2.5 text-xs text-[#1e293b]/75"
                  >
                    <option value="all">All books</option>
                    {bookmakers.map((bm) => (
                      <option key={bm} value={bm}>{bm}</option>
                    ))}
                  </select>
                )}

                {/* Market filter */}
                {markets.length > 1 && (
                  <select
                    aria-label="Filter by market"
                    value={marketFilter}
                    onChange={(e) => setMarketFilter(e.target.value)}
                    className="h-7 rounded-full border border-border bg-white px-2.5 text-xs text-[#1e293b]/75"
                  >
                    <option value="all">All markets</option>
                    {markets.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                )}

                {/* Status filter */}
                <div className="flex gap-1">
                  {(["all", "pending", "settled"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setStatusFilter(f)}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium capitalize",
                        statusFilter === f ? "bg-[#3D2DFF] text-white" : "text-[#1e293b]/60 hover:bg-slate-100",
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <ul className="divide-y divide-border">
              {filtered.map((b) => {
                if (editingId === b.id) {
                  return (
                    <li key={b.id}>
                      <EditBetRow bet={b} onDone={() => setEditingId(null)} />
                    </li>
                  );
                }
                const p = betProfit(b);
                return (
                  <li key={b.id} className="grid gap-3 px-6 py-4 md:grid-cols-[1fr_auto] md:items-center">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[#0f172a]">{b.selection}</p>
                      <p className="truncate text-xs text-[#1e293b]/50">
                        {b.eventName} · {b.market}
                        {(b.legCount ?? 1) > 1 && ` (${b.legCount} legs)`}
                        {b.bookmaker && ` · ${b.bookmaker}`} ·{" "}
                        {new Date(b.placedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </p>
                      <p className="mt-1 text-xs tabular-nums text-[#1e293b]/70">
                        {money(b.stake)} @ {b.odds.toFixed(2)}
                        {b.yourProb !== null && ` · your chance ${pct(b.yourProb, 0)}`}
                        {b.status !== "pending" && (
                          <span className={cn("ml-2 font-semibold", p >= 0 ? "text-emerald-600" : "text-rose-600")}>
                            {signedMoney(p)}
                          </span>
                        )}
                      </p>
                    </div>
                    <SettleControls
                      key={`${b.status}-${b.closingOdds}-${b.cashoutAmount}`}
                      bet={b}
                      onEdit={() => setEditingId(b.id)}
                    />
                  </li>
                );
              })}
              {filtered.length === 0 && (
                <li className="px-6 py-8 text-center text-sm text-[#1e293b]/50">No bets match these filters.</li>
              )}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
