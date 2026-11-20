"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, ChevronLeft, Loader2, RefreshCw } from "lucide-react";
import { FormRow } from "./form-badges";
import { FixtureSearch } from "./fixture-search";
import type {
  HeadToHead,
  LeagueImportance,
  MatchResult,
  TeamForm,
} from "@/lib/match-breakdown/types";
import type { Fixture } from "@/lib/sports-data/types";

export { StepAvailability, StepBreakdownResults } from "./match-analyzer-results";

export type Step = 0 | 1 | 2 | 3 | 4 | 5;

export const STEPS = [
  { label: "Match Context", description: "Teams & stakes" },
  { label: "Home Form", description: "Last 5 + goals" },
  { label: "Away Form", description: "Last 5 + goals" },
  { label: "Head-to-Head", description: "Historical record" },
  { label: "Availability", description: "Injuries & suspensions" },
  { label: "Breakdown", description: "Probability analysis" },
];

export type TeamFormState = TeamForm & { gs: string; gc: string };
export type H2HState = HeadToHead & { avg: string };

const IMPORTANCE_OPTIONS: { value: LeagueImportance; label: string }[] = [
  { value: "friendly", label: "Friendly / pre-season" },
  { value: "league", label: "Regular league match" },
  { value: "cup", label: "Cup / knockout" },
  { value: "playoff", label: "Playoff / promotion decider" },
  { value: "title-decider", label: "Title decider / relegation six-pointer" },
];

