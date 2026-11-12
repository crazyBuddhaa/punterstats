"use client";

import { useState, useCallback, useTransition, useRef } from "react";
import { RefreshCw, CheckCircle2, XCircle, Layers, Zap } from "lucide-react";
import { createSession, recordBet } from "@/lib/simulation/actions";
import { OddsPicker, type OddsLegFixtureInfo } from "./odds-picker";
import { impliedProbability as rawImpliedProbability } from "@/lib/odds/devig";
import { createRng } from "@/lib/simulation/rng";
import { evaluateAccaLegs, type CorrelatedLegInput } from "@/lib/simulation/correlated-acca";
import {
  STARTING_BALANCE,
  MAX_LEGS,
  SUGGESTIONS,
  formatMoney,
  computeStats,
  StakeInput,
  ReturnPreview,
  ErrorMsg,
  SimulateButton,
  BetSimulatorStats,
  BetHistoryTable,
  type AccaLeg,
  type BetEntry,
} from "./bet-simulator-parts";
import { AccumulatorPanel } from "./bet-simulator-panels";

const impliedProbability = rawImpliedProbability;

function simulateOutcome(winProb: number): "win" | "loss" {
  return Math.random() < winProb ? "win" : "loss";
}

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
  const accumOdds = legs.reduce((acc, l) => acc * l.odds, 1);

  const ensureSession = useCallback(async (): Promise<string | null> => {
    if (sessionId) return sessionId;
    if (!isAuthenticated) return null;
    const res = await createSession("bet", STARTING_BALANCE);
    if (res.success && res.data) {
      setSessionId(res.data.id);
      return res.data.id;
    }
    return null;
  }, [sessionId, isAuthenticated]);

  const placeSingleBet = useCallback(() => {
    setErrorMsg(null);
    const parsedOdds = parseFloat(odds);
    const parsedStake = parseFloat(stake);
    if (isNaN(parsedOdds) || parsedOdds < 1.01) {
      setErrorMsg("Odds must be at least 1.01.");
      return;
    }
    if (isNaN(parsedStake) || parsedStake < 1) {
      setErrorMsg("Stake must be at least ₦1.");
      return;
    }
    if (parsedStake > balance) {
      setErrorMsg("Stake exceeds your available balance.");
      return;
    }

    startTransition(async () => {
      const outcome = simulateOutcome(impliedProbability(parsedOdds));
      const profitLoss =
        outcome === "win"
          ? parseFloat(((parsedOdds - 1) * parsedStake).toFixed(2))
          : -parsedStake;
      const newBalance = parseFloat((balance + profitLoss).toFixed(2));

      const entry: BetEntry = {
        id: crypto.randomUUID(),
        sessionId: sessionId ?? "",
        odds: parsedOdds,
        stake: parsedStake,
        outcome,
        profitLoss,
        balanceAfter: newBalance,
        runningBalance: newBalance,
        createdAt: new Date().toISOString(),
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

  const addLeg = useCallback(
    (
      decimalOdds: number,
      label: string,
      match?: string,
      fixtureId?: string,
      _fairProb?: number,
      fixtureInfo?: OddsLegFixtureInfo
    ) => {
      if (legs.length >= MAX_LEGS) {
        setErrorMsg(`Maximum ${MAX_LEGS} legs in an accumulator.`);
        return;
      }
      setErrorMsg(null);
      setLegs((prev) => [
        ...prev,
        { id: String(++legIdRef.current), label, match, odds: decimalOdds, fixtureId, fixtureInfo },
      ]);
    },
    [legs.length]
  );

  const removeLeg = useCallback((id: string) => {
    setLegs((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const addManualLeg = useCallback(() => {
    const parsed = parseFloat(manualLegOdds);
    if (isNaN(parsed) || parsed < 1.01) {
      setErrorMsg("Leg odds must be at least 1.01.");
      return;
    }
    addLeg(parsed, manualLegLabel.trim() || `Selection ${legs.length + 1}`);
    setManualLegOdds("2.00");
    setManualLegLabel("");
    setShowManualLeg(false);
  }, [manualLegOdds, manualLegLabel, legs.length, addLeg]);

  const placeAccaBet = useCallback(() => {
    setErrorMsg(null);
    if (legs.length < 2) {
      setErrorMsg("Add at least 2 legs to build an accumulator.");
      return;
    }
    const parsedStake = parseFloat(stake);
    if (isNaN(parsedStake) || parsedStake < 1) {
      setErrorMsg("Stake must be at least ₦1.");
      return;
    }
    if (parsedStake > balance) {
      setErrorMsg("Stake exceeds your available balance.");
      return;
    }

    startTransition(async () => {
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
      const profitLoss =
        outcome === "win"
          ? parseFloat(((accumOdds - 1) * parsedStake).toFixed(2))
          : -parsedStake;
      const newBalance = parseFloat((balance + profitLoss).toFixed(2));

      const entry: BetEntry = {
        id: crypto.randomUUID(),
        sessionId: sessionId ?? "",
        odds: parseFloat(accumOdds.toFixed(2)),
        stake: parsedStake,
        outcome,
        profitLoss,
        balanceAfter: newBalance,
        runningBalance: newBalance,
        createdAt: new Date().toISOString(),
        legs: legs.length,
      };

      setHistory((prev) => [entry, ...prev]);
      setBalance(newBalance);
      setLastResult(outcome);

      if (isAuthenticated) {
        const sid = await ensureSession();
        if (sid)
          await recordBet(
            sid,
            parseFloat(accumOdds.toFixed(2)),
            parsedStake,
            outcome,
            profitLoss,
            newBalance
          );
      }
    });
  }, [legs, stake, balance, accumOdds, sessionId, isAuthenticated, ensureSession]);

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
  const balanceColor =
    balanceDelta > 0 ? "text-emerald-600" : balanceDelta < 0 ? "text-red-500" : "text-[#0f172a]";
  const parsedOdds = parseFloat(odds);
  const parsedStake = parseFloat(stake);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#1e293b]/50">
              Virtual Balance
            </p>
            <p className={`mt-1 text-4xl font-bold tracking-tight ${balanceColor}`}>
              {formatMoney(balance)}
            </p>
            {history.length > 0 && (
              <p
                className={`mt-0.5 text-sm font-medium ${
                  balanceDelta >= 0 ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {balanceDelta >= 0 ? "+" : ""}
                {formatMoney(balanceDelta)} from start
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
              className={`h-2 rounded-full transition-all duration-500 ${
                balance >= STARTING_BALANCE ? "bg-emerald-500" : "bg-red-400"
              }`}
              style={{
                width: `${Math.min(100, Math.max(2, (balance / STARTING_BALANCE) * 100))}%`,
              }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-[#1e293b]/40">
            <span>₦0</span>
            <span>Starting: {formatMoney(STARTING_BALANCE)}</span>
          </div>
        </div>
      </div>

      {lastResult && (
        <div
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
            lastResult === "win"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {lastResult === "win" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{lastResult === "win" ? "Win! Well played." : "Loss. The market wins sometimes."}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex rounded-xl border border-border bg-white overflow-hidden">
            {(["single", "accumulator"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setErrorMsg(null);
                }}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition ${
                  mode === m
                    ? "bg-[#0f172a] text-white"
                    : "text-[#1e293b]/60 hover:text-[#0f172a]"
                }`}
              >
                {m === "single" ? (
                  <Zap className="h-3.5 w-3.5" />
                ) : (
                  <Layers className="h-3.5 w-3.5" />
                )}
                {m === "single" ? "Single Bet" : "Accumulator"}
              </button>
            ))}
          </div>

          {mode === "single" && (
            <div className="rounded-2xl border border-border bg-white p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-[#0f172a]">Place a Simulated Bet</h3>

              <OddsPicker
                onSelect={(price, label, fairProb) => {
                  setOdds(price.toFixed(2));
                  setOddsLabel(label);
                  setOddsFairProb(fairProb);
                }}
              />

              <div>
                <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-[#1e293b]/40">
                  Quick Suggestions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map(({ label, odds: o }) => (
                    <button
                      key={label}
                      onClick={() => {
                        setOdds(o.toFixed(2));
                        setOddsLabel(null);
                        setOddsFairProb(null);
                      }}
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

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#1e293b]/60">
                  Decimal Odds
                </label>
                {oddsLabel && (
                  <p className="mb-1 truncate text-[10px] text-teal-600">{oddsLabel}</p>
                )}
                <input
                  type="number"
                  min="1.01"
                  step="0.05"
                  value={odds}
                  onChange={(e) => {
                    setOdds(e.target.value);
                    setOddsLabel(null);
                    setOddsFairProb(null);
                  }}
                  className="w-full rounded-lg border border-border bg-[#f8fafc] px-3 py-2.5 text-sm font-mono text-[#0f172a] outline-none transition focus:border-[#0f172a] focus:ring-2 focus:ring-[#0f172a]/10"
                  placeholder="e.g. 2.50"
                />
                <p className="mt-1 text-[10px] text-[#1e293b]/40">
                  Raw implied probability (market, with margin):{" "}
                  {parsedOdds > 1 ? `${(impliedProbability(parsedOdds) * 100).toFixed(1)}%` : "—"}
                </p>
                {oddsFairProb !== null && (
                  <p className="mt-0.5 text-[10px] text-teal-600">
                    De-vigged fair probability (margin removed): {(oddsFairProb * 100).toFixed(1)}% —
                    the bookmaker&apos;s true view once their edge is stripped out.
                  </p>
                )}
              </div>

              <StakeInput stake={stake} setStake={setStake} balance={balance} />

              {parsedOdds > 1 && parsedStake > 0 && (
                <ReturnPreview odds={parsedOdds} stake={parsedStake} />
              )}

              {errorMsg && <ErrorMsg msg={errorMsg} />}

              <SimulateButton
                onClick={placeSingleBet}
                disabled={isPending || balance <= 0}
                pending={isPending}
                label="Simulate Bet"
              />
              {balance <= 0 && (
                <p className="text-center text-xs text-red-500">
                  Balance is ₦0 — reset your session.
                </p>
              )}
              {!isAuthenticated && (
                <p className="text-center text-[10px] text-[#1e293b]/40">
                  Sign in to save your session
                </p>
              )}
            </div>
          )}

          {mode === "accumulator" && (
            <AccumulatorPanel
              legs={legs}
              accumOdds={accumOdds}
              showLivePicker={showLivePicker}
              setShowLivePicker={setShowLivePicker}
              showManualLeg={showManualLeg}
              setShowManualLeg={setShowManualLeg}
              manualLegOdds={manualLegOdds}
              setManualLegOdds={setManualLegOdds}
              manualLegLabel={manualLegLabel}
              setManualLegLabel={setManualLegLabel}
              addLeg={addLeg}
              removeLeg={removeLeg}
              addManualLeg={addManualLeg}
              stake={stake}
              setStake={setStake}
              balance={balance}
              parsedStake={parsedStake}
              errorMsg={errorMsg}
              placeAccaBet={placeAccaBet}
              isPending={isPending}
              isAuthenticated={isAuthenticated}
            />
          )}
        </div>

        <BetSimulatorStats stats={stats} />
      </div>

      <BetHistoryTable history={history} />

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
        <p className="mb-1 text-sm font-semibold text-amber-800">Educational Note</p>
        <p className="text-xs leading-relaxed text-amber-700">
          The simulator uses each selection&apos;s implied probability directly from the odds — no
          bookmaker margin is removed. Accumulators multiply the implied win chance across every
          leg, so a 5-fold at 2.00/leg has only a{" "}
          <strong>{(0.5 ** 5 * 100).toFixed(1)}% true win probability</strong>. The big returns look
          attractive, but notice how quickly accumulators drain a balance compared to single bets.
        </p>
      </div>
    </div>
  );
}
