"use client";

import { useState, useTransition } from "react";
import {
  ChevronRight,
  ChevronLeft,
  BarChart2,
  Save,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { analyzeMatch } from "@/lib/match-breakdown/analyzer";
import { saveAnalysis } from "@/lib/match-breakdown/actions";
import { FormRow } from "./form-badges";
import { FactorCard } from "./factor-card";
import { ProbabilityDisplay } from "./probability-display";
import type {
  HeadToHead,
  InjuryFactor,
  InjuryImpact,
  LeagueImportance,
  MatchAnalysisInput,
  MatchAnalysisResult,
  MatchResult,
  TeamForm,
} from "@/lib/match-breakdown/types";

// ─── Step types ───────────────────────────────────────────────────────────────
type Step = 0 | 1 | 2 | 3 | 4 | 5;

const STEPS = [
  { label: "Match Context", description: "Teams & stakes" },
  { label: "Home Form", description: "Last 5 + goals" },
  { label: "Away Form", description: "Last 5 + goals" },
  { label: "Head-to-Head", description: "Historical record" },
  { label: "Availability", description: "Injuries & suspensions" },
  { label: "Breakdown", description: "Probability analysis" },
];

// ─── Helper sub-components ────────────────────────────────────────────────────
function StepHeader({ step, total }: { step: number; total: number }) {
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
  return (
    <label className="block text-sm font-medium text-[#0f172a] mb-1.5">{children}</label>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-[#1e293b]/50">{children}</p>;
}

function NavButtons({
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
    <div className="mt-8 flex items-center justify-between">
      <button
        onClick={onBack}
        disabled={step === 0}
        className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-[#1e293b] transition hover:bg-slate-50 disabled:opacity-30"
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

// Result picker row (W / D / L buttons)
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
        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        placeholder="e.g. 1.7"
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface MatchAnalyzerProps {
  isAuthenticated: boolean;
}

const defaultTeamForm = (): TeamForm => ({
  name: "",
  last5: [],
  goalsScored: 1.5,
  goalsConceded: 1.2,
});

export function MatchAnalyzer({ isAuthenticated }: MatchAnalyzerProps) {
  const [step, setStep] = useState<Step>(0);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ── Form state ──────────────────────────────────────────────
  const [homeTeam, setHomeTeam] = useState<TeamForm & { gs: string; gc: string }>({
    ...defaultTeamForm(),
    gs: "1.5",
    gc: "1.2",
  });
  const [awayTeam, setAwayTeam] = useState<TeamForm & { gs: string; gc: string }>({
    ...defaultTeamForm(),
    gs: "1.3",
    gc: "1.5",
  });
  const [h2h, setH2H] = useState<HeadToHead & { avg: string }>({
    homeWins: 0,
    draws: 0,
    awayWins: 0,
    avgGoals: 2.5,
    avg: "2.5",
  });
  const [homeInjuries, setHomeInjuries] = useState<InjuryFactor>({ impactRating: "none" });
  const [awayInjuries, setAwayInjuries] = useState<InjuryFactor>({ impactRating: "none" });
  const [leagueImportance, setLeagueImportance] = useState<LeagueImportance>("league");

  // ── Analysis result ─────────────────────────────────────────
  const [result, setResult] = useState<MatchAnalysisResult | null>(null);

  // ── Validation per step ────────────────────────────────────
  const stepValid: Record<Step, boolean> = {
    0: homeTeam.name.trim().length >= 2 && awayTeam.name.trim().length >= 2,
    1: homeTeam.last5.length === 5 && !isNaN(Number(homeTeam.gs)) && !isNaN(Number(homeTeam.gc)),
    2: awayTeam.last5.length === 5 && !isNaN(Number(awayTeam.gs)) && !isNaN(Number(awayTeam.gc)),
    3: h2h.homeWins + h2h.draws + h2h.awayWins >= 0,
    4: true,
    5: true,
  };

  function updateHomeResult(index: number, r: MatchResult) {
    setHomeTeam((prev) => {
      const next = [...prev.last5] as MatchResult[];
      next[index] = r;
      return { ...prev, last5: next };
    });
  }

  function updateAwayResult(index: number, r: MatchResult) {
    setAwayTeam((prev) => {
      const next = [...prev.last5] as MatchResult[];
      next[index] = r;
      return { ...prev, last5: next };
    });
  }

  function runAnalysis() {
    const input: MatchAnalysisInput = {
      homeTeam: {
        name: homeTeam.name,
        last5: homeTeam.last5.slice(0, 5),
        goalsScored: parseFloat(homeTeam.gs) || 1.5,
        goalsConceded: parseFloat(homeTeam.gc) || 1.2,
      },
      awayTeam: {
        name: awayTeam.name,
        last5: awayTeam.last5.slice(0, 5),
        goalsScored: parseFloat(awayTeam.gs) || 1.3,
        goalsConceded: parseFloat(awayTeam.gc) || 1.5,
      },
      headToHead: {
        homeWins: h2h.homeWins,
        draws: h2h.draws,
        awayWins: h2h.awayWins,
        avgGoals: parseFloat(h2h.avg) || 2.5,
      },
      homeInjuries,
      awayInjuries,
      leagueImportance,
    };
    setResult(analyzeMatch(input));
    setStep(5);
  }

  function handleSave() {
    if (!result || !isAuthenticated) return;
    const input: MatchAnalysisInput = {
      homeTeam: {
        name: homeTeam.name,
        last5: homeTeam.last5.slice(0, 5),
        goalsScored: parseFloat(homeTeam.gs) || 1.5,
        goalsConceded: parseFloat(homeTeam.gc) || 1.2,
      },
      awayTeam: {
        name: awayTeam.name,
        last5: awayTeam.last5.slice(0, 5),
        goalsScored: parseFloat(awayTeam.gs) || 1.3,
        goalsConceded: parseFloat(awayTeam.gc) || 1.5,
      },
      headToHead: {
        homeWins: h2h.homeWins,
        draws: h2h.draws,
        awayWins: h2h.awayWins,
        avgGoals: parseFloat(h2h.avg) || 2.5,
      },
      homeInjuries,
      awayInjuries,
      leagueImportance,
    };
    startTransition(async () => {
      const res = await saveAnalysis(homeTeam.name, awayTeam.name, input, result);
      if (res.success) {
        setSaved(true);
      } else {
        setSaveError(res.error);
      }
    });
  }

  function reset() {
    setStep(0);
    setHomeTeam({ ...defaultTeamForm(), gs: "1.5", gc: "1.2" });
    setAwayTeam({ ...defaultTeamForm(), gs: "1.3", gc: "1.5" });
    setH2H({ homeWins: 0, draws: 0, awayWins: 0, avgGoals: 2.5, avg: "2.5" });
    setHomeInjuries({ impactRating: "none" });
    setAwayInjuries({ impactRating: "none" });
    setLeagueImportance("league");
    setResult(null);
    setSaved(false);
    setSaveError(null);
  }

  const injuryOptions: InjuryImpact[] = ["none", "minor", "moderate", "significant", "major"];
  const importanceOptions: { value: LeagueImportance; label: string }[] = [
    { value: "friendly", label: "Friendly / pre-season" },
    { value: "league", label: "Regular league match" },
    { value: "cup", label: "Cup / knockout" },
    { value: "playoff", label: "Playoff / promotion decider" },
    { value: "title-decider", label: "Title decider / relegation six-pointer" },
  ];

  // ── Step renders ────────────────────────────────────────────────────────────
  const steps: Record<Step, React.ReactNode> = {
    // ── Step 0: Match Context ──────────────────────────────────────────────
    0: (
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Home Team Name</Label>
            <input
              type="text"
              value={homeTeam.name}
              onChange={(e) => setHomeTeam((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Arsenal"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <Label>Away Team Name</Label>
            <input
              type="text"
              value={awayTeam.name}
              onChange={(e) => setAwayTeam((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Chelsea"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div>
          <Label>Match Importance</Label>
          <div className="mt-1 grid gap-2">
            {importanceOptions.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setLeagueImportance(value)}
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
    ),

    // ── Step 1: Home Team Form ─────────────────────────────────────────────
    1: (
      <div className="space-y-5">
        <div className="rounded-lg bg-slate-50 border border-border p-3">
          <p className="text-xs text-[#1e293b]/60">
            <span className="font-semibold text-[#0f172a]">{homeTeam.name || "Home team"}</span> — enter
            the last 5 results, most recent first. Then add average goals per game this season.
          </p>
        </div>

        <div>
          <Label>Last 5 Results (most recent first)</Label>
          <div className="mt-2 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <ResultPicker
                key={i}
                index={i}
                value={homeTeam.last5[i]}
                onChange={(r) => updateHomeResult(i, r)}
              />
            ))}
          </div>
          <FieldHint>W = Win, D = Draw, L = Loss</FieldHint>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <GoalInput
            label="Avg goals scored per game"
            value={homeTeam.gs}
            onChange={(v) => setHomeTeam((p) => ({ ...p, gs: v }))}
          />
          <GoalInput
            label="Avg goals conceded per game"
            value={homeTeam.gc}
            onChange={(v) => setHomeTeam((p) => ({ ...p, gc: v }))}
          />
        </div>

        {/* Preview */}
        <div className="rounded-lg border border-border bg-white p-4">
          <p className="mb-2 text-xs font-medium text-[#1e293b]/50">Form Preview</p>
          <FormRow results={homeTeam.last5} label={homeTeam.name || "Home team"} />
        </div>
      </div>
    ),

    // ── Step 2: Away Team Form ─────────────────────────────────────────────
    2: (
      <div className="space-y-5">
        <div className="rounded-lg bg-slate-50 border border-border p-3">
          <p className="text-xs text-[#1e293b]/60">
            <span className="font-semibold text-[#0f172a]">{awayTeam.name || "Away team"}</span> — same
            process. Note that for the away team, results are from their perspective (W = they won).
          </p>
        </div>

        <div>
          <Label>Last 5 Results (most recent first)</Label>
          <div className="mt-2 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <ResultPicker
                key={i}
                index={i}
                value={awayTeam.last5[i]}
                onChange={(r) => updateAwayResult(i, r)}
              />
            ))}
          </div>
          <FieldHint>W = Win, D = Draw, L = Loss</FieldHint>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <GoalInput
            label="Avg goals scored per game"
            value={awayTeam.gs}
            onChange={(v) => setAwayTeam((p) => ({ ...p, gs: v }))}
          />
          <GoalInput
            label="Avg goals conceded per game"
            value={awayTeam.gc}
            onChange={(v) => setAwayTeam((p) => ({ ...p, gc: v }))}
          />
        </div>

        <div className="rounded-lg border border-border bg-white p-4">
          <p className="mb-2 text-xs font-medium text-[#1e293b]/50">Form Preview</p>
          <FormRow results={awayTeam.last5} label={awayTeam.name || "Away team"} />
        </div>
      </div>
    ),

    // ── Step 3: Head-to-Head ───────────────────────────────────────────────
    3: (
      <div className="space-y-5">
        <div className="rounded-lg bg-slate-50 border border-border p-3">
          <p className="text-xs text-[#1e293b]/60">
            Enter the historical record between{" "}
            <span className="font-semibold text-[#0f172a]">{homeTeam.name || "Home"}</span> (home)
            and{" "}
            <span className="font-semibold text-[#0f172a]">{awayTeam.name || "Away"}</span> (away).
            Leave at zero if you don&apos;t have this data — the factor weight will be reduced.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {(
            [
              { key: "homeWins", label: `${homeTeam.name || "Home"} Wins` },
              { key: "draws", label: "Draws" },
              { key: "awayWins", label: `${awayTeam.name || "Away"} Wins` },
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

        {/* H2H summary */}
        {h2h.homeWins + h2h.draws + h2h.awayWins > 0 && (
          <div className="rounded-lg border border-border bg-white p-4">
            <p className="mb-3 text-xs font-medium text-[#1e293b]/50">H2H Summary</p>
            <div className="flex gap-3">
              {[
                {
                  label: homeTeam.name || "Home",
                  val: h2h.homeWins,
                  color: "text-teal-600",
                },
                { label: "Draw", val: h2h.draws, color: "text-amber-600" },
                {
                  label: awayTeam.name || "Away",
                  val: h2h.awayWins,
                  color: "text-indigo-600",
                },
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
    ),

    // ── Step 4: Availability ───────────────────────────────────────────────
    4: (
      <div className="space-y-6">
        <div className="rounded-lg bg-slate-50 border border-border p-3">
          <p className="text-xs text-[#1e293b]/60">
            Estimate the overall impact of injuries and suspensions for each side. Consider the
            quality and role of absent players, not just the count.
          </p>
        </div>

        {[
          {
            team: homeTeam.name || "Home team",
            injuries: homeInjuries,
            setInjuries: setHomeInjuries,
          },
          {
            team: awayTeam.name || "Away team",
            injuries: awayInjuries,
            setInjuries: setAwayInjuries,
          },
        ].map(({ team, injuries, setInjuries }) => (
          <div key={team}>
            <Label>{team} — Absence Impact</Label>
            <div className="mt-1 grid grid-cols-5 gap-1.5">
              {injuryOptions.map((opt) => {
                const optColors: Record<InjuryImpact, string> = {
                  none: "border-emerald-400 bg-emerald-50 text-emerald-700",
                  minor: "border-teal-400 bg-teal-50 text-teal-700",
                  moderate: "border-amber-400 bg-amber-50 text-amber-700",
                  significant: "border-orange-400 bg-orange-50 text-orange-700",
                  major: "border-rose-400 bg-rose-50 text-rose-700",
                };
                return (
                  <button
                    key={opt}
                    onClick={() => setInjuries({ impactRating: opt })}
                    className={`rounded-lg border-2 px-1 py-2 text-center text-[10px] font-semibold capitalize transition ${
                      injuries.impactRating === opt
                        ? optColors[opt]
                        : "border-border bg-white text-[#1e293b]/50 hover:border-slate-300"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="rounded-lg border border-border bg-white p-4 text-xs text-[#1e293b]/60 leading-relaxed">
          <p className="mb-1 font-semibold text-[#0f172a] text-sm">Impact guide</p>
          <ul className="space-y-1">
            <li><span className="font-medium text-emerald-700">None</span> — Full squad available</li>
            <li><span className="font-medium text-teal-700">Minor</span> — Rotation players absent</li>
            <li><span className="font-medium text-amber-700">Moderate</span> — Important squad players out</li>
            <li><span className="font-medium text-orange-700">Significant</span> — Key starters missing (top scorer, CB, CDM)</li>
            <li><span className="font-medium text-rose-700">Major</span> — Multiple first-XI starters absent, including captain or main creator</li>
          </ul>
        </div>
      </div>
    ),

    // ── Step 5: Results ────────────────────────────────────────────────────
    5: (
      result ? (
        <div className="space-y-8">
          {/* Save action */}
          {isAuthenticated && (
            <div className="flex items-center justify-between rounded-xl border border-border bg-white px-5 py-3">
              <div>
                <p className="text-sm font-semibold text-[#0f172a]">
                  {homeTeam.name} vs {awayTeam.name}
                </p>
                <p className="text-xs text-[#1e293b]/50">Save to your dashboard for later reference</p>
              </div>
              {saved ? (
                <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" /> Saved
                </span>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={isPending}
                  className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60"
                >
                  {isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Save Analysis
                </button>
              )}
            </div>
          )}
          {saveError && (
            <p className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-2 text-xs text-rose-600">
              {saveError}
            </p>
          )}

          {/* Probability display */}
          <ProbabilityDisplay
            result={result}
            homeTeamName={homeTeam.name}
            awayTeamName={awayTeam.name}
          />

          {/* Factor breakdown */}
          <div>
            <h3 className="mb-4 font-semibold text-[#0f172a]">Factor-by-Factor Breakdown</h3>
            <div className="grid gap-4 lg:grid-cols-2">
              {result.factors.map((f) => (
                <FactorCard
                  key={f.name}
                  factor={f}
                  homeTeamName={homeTeam.name}
                  awayTeamName={awayTeam.name}
                />
              ))}
            </div>
          </div>

          {/* Restart */}
          <div className="text-center pt-2">
            <button
              onClick={reset}
              className="rounded-lg border border-border px-5 py-2 text-sm font-medium text-[#1e293b] transition hover:bg-slate-50"
            >
              Analyse Another Match
            </button>
          </div>
        </div>
      ) : null
    ),
  };

  // ── Navigation logic ────────────────────────────────────────────────────────
  function handleNext() {
    if (step === 4) {
      runAnalysis();
    } else {
      setStep((s) => (s + 1) as Step);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm">
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-teal-600" />
          <span className="font-semibold text-[#0f172a]">Match Breakdown Analyzer</span>
        </div>
      </div>

      <div className="p-6">
        <StepHeader step={step} total={STEPS.length} />
        {steps[step]}

        {step < 5 && (
          <NavButtons
            step={step}
            total={STEPS.length}
            onBack={() => setStep((s) => Math.max(0, s - 1) as Step)}
            onNext={handleNext}
            nextLabel={step === 4 ? "Run Analysis" : "Continue"}
            nextDisabled={!stepValid[step]}
          />
        )}
      </div>
    </div>
  );
}
