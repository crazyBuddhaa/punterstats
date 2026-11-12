"use client";

import { useState, useTransition } from "react";
import { BarChart2 } from "lucide-react";
import { analyzeMatch } from "@/lib/match-breakdown/analyzer";
import { saveAnalysis, trackPrediction } from "@/lib/match-breakdown/actions";
import type {
  InjuryFactor,
  LeagueImportance,
  MatchAnalysisInput,
  MatchAnalysisResult,
  MatchResult,
  TeamForm,
} from "@/lib/match-breakdown/types";
import type { Fixture } from "@/lib/sports-data/types";
import {
  STEPS,
  StepHeader,
  NavButtons,
  StepMatchContext,
  StepTeamForm,
  StepHeadToHead,
  StepAvailability,
  StepBreakdownResults,
  type Step,
  type TeamFormState,
  type H2HState,
} from "./match-analyzer-steps";

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
  const [selectedFixtureId, setSelectedFixtureId] = useState<string | null>(null);
  const [tracked, setTracked] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [isTracking, startTracking] = useTransition();
  const [enriching, setEnriching] = useState(false);
  const [enrichedFrom, setEnrichedFrom] = useState<string | null>(null);

  // ── Form state ──────────────────────────────────────────────
  const [homeTeam, setHomeTeam] = useState<TeamFormState>({
    ...defaultTeamForm(),
    gs: "1.5",
    gc: "1.2",
  });
  const [awayTeam, setAwayTeam] = useState<TeamFormState>({
    ...defaultTeamForm(),
    gs: "1.3",
    gc: "1.5",
  });
  const [h2h, setH2H] = useState<H2HState>({
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

  function buildInput(): MatchAnalysisInput {
    return {
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
  }

  function handleFixtureSelect(fixture: Fixture) {
    setHomeTeam((p) => ({ ...p, name: fixture.homeTeam }));
    setAwayTeam((p) => ({ ...p, name: fixture.awayTeam }));
    setSelectedFixtureId(fixture.id);
    setEnrichedFrom(null);

    if (fixture.homeTeamId == null || fixture.awayTeamId == null) return;

    const params = new URLSearchParams({
      matchId: fixture.externalId,
      homeTeamId: String(fixture.homeTeamId),
      awayTeamId: String(fixture.awayTeamId),
      homeTeamName: fixture.homeTeam,
      awayTeamName: fixture.awayTeam,
    });

    setEnriching(true);
    fetch(`/api/fixtures/enrich?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) return;
        if (json.homeForm) {
          setHomeTeam((p) => ({
            ...p,
            last5: json.homeForm.last5,
            goalsScored: json.homeForm.goalsScored,
            goalsConceded: json.homeForm.goalsConceded,
            gs: String(json.homeForm.goalsScored),
            gc: String(json.homeForm.goalsConceded),
          }));
        }
        if (json.awayForm) {
          setAwayTeam((p) => ({
            ...p,
            last5: json.awayForm.last5,
            goalsScored: json.awayForm.goalsScored,
            goalsConceded: json.awayForm.goalsConceded,
            gs: String(json.awayForm.goalsScored),
            gc: String(json.awayForm.goalsConceded),
          }));
        }
        if (json.headToHead) {
          setH2H((p) => ({
            ...p,
            homeWins: json.headToHead.homeWins,
            draws: json.headToHead.draws,
            awayWins: json.headToHead.awayWins,
          }));
        }
        if (json.homeForm || json.awayForm || json.headToHead) {
          setEnrichedFrom(`${fixture.homeTeam} vs ${fixture.awayTeam}`);
        }
      })
      .catch(() => {
        // Silent — enrichment is optional, manual entry remains available.
      })
      .finally(() => setEnriching(false));
  }

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
    setResult(analyzeMatch(buildInput()));
    setStep(5);
  }

  function handleSave() {
    if (!result || !isAuthenticated) return;
    const input = buildInput();
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
    setSelectedFixtureId(null);
    setTracked(false);
    setTrackError(null);
    setEnriching(false);
    setEnrichedFrom(null);
  }

  function handleTrackPrediction() {
    if (!result || !isAuthenticated) return;
    const input = buildInput();
    startTracking(async () => {
      const res = await trackPrediction(
        homeTeam.name,
        awayTeam.name,
        input,
        result,
        selectedFixtureId ?? undefined
      );
      if (res.success) {
        setTracked(true);
      } else {
        setTrackError(res.error);
      }
    });
  }

  const steps: Record<Step, React.ReactNode> = {
    0: (
      <StepMatchContext
        homeTeamName={homeTeam.name}
        awayTeamName={awayTeam.name}
        onHomeNameChange={(name) => setHomeTeam((p) => ({ ...p, name }))}
        onAwayNameChange={(name) => setAwayTeam((p) => ({ ...p, name }))}
        leagueImportance={leagueImportance}
        onImportanceChange={setLeagueImportance}
        onFixtureSelect={handleFixtureSelect}
        enriching={enriching}
        enrichedFrom={enrichedFrom}
      />
    ),
    1: (
      <StepTeamForm
        team={homeTeam}
        sideLabel="Home team"
        description="enter the last 5 results, most recent first. Then add average goals per game this season."
        onResultChange={updateHomeResult}
        onGsChange={(gs) => setHomeTeam((p) => ({ ...p, gs }))}
        onGcChange={(gc) => setHomeTeam((p) => ({ ...p, gc }))}
      />
    ),
    2: (
      <StepTeamForm
        team={awayTeam}
        sideLabel="Away team"
        description="same process. Note that for the away team, results are from their perspective (W = they won)."
        onResultChange={updateAwayResult}
        onGsChange={(gs) => setAwayTeam((p) => ({ ...p, gs }))}
        onGcChange={(gc) => setAwayTeam((p) => ({ ...p, gc }))}
      />
    ),
    3: (
      <StepHeadToHead
        homeTeamName={homeTeam.name}
        awayTeamName={awayTeam.name}
        h2h={h2h}
        setH2H={setH2H}
      />
    ),
    4: (
      <StepAvailability
        homeTeamName={homeTeam.name}
        awayTeamName={awayTeam.name}
        homeInjuries={homeInjuries}
        awayInjuries={awayInjuries}
        setHomeInjuries={setHomeInjuries}
        setAwayInjuries={setAwayInjuries}
      />
    ),
    5: result ? (
      <StepBreakdownResults
        result={result}
        isAuthenticated={isAuthenticated}
        homeTeamName={homeTeam.name}
        awayTeamName={awayTeam.name}
        saved={saved}
        isPending={isPending}
        saveError={saveError}
        onSave={handleSave}
        tracked={tracked}
        isTracking={isTracking}
        trackError={trackError}
        onTrackPrediction={handleTrackPrediction}
        onReset={reset}
      />
    ) : null,
  };

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
