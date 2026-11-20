"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, CheckCircle2, Copy, Loader2, Plus, Share2, Sparkles, Ticket, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { assessSlip, type SlipAssessment, type SlipRisk } from "@/lib/bet-assist/slip";
import { pct } from "@/lib/bet-assist/calculators";
import {
  scoreSlipWithPunterModel,
  type PunterBehaviorModel,
} from "@/lib/model/punter-model";
import { cn } from "@/lib/utils";

const CODE_BOOKMAKERS = [
  { key: "sportybet", label: "SportyBet (NG)" },
  { key: "bet9ja", label: "Bet9ja" },
  { key: "football.com", label: "Football.com" },
  { key: "betking", label: "BetKing" },
  { key: "onexbet", label: "1xBet" },
  { key: "msport", label: "MSport" },
  { key: "betway", label: "Betway" },
  { key: "22bet", label: "22Bet" },
  { key: "sportybet_gh", label: "SportyBet (GH)" },
  { key: "sportybet_ke", label: "SportyBet (KE)" },
  { key: "sportybet_za", label: "SportyBet (ZA)" },
  { key: "sportybet_tz", label: "SportyBet (TZ)" },
];

interface LegDraft {
  event: string;
  selection: string;
  odds: string;
  yourProb: string;
}

const EMPTY_LEG: LegDraft = { event: "", selection: "", odds: "", yourProb: "" };

const SAMPLE: LegDraft[] = [
  { event: "Arsenal v Everton", selection: "Arsenal to win", odds: "1.30", yourProb: "" },
  { event: "Chelsea v Fulham", selection: "Chelsea to win", odds: "1.55", yourProb: "" },
  { event: "Liverpool v Brentford", selection: "Over 2.5 goals", odds: "1.62", yourProb: "" },
  { event: "Newcastle v Wolves", selection: "Newcastle to win", odds: "1.70", yourProb: "" },
];

const RISK_STYLE: Record<SlipRisk, { label: string; className: string; blurb: string }> = {
  low: { label: "Low risk", className: "bg-emerald-50 text-emerald-700 border-emerald-200", blurb: "More likely to win than lose." },
  moderate: { label: "Moderate risk", className: "bg-sky-50 text-sky-700 border-sky-200", blurb: "Wins roughly one time in two to four." },
  high: { label: "High risk", className: "bg-amber-50 text-amber-800 border-amber-200", blurb: "Expect to lose this most of the time." },
  very_high: { label: "Very high risk", className: "bg-rose-50 text-rose-700 border-rose-200", blurb: "A long shot — it will usually lose." },
};

