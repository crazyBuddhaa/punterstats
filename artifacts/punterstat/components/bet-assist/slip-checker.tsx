"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  Plus,
  Share2,
  ShieldAlert,
  Sparkles,
  Ticket,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { assessSlip, type SlipAssessment, type SlipRisk } from "@/lib/bet-assist/slip";
import { pct } from "@/lib/bet-assist/calculators";
import {
  scoreSlipWithPunterModel,
  type PunterBehaviorModel,
} from "@/lib/model/punter-model";
import type { CompetitionStage, LineupStatus } from "@/lib/football/match-intel";
import type { FootballLegReview } from "@/app/api/bet-assist/analyze-slip/route";
import { BOOKING_CODE_BOOKMAKERS } from "@/lib/bet-assist/booking-code";
import { CashOutEvaluator } from "./cash-out-evaluator";
import { cn } from "@/lib/utils";

const CODE_BOOKMAKERS = BOOKING_CODE_BOOKMAKERS;

const STAGE_OPTIONS: Array<{ value: CompetitionStage; label: string }> = [
  { value: "league", label: "League" },
  { value: "cup_knockout", label: "Cup / Knockout" },
  { value: "cup_group", label: "Cup Group" },
  { value: "derby", label: "Derby" },
  { value: "relegation_or_title", label: "Title / Relegation" },
];

const LINEUP_OPTIONS: Array<{ value: LineupStatus; label: string }> = [
  { value: "full_strength", label: "Full strength" },
  { value: "minor_absences", label: "Minor absences" },
  { value: "key_starters_out", label: "Key starters out" },
  { value: "heavy_rotation", label: "Heavy rotation" },
];

interface LegDraft {
  event: string;
  selection: string;
  odds: string;
  competitionStage: CompetitionStage;
  homeLineup: LineupStatus;
  awayLineup: LineupStatus;
}

const EMPTY_LEG: LegDraft = {
  event: "",
  selection: "",
  odds: "",
  competitionStage: "league",
  homeLineup: "full_strength",
  awayLineup: "full_strength",
};

const SAMPLE: LegDraft[] = [
  { event: "Arsenal vs Everton", selection: "Arsenal to win", odds: "1.30", competitionStage: "league", homeLineup: "full_strength", awayLineup: "full_strength" },
  { event: "Chelsea vs Fulham", selection: "Chelsea to win", odds: "1.55", competitionStage: "derby", homeLineup: "full_strength", awayLineup: "full_strength" },
  { event: "Liverpool vs Brentford", selection: "Over 2.5 goals", odds: "1.62", competitionStage: "league", homeLineup: "full_strength", awayLineup: "minor_absences" },
  { event: "Newcastle vs Wolves", selection: "Newcastle to win", odds: "1.70", competitionStage: "league", homeLineup: "full_strength", awayLineup: "full_strength" },
];

const RISK_STYLE: Record<SlipRisk, { label: string; className: string; blurb: string }> = {
  low: { label: "Low risk", className: "bg-emerald-50 text-emerald-700 border-emerald-200", blurb: "Solid probability profile." },
  moderate: { label: "Moderate risk", className: "bg-sky-50 text-sky-700 border-sky-200", blurb: "Lands roughly 1 in 2 to 4 tries." },
  high: { label: "High risk", className: "bg-amber-50 text-amber-800 border-amber-200", blurb: "Longer accumulator — protect against trap legs." },
  very_high: { label: "Very high risk", className: "bg-rose-50 text-rose-700 border-rose-200", blurb: "Long shot — trim weak legs to boost survival." },
};

