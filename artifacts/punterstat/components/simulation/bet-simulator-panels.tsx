"use client";

import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { OddsPicker, type OddsLegFixtureInfo } from "./odds-picker";
import {
  MAX_LEGS,
  SUGGESTIONS,
  StakeInput,
  ReturnPreview,
  ErrorMsg,
  SimulateButton,
  type AccaLeg,
} from "./bet-simulator-parts";

export function AccumulatorPanel({
  legs,
  accumOdds,
  showLivePicker,
  setShowLivePicker,
  showManualLeg,
  setShowManualLeg,
  manualLegOdds,
  setManualLegOdds,
  manualLegLabel,
  setManualLegLabel,
  addLeg,
  removeLeg,
  addManualLeg,
  stake,
  setStake,
  balance,
  parsedStake,
  errorMsg,
  placeAccaBet,
  isPending,
  isAuthenticated,
}: {
  legs: AccaLeg[];
  accumOdds: number;
  showLivePicker: boolean;
  setShowLivePicker: React.Dispatch<React.SetStateAction<boolean>>;
  showManualLeg: boolean;
  setShowManualLeg: React.Dispatch<React.SetStateAction<boolean>>;
  manualLegOdds: string;
  setManualLegOdds: (v: string) => void;
  manualLegLabel: string;
  setManualLegLabel: (v: string) => void;
  addLeg: (
    decimalOdds: number,
    label: string,
    match?: string,
    fixtureId?: string,
    _fairProb?: number,
    fixtureInfo?: OddsLegFixtureInfo
  ) => void;
  removeLeg: (id: string) => void;
  addManualLeg: () => void;
  stake: string;
  setStake: (v: string) => void;
  balance: number;
  parsedStake: number;
  errorMsg: string | null;
  placeAccaBet: () => void;
  isPending: boolean;
  isAuthenticated: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#0f172a]">Build Your Accumulator</h3>
        <span className="text-[10px] text-[#1e293b]/40">
          {legs.length}/{MAX_LEGS} legs
        </span>
      </div>

      {legs.length > 0 && (
        <div className="space-y-1.5">
          {legs.map((leg, i) => {
            const sharesFixture =
              !!leg.fixtureId && legs.filter((l) => l.fixtureId === leg.fixtureId).length > 1;
            return (
              <div
                key={leg.id}
                className="flex items-center gap-2 rounded-lg border border-border bg-[#f8fafc] px-3 py-2"
              >
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

      <div>
        <button
          onClick={() => setShowLivePicker((v) => !v)}
          disabled={legs.length >= MAX_LEGS}
          className="flex w-full items-center justify-between rounded-lg border border-dashed border-teal-300 bg-teal-50/40 px-3 py-2 text-[11px] font-semibold text-teal-700 transition hover:border-teal-500 disabled:opacity-40"
        >
          <span className="flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add from live odds
          </span>
          {showLivePicker ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
        {showLivePicker && legs.length < MAX_LEGS && (
          <div className="mt-2">
            <OddsPicker accumMode onAddLeg={addLeg} />
          </div>
        )}
      </div>

      <div>
        <button
          onClick={() => setShowManualLeg((v) => !v)}
          disabled={legs.length >= MAX_LEGS}
          className="flex w-full items-center justify-between rounded-lg border border-dashed border-slate-300 bg-[#f8fafc] px-3 py-2 text-[11px] font-semibold text-[#1e293b]/60 transition hover:border-slate-400 hover:text-[#0f172a] disabled:opacity-40"
        >
          <span className="flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add manually
          </span>
          {showManualLeg ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>

        {showManualLeg && legs.length < MAX_LEGS && (
          <div className="mt-2 space-y-2 rounded-lg border border-border bg-[#f8fafc] p-3">
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
              type="text"
              value={manualLegLabel}
              onChange={(e) => setManualLegLabel(e.target.value)}
              placeholder="Selection label (e.g. Man City to win)"
              className="w-full rounded border border-border bg-white px-2.5 py-2 text-xs text-[#0f172a] outline-none focus:border-[#0f172a]"
            />
            <div className="flex gap-2">
              <input
                type="number"
                min="1.01"
                step="0.05"
                value={manualLegOdds}
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

      <StakeInput stake={stake} setStake={setStake} balance={balance} />

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
      {balance <= 0 && (
        <p className="text-center text-xs text-red-500">Balance is ₦0 — reset your session.</p>
      )}
      {!isAuthenticated && (
        <p className="text-center text-[10px] text-[#1e293b]/40">Sign in to save your session</p>
      )}
    </div>
  );
}
