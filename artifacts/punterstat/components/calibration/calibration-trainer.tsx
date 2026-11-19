"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Plus, RefreshCw, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logManualPrediction } from "@/lib/calibration/actions";

interface DrillMatch {
  id: string;
  league: string;
  home: string;
  away: string;
  context: string;
  actual: "home_win" | "draw" | "away_win";
  score: string;
  note: string;
}

const DRILL_MATCHES: DrillMatch[] = [
  {
    id: "epl-1",
    league: "Premier League",
    home: "Arsenal",
    away: "Aston Villa",
    context: "Arsenal 2nd in table (W-W-W-D-W, 2.2 xG/g at home). Villa 4th (W-D-L-W-W, strong counter-attack).",
    actual: "away_win",
    score: "0 – 2",
    note: "Even heavy home favourites lose ~15–20% of the time; putting 80%+ on Arsenal gets punished heavily by Brier score.",
  },
  {
    id: "ucl-1",
    league: "Champions League",
    home: "Real Madrid",
    away: "Man City",
    context: "Quarter-final 1st leg at Bernabéu. Both sides averaging >2.0 goals/game; evenly matched knockout tie.",
    actual: "draw",
    score: "3 – 3",
    note: "Knockout 1st legs between elite sides carry ~26–30% draw probability.",
  },
  {
    id: "epl-2",
    league: "Premier League",
    home: "Liverpool",
    away: "Nottingham Forest",
    context: "Liverpool strong at Anfield (W-W-W-W-D); Forest 17th on the road but compact low block.",
    actual: "home_win",
    score: "3 – 0",
    note: "Strong home favourites win ~65–72% of the time — confident, but never 95%.",
  },
  {
    id: "seriea-1",
    league: "Serie A",
    home: "Inter Milan",
    away: "Juventus",
    context: "Derby d'Italia. Inter top of table with best defence; Juve unbeaten in 10, conceding <0.7 goals/game.",
    actual: "draw",
    score: "1 – 1",
    note: "Tight tactical derbies with elite defences push draw probability well above 30%.",
  },
  {
    id: "laliga-1",
    league: "La Liga",
    home: "Barcelona",
    away: "Girona",
    context: "High-tempo Catalan derby. Both sides top-3 in xG created; open pressing game expected.",
    actual: "away_win",
    score: "2 – 4",
    note: "In high-variance open matches, underdogs win far more often than public sentiment assumes.",
  },
];

function computeBrier3Way(
  homeP: number,
  drawP: number,
  awayP: number,
  actual: "home_win" | "draw" | "away_win",
): number {
  const oh = actual === "home_win" ? 1 : 0;
  const od = actual === "draw" ? 1 : 0;
  const oa = actual === "away_win" ? 1 : 0;
  return (homeP - oh) ** 2 + (drawP - od) ** 2 + (awayP - oa) ** 2;
}