export function StepHeader({ step, total }: { step: number; total: number }) {
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i <= step ? "bg-teal-500" : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-[#1e293b]/50">
        Step {step + 1} of {total} — {STEPS[step]?.description}
      </p>
      <h2 className="mt-0.5 text-lg font-bold text-[#0f172a]">{STEPS[step]?.label}</h2>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-[#0f172a] mb-1.5">{children}</label>;
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-[#1e293b]/50">{children}</p>;
}

export function NavButtons({
  step,
  total,
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled = false,
}: {
  step: number;
  total: number;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-5">
      <button
        onClick={onBack}
        disabled={step === 0}
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-30"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-40"
      >
        {nextLabel}
        {step < total - 1 && <ChevronRight className="h-4 w-4" />}
      </button>
    </div>
  );
}

function ResultPicker({
  index,
  value,
  onChange,
}: {
  index: number;
  value: MatchResult | undefined;
  onChange: (r: MatchResult) => void;
}) {
  const options: MatchResult[] = ["W", "D", "L"];
  const colors: Record<MatchResult, string> = {
    W: "border-emerald-400 bg-emerald-50 text-emerald-700",
    D: "border-amber-400 bg-amber-50 text-amber-700",
    L: "border-rose-400 bg-rose-50 text-rose-700",
  };
  const ordinals = ["Most recent", "2nd", "3rd", "4th", "5th"];
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-xs text-[#1e293b]/50">{ordinals[index]}</span>
      <div className="flex gap-2">
        {options.map((r) => (
          <button
            key={r}
            onClick={() => onChange(r)}
            className={`h-9 w-9 rounded border-2 text-xs font-bold transition ${
              value === r
                ? colors[r]
                : "border-border bg-white text-[#1e293b]/40 hover:border-slate-300"
            }`}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}

function GoalInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type="number"
        min="0"
        max="10"
        step="0.1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        placeholder="e.g. 1.7"
      />
    </div>
  );
}

function TeamNameField({
  label,
  value,
  onChange,
  onSelectTeam,
  teams,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (name: string) => void;
  onSelectTeam: (name: string) => void;
  teams: string[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q || teams.length === 0) return [];
    const starts: string[] = [];
    const includes: string[] = [];
    for (const t of teams) {
      const lower = t.toLowerCase();
      if (lower === q) continue;
      if (lower.startsWith(q)) starts.push(t);
      else if (lower.includes(q)) includes.push(t);
      if (starts.length + includes.length >= 10) break;
    }
    return [...starts, ...includes].slice(0, 8);
  }, [value, teams]);

  return (
    <div className="relative">
      <Label>{label}</Label>
      <input
        type="text"
        value={value}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute left-0 top-full z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {suggestions.map((t) => (
            <li key={t}>
              <button
                type="button"
                onMouseDown={() => {
                  onSelectTeam(t);
                  setOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left text-xs font-medium text-slate-800 hover:bg-slate-100"
              >
                {t}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function StepMatchContext({
  homeTeamName,
  awayTeamName,
  onHomeNameChange,
  onAwayNameChange,
  onLoadTeamData,
  leagueImportance,
  onImportanceChange,
  onFixtureSelect,
  enriching,
  enrichedFrom,
}: {
  homeTeamName: string;
  awayTeamName: string;
  onHomeNameChange: (name: string) => void;
  onAwayNameChange: (name: string) => void;
  onLoadTeamData?: (home: string, away: string) => void;
  leagueImportance: LeagueImportance;
  onImportanceChange: (val: LeagueImportance) => void;
  onFixtureSelect: (fixture: Fixture) => void;
  enriching: boolean;
  enrichedFrom: string | null;
}) {
  const [teams, setTeams] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/historical/teams")
      .then((r) => r.json())
      .then((json: { success?: boolean; teams?: string[] }) => {
        if (active && json.success && Array.isArray(json.teams)) {
          setTeams(json.teams);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const canLoad = homeTeamName.trim().length >= 2 && awayTeamName.trim().length >= 2;

  return (
    <div className="space-y-5">
      <FixtureSearch onSelect={onFixtureSelect} />

      <div className="grid gap-4 sm:grid-cols-2">
        <TeamNameField
          label="Home Team"
          value={homeTeamName}
          onChange={onHomeNameChange}
          onSelectTeam={(name) => {
            onHomeNameChange(name);
            if (awayTeamName.trim().length >= 2) onLoadTeamData?.(name, awayTeamName);
          }}
          teams={teams}
          placeholder="e.g. Arsenal"
        />
        <TeamNameField
          label="Away Team"
          value={awayTeamName}
          onChange={onAwayNameChange}
          onSelectTeam={(name) => {
            onAwayNameChange(name);
            if (homeTeamName.trim().length >= 2) onLoadTeamData?.(homeTeamName, name);
          }}
          teams={teams}
          placeholder="e.g. Chelsea"
        />
      </div>

      {canLoad && onLoadTeamData && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={enriching}
            onClick={() => onLoadTeamData(homeTeamName, awayTeamName)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 transition hover:bg-teal-100 disabled:opacity-50"
          >
            {enriching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {enriching ? "Loading team stats…" : "Load latest form & H2H"}
          </button>
          {!enriching && enrichedFrom && (
            <span className="text-xs font-medium text-emerald-700">
              Loaded {enrichedFrom} — review or adjust any field below.
            </span>
          )}
        </div>
      )}

      <div>
        <Label>Match Importance</Label>
        <div className="mt-1 grid gap-2">
          {IMPORTANCE_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onImportanceChange(value)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-left text-sm transition ${
                leagueImportance === value
                  ? "border-teal-500 bg-teal-50 text-teal-700 font-medium"
                  : "border-border bg-white text-[#1e293b] hover:bg-slate-50"
              }`}
            >
              <span
                className={`h-3 w-3 rounded-full border-2 ${
                  leagueImportance === value ? "border-teal-500 bg-teal-500" : "border-slate-300"
                }`}
              />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StepTeamForm({
  team,
  sideLabel,
  description,
  onResultChange,
  onGsChange,
  onGcChange,
}: {
  team: TeamFormState;
  sideLabel: string;
  description: string;
  onResultChange: (index: number, r: MatchResult) => void;
  onGsChange: (gs: string) => void;
  onGcChange: (gc: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-lg bg-slate-50 border border-border p-3">
        <p className="text-xs text-[#1e293b]/60">
          <span className="font-semibold text-[#0f172a]">{team.name || sideLabel}</span> —{" "}
          {description}
        </p>
      </div>

      <div>
        <Label>Last 5 Results (most recent first)</Label>
        <div className="mt-2 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <ResultPicker
              key={i}
              index={i}
              value={team.last5[i]}
              onChange={(r) => onResultChange(i, r)}
            />
          ))}
        </div>
        <FieldHint>W = Win, D = Draw, L = Loss</FieldHint>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <GoalInput label="Avg goals scored per game" value={team.gs} onChange={onGsChange} />
        <GoalInput label="Avg goals conceded per game" value={team.gc} onChange={onGcChange} />
      </div>

      <div className="rounded-lg border border-border bg-white p-4">
        <p className="mb-2 text-xs font-medium text-[#1e293b]/50">Form Preview</p>
        <FormRow results={team.last5} label={team.name || sideLabel} />
      </div>
    </div>
  );
}

export function StepHeadToHead({
  homeTeamName,
  awayTeamName,
  h2h,
  setH2H,
}: {
  homeTeamName: string;
  awayTeamName: string;
  h2h: H2HState;
  setH2H: React.Dispatch<React.SetStateAction<H2HState>>;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-lg bg-slate-50 border border-border p-3">
        <p className="text-xs text-[#1e293b]/60">
          Enter the historical record between{" "}
          <span className="font-semibold text-[#0f172a]">{homeTeamName || "Home"}</span> (home) and{" "}
          <span className="font-semibold text-[#0f172a]">{awayTeamName || "Away"}</span> (away).
          Leave at zero if you don&apos;t have this data — the factor weight will be reduced.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {(
          [
            { key: "homeWins", label: `${homeTeamName || "Home"} Wins` },
            { key: "draws", label: "Draws" },
            { key: "awayWins", label: `${awayTeamName || "Away"} Wins` },
          ] as Array<{ key: "homeWins" | "draws" | "awayWins"; label: string }>
        ).map(({ key, label }) => (
          <div key={key}>
            <Label>{label}</Label>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={h2h[key]}
              onChange={(e) =>
                setH2H((p) => ({
                  ...p,
                  [key]: Math.max(0, parseInt(e.target.value) || 0),
                }))
              }
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        ))}
      </div>

      <div>
        <Label>Average total goals in H2H matches</Label>
        <input
          type="number"
          min="0"
          max="15"
          step="0.1"
          value={h2h.avg}
          onChange={(e) => setH2H((p) => ({ ...p, avg: e.target.value }))}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="e.g. 2.8"
        />
        <FieldHint>Used to calibrate the goals line estimate</FieldHint>
      </div>

      {h2h.homeWins + h2h.draws + h2h.awayWins > 0 && (
        <div className="rounded-lg border border-border bg-white p-4">
          <p className="mb-3 text-xs font-medium text-[#1e293b]/50">H2H Summary</p>
          <div className="flex gap-3">
            {[
              { label: homeTeamName || "Home", val: h2h.homeWins, color: "text-teal-600" },
              { label: "Draw", val: h2h.draws, color: "text-amber-600" },
              { label: awayTeamName || "Away", val: h2h.awayWins, color: "text-indigo-600" },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex-1 text-center">
                <p className={`text-2xl font-bold ${color}`}>{val}</p>
                <p className="text-xs text-[#1e293b]/50 truncate">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