const naira = (n: number) =>
  `${n < 0 ? "-" : ""}₦${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

function Metric({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "good" | "bad" }) {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#1e293b]/50">{label}</p>
      <p
        className={cn(
          "mt-1 text-xl font-bold tabular-nums text-[#0f172a]",
          tone === "good" && "text-emerald-600",
          tone === "bad" && "text-rose-600",
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[11px] text-[#1e293b]/50">{sub}</p>}
    </div>
  );
}

export function SlipChecker({
  isAuthenticated = false,
  punterModel = null,
}: {
  isAuthenticated?: boolean;
  punterModel?: PunterBehaviorModel | null;
}) {
  const [inputMode, setInputMode] = useState<"quick" | "detailed">("detailed");
  const [quickOddsText, setQuickOddsText] = useState("1.30, 1.55, 1.62, 1.70");
  const [legs, setLegs] = useState<LegDraft[]>([{ ...EMPTY_LEG }, { ...EMPTY_LEG }]);
  const [stake, setStake] = useState("1000");
  const [bonusPct, setBonusPct] = useState("0");
  const [result, setResult] = useState<SlipAssessment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedVerdict, setCopiedVerdict] = useState(false);

  const [bookingCode, setBookingCode] = useState("");
  const [codeBookie, setCodeBookie] = useState("sportybet");
  const [decoding, setDecoding] = useState(false);
  const [decodeNotice, setDecodeNotice] = useState<string | null>(null);

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
        `/api/bet-assist/decode-slip?code=${encodeURIComponent(clean)}&bookmaker=${encodeURIComponent(codeBookie)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Could not decode booking code.");
        return;
      }
      const decodedLegs: LegDraft[] = (data.legs ?? []).map(
        (l: { event: string; selection: string; odds: number; modelProb: number | null }) => ({
          event: l.event ?? "",
          selection: l.selection ?? "",
          odds: Number(l.odds).toFixed(2),
          yourProb: l.modelProb !== null ? String(Math.round(l.modelProb * 1000) / 10) : "",
        })
      );
      if (decodedLegs.length === 0) {
        setError("No readable selections with decimal odds found in that booking code.");
        return;
      }
      setLegs(decodedLegs);
      setInputMode("detailed");
      const matchedCount = decodedLegs.filter((l) => l.yourProb !== "").length;
      setDecodeNotice(
        `Loaded ${decodedLegs.length} leg${decodedLegs.length === 1 ? "" : "s"} from ${data.bookmaker} (${data.code})${
          matchedCount > 0 ? ` · ${matchedCount} auto-priced with Dixon-Coles v2.0` : ""
        }.`
      );
      const assessment = assessSlip(
        decodedLegs.map((l) => ({
          selection: l.selection || "Selection",
          event: l.event || undefined,
          decimalOdds: Number(l.odds),
          yourProb: l.yourProb ? Number(l.yourProb) / 100 : null,
        })),
        Number(stake) || 1000
      );
      if (assessment) setResult(assessment);
    } catch {
      setError("Network error while decoding booking code. Please try again.");
    } finally {
      setDecoding(false);
    }
  };

  const update = (i: number, patch: Partial<LegDraft>) => {
    setLegs(legs.map((l, j) => (j === i ? { ...l, ...patch } : l)));
    setResult(null);
  };

  const check = () => {
    let parsed: Array<{ selection: string; event?: string; decimalOdds: number; yourProb: number | null }> = [];

    if (inputMode === "quick") {
      // Extract decimal numbers > 1 from pasted odds text (comma, space, slash, newline separated)
      const tokens = quickOddsText.match(/\d+(?:\.\d+)?/g) ?? [];
      parsed = tokens
        .map((t) => Number(t))
        .filter((n) => Number.isFinite(n))
        .map((n, i) => ({
          selection: `Leg ${i + 1}`,
          decimalOdds: n,
          yourProb: null,
        }));
      if (parsed.length === 0) {
        setError("Paste at least one decimal odd greater than 1.00 (e.g. 1.45, 1.80, 2.10).");
        return;
      }
    } else {
      parsed = legs
        .filter((l) => l.odds.trim() !== "")
        .map((l) => ({
          selection: l.selection.trim() || "Selection",
          event: l.event.trim() || undefined,
          decimalOdds: Number(l.odds),
          yourProb: l.yourProb.trim() ? Number(l.yourProb) / 100 : null,
        }));
    }

    if (parsed.some((l) => !(l.decimalOdds > 1))) {
      setError("Every leg needs decimal odds greater than 1.00.");
      return;
    }
    const r = assessSlip(parsed, Number(stake));
    if (!r) {
      setError("Add at least one leg with odds and a stake above 0.");
      return;
    }
    setError(null);
    setResult(r);
  };

  const bonus = Math.max(0, Number.isFinite(Number(bonusPct)) ? Number(bonusPct) : 0);
  const stakeNum = Number(stake) || 0;
  const boostedProfit = result ? result.potentialProfit * (1 + bonus / 100) : 0;
  const boostedReturn = result ? stakeNum + boostedProfit : 0;
  const boostedEv =
    result && stakeNum > 0
      ? ((result.yourProb ?? result.fairProb) * boostedReturn) / stakeNum - 1
      : 0;

  function buildVerdictText(r: SlipAssessment): string {
    const chance = pct(r.yourProb ?? r.fairProb, 1);
    const lines = [
      `PunterStat Slip Check (${r.legs.length}-leg ${r.legs.length > 1 ? "acca" : "single"})`,
      `• Risk: ${RISK_STYLE[r.risk].label} (lands ~1 in ${r.oneWinEvery})`,
      `• Combined odds: ${r.combinedOdds.toFixed(2)} | Stake: ${naira(stakeNum)} -> ${naira(bonus > 0 ? boostedReturn : r.potentialReturn)}`,
      `• Est. true chance: ${chance} | Margin drag: ${pct(r.compoundedMargin)}`,
      `• Checked on punterstat.site/bet-assist/slip-checker`,
    ];
    return lines.join("\n");
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
    const text = encodeURIComponent(buildVerdictText(result));
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
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
        market: result.legs.length > 1 ? "Accumulator" : "1X2",
        legs: String(result.legs.length),
        stake: stake.trim() || "1000",
        ...(result.yourProb !== null
          ? { prob: String(Math.round(result.yourProb * 1000) / 10) }
          : {}),
      }).toString()
    : "";

  const trackerHref = `/dashboard/bet-tracker?${trackerQuery}`;
  const logHref = isAuthenticated ? trackerHref : `/login?next=${encodeURIComponent(trackerHref)}`;

  const numericStake = Number(stake) || 0;
  const personalInsight =
    result && punterModel
      ? scoreSlipWithPunterModel(punterModel, {
          combinedOdds: result.combinedOdds,
          legCount: result.legs.length,
          stake: numericStake,
          bookmaker: decodeNotice ? codeBookie : null,
        })
      : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      {/* Input */}
      <div className="space-y-4 rounded-2xl border border-border bg-white p-6 shadow-sm">
        {/* Load by Booking Code bar */}
        <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-3.5 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0f172a]">
            <Ticket className="h-3.5 w-3.5 text-teal-600" />
            Load by Booking Code
          </div>
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <select
              value={codeBookie}
              onChange={(e) => setCodeBookie(e.target.value)}
              aria-label="Select bookmaker"
              className="h-9 rounded-lg border border-border bg-white px-2.5 text-xs text-[#0f172a] focus:border-teal-600 focus:outline-none"
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
                  void decodeBookingCode();
                }
              }}
              placeholder="Paste code (e.g. JQW6XN)"
              className="h-9 bg-white text-xs font-mono uppercase tracking-wider"
            />
            <Button
              type="button"
              variant="teal"
              size="sm"
              disabled={decoding}
              onClick={() => void decodeBookingCode()}
              className="h-9 gap-1.5"
            >
              {decoding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Load Slip"}
            </Button>
          </div>
          {decodeNotice && (
            <p className="text-[11px] font-medium text-teal-800">{decodeNotice}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold text-[#0f172a]">Your slip</h2>
          <div className="inline-flex rounded-lg border border-border bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => {
                setInputMode("quick");
                setResult(null);
              }}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition",
                inputMode === "quick" ? "bg-[#3D2DFF] text-white" : "text-[#1e293b]/60 hover:text-[#0f172a]",
              )}
            >
              Quick Paste Odds
            </button>
            <button
              type="button"
              onClick={() => {
                setInputMode("detailed");
                setResult(null);
              }}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition",
                inputMode === "detailed" ? "bg-[#3D2DFF] text-white" : "text-[#1e293b]/60 hover:text-[#0f172a]",
              )}
            >
              Detailed Legs
            </button>
          </div>
        </div>

        {inputMode === "quick" ? (
          <div className="space-y-2">
            <Label className="text-xs text-[#1e293b]/65">
              Paste or type leg odds (separated by commas, spaces, or new lines)
            </Label>
            <textarea
              rows={4}
              value={quickOddsText}
              onChange={(e) => {
                setQuickOddsText(e.target.value);
                setResult(null);
              }}
              placeholder="e.g. 1.35, 1.60, 1.85, 2.10, 1.45"
              className="w-full rounded-xl border border-input bg-[#f8fafc] p-3 font-mono text-sm text-[#0f172a] focus:border-[#3D2DFF] focus:bg-white focus:outline-none"
            />
            <p className="text-[11px] text-[#1e293b]/50">
              Fastest way to check a 5–15 leg SportyBet or Bet9ja booking code ticket before staking.
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs font-medium text-[#3D2DFF] hover:underline"
                onClick={() => {
                  setLegs(SAMPLE.map((l) => ({ ...l })));
                  setResult(null);
                }}
              >
                Load example acca
              </button>
            </div>

            {legs.map((l, i) => (
              <div key={i} className="rounded-xl border border-border bg-[#f8fafc] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold text-[#1e293b]/60">Leg {i + 1}</p>
                  {legs.length > 1 && (
                    <button
                      type="button"
                      aria-label={`Remove leg ${i + 1}`}
                      className="text-[#1e293b]/40 hover:text-rose-600"
                      onClick={() => {
                        setLegs(legs.filter((_, j) => j !== i));
                        setResult(null);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-[#1e293b]/60">Match / event</Label>
                    <Input value={l.event} placeholder="Arsenal v Everton" onChange={(e) => update(i, { event: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-[#1e293b]/60">Selection</Label>
                    <Input value={l.selection} placeholder="Arsenal to win" onChange={(e) => update(i, { selection: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-[#1e293b]/60">Decimal odds</Label>
                    <Input inputMode="decimal" value={l.odds} placeholder="1.80" onChange={(e) => update(i, { odds: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-[#1e293b]/60">Your chance % (optional)</Label>
                    <Input inputMode="decimal" value={l.yourProb} placeholder="e.g. 60" onChange={(e) => update(i, { yourProb: e.target.value })} />
                  </div>
                </div>
              </div>
            ))}

            {legs.length < 20 && (
              <Button type="button" variant="outline" size="sm" onClick={() => setLegs([...legs, { ...EMPTY_LEG }])}>
                <Plus className="mr-1 h-4 w-4" /> Add leg
              </Button>
            )}
          </>
        )}

        <div className="grid gap-3 border-t border-border pt-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div className="space-y-1">
            <Label className="text-[11px] text-[#1e293b]/60">Stake (₦)</Label>
            <Input inputMode="decimal" value={stake} onChange={(e) => { setStake(e.target.value); setResult(null); }} />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-[#1e293b]/60">Acca bonus % (optional)</Label>
            <Input inputMode="decimal" value={bonusPct} placeholder="0" onChange={(e) => setBonusPct(e.target.value)} />
          </div>
          <Button type="button" variant="teal" onClick={check}>
            Check slip
          </Button>
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>

      {/* Result */}
      <div className="space-y-4">
        {!result ? (
          <div className="flex h-full min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-border bg-white p-8 text-center text-sm text-[#1e293b]/50">
            Enter or paste your leg odds and press <strong className="mx-1">Check slip</strong> to see what the price really
            implies.
          </div>
        ) : (
          <>
            <div className={cn("rounded-2xl border p-5", RISK_STYLE[result.risk].className)}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-lg font-bold">{RISK_STYLE[result.risk].label}</p>
                  <p className="text-sm opacity-80">
                    {RISK_STYLE[result.risk].blurb}{" "}
                    {Number.isFinite(result.oneWinEvery) && result.oneWinEvery > 1 && (
                      <>Expect it to land about <strong>1 time in {result.oneWinEvery}</strong>.</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={copyVerdict}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/80 px-2.5 py-1 text-xs font-semibold text-[#0f172a] hover:bg-white"
                  >
                    {copiedVerdict ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedVerdict ? "Copied" : "Copy"}
                  </button>
                  <button
                    type="button"
                    onClick={shareVerdictWhatsApp}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/80 px-2.5 py-1 text-xs font-semibold text-[#0f172a] hover:bg-white"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    WhatsApp
                  </button>
                </div>
              </div>
            </div>

            {personalInsight && (
              <div
                className={cn(
                  "rounded-2xl border p-4 space-y-2.5",
                  personalInsight.maturity === "cold"
                    ? "border-slate-200 bg-slate-50"
                    : personalInsight.riskLevel === "high_leak"
                      ? "border-rose-200 bg-rose-50/70"
                      : personalInsight.riskLevel === "caution"
                        ? "border-amber-200 bg-amber-50/70"
                        : "border-teal-200 bg-teal-50/60",
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0f172a]">
                    <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                    Personal History Model
                    <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-[#1e293b]/70 border border-border">
                      {personalInsight.settledBets} settled bet{personalInsight.settledBets === 1 ? "" : "s"}
                    </span>
                  </div>
                  {personalInsight.maturity !== "cold" && (
                    <span
                      className={cn(
                        "text-xs font-bold tabular-nums",
                        personalInsight.predictedRoi >= 0 ? "text-emerald-700" : "text-rose-700",
                      )}
                    >
                      Est. Personal ROI: {personalInsight.predictedRoi >= 0 ? "+" : ""}
                      {(personalInsight.predictedRoi * 100).toFixed(1)}%
                    </span>
                  )}
                </div>

                {personalInsight.maturity === "cold" ? (
                  <p className="text-xs text-[#1e293b]/70">
                    Upload at least 10 settled bets via{" "}
                    <Link href="/dashboard/profile" className="font-semibold text-teal-700 underline">
                      Profile CSV Import
                    </Link>{" "}
                    to train your personal Empirical Bayes leak &amp; tilt model on this slip checker.
                  </p>
                ) : (
                  <div className="space-y-1.5 text-xs">
                    {personalInsight.warnings.map((w) => (
                      <p key={w} className="flex gap-1.5 text-rose-900">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-600" />
                        {w}
                      </p>
                    ))}
                    {personalInsight.strengths.map((s) => (
                      <p key={s} className="flex gap-1.5 text-emerald-900">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        {s}
                      </p>
                    ))}
                    {personalInsight.warnings.length === 0 && personalInsight.strengths.length === 0 && (
                      <p className="text-[#1e293b]/70">
                        No personal leak or tilt flags triggered for this slip profile. Estimates will sharpen as you upload more settled history.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Metric label="Combined odds" value={result.combinedOdds.toFixed(2)} />
              <Metric
                label={bonus > 0 ? `Return (+${bonus}% bonus)` : "Potential return"}
                value={naira(bonus > 0 ? boostedReturn : result.potentialReturn)}
                sub={`Profit ${naira(bonus > 0 ? boostedProfit : result.potentialProfit)}`}
              />
              <Metric label="Price implies" value={pct(result.impliedProb, 2)} sub="1 ÷ combined odds" />
              <Metric
                label={result.evSource === "yours" ? "Your estimate" : "Est. true chance"}
                value={pct(result.yourProb ?? result.fairProb, 2)}
                sub={result.evSource === "yours" ? "From your leg probabilities" : "After removing ~5% margin per leg"}
              />
              <Metric
                label={bonus > 0 ? "EV after acca bonus" : "Expected value (illustrative)"}
                value={`${(bonus > 0 ? boostedEv : result.ev) >= 0 ? "+" : ""}${pct(bonus > 0 ? boostedEv : result.ev)}`}
                sub={`≈ ${naira(result.expectedReturnOnStake)} expected return per slip`}
                tone={(bonus > 0 ? boostedEv : result.ev) >= 0 ? "good" : "bad"}
              />
              <Metric
                label="Margin you're paying"
                value={pct(result.compoundedMargin)}
                sub={`${result.legs.length} leg${result.legs.length > 1 ? "s" : ""} compounded`}
                tone={result.compoundedMargin > 0.15 ? "bad" : undefined}
              />
            </div>

            {result.warnings.length > 0 && (
              <div className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                {result.warnings.map((w) => (
                  <p key={w} className="flex gap-2 text-sm text-amber-900">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    {w}
                  </p>
                ))}
              </div>
            )}
            {result.positives.length > 0 && (
              <div className="space-y-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                {result.positives.map((w) => (
                  <p key={w} className="flex gap-2 text-sm text-emerald-900">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    {w}
                  </p>
                ))}
              </div>
            )}

            <div className="overflow-x-auto rounded-2xl border border-border bg-white p-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-[#1e293b]/50">
                    <th className="pb-2">Leg</th>
                    <th className="pb-2 text-right">Odds</th>
                    <th className="pb-2 text-right">Implied</th>
                    <th className="pb-2 text-right">EV (illustrative)</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {result.legs.map((l, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="py-2">
                        <p className="font-medium text-[#0f172a]">{l.selection}</p>
                        {l.event && <p className="text-xs text-[#1e293b]/50">{l.event}</p>}
                      </td>
                      <td className="py-2 text-right">{l.decimalOdds.toFixed(2)}</td>
                      <td className="py-2 text-right">{pct(l.impliedProb)}</td>
                      <td className={cn("py-2 text-right", l.ev !== null && (l.ev >= 0 ? "text-emerald-600" : "text-rose-600"))}>
                        {l.ev === null ? "—" : `${l.ev >= 0 ? "+" : ""}${pct(l.ev)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white p-4">
              <p className="text-xs text-[#1e293b]/65">
                {isAuthenticated
                  ? "Placing this slip? Log it in your Bet Tracker in one click to measure your real results over time."
                  : "Sign in to log this slip in your Bet Tracker — your legs and odds will stay prefilled."}
              </p>
              <Button variant="teal" size="sm" asChild>
                <Link href={logHref}>
                  {isAuthenticated ? "Log this slip →" : "Sign in & log slip →"}
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
