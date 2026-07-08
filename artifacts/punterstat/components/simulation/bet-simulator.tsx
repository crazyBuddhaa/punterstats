"use client";

import { useState, useCallback, useTransition, useRef } from "react";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Flame,
  Target,
  Activity,
  Layers,
  Zap,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { createSession, recordBet } from "@/lib/simulation/actions";
import { OddsPicker } from "./odds-picker";
import { impliedProbability as rawImpliedProbability } from "@/lib/odds/devig";
import { createRng } from "@/lib/simulation/rng";
import { evaluateAccaLegs, type CorrelatedLegInput } from "@/lib/simulation/correlated-acca";
import type { OddsLegFixtureInfo } from "./odds-picker";
import type { SimulationHistory } from "@/types";

const STARTING_BALANCE = 10_000;
const CURRENCY = "₦";
const MAX_LEGS = 8;

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatMoney(n: number) {
  return `${CURRENCY}${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const impliedProbability = rawImpliedProbability;

function simulateOutcome(winProb: number): "win" | "loss" {
  return Math.random() < winProb ? "win" : "loss";
}

// ── Manual odds suggestions ────────────────────────────────────────────────

const SUGGESTIONS = [
  { label: "Heavy Fav", odds: 1.2 },
  { label: "Favourite", odds: 1.65 },
  { label: "Slight Fav", odds: 2.0 },
  { label: "Even", odds: 2.5 },
  { label: "Outsider", odds: 4.0 },
  { label: "Longshot", odds: 10.0 },
];

// ── Accumulator leg type ───────────────────────────────────────────────────

interface AccaLeg {
  id: string;
  label: string;
  match?: string;   // e.g. "Hull City vs Manchester United"
  odds: number;
  /** The Odds API event id — legs sharing a fixtureId are correlated via a shared Poisson scoreline. */
  fixtureId?: string;
  /** Which 1X2 side this leg backs, when known (only set for plain h2h picks from the live odds panel). */
  fixtureInfo?: OddsLegFixtureInfo;
}

// ── Stats ─────────────────────────────────────────────────────────────────

interface BetEntry extends SimulationHistory {
  runningBalance: number;
  /** For accas: number of legs */
  legs?: number;
}

interface Stats {
  totalBets: number;
  wins: number;
  losses: number;
  winRate: number;
  longestWinStreak: number;
  longestLossStreak: number;
  currentStreak: { type: "win" | "loss" | null; count: number };
  totalStaked: number;
  totalProfit: number;
  roi: number;
  biggestWin: number;
  biggestLoss: number;
}

function computeStats(history: BetEntry[]): Stats {
  let wins = 0, losses = 0;
  let longestWin = 0, longestLoss = 0;
  let currentWin = 0, currentLoss = 0;
  let totalStaked = 0, totalProfit = 0;
  let biggestWin = 0, biggestLoss = 0;

  for (const entry of history) {
    totalStaked += entry.stake;
    totalProfit += entry.profitLoss;
    if (entry.outcome === "win") {
      wins++; currentWin++; currentLoss = 0;
      longestWin = Math.max(longestWin, currentWin);
      biggestWin = Math.max(biggestWin, entry.profitLoss);
    } else {
      losses++; currentLoss++; currentWin = 0;
      longestLoss = Math.max(longestLoss, currentLoss);
      biggestLoss = Math.min(biggestLoss, entry.profitLoss);
    }
  }

  const last = history[history.length - 1];
  const currentStreak: Stats["currentStreak"] =
    !last ? { type: null, count: 0 }
    : last.outcome === "win" ? { type: "win", count: currentWin }
    : { type: "loss", count: currentLoss };

  return {
    totalBets: history.length, wins, losses,
    winRate: history.length ? (wins / history.length) * 100 : 0,
    longestWinStreak: longestWin, longestLossStreak: longestLoss,
    currentStreak, totalStaked, totalProfit,
    roi: totalStaked ? (totalProfit / totalStaked) * 100 : 0,
    biggestWin, biggestLoss,
  };
}

// ── Main component ────────────────────────────────────────────────────────

type Mode = "single" | "accumulator";

export function BetSimulator({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [balance, setBalance] = useState(STARTING_BALANCE);
  const [mode, setMode] = useState<Mode>("single");

  // Single mode state
  const [odds, setOdds] = useState("2.00");
  const [oddsLabel, setOddsLabel] = useState<string | null>(null);
  const [oddsFairProb, setOddsFairProb] = useState<number | null>(null);

  // Accumulator state
  const [legs, setLegs] = useState<AccaLeg[]>([]);
  const [manualLegOdds, setManualLegOdds] = useState("2.00");
  const [manualLegLabel, setManualLegLabel] = useState("");
  const [showManualLeg, setShowManualLeg] = useState(false);
  const [showLivePicker, setShowLivePicker] = useState(true);

  // Shared
  const [stake, setStake] = useState("500");
  const [history, setHistory] = useState<BetEntry[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<"win" | "loss" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const legIdRef = useRef(0);

  const stats = computeStats(history);

  // Combined accumulator odds
  const accumOdds = legs.reduce((acc, l) => acc * l.odds, 1);

  const ensureSession = useCallback(async (): Promise<string | null> => {
    if (sessionId) return sessionId;
    if (!isAuthenticated) return null;
    const res = await createSession("bet", STARTING_BALANCE);
    if (res.success && res.data) { setSessionId(res.data.id); return res.data.id; }
    return null;
  }, [sessionId, isAuthenticated]);

  // ── Single bet ─────────────────────────────────────────────────────────

  const placeSingleBet = useCallback(() => {
    setErrorMsg(null);
    const parsedOdds = parseFloat(odds);
    const parsedStake = parseFloat(stake);
    if (isNaN(parsedOdds) || parsedOdds < 1.01) { setErrorMsg("Odds must be at least 1.01."); return; }
    if (isNaN(parsedStake) || parsedStake < 1) { setErrorMsg("Stake must be at least ₦1."); return; }
    if (parsedStake > balance) { setErrorMsg("Stake exceeds your available balance."); return; }

    startTransition(async () => {
      const outcome = simulateOutcome(impliedProbability(parsedOdds));
      const profitLoss = outcome === "win"
        ? parseFloat(((parsedOdds - 1) * parsedStake).toFixed(2))
        : -parsedStake;
      const newBalance = parseFloat((balance + profitLoss).toFixed(2));

      const entry: BetEntry = {
        id: crypto.randomUUID(), sessionId: sessionId ?? "", odds: parsedOdds,
        stake: parsedStake, outcome, profitLoss, balanceAfter: newBalance,
        runningBalance: newBalance, createdAt: new Date().toISOString(),
      };

      setHistory((prev) => [entry, ...prev]);
      setBalance(newBalance);
      setLastResult(outcome);
      setOddsLabel(null);

      if (isAuthenticated) {
        const sid = await ensureSession();
        if (sid) await recordBet(sid, parsedOdds, parsedStake, outcome, profitLoss, newBalance);
      }
    });
  }, [odds, stake, balance, sessionId, isAuthenticated, ensureSession]);

  // ── Accumulator bet ────────────────────────────────────────────────────

  const addLeg = useCallback((
    decimalOdds: number,
    label: string,
    match?: string,
    fixtureId?: string,
    _fairProb?: number,
    fixtureInfo?: OddsLegFixtureInfo
  ) => {
    if (legs.length >= MAX_LEGS) { setErrorMsg(`Maximum ${MAX_LEGS} legs in an accumulator.`); return; }
    setErrorMsg(null);
    setLegs((prev) => [...prev, { id: String(++legIdRef.current), label, match, odds: decimalOdds, fixtureId, fixtureInfo }]);
  }, [legs.length]);

  const removeLeg = useCallback((id: string) => {
    setLegs((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const addManualLeg = useCallback(() => {
    const parsed = parseFloat(manualLegOdds);
    if (isNaN(parsed) || parsed < 1.01) { setErrorMsg("Leg odds must be at least 1.01."); return; }
    addLeg(parsed, manualLegLabel.trim() || `Selection ${legs.length + 1}`);
    setManualLegOdds("2.00");
    setManualLegLabel("");
    setShowManualLeg(false);
  }, [manualLegOdds, manualLegLabel, legs.length, addLeg]);

  const placeAccaBet = useCallback(() => {
    setErrorMsg(null);
    if (legs.length < 2) { setErrorMsg("Add at least 2 legs to build an accumulator."); return; }
    const parsedStake = parseFloat(stake);
    if (isNaN(parsedStake) || parsedStake < 1) { setErrorMsg("Stake must be at least ₦1."); return; }
    if (parsedStake > balance) { setErrorMsg("Stake exceeds your available balance."); return; }

    startTransition(async () => {
      // Legs on the same match are correlated via a shared Poisson-model
      // scoreline (only one 1X2 outcome can actually happen); everything
      // else falls back to an independent draw. All legs must win.
      const { rng } = createRng();
      const correlatedInputs: CorrelatedLegInput[] = legs.map((l) => ({
        id: l.id,
        fixtureId: l.fixtureInfo?.fixtureId,
        side: l.fixtureInfo?.side,
        fixtureFairProbs: l.fixtureInfo?.fixtureFairProbs,
        fallbackWinProb: impliedProbability(l.odds),
      }));
      const legResults = evaluateAccaLegs(rng, correlatedInputs);
      const outcome: "win" | "loss" = legs.every((l) => legResults.get(l.id)) ? "win" : "loss";
      const profitLoss = outcome === "win"
        ? parseFloat(((accumOdds - 1) * parsedStake).toFixed(2))
        : -parsedStake;
      const newBalance = parseFloat((balance + profitLoss).toFixed(2));

      const entry: BetEntry = {
        id: crypto.randomUUID(), sessionId: sessionId ?? "",
        odds: parseFloat(accumOdds.toFixed(2)),
        stake: parsedStake, outcome, profitLoss, balanceAfter: newBalance,
        runningBalance: newBalance, createdAt: new Date().toISOString(),
        legs: legs.length,
      };

      setHistory((prev) => [entry, ...prev]);
      setBalance(newBalance);
      setLastResult(outcome);

      if (isAuthenticated) {
        const sid = await ensureSession();
        if (sid) await recordBet(sid, parseFloat(accumOdds.toFixed(2)), parsedStake, outcome, profitLoss, newBalance);
      }
    });
  }, [legs, stake, balance, accumOdds, sessionId, isAuthenticated, ensureSession]);

  // ── Reset ──────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setBalance(STARTING_BALANCE);
    setHistory([]);
    setSessionId(null);
    setLastResult(null);
    setErrorMsg(null);
    setLegs([]);
    setOddsLabel(null);
    setOddsFairProb(null);
  }, []);

  const balanceDelta = balance - STARTING_BALANCE;
  const balanceColor = balanceDelta > 0 ? "text-emerald-600" : balanceDelta < 0 ? "text-red-500" : "text-[#0f172a]";
  const parsedOdds = parseFloat(odds);
  const parsedStake = parseFloat(stake);

  return (
    <div className="space-y-6">
      {/* ── Balance header ───────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#1e293b]/50">Virtual Balance</p>
            <p className={`mt-1 text-4xl font-bold tracking-tight ${balanceColor}`}>
              {formatMoney(balance)}
            </p>
            {history.length > 0 && (
              <p className={`mt-0.5 text-sm font-medium ${balanceDelta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {balanceDelta >= 0 ? "+" : ""}{formatMoney(balanceDelta)} from start
              </p>
            )}
          </div>
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-medium text-[#1e293b]/60 transition hover:bg-[#f8fafc] hover:text-[#0f172a]"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reset session
          </button>
        </div>
        <div className="mt-5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#f1f5f9]">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${balance >= STARTING_BALANCE ? "bg-emerald-500" : "bg-red-400"}`}
              style={{ width: `${Math.min(100, Math.max(2, (balance / STARTING_BALANCE) * 100))}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-[#1e293b]/40">
            <span>₦0</span>
            <span>Starting: {formatMoney(STARTING_BALANCE)}</span>
          </div>
        </div>
      </div>

      {/* ── Last result flash ─────────────────────────────────────────── */}
      {lastResult && (
        <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
          lastResult === "win" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"
        }`}>
          {lastResult === "win" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
          <span>{lastResult === "win" ? "Win! Well played." : "Loss. The market wins sometimes."}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* ── Left panel ────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Mode toggle */}
          <div className="flex rounded-xl border border-border bg-white overflow-hidden">
            {(["single", "accumulator"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setErrorMsg(null); }}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition ${
                  mode === m
                    ? "bg-[#0f172a] text-white"
                    : "text-[#1e293b]/60 hover:text-[#0f172a]"
                }`}
              >
                {m === "single" ? <Zap className="h-3.5 w-3.5" /> : <Layers className="h-3.5 w-3.5" />}
                {m === "single" ? "Single Bet" : "Accumulator"}
              </button>
            ))}
          </div>

          {/* ── SINGLE MODE ─────────────────────────────────────────── */}
          {mode === "single" && (
            <div className="rounded-2xl border border-border bg-white p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-[#0f172a]">Place a Simulated Bet</h3>

              {/* Live odds picker — always visible */}
              <OddsPicker
                onSelect={(price, label, fairProb) => {
                  setOdds(price.toFixed(2));
                  setOddsLabel(label);
                  setOddsFairProb(fairProb);
                }}
              />

              {/* Manual suggestions */}
              <div>
                <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-[#1e293b]/40">
                  Quick Suggestions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map(({ label, odds: o }) => (
                    <button
                      key={label}
                      onClick={() => { setOdds(o.toFixed(2)); setOddsLabel(null); setOddsFairProb(null); }}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                        parseFloat(odds) === o
                          ? "border-[#0f172a] bg-[#0f172a] text-white"
                          : "border-border text-[#1e293b]/60 hover:border-[#0f172a]/30 hover:text-[#0f172a]"
                      }`}
                    >
                      {label} · {o.toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Odds input */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#1e293b]/60">Decimal Odds</label>
                {oddsLabel && (
                  <p className="mb-1 truncate text-[10px] text-teal-600">{oddsLabel}</p>
                )}
                <input
                  type="number" min="1.01" step="0.05" value={odds}
                  onChange={(e) => { setOdds(e.target.value); setOddsLabel(null); setOddsFairProb(null); }}
                  className="w-full rounded-lg border border-border bg-[#f8fafc] px-3 py-2.5 text-sm font-mono text-[#0f172a] outline-none transition focus:border-[#0f172a] focus:ring-2 focus:ring-[#0f172a]/10"
                  placeholder="e.g. 2.50"
                />
                <p className="mt-1 text-[10px] text-[#1e293b]/40">
                  Raw implied probability (market, with margin):{" "}
                  {parsedOdds > 1 ? `${(impliedProbability(parsedOdds) * 100).toFixed(1)}%` : "—"}
                </p>
                {oddsFairProb !== null && (
                  <p className="mt-0.5 text-[10px] text-teal-600">
                    De-vigged fair probability (margin removed): {(oddsFairProb * 100).toFixed(1)}% — the
                    bookmaker&apos;s true view once their edge is stripped out.
                  </p>
                )}
              </div>

              {/* Stake */}
              <StakeInput stake={stake} setStake={setStake} balance={balance} />

              {/* Potential return */}
              {parsedOdds > 1 && parsedStake > 0 && (
                <ReturnPreview odds={parsedOdds} stake={parsedStake} />
              )}

              {errorMsg && <ErrorMsg msg={errorMsg} />}

              <SimulateButton onClick={placeSingleBet} disabled={isPending || balance <= 0} pending={isPending} label="Simulate Bet" />
              {balance <= 0 && <p className="text-center text-xs text-red-500">Balance is ₦0 — reset your session.</p>}
              {!isAuthenticated && <p className="text-center text-[10px] text-[#1e293b]/40">Sign in to save your session</p>}
            </div>
          )}

          {/* ── ACCUMULATOR MODE ────────────────────────────────────── */}
          {mode === "accumulator" && (
            <div className="rounded-2xl border border-border bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#0f172a]">Build Your Accumulator</h3>
                <span className="text-[10px] text-[#1e293b]/40">{legs.length}/{MAX_LEGS} legs</span>
              </div>

              {/* Leg list */}
              {legs.length > 0 && (
                <div className="space-y-1.5">
                  {legs.map((leg, i) => {
                    const sharesFixture = !!leg.fixtureId && legs.filter((l) => l.fixtureId === leg.fixtureId).length > 1;
                    return (
                    <div key={leg.id} className="flex items-center gap-2 rounded-lg border border-border bg-[#f8fafc] px-3 py-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0f172a] text-[9px] font-bold text-white">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-medium text-[#0f172a]">{leg.label}</p>
                        {leg.match && (
                          <p className="truncate text-[9px] text-[#1e293b]/40">
                            {leg.match}
                            {sharesFixture && (
                              <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-amber-700">
                                Correlated
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 font-mono text-[11px] font-semibold text-emerald-600">
                        {leg.odds.toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeLeg(leg.id)}
                        className="shrink-0 text-[#1e293b]/30 transition hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    );
                  })}
                </div>
              )}

              {legs.length === 0 && (
                <p className="text-center text-xs text-[#1e293b]/40 py-2">
                  No legs yet — add at least 2 from live odds or manually.
                </p>
              )}

              {/* Combined odds badge */}
              {legs.length >= 2 && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-emerald-700">Combined odds ({legs.length} legs)</p>
                    <p className="font-mono text-sm font-bold text-emerald-700">{accumOdds.toFixed(2)}</p>
                  </div>
                  <p className="mt-0.5 text-[10px] text-emerald-600/70">
                    Each leg must win independently
                  </p>
                </div>
              )}

              {/* Add from live odds toggle */}
              <div>
                <button
                  onClick={() => setShowLivePicker((v) => !v)}
                  disabled={legs.length >= MAX_LEGS}
                  className="flex w-full items-center justify-between rounded-lg border border-dashed border-teal-300 bg-teal-50/40 px-3 py-2 text-[11px] font-semibold text-teal-700 transition hover:border-teal-500 disabled:opacity-40"
                >
                  <span className="flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" />Add from live odds</span>
                  {showLivePicker ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
                {showLivePicker && legs.length < MAX_LEGS && (
                  <div className="mt-2">
                    <OddsPicker accumMode onAddLeg={addLeg} />
                  </div>
                )}
              </div>

              {/* Add manually toggle */}
              <div>
                <button
                  onClick={() => setShowManualLeg((v) => !v)}
                  disabled={legs.length >= MAX_LEGS}
                  className="flex w-full items-center justify-between rounded-lg border border-dashed border-slate-300 bg-[#f8fafc] px-3 py-2 text-[11px] font-semibold text-[#1e293b]/60 transition hover:border-slate-400 hover:text-[#0f172a] disabled:opacity-40"
                >
                  <span className="flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" />Add manually</span>
                  {showManualLeg ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>

                {showManualLeg && legs.length < MAX_LEGS && (
                  <div className="mt-2 space-y-2 rounded-lg border border-border bg-[#f8fafc] p-3">
                    {/* Manual suggestions for leg odds */}
                    <div className="flex flex-wrap gap-1">
                      {SUGGESTIONS.map(({ label, odds: o }) => (
                        <button
                          key={label}
                          onClick={() => setManualLegOdds(o.toFixed(2))}
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium transition ${
                            parseFloat(manualLegOdds) === o
                              ? "border-[#0f172a] bg-[#0f172a] text-white"
                              : "border-border text-[#1e293b]/60 hover:border-[#0f172a]/30"
                          }`}
                        >
                          {label} · {o.toFixed(2)}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text" value={manualLegLabel}
                      onChange={(e) => setManualLegLabel(e.target.value)}
                      placeholder="Selection label (e.g. Man City to win)"
                      className="w-full rounded border border-border bg-white px-2.5 py-2 text-xs text-[#0f172a] outline-none focus:border-[#0f172a]"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number" min="1.01" step="0.05" value={manualLegOdds}
                        onChange={(e) => setManualLegOdds(e.target.value)}
                        className="w-28 rounded border border-border bg-white px-2.5 py-2 text-xs font-mono text-[#0f172a] outline-none focus:border-[#0f172a]"
                        placeholder="Odds"
                      />
                      <button
                        onClick={addManualLeg}
                        className="flex-1 rounded border border-[#0f172a] bg-[#0f172a] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#1e293b]"
                      >
                        Add Leg
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Stake */}
              <StakeInput stake={stake} setStake={setStake} balance={balance} />

              {/* Acca return preview */}
              {legs.length >= 2 && parsedStake > 0 && (
                <ReturnPreview odds={accumOdds} stake={parsedStake} label="Accumulator return" />
              )}

              {errorMsg && <ErrorMsg msg={errorMsg} />}

              <SimulateButton
                onClick={placeAccaBet}
                disabled={isPending || balance <= 0 || legs.length < 2}
                pending={isPending}
                label={`Simulate ${legs.length > 0 ? `${legs.length}-Leg ` : ""}Acca`}
              />
              {balance <= 0 && <p className="text-center text-xs text-red-500">Balance is ₦0 — reset your session.</p>}
              {!isAuthenticated && <p className="text-center text-[10px] text-[#1e293b]/40">Sign in to save your session</p>}
            </div>
          )}
        </div>

        {/* ── Stats ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-4">
          {stats.currentStreak.type && (
            <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
              stats.currentStreak.type === "win" ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
            }`}>
              <Flame className={`h-4 w-4 ${stats.currentStreak.type === "win" ? "text-emerald-600" : "text-red-500"}`} />
              <span className={`text-sm font-medium ${stats.currentStreak.type === "win" ? "text-emerald-700" : "text-red-700"}`}>
                {stats.currentStreak.count} {stats.currentStreak.type} streak
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: "Total Bets", value: stats.totalBets, icon: Target, fmt: (v: number) => String(v) },
              { label: "Win Rate", value: stats.winRate, icon: Activity, fmt: (v: number) => `${v.toFixed(1)}%` },
              {
                label: "Total ROI", value: stats.roi,
                icon: stats.roi >= 0 ? TrendingUp : TrendingDown,
                fmt: (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`,
                color: stats.roi >= 0 ? "text-emerald-600" : "text-red-500",
              },
              { label: "Total Staked", value: stats.totalStaked, fmt: (v: number) => formatMoney(v) },
              {
                label: "Profit / Loss", value: stats.totalProfit,
                fmt: (v: number) => `${v >= 0 ? "+" : ""}${formatMoney(v)}`,
                color: stats.totalProfit >= 0 ? "text-emerald-600" : "text-red-500",
              },
              { label: "Best Streak", value: stats.longestWinStreak, fmt: (v: number) => `${v} wins`, icon: Flame },
            ].map(({ label, value, fmt, color, icon: Icon }) => (
              <div key={label} className="rounded-xl border border-border bg-white p-4 shadow-sm">
                {Icon && <Icon className="mb-2 h-4 w-4 text-[#1e293b]/30" />}
                <p className="text-[10px] font-medium uppercase tracking-wider text-[#1e293b]/50">{label}</p>
                <p className={`mt-0.5 text-lg font-bold ${color ?? "text-[#0f172a]"}`}>{fmt(value as number)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── History table ─────────────────────────────────────────────── */}
      {history.length > 0 && (
        <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="border-b border-border px-6 py-4">
            <h3 className="text-sm font-semibold text-[#0f172a]">Bet History ({history.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-[#f8fafc] text-left text-[10px] font-medium uppercase tracking-wider text-[#1e293b]/50">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Odds</th>
                  <th className="px-4 py-3">Stake</th>
                  <th className="px-4 py-3">Outcome</th>
                  <th className="px-4 py-3">Profit/Loss</th>
                  <th className="px-4 py-3">Balance</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 25).map((entry, i) => (
                  <tr key={entry.id} className="border-b border-border/50 transition hover:bg-[#f8fafc]/50">
                    <td className="px-4 py-3 text-[#1e293b]/40 text-xs">{history.length - i}</td>
                    <td className="px-4 py-3">
                      {entry.legs ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700">
                          <Layers className="h-3 w-3" />{entry.legs}-Leg Acca
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          <Zap className="h-3 w-3" />Single
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#0f172a]">{entry.odds.toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#1e293b]/70">{formatMoney(entry.stake)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        entry.outcome === "win" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                      }`}>
                        {entry.outcome === "win" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {entry.outcome}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-mono text-xs font-medium ${entry.profitLoss >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {entry.profitLoss >= 0 ? "+" : ""}{formatMoney(entry.profitLoss)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#0f172a]">{formatMoney(entry.balanceAfter)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {history.length > 25 && (
              <p className="px-6 py-3 text-center text-xs text-[#1e293b]/40">Showing 25 most recent bets</p>
            )}
          </div>
        </div>
      )}

      {/* ── Educational note ──────────────────────────────────────────── */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
        <p className="mb-1 text-sm font-semibold text-amber-800">Educational Note</p>
        <p className="text-xs leading-relaxed text-amber-700">
          The simulator uses each selection&apos;s implied probability directly from the odds — no bookmaker
          margin is removed. Accumulators multiply the implied win chance across every leg, so a
          5-fold at 2.00/leg has only a{" "}
          <strong>{((0.5 ** 5) * 100).toFixed(1)}% true win probability</strong>. The big returns look
          attractive, but notice how quickly accumulators drain a balance compared to single bets.
        </p>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function StakeInput({
  stake, setStake, balance,
}: { stake: string; setStake: (v: string) => void; balance: number }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[#1e293b]/60">Stake Amount (₦)</label>
      <input
        type="number" min="1" step="100" value={stake}
        onChange={(e) => setStake(e.target.value)}
        className="w-full rounded-lg border border-border bg-[#f8fafc] px-3 py-2.5 text-sm font-mono text-[#0f172a] outline-none transition focus:border-[#0f172a] focus:ring-2 focus:ring-[#0f172a]/10"
        placeholder="e.g. 500"
      />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {[250, 500, 1000, 2500].map((amt) => (
          <button
            key={amt}
            onClick={() => setStake(String(Math.min(amt, balance)))}
            className="rounded border border-border px-2 py-1 text-[10px] font-medium text-[#1e293b]/60 transition hover:border-[#0f172a]/30 hover:text-[#0f172a]"
          >
            ₦{amt.toLocaleString()}
          </button>
        ))}
        <button
          onClick={() => setStake(balance.toFixed(0))}
          className="rounded border border-red-200 px-2 py-1 text-[10px] font-medium text-red-400 transition hover:border-red-400 hover:text-red-600"
        >
          All in
        </button>
      </div>
    </div>
  );
}

function ReturnPreview({ odds, stake, label = "Potential return" }: { odds: number; stake: number; label?: string }) {
  const CURRENCY = "₦";
  function fmt(n: number) {
    return `${CURRENCY}${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return (
    <div className="rounded-lg bg-[#f8fafc] px-3 py-2.5">
      <p className="text-[10px] text-[#1e293b]/50">{label}</p>
      <p className="font-mono text-sm font-semibold text-emerald-600">{fmt(odds * stake)}</p>
      <p className="text-[10px] text-[#1e293b]/40">Profit: {fmt((odds - 1) * stake)}</p>
    </div>
  );
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-red-600">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />{msg}
    </div>
  );
}

function SimulateButton({
  onClick, disabled, pending, label,
}: { onClick: () => void; disabled: boolean; pending: boolean; label: string }) {
  return (
    <button
      onClick={onClick} disabled={disabled}
      className="w-full rounded-xl bg-[#0f172a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Simulating…" : label}
    </button>
  );
}