function brierRating(score: number): { label: string; color: string } {
  if (score < 0.55) return { label: "Sharp", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (score <= 0.62) return { label: "Solid", color: "bg-teal-50 text-teal-700 border-teal-200" };
  if (score <= 0.67) return { label: "Market-average", color: "bg-amber-50 text-amber-800 border-amber-200" };
  return { label: "Overconfident", color: "bg-rose-50 text-rose-700 border-rose-200" };
}

export function CalibrationTrainer() {
  const router = useRouter();
  const [tab, setTab] = useState<"drill" | "log">("drill");

  // ── Drill state ─────────────────────────────────────────────
  const [idx, setIdx] = useState(0);
  const [homePct, setHomePct] = useState("45");
  const [drawPct, setDrawPct] = useState("27");
  const [awayPct, setAwayPct] = useState("28");
  const [revealed, setRevealed] = useState<{ brier: number } | null>(null);
  const [scores, setScores] = useState<number[]>([]);

  const current = DRILL_MATCHES[idx];
  const drillDone = idx >= DRILL_MATCHES.length;
  const drillSum = (parseFloat(homePct) || 0) + (parseFloat(drawPct) || 0) + (parseFloat(awayPct) || 0);
  const drillValid = Math.abs(drillSum - 100) <= 1;

  function submitDrill() {
    if (!drillValid || !current) return;
    const b = computeBrier3Way(
      parseFloat(homePct) / 100,
      parseFloat(drawPct) / 100,
      parseFloat(awayPct) / 100,
      current.actual,
    );
    setRevealed({ brier: b });
    setScores((prev) => [...prev, b]);
  }

  function nextDrill() {
    setRevealed(null);
    setHomePct("45");
    setDrawPct("27");
    setAwayPct("28");
    setIdx((i) => i + 1);
  }

  function resetDrill() {
    setIdx(0);
    setScores([]);
    setRevealed(null);
    setHomePct("45");
    setDrawPct("27");
    setAwayPct("28");
  }

  // ── Manual forecast logger state ────────────────────────────
  const [mHome, setMHome] = useState("");
  const [mAway, setMAway] = useState("");
  const [mHomeP, setMHomeP] = useState("45");
  const [mDrawP, setMDrawP] = useState("27");
  const [mAwayP, setMAwayP] = useState("28");
  const [logError, setLogError] = useState<string | null>(null);
  const [logSaved, setLogSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const manualSum = (parseFloat(mHomeP) || 0) + (parseFloat(mDrawP) || 0) + (parseFloat(mAwayP) || 0);
  const manualValid = mHome.trim().length >= 2 && mAway.trim().length >= 2 && Math.abs(manualSum - 100) <= 1;

  function handleLogForecast(e: React.FormEvent) {
    e.preventDefault();
    setLogError(null);
    setLogSaved(false);
    startTransition(async () => {
      const res = await logManualPrediction({
        homeTeam: mHome,
        awayTeam: mAway,
        homeProb: parseFloat(mHomeP) / 100,
        drawProb: parseFloat(mDrawP) / 100,
        awayProb: parseFloat(mAwayP) / 100,
      });
      if (!res.success) {
        setLogError(res.error ?? "Failed to save forecast.");
        return;
      }
      setMHome("");
      setMAway("");
      setLogSaved(true);
      router.refresh();
    });
  }

  const avgDrillBrier =
    scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const avgRating = brierRating(avgDrillBrier);

  return (
    <section className="rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-sm space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#3D2DFF]" />
          <h2 className="font-semibold text-[#0f172a]">Calibration Practice &amp; Quick Forecast</h2>
        </div>
        <div className="inline-flex rounded-lg border border-border bg-slate-50 p-0.5">
          <button
            type="button"
            onClick={() => setTab("drill")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition ${
              tab === "drill" ? "bg-[#3D2DFF] text-white" : "text-[#1e293b]/60 hover:text-[#0f172a]"
            }`}
          >
            Quick 5-Match Drill
          </button>
          <button
            type="button"
            onClick={() => setTab("log")}
            className={`inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition ${
              tab === "log" ? "bg-[#3D2DFF] text-white" : "text-[#1e293b]/60 hover:text-[#0f172a]"
            }`}
          >
            <Plus className="h-3 w-3" /> Log Forecast
          </button>
        </div>
      </div>

      {tab === "drill" ? (
        drillDone ? (
          <div className="rounded-xl border border-border bg-slate-50 p-6 text-center space-y-3">
            <Target className="mx-auto h-8 w-8 text-[#3D2DFF]" />
            <p className="text-lg font-bold text-[#0f172a]">
              Drill Complete — Avg Brier Score: {avgDrillBrier.toFixed(3)}
            </p>
            <span className={`inline-block rounded-full border px-3 py-0.5 text-xs font-semibold ${avgRating.color}`}>
              {avgRating.label}
            </span>
            <p className="mx-auto max-w-md text-xs text-[#1e293b]/60">
              For 3-way football markets, a uniform 33/33/33 guess scores ~0.667. Consistently beating 0.60 means your
              probability estimates are well-calibrated without overconfidence.
            </p>
            <Button type="button" variant="outline" size="sm" onClick={resetDrill} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> Run drill again
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-slate-50/70 p-4">
              <div className="flex items-center justify-between text-xs text-[#1e293b]/50 mb-1">
                <span className="font-semibold text-[#3D2DFF]">{current.league}</span>
                <span>
                  Match {idx + 1} of {DRILL_MATCHES.length}
                </span>
              </div>
              <p className="text-base font-bold text-[#0f172a]">
                {current.home} vs {current.away}
              </p>
              <p className="mt-1 text-xs text-[#1e293b]/65 leading-relaxed">{current.context}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: `${current.home} %`, val: homePct, set: setHomePct },
                { label: "Draw %", val: drawPct, set: setDrawPct },
                { label: `${current.away} %`, val: awayPct, set: setAwayPct },
              ].map((f) => (
                <div key={f.label}>
                  <label className="mb-1 block text-xs font-medium text-[#1e293b]/60 truncate">{f.label}</label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    disabled={revealed !== null}
                    value={f.val}
                    onChange={(e) => f.set(e.target.value)}
                    className="tabular-nums"
                  />
                </div>
              ))}
            </div>

            {!revealed ? (
              <div className="flex items-center justify-between gap-3">
                <span className={`text-xs font-medium ${drillValid ? "text-emerald-600" : "text-amber-600"}`}>
                  Total: {drillSum.toFixed(0)}% {drillValid ? "✓" : "(must equal 100%)"}
                </span>
                <Button type="button" variant="teal" size="sm" disabled={!drillValid} onClick={submitDrill}>
                  Submit Forecast
                </Button>
              </div>
            ) : (
              <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-[#0f172a]">
                    Result: {current.home} {current.score} {current.away}
                  </p>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      brierRating(revealed.brier).color
                    }`}
                  >
                    Brier: {revealed.brier.toFixed(3)} ({brierRating(revealed.brier).label})
                  </span>
                </div>
                <p className="text-xs text-[#1e293b]/70 leading-relaxed">{current.note}</p>
                <div className="pt-1 flex justify-end">
                  <Button type="button" variant="teal" size="sm" onClick={nextDrill}>
                    {idx + 1 < DRILL_MATCHES.length ? "Next match →" : "See final score →"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )
      ) : (
        <form onSubmit={handleLogForecast} className="space-y-4">
          <p className="text-xs text-[#1e293b]/60">
            Record your pre-match 1X2 probabilities for any upcoming fixture. Once full-time hits, resolve it below to build your personal Brier score.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input value={mHome} onChange={(e) => setMHome(e.target.value)} placeholder="Home team (e.g. Arsenal)" required />
            <Input value={mAway} onChange={(e) => setMAway(e.target.value)} placeholder="Away team (e.g. Chelsea)" required />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs text-[#1e293b]/60">Home %</label>
              <Input type="number" min={0} max={100} value={mHomeP} onChange={(e) => setMHomeP(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#1e293b]/60">Draw %</label>
              <Input type="number" min={0} max={100} value={mDrawP} onChange={(e) => setMDrawP(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#1e293b]/60">Away %</label>
              <Input type="number" min={0} max={100} value={mAwayP} onChange={(e) => setMAwayP(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className={`text-xs font-medium ${Math.abs(manualSum - 100) <= 1 ? "text-emerald-600" : "text-amber-600"}`}>
              Total: {manualSum.toFixed(0)}% {Math.abs(manualSum - 100) <= 1 ? "✓" : "(must equal 100%)"}
            </span>
            <Button type="submit" variant="teal" size="sm" disabled={pending || !manualValid}>
              {pending ? "Saving…" : "Track Forecast"}
            </Button>
          </div>
          {logError && <p className="text-xs text-rose-600">{logError}</p>}
          {logSaved && (
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" /> Forecast logged — resolve it below after the match!
            </p>
          )}
        </form>
      )}
    </section>
  );
}