const naira = (n: number) =>
  `${n < 0 ? "-" : ""}₦${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

function getInitialLegsFromQuery(): LegDraft[] {
  if (typeof window === "undefined") {
    return [{ ...EMPTY_LEG }, { ...EMPTY_LEG }, { ...EMPTY_LEG }];
  }
  try {
    const raw = new URLSearchParams(window.location.search).get("legs");
    if (!raw) return [{ ...EMPTY_LEG }, { ...EMPTY_LEG }, { ...EMPTY_LEG }];
    const parsed = JSON.parse(raw) as Array<{ event?: string; selection?: string; odds?: string | number }>;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [{ ...EMPTY_LEG }, { ...EMPTY_LEG }, { ...EMPTY_LEG }];
    }
    return parsed.slice(0, 50).map((l) => ({
      event: String(l.event ?? ""),
      selection: String(l.selection ?? ""),
      odds: l.odds != null ? String(l.odds) : "",
      competitionStage: "league",
      homeLineup: "full_strength",
      awayLineup: "full_strength",
    }));
  } catch {
    return [{ ...EMPTY_LEG }, { ...EMPTY_LEG }, { ...EMPTY_LEG }];
  }
}

export function SlipChecker({
  isAuthenticated = false,
  punterModel = null,
}: {
  isAuthenticated?: boolean;
  punterModel?: PunterBehaviorModel | null;
}) {
  const [activeTab, setActiveTab] = useState<"slip" | "cashout">(() => {
    if (typeof window === "undefined") return "slip";
    return new URLSearchParams(window.location.search).get("tab") === "cashout" ? "cashout" : "slip";
  });
  const [legs, setLegs] = useState<LegDraft[]>(getInitialLegsFromQuery);
  const [stake, setStake] = useState("1000");
  const [bonusPct, setBonusPct] = useState("0");
  const [result, setResult] = useState<SlipAssessment | null>(null);
  const [footballReviews, setFootballReviews] = useState<FootballLegReview[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedVerdict, setCopiedVerdict] = useState(false);

  const [bookingCode, setBookingCode] = useState("");
  const [codeBookie, setCodeBookie] = useState("sportybet");
  const [decoding, setDecoding] = useState(false);
  const [decodeNotice, setDecodeNotice] = useState<string | null>(null);

  const runFullAnalysis = async (drafts: LegDraft[], stakeVal: number) => {
    const valid = drafts
      .filter((l) => l.odds.trim() !== "")
      .map((l) => ({
        event: l.event.trim(),
        selection: l.selection.trim() || "Selection",
        decimalOdds: Number(l.odds),
        competitionStage: l.competitionStage,
        homeLineup: l.homeLineup,
        awayLineup: l.awayLineup,
      }));

    if (valid.length === 0) {
      setError("Add at least one leg with decimal odds greater than 1.00.");
      return;
    }
    if (valid.some((l) => !(l.decimalOdds > 1))) {
      setError("Every leg needs decimal odds greater than 1.00.");
      return;
    }
    if (!(stakeVal > 0)) {
      setError("Enter a stake above ₦0.");
      return;
    }

    setError(null);
    setAnalyzing(true);
    try {
      let reviews: FootballLegReview[] = [];
      const res = await fetch("/api/bet-assist/analyze-slip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ legs: valid }),
      });
      if (res.ok) {
        const data = (await res.json()) as { success?: boolean; reviews?: FootballLegReview[] };
        if (data.success && Array.isArray(data.reviews)) {
          reviews = data.reviews;
        }
      }

      setFootballReviews(reviews);

      const assessment = assessSlip(
        valid.map((l, idx) => ({
          event: l.event || undefined,
          selection: l.selection,
          decimalOdds: l.decimalOdds,
          yourProb: reviews[idx]?.footballProb ?? null,
        })),
        stakeVal,
      );

      if (!assessment) {
        setError("Could not evaluate slip — check your odds and stake.");
        return;
      }
      setResult(assessment);
    } catch {
      // Fallback to local assessment if network hiccups
      const assessment = assessSlip(
        valid.map((l) => ({
          event: l.event || undefined,
          selection: l.selection,
          decimalOdds: l.decimalOdds,
          yourProb: null,
        })),
        stakeVal,
      );
      setFootballReviews([]);
      if (assessment) setResult(assessment);
    } finally {
      setAnalyzing(false);
    }
  };

  const decodeBookingCode = async () => {
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
      const decodedLegs: LegDraft[] = (data.legs ?? []).map(
        (l: { event: string; selection: string; odds: number }) => ({
          event: l.event ?? "",
          selection: l.selection ?? "",
          odds: Number(l.odds).toFixed(2),
          competitionStage: "league",
          homeLineup: "full_strength",
          awayLineup: "full_strength",
        }),
      );
      if (decodedLegs.length === 0) {
        setError("No readable selections with decimal odds found in that booking code.");
        return;
      }
      setLegs(decodedLegs);
      setDecodeNotice(`Loaded ${decodedLegs.length} legs from ${data.bookmaker} (${data.code}). Running football analysis…`);
      await runFullAnalysis(decodedLegs, Number(stake) || 1000);
    } catch {
      setError("Network error while decoding booking code. Please try again.");
    } finally {
      setDecoding(false);
    }
  };

  const updateLeg = (i: number, patch: Partial<LegDraft>) => {
    setLegs((prev) => prev.map((l, j) => (j === i ? { ...l, ...patch } : l)));
    setResult(null);
  };

  const bonus = Math.max(0, Number.isFinite(Number(bonusPct)) ? Number(bonusPct) : 0);
  const stakeNum = Number(stake) || 0;
  const boostedProfit = result ? result.potentialProfit * (1 + bonus / 100) : 0;
  const boostedReturn = result ? stakeNum + boostedProfit : 0;
  const trapLegs = footballReviews.filter((r) => r.isTrapLeg);
  const matchedFootballLegs = footballReviews.filter((r) => r.matchedTeams).length;

  const personalScore =
    result && punterModel
      ? scoreSlipWithPunterModel(punterModel, {
          legCount: result.legs.length,
          combinedOdds: result.combinedOdds,
          stake: stakeNum,
        })
      : null;

  function buildVerdictText(r: SlipAssessment): string {
    const chance = pct(r.effectiveProb, 1);
    const cut1 = r.legs.length > 1 ? ` | Cut-by-1 chance: ${pct(r.cutBreakdown.cutByOneProb, 1)}` : "";
    return [
      `PunterStat Slip Check (${r.legs.length}-leg ${r.legs.length > 1 ? "acca" : "single"})`,
      `• Risk: ${RISK_STYLE[r.risk].label} (lands ~1 in ${r.oneWinEvery})`,
      `• Combined odds: ${r.combinedOdds.toFixed(2)} | Stake: ${naira(stakeNum)} -> ${naira(bonus > 0 ? boostedReturn : r.potentialReturn)}`,
      `• Football-adjusted chance: ${chance}${cut1} | Trap legs flagged: ${trapLegs.length}`,
      `• Checked on punterstat.site/bet-assist/slip-checker`,
    ].join("\n");
  }

  async function applyTrimSuggestion(droppedIndices: number[]) {
    const dropSet = new Set(droppedIndices);
    const remaining = legs.filter((_, idx) => !dropSet.has(idx));
    if (remaining.length === 0) return;
    setLegs(remaining);
    await runFullAnalysis(remaining, Number(stake) || 1000);
  }

  async function swapLegOption(legIndex: number, newSelection: string, fairOdds: number) {
    const updated = legs.map((l, idx) =>
      idx === legIndex ? { ...l, selection: newSelection, odds: fairOdds.toFixed(2) } : l,
    );
    setLegs(updated);
    await runFullAnalysis(updated, Number(stake) || 1000);
  }

  function copyVerdict() {
    if (!result) return;
    navigator.clipboard
      ?.writeText(buildVerdictText(result))
      .then(() => {
        setCopiedVerdict(true);
        setTimeout(() => setCopiedVerdict(false), 1800);
      })
      .catch(() => {});
  }

  function shareVerdictWhatsApp() {
    if (!result) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(buildVerdictText(result))}`, "_blank", "noopener,noreferrer");
  }

  const trackerQuery = result
    ? new URLSearchParams({
        event:
          result.legs.length === 1
            ? result.legs[0].event || "Match"
            : result.legs
                .map((l) => l.event)
                .filter(Boolean)
                .join(" / ")
                .slice(0, 180) || `${result.legs.length}-leg accumulator`,
        selection: result.legs
          .map((l) => l.selection)
          .join(" + ")
          .slice(0, 180),
        odds: result.combinedOdds.toFixed(2),
        stake: String(stakeNum),
        market: result.legs.length > 1 ? "Accumulator" : "1X2",
        legs: String(result.legs.length),
      }).toString()
    : "";

  return (
    <div className="space-y-8">
      {/* Mode switcher: Check Slip | Cash-Out Evaluator */}
      <div className="inline-flex rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("slip")}
          className={cn(
            "rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition",
            activeTab === "slip"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900",
          )}
        >
          Check Slip
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("cashout")}
          className={cn(
            "rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition",
            activeTab === "cashout"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900",
          )}
        >
          Cash-Out Evaluator
        </button>
      </div>

      {activeTab === "cashout" ? (
        <CashOutEvaluator
          key={result ? `${stakeNum}-${result.combinedOdds.toFixed(2)}` : "standalone"}
          prefill={
            result
              ? {
                  stake: stakeNum,
                  combinedOdds: result.combinedOdds,
                  winProbPct: result.effectiveProb * 100,
                }
              : undefined
          }
        />
      ) : (
        <>
      {/* 1. Booking Code Import (Flat section, no box-in-box) */}
      <section className="space-y-3 border-b border-slate-200 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-900">Import by Booking Code</h2>
          </div>
          <span className="text-xs text-slate-500">
            Paste a SportyBet, Bet9ja, Football.com, or BetKing code to audit every leg
          </span>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-[190px_1fr_auto]">
          <select
            aria-label="Bookmaker"
            value={codeBookie}
            onChange={(e) => setCodeBookie(e.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
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
                decodeBookingCode();
              }
            }}
            placeholder="Booking code (e.g. JQW6XN)"
            className="h-10 bg-white font-mono uppercase tracking-wider"
          />
          <Button
            type="button"
            variant="teal"
            disabled={decoding || analyzing}
            onClick={decodeBookingCode}
            className="h-10 gap-1.5"
          >
            {decoding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ticket className="h-4 w-4" />}
            {decoding ? "Decoding…" : "Load & Check"}
          </Button>
        </div>

        {decodeNotice && <p className="text-xs font-medium text-teal-700">{decodeNotice}</p>}
      </section>

      {/* 2. Accumulator Leg Builder (Flat table/list layout) */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Your Slip Selections ({legs.length} {legs.length === 1 ? "leg" : "legs"})
            </h2>
            <p className="text-xs text-slate-500">
              We evaluate each leg using team strength (Elo/Dixon-Coles), recent form, H2H history, competition stage, lineup status, and bookmaker odds.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setLegs(SAMPLE);
              setResult(null);
              setFootballReviews([]);
            }}
            className="text-xs font-semibold text-[#3D2DFF] hover:underline"
          >
            Load 4-leg sample
          </button>
        </div>

        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {legs.map((leg, i) => (
            <div key={i} className="grid gap-2.5 py-3.5 md:grid-cols-[1.3fr_1.1fr_86px_130px_135px_auto] md:items-center">
              <Input
                value={leg.event}
                onChange={(e) => updateLeg(i, { event: e.target.value })}
                placeholder={`Match ${i + 1} (e.g. Arsenal vs Chelsea)`}
                className="h-9 bg-white text-xs"
              />
              <Input
                value={leg.selection}
                onChange={(e) => updateLeg(i, { selection: e.target.value })}
                placeholder="Pick (e.g. Arsenal to win, Over 2.5, 1X)"
                className="h-9 bg-white text-xs"
              />
              <Input
                inputMode="decimal"
                value={leg.odds}
                onChange={(e) => updateLeg(i, { odds: e.target.value })}
                placeholder="Odds"
                className="h-9 bg-white text-xs tabular-nums"
              />
              <select
                aria-label={`Leg ${i + 1} competition stage`}
                value={leg.competitionStage}
                onChange={(e) => updateLeg(i, { competitionStage: e.target.value as CompetitionStage })}
                className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700"
              >
                {STAGE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <select
                aria-label={`Leg ${i + 1} lineup status`}
                value={leg.homeLineup}
                onChange={(e) => updateLeg(i, { homeLineup: e.target.value as LineupStatus })}
                className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700"
                title="Squad / lineup strength for your backed side"
              >
                {LINEUP_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {legs.length > 1 ? (
                <button
                  type="button"
                  aria-label={`Remove leg ${i + 1}`}
                  onClick={() => {
                    setLegs((prev) => prev.filter((_, j) => j !== i));
                    setResult(null);
                  }}
                  className="inline-flex h-9 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : (
                <span className="w-8" />
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4 pt-1">
          <div className="flex flex-wrap items-end gap-3">
            {legs.length < 50 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setLegs((prev) => [...prev, { ...EMPTY_LEG }])}
                className="h-10 gap-1.5"
              >
                <Plus className="h-4 w-4" /> Add leg
              </Button>
            )}
            <div className="space-y-1">
              <Label htmlFor="slip-stake" className="text-[11px] uppercase tracking-wide text-slate-500">
                Stake (₦)
              </Label>
              <Input
                id="slip-stake"
                inputMode="decimal"
                value={stake}
                onChange={(e) => {
                  setStake(e.target.value);
                  setResult(null);
                }}
                className="h-10 w-32 bg-white tabular-nums"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="slip-bonus" className="text-[11px] uppercase tracking-wide text-slate-500">
                Acca Bonus (%)
              </Label>
              <Input
                id="slip-bonus"
                inputMode="decimal"
                value={bonusPct}
                onChange={(e) => setBonusPct(e.target.value)}
                placeholder="0"
                className="h-10 w-24 bg-white tabular-nums"
              />
            </div>
          </div>

          <Button
            type="button"
            disabled={analyzing}
            onClick={() => runFullAnalysis(legs, Number(stake))}
            className="h-10 gap-2 bg-[#3D2DFF] px-6 text-white hover:bg-[#3D2DFF]/90"
          >
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {analyzing ? "Analyzing football data…" : "Check Slip"}
          </Button>
        </div>

        {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
      </section>

      {/* 3. Verdict & Leg-by-Leg Football Audit (Flat layout) */}
      {result && (
        <section className="space-y-6 border-t border-slate-200 pt-6">
          {/* Top verdict header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold",
                  RISK_STYLE[result.risk].className,
                )}
              >
                {RISK_STYLE[result.risk].label}
              </span>
              <span className="text-sm font-medium text-slate-700">
                {RISK_STYLE[result.risk].blurb}
              </span>
              {matchedFootballLegs > 0 && (
                <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700">
                  {matchedFootballLegs}/{result.legs.length} legs scored with live team strength &amp; H2H
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={copyVerdict} className="gap-1.5">
                {copiedVerdict ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedVerdict ? "Copied" : "Copy verdict"}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={shareVerdictWhatsApp} className="gap-1.5">
                <Share2 className="h-3.5 w-3.5" /> WhatsApp
              </Button>
              {isAuthenticated && (
                <Button size="sm" variant="teal" asChild>
                  <Link href={`/dashboard/bet-tracker?${trackerQuery}`}>Track this slip</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Flat horizontal KPI strip (no box-in-box) */}
          <div className="grid grid-cols-2 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-slate-50/60 sm:grid-cols-4">
            <div className="px-4 py-3.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Combined Odds</p>
              <p className="mt-0.5 text-xl font-bold tabular-nums text-slate-900">
                {result.combinedOdds.toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-500">
                Return: {naira(bonus > 0 ? boostedReturn : result.potentialReturn)}
              </p>
            </div>
            <div className="px-4 py-3.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Football-Adjusted Chance
              </p>
              <p className="mt-0.5 text-xl font-bold tabular-nums text-slate-900">
                {pct(result.effectiveProb, 1)}
              </p>
              <p className="text-[11px] text-slate-500">
                ~1 win in {Number.isFinite(result.oneWinEvery) ? result.oneWinEvery : "∞"} slips
              </p>
            </div>
            <div className="px-4 py-3.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Trap / Weak Legs</p>
              <p
                className={cn(
                  "mt-0.5 text-xl font-bold tabular-nums",
                  trapLegs.length > 0 ? "text-rose-600" : "text-emerald-600",
                )}
              >
                {trapLegs.length}
              </p>
              <p className="text-[11px] text-slate-500">
                {trapLegs.length > 0 ? "Review highlighted legs below" : "No obvious trap legs"}
              </p>
            </div>
            <div className="px-4 py-3.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                {result.legs.length > 1 ? "Cut-by-1 Risk" : "Price Margin"}
              </p>
              <p className="mt-0.5 text-xl font-bold tabular-nums text-slate-900">
                {result.legs.length > 1
                  ? pct(result.cutBreakdown.cutByOneProb, 1)
                  : pct(result.compoundedMargin, 0)}
              </p>
              <p className="text-[11px] text-slate-500">
                {result.legs.length > 1
                  ? `Bookie margin est. ${pct(result.compoundedMargin, 0)}`
                  : "Single-leg bookmaker cut"}
              </p>
            </div>
          </div>

          {/* Cut-1 Survival Breakdown for multi-leg slips */}
          {result.legs.length > 1 && (
            <div className="grid grid-cols-3 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-white">
              <div className="px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                  All {result.legs.length} Legs Win
                </p>
                <p className="mt-0.5 text-base font-bold tabular-nums text-slate-900">
                  {pct(result.cutBreakdown.allWinProb, 1)}
                </p>
              </div>
              <div className="px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                  Cut by Exactly 1 Leg
                </p>
                <p className="mt-0.5 text-base font-bold tabular-nums text-slate-900">
                  {pct(result.cutBreakdown.cutByOneProb, 1)}
                </p>
              </div>
              <div className="px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Cut by 2+ Legs
                </p>
                <p className="mt-0.5 text-base font-bold tabular-nums text-slate-900">
                  {pct(result.cutBreakdown.cutByTwoPlusProb, 1)}
                </p>
              </div>
            </div>
          )}

          {/* Ticket-Killer Trim Simulator */}
          {result.trimSuggestion && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs text-amber-950">
              <div className="space-y-0.5">
                <p className="font-bold text-amber-950">
                  Survival Boost: Drop {result.trimSuggestion.droppedIndices.length}{" "}
                  high-drag {result.trimSuggestion.droppedIndices.length === 1 ? "leg" : "legs"} →{" "}
                  <span className="text-emerald-700">
                    +{result.trimSuggestion.survivalBoostPct}% higher win chance
                  </span>{" "}
                  ({pct(result.effectiveProb, 1)} → {pct(result.trimSuggestion.newWinProb, 1)})
                </p>
                <p className="text-amber-900/80">
                  Trimming {result.trimSuggestion.droppedLabels.join(" + ")} moves odds from{" "}
                  <strong>{result.combinedOdds.toFixed(2)}</strong> to{" "}
                  <strong>{result.trimSuggestion.newOdds.toFixed(2)}</strong> (-{result.trimSuggestion.oddsDropPct}% payout).
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={analyzing}
                onClick={() => applyTrimSuggestion(result.trimSuggestion!.droppedIndices)}
                className="border-amber-300 bg-white text-amber-950 hover:bg-amber-100"
              >
                Trim &amp; Re-check
              </Button>
            </div>
          )}

          {/* Personalized behavior insight if logged in with history */}
          {personalScore && (
            <div className="flex items-start gap-2.5 border-l-4 border-[#3D2DFF] bg-slate-50/70 px-4 py-3 text-xs text-slate-700">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#3D2DFF]" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900">
                    Personal Habit Check:{" "}
                    {personalScore.riskLevel === "high_leak"
                      ? "High-leak profile"
                      : personalScore.riskLevel === "caution"
                        ? "Caution"
                        : "Aligned with your strengths"}{" "}
                    (est. historical ROI {personalScore.predictedRoi >= 0 ? "+" : ""}
                    {(personalScore.predictedRoi * 100).toFixed(1)}%)
                  </p>
                  <span className="rounded-full bg-[#3D2DFF]/10 px-2 py-0.5 text-[10px] font-bold text-[#3D2DFF]">
                    Profile: {personalScore.profile.label}
                  </span>
                </div>
                {(personalScore.warnings.length > 0 || personalScore.strengths.length > 0) && (
                  <p className="mt-0.5 text-slate-600">
                    {[...personalScore.warnings, ...personalScore.strengths].join(" · ")}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Leg-by-leg football breakdown */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Leg-by-Leg Football &amp; Odds Audit
            </h3>
            <ul className="divide-y divide-slate-200 border-y border-slate-200">
              {result.legs.map((leg, idx) => {
                const review = footballReviews[idx];
                const modelPct = review?.footballProb != null ? `${(review.footballProb * 100).toFixed(0)}%` : "—";
                const impliedPct = `${(leg.impliedProb * 100).toFixed(0)}%`;
                return (
                  <li
                    key={idx}
                    className={cn(
                      "py-3.5",
                      review?.isTrapLeg && "bg-rose-50/40 px-3 -mx-3 rounded-lg",
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{leg.selection}</span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-slate-700">
                            @ {leg.decimalOdds.toFixed(2)}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                            {leg.likelihoodLabel} · {leg.priceVerdict} price
                          </span>
                          {leg.marketTier === "combo" && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                              Combo · High Margin
                            </span>
                          )}
                          {review?.sharpCheck && (
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                review.sharpCheck.isDriftWarning
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-sky-50 text-sky-700",
                              )}
                            >
                              {review.sharpCheck.sourceLabel}: {(review.sharpCheck.sharpFairProb * 100).toFixed(0)}% (fair @{review.sharpCheck.sharpFairOdds.toFixed(2)})
                            </span>
                          )}
                          {review?.isTrapLeg && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                              <ShieldAlert className="h-3 w-3" /> Trap / Upset Risk
                            </span>
                          )}
                          {review?.strengthEdgeLabel && (
                            <span className="text-xs font-medium text-teal-700">
                              {review.strengthEdgeLabel}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                          {leg.event && <span>{leg.event}</span>}
                          {leg.winsNeededPerLoss !== null && leg.winsNeededPerLoss >= 2 && (
                            <span className="text-[11px] text-slate-500">
                              1 upset wipes out {leg.winsNeededPerLoss} wins at this price
                            </span>
                          )}
                        </div>
                        {review?.factors && review.factors.length > 0 && (
                          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[11px] text-slate-600">
                            {review.homeForm && <span>Home last 5: <strong>{review.homeForm}</strong></span>}
                            {review.awayForm && <span>Away last 5: <strong>{review.awayForm}</strong></span>}
                            {review.h2hSummary && <span>H2H: <strong>{review.h2hSummary}</strong></span>}
                            {review.microSummary && <span><strong>{review.microSummary}</strong></span>}
                          </div>
                        )}
                        {review?.alternatives && review.alternatives.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                            <span className="font-medium text-teal-800">Better options for this match:</span>
                            {review.alternatives.map((a) => (
                              <button
                                key={a.label}
                                type="button"
                                disabled={analyzing}
                                onClick={() => swapLegOption(idx, a.label, a.fairOdds)}
                                className="rounded-md border border-teal-200 bg-teal-50/70 px-2 py-0.5 font-semibold text-teal-800 transition-colors hover:bg-teal-100"
                                title="Click to swap this leg and re-check the slip"
                              >
                                {a.label} ({(a.modelProb * 100).toFixed(0)}%)
                              </button>
                            ))}
                          </div>
                        )}
                        {review?.riskNotes && review.riskNotes.length > 0 && (
                          <p className="text-[11px] font-medium text-amber-800">
                            ⚠ {review.riskNotes.join(" · ")}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-4 text-right text-xs tabular-nums">
                        <div>
                          <p className="text-[10px] uppercase text-slate-400">Book Implied</p>
                          <p className="font-semibold text-slate-700">{impliedPct}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-slate-400">Football Model</p>
                          <p className="font-bold text-slate-900">{modelPct}</p>
                        </div>
                        {review?.edgePct != null && (
                          <div>
                            <p className="text-[10px] uppercase text-slate-400">Edge</p>
                            <p
                              className={cn(
                                "font-bold",
                                review.edgePct >= 0 ? "text-emerald-600" : "text-rose-600",
                              )}
                            >
                              {review.edgePct >= 0 ? "+" : ""}
                              {review.edgePct.toFixed(1)}%
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Warnings & Positives (flat list, no nested boxes) */}
          {(result.warnings.length > 0 || result.positives.length > 0) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {result.warnings.length > 0 && (
                <div className="space-y-1.5">
                  <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-700">
                    <AlertTriangle className="h-3.5 w-3.5" /> Watch-outs
                  </p>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {result.warnings.map((w, i) => (
                      <li key={i}>• {w}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.positives.length > 0 && (
                <div className="space-y-1.5">
                  <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Strengths
                  </p>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {result.positives.map((p, i) => (
                      <li key={i}>• {p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>
      )}
        </>
      )}
    </div>
  );
}
