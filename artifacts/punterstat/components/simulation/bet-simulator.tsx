"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  CheckCircle2,
  Loader2,
  Play,
  Plus,
  RefreshCw,
  Trash2,
  XCircle,
} from "lucide-react";
import { createSession, recordBet } from "@/lib/simulation/actions";
import { createRng } from "@/lib/simulation/rng";
import { sampleScoreline } from "@/lib/simulation/poisson";
import { evaluateSelection } from "@/lib/bet-assist/auto-settle";
import type { CompetitionStage, LineupStatus, MatchIntel } from "@/lib/football/match-intel";
import { STARTING_BALANCE, formatMoney } from "./bet-simulator-parts";
import { cn } from "@/lib/utils";

type SimMarket =
  | "Home Win"
  | "Draw"
  | "Away Win"
  | "1X"
  | "X2"
  | "Over 2.5"
  | "Under 2.5"
  | "BTTS Yes";

const SIM_MARKETS: SimMarket[] = [
  "Home Win",
  "Draw",
  "Away Win",
  "1X",
  "X2",
  "Over 2.5",
  "Under 2.5",
  "BTTS Yes",
];

const STAGES: Array<{ value: CompetitionStage; label: string }> = [
  { value: "league", label: "League" },
  { value: "cup_knockout", label: "Cup / Knockout" },
  { value: "derby", label: "Derby" },
  { value: "relegation_or_title", label: "Title / Relegation" },
];

const LINEUPS: Array<{ value: LineupStatus; label: string }> = [
  { value: "full_strength", label: "Full strength" },
  { value: "minor_absences", label: "Minor absences" },
  { value: "key_starters_out", label: "Key starters out" },
  { value: "heavy_rotation", label: "Heavy rotation" },
];

interface SimSlipLeg {
  id: string;
  homeTeam: string;
  awayTeam: string;
  market: SimMarket;
  odds: number;
  lambdaHome: number;
  lambdaAway: number;
  stage: CompetitionStage;
  strengthLabel: string;
}

const DEFAULT_SIM_RUNS = 1000;

interface SimulatedMatchResult {
  id: string;
  mode: "single" | "accumulator";
  label: string;
  scorelines: Array<{
    match: string;
    score: string;
    market: string;
    won: boolean;
    legWinPct?: number;
  }>;
  odds: number;
  stake: number;
  outcome: "win" | "loss";
  profitLoss: number;
  balanceAfter: number;
  /** Win probability estimated silently across DEFAULT_SIM_RUNS Monte Carlo scoreline runs. */
  simulatedWinPct: number;
  /** Most frequent simulated scoreline (single match mode). */
  topScoreline?: string | null;
  createdAt: string;
}

function marketProbFromIntel(intel: MatchIntel, market: SimMarket): number {
  const m = intel.markets;
  switch (market) {
    case "Home Win": return m.homeWin;
    case "Draw": return m.draw;
    case "Away Win": return m.awayWin;
    case "1X": return m.doubleChanceHD;
    case "X2": return m.doubleChanceDA;
    case "Over 2.5": return m.over25;
    case "Under 2.5": return m.under25;
    case "BTTS Yes": return m.btts;
  }
}

function TeamInput({
  label,
  value,
  onChange,
  onCommitTeam,
  teams,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onCommitTeam?: (v: string) => void;
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
      const l = t.toLowerCase();
      if (l === q) continue;
      if (l.startsWith(q)) starts.push(t);
      else if (l.includes(q)) includes.push(t);
      if (starts.length + includes.length >= 10) break;
    }
    return [...starts, ...includes].slice(0, 8);
  }, [value, teams]);

  return (
    <div className="relative space-y-1">
      <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</label>
      <input
        type="text"
        value={value}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setTimeout(() => setOpen(false), 150);
          if (value.trim().length >= 3) onCommitTeam?.(value.trim());
        }}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#3D2DFF] focus:outline-none focus:ring-2 focus:ring-[#3D2DFF]/15"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute left-0 top-full z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {suggestions.map((t) => (
            <li key={t}>
              <button
                type="button"
                onMouseDown={() => {
                  onChange(t);
                  onCommitTeam?.(t);
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

export function BetSimulator({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [balance, setBalance] = useState(STARTING_BALANCE);
  const [mode, setMode] = useState<"single" | "accumulator">("single");
  const [teams, setTeams] = useState<string[]>([]);

  // Match setup state
  const [homeTeam, setHomeTeam] = useState("Arsenal");
  const [awayTeam, setAwayTeam] = useState("Chelsea");
  const [stage, setStage] = useState<CompetitionStage>("league");
  const [homeLineup, setHomeLineup] = useState<LineupStatus>("full_strength");
  const [awayLineup, setAwayLineup] = useState<LineupStatus>("full_strength");
  const [market, setMarket] = useState<SimMarket>("Home Win");
  const [odds, setOdds] = useState("1.95");
  const [stake, setStake] = useState("1000");

  // Loaded match intel & auto-detected upcoming fixture
  const [intel, setIntel] = useState<MatchIntel | null>(null);
  const [loadingIntel, setLoadingIntel] = useState(false);
  const [autoFixtureNote, setAutoFixtureNote] = useState<string | null>(null);
  const lastLookupRef = useRef<string>("");

  // Accumulator legs
  const [accaLegs, setAccaLegs] = useState<SimSlipLeg[]>([]);
  const legIdRef = useRef(0);

  // History & session
  const [history, setHistory] = useState<SimulatedMatchResult[]>([]);
  const [lastSim, setLastSim] = useState<SimulatedMatchResult | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/historical/teams")
        .then((r) => r.json())
        .catch(() => ({})),
      fetch("/api/fixtures/search?league=Premier%20League")
        .then((r) => r.json())
        .catch(() => ({})),
    ]).then(([hist, pl]) => {
      if (!active) return;
      const set = new Set<string>();
      const histObj = hist as { success?: boolean; teams?: string[] };
      if (histObj.success && Array.isArray(histObj.teams)) {
        for (const t of histObj.teams) set.add(t);
      }
      const plObj = pl as { fixtures?: Array<{ homeTeam?: string; awayTeam?: string }> };
      if (Array.isArray(plObj.fixtures)) {
        for (const f of plObj.fixtures) {
          if (f.homeTeam) set.add(f.homeTeam);
          if (f.awayTeam) set.add(f.awayTeam);
        }
      }
      setTeams(Array.from(set).sort());
    });
    return () => {
      active = false;
    };
  }, []);

  /** Auto-load the next real scheduled opponent when a user enters/selects a team. */
  const lookupUpcomingOpponent = useCallback(async (teamName: string) => {
    const clean = teamName.trim();
    if (clean.length < 3) return;
    const key = clean.toLowerCase();
    if (lastLookupRef.current === key) return;
    lastLookupRef.current = key;

    try {
      const res = await fetch(`/api/fixtures/search?q=${encodeURIComponent(clean)}`);
      if (!res.ok) return;
      const data = (await res.json()) as {
        success?: boolean;
        fixtures?: Array<{
          homeTeam: string;
          awayTeam: string;
          league: string;
          kickoff: string;
          status: string;
        }>;
      };
      if (!data.success || !Array.isArray(data.fixtures)) return;

      const upcoming = data.fixtures
        .filter((f) => f.status === "scheduled")
        .sort((a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff));
      const next =
        upcoming.find(
          (f) =>
            f.homeTeam.toLowerCase().includes(key) ||
            f.awayTeam.toLowerCase().includes(key),
        ) ?? upcoming[0];

      if (!next) return;

      setHomeTeam(next.homeTeam);
      setAwayTeam(next.awayTeam);
      setIntel(null);
      const dt = new Date(next.kickoff);
      const when = Number.isNaN(dt.getTime())
        ? ""
        : ` · ${dt.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}`;
      setAutoFixtureNote(`Auto-loaded next fixture: ${next.homeTeam} vs ${next.awayTeam} (${next.league}${when})`);
    } catch {
      // Non-blocking: user can still type any opponent manually
    }
  }, []);

  const fetchIntel = useCallback(async () => {
    const h = homeTeam.trim();
    const a = awayTeam.trim();
    if (h.length < 2 || a.length < 2) {
      setErrorMsg("Enter both Home and Away team names.");
      return null;
    }
    setLoadingIntel(true);
    setErrorMsg(null);
    try {
      const qs = new URLSearchParams({
        home: h,
        away: a,
        stage,
        homeLineup,
        awayLineup,
      });
      const res = await fetch(`/api/football/match-intel?${qs.toString()}`);
      const data = (await res.json()) as { success?: boolean; intel?: MatchIntel; error?: string };
      if (!res.ok || !data.success || !data.intel) {
        setErrorMsg(data.error ?? "Could not load team strength data.");
        return null;
      }
      setIntel(data.intel);
      // Suggest realistic bookmaker odds (~5% margin below fair odds) for selected market
      const p = marketProbFromIntel(data.intel, market);
      if (p > 0.02 && p < 0.98) {
        const suggested = Math.max(1.05, Number((1 / (p * 1.05)).toFixed(2)));
        setOdds(suggested.toFixed(2));
      }
      return data.intel;
    } catch {
      setErrorMsg("Network error loading match data.");
      return null;
    } finally {
      setLoadingIntel(false);
    }
  }, [homeTeam, awayTeam, stage, homeLineup, awayLineup, market]);

  const handleMarketChange = (nextMarket: SimMarket) => {
    setMarket(nextMarket);
    if (intel) {
      const p = marketProbFromIntel(intel, nextMarket);
      if (p > 0.02 && p < 0.98) {
        const suggested = Math.max(1.05, Number((1 / (p * 1.05)).toFixed(2)));
        setOdds(suggested.toFixed(2));
      }
    }
  };

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

  const addMatchToAcca = async () => {
    const parsedOdds = parseFloat(odds);
    if (!Number.isFinite(parsedOdds) || parsedOdds <= 1.01) {
      setErrorMsg("Enter decimal odds greater than 1.01.");
      return;
    }
    const activeIntel =
      intel &&
      intel.homeTeam.toLowerCase() === homeTeam.trim().toLowerCase() &&
      intel.awayTeam.toLowerCase() === awayTeam.trim().toLowerCase()
        ? intel
        : await fetchIntel();
    if (!activeIntel) return;

    setAccaLegs((prev) => [
      ...prev,
      {
        id: String(++legIdRef.current),
        homeTeam: activeIntel.homeTeam,
        awayTeam: activeIntel.awayTeam,
        market,
        odds: parsedOdds,
        lambdaHome: activeIntel.lambdaHome,
        lambdaAway: activeIntel.lambdaAway,
        stage,
        strengthLabel: activeIntel.strengthEdgeLabel,
      },
    ]);
    setErrorMsg(null);
  };

  const simulateNow = () => {
    setErrorMsg(null);
    const parsedStake = parseFloat(stake);
    if (!Number.isFinite(parsedStake) || parsedStake < 1) {
      setErrorMsg("Stake must be at least ₦1.");
      return;
    }
    if (parsedStake > balance) {
      setErrorMsg("Stake exceeds your simulated bankroll.");
      return;
    }

    startTransition(async () => {
      const { rng } = createRng();

      if (mode === "single") {
        const parsedOdds = parseFloat(odds);
        if (!Number.isFinite(parsedOdds) || parsedOdds <= 1.01) {
          setErrorMsg("Odds must be greater than 1.01.");
          return;
        }
        const activeIntel =
          intel &&
          intel.homeTeam.toLowerCase() === homeTeam.trim().toLowerCase() &&
          intel.awayTeam.toLowerCase() === awayTeam.trim().toLowerCase()
            ? intel
            : await fetchIntel();
        if (!activeIntel) return;

        // Run DEFAULT_SIM_RUNS (1,000) scoreline simulations silently to estimate true win % & top scoreline
        let simWins = 0;
        const scoreCounts = new Map<string, number>();
        let sampleScore = { home: 0, away: 0 };
        let sampleWon = false;

        for (let r = 0; r < DEFAULT_SIM_RUNS; r++) {
          const sc = sampleScoreline(rng, activeIntel.lambdaHome, activeIntel.lambdaAway);
          const evalRes = evaluateSelection(
            market,
            "1X2",
            activeIntel.homeTeam,
            activeIntel.awayTeam,
            sc.home,
            sc.away,
          );
          const wonRun = evalRes === "won";
          if (wonRun) simWins += 1;
          const key = `${sc.home} – ${sc.away}`;
          scoreCounts.set(key, (scoreCounts.get(key) ?? 0) + 1);
          if (r === 0) {
            sampleScore = sc;
            sampleWon = wonRun;
          }
        }

        let topScoreline: string | null = null;
        let topCount = 0;
        for (const [scKey, cnt] of scoreCounts.entries()) {
          if (cnt > topCount) {
            topCount = cnt;
            topScoreline = scKey;
          }
        }

        const simulatedWinPct = Math.round((simWins / DEFAULT_SIM_RUNS) * 1000) / 10;
        const outcome: "win" | "loss" = sampleWon ? "win" : "loss";
        const profitLoss = sampleWon ? Number(((parsedOdds - 1) * parsedStake).toFixed(2)) : -parsedStake;
        const newBalance = Number((balance + profitLoss).toFixed(2));

        const entry: SimulatedMatchResult = {
          id: crypto.randomUUID(),
          mode: "single",
          label: `${activeIntel.homeTeam} vs ${activeIntel.awayTeam} (${market})`,
          scorelines: [
            {
              match: `${activeIntel.homeTeam} vs ${activeIntel.awayTeam}`,
              score: `${sampleScore.home} – ${sampleScore.away}`,
              market,
              won: sampleWon,
              legWinPct: simulatedWinPct,
            },
          ],
          odds: parsedOdds,
          stake: parsedStake,
          outcome,
          profitLoss,
          balanceAfter: newBalance,
          simulatedWinPct,
          topScoreline,
          createdAt: new Date().toISOString(),
        };

        setBalance(newBalance);
        setLastSim(entry);
        setHistory((prev) => [entry, ...prev]);

        if (isAuthenticated) {
          const sid = await ensureSession();
          if (sid) await recordBet(sid, parsedOdds, parsedStake, outcome, profitLoss, newBalance);
        }
      } else {
        if (accaLegs.length < 2) {
          setErrorMsg("Add at least 2 matches to your accumulator slip first.");
          return;
        }
        const combinedOdds = Number(accaLegs.reduce((acc, l) => acc * l.odds, 1).toFixed(2));

        let simWins = 0;
        const legWinCounts = new Array<number>(accaLegs.length).fill(0);
        let sampleScorelines: SimulatedMatchResult["scorelines"] = [];
        let sampleAllWon = false;

        for (let r = 0; r < DEFAULT_SIM_RUNS; r++) {
          let runAllWon = true;
          const runLines: SimulatedMatchResult["scorelines"] = [];
          for (let li = 0; li < accaLegs.length; li++) {
            const l = accaLegs[li];
            const sc = sampleScoreline(rng, l.lambdaHome, l.lambdaAway);
            const evalRes = evaluateSelection(l.market, "1X2", l.homeTeam, l.awayTeam, sc.home, sc.away);
            const wonLeg = evalRes === "won";
            if (wonLeg) legWinCounts[li] += 1;
            else runAllWon = false;
            if (r === 0) {
              runLines.push({
                match: `${l.homeTeam} vs ${l.awayTeam}`,
                score: `${sc.home} – ${sc.away}`,
                market: l.market,
                won: wonLeg,
              });
            }
          }
          if (runAllWon) simWins += 1;
          if (r === 0) {
            sampleScorelines = runLines;
            sampleAllWon = runAllWon;
          }
        }

        sampleScorelines = sampleScorelines.map((line, li) => ({
          ...line,
          legWinPct: Math.round((legWinCounts[li] / DEFAULT_SIM_RUNS) * 1000) / 10,
        }));

        const simulatedWinPct = Math.round((simWins / DEFAULT_SIM_RUNS) * 1000) / 10;
        const outcome: "win" | "loss" = sampleAllWon ? "win" : "loss";
        const profitLoss = sampleAllWon ? Number(((combinedOdds - 1) * parsedStake).toFixed(2)) : -parsedStake;
        const newBalance = Number((balance + profitLoss).toFixed(2));

        const entry: SimulatedMatchResult = {
          id: crypto.randomUUID(),
          mode: "accumulator",
          label: `${accaLegs.length}-leg Match Accumulator`,
          scorelines: sampleScorelines,
          odds: combinedOdds,
          stake: parsedStake,
          outcome,
          profitLoss,
          balanceAfter: newBalance,
          simulatedWinPct,
          topScoreline: null,
          createdAt: new Date().toISOString(),
        };

        setBalance(newBalance);
        setLastSim(entry);
        setHistory((prev) => [entry, ...prev]);

        if (isAuthenticated) {
          const sid = await ensureSession();
          if (sid) await recordBet(sid, combinedOdds, parsedStake, outcome, profitLoss, newBalance);
        }
      }
    });
  };

  const resetSession = () => {
    setBalance(STARTING_BALANCE);
    setHistory([]);
    setLastSim(null);
    setSessionId(null);
    setErrorMsg(null);
  };

  const totalStaked = history.reduce((s, h) => s + h.stake, 0);
  const netProfit = balance - STARTING_BALANCE;
  const wins = history.filter((h) => h.outcome === "win").length;
  const roi = totalStaked > 0 ? (netProfit / totalStaked) * 100 : 0;
  const accaOdds = accaLegs.reduce((a, l) => a * l.odds, 1);

  return (
    <div className="space-y-8">
      {/* Flat KPI bar (no box-in-box) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Sim Bankroll</p>
            <p className="mt-0.5 text-xl font-bold tabular-nums text-slate-900">{formatMoney(balance)}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Net P&amp;L</p>
            <p className={cn("mt-0.5 text-xl font-bold tabular-nums", netProfit >= 0 ? "text-emerald-600" : "text-rose-600")}>
              {netProfit >= 0 ? "+" : "-"}
              {formatMoney(Math.abs(netProfit))}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Win Rate</p>
            <p className="mt-0.5 text-xl font-bold tabular-nums text-slate-900">
              {history.length > 0 ? `${Math.round((wins / history.length) * 100)}%` : "—"}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">ROI</p>
            <p className={cn("mt-0.5 text-xl font-bold tabular-nums", roi >= 0 ? "text-emerald-600" : "text-rose-600")}>
              {history.length > 0 ? `${roi >= 0 ? "+" : ""}${roi.toFixed(1)}%` : "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            {(["single", "accumulator"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition",
                  mode === m ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900",
                )}
              >
                {m === "single" ? "Single Match" : "Match Accumulator"}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={resetSession}
            title="Reset simulated bankroll"
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Match Setup (Flat form) */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Select Two Teams to Simulate</h3>
            <p className="text-xs text-slate-500">
              Simulations draw real match scorelines driven by team strength (Elo &amp; Dixon-Coles), recent form, H2H, competition stage, and lineup status.
            </p>
          </div>
          <button
            type="button"
            disabled={loadingIntel}
            onClick={fetchIntel}
            className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-100 disabled:opacity-50"
          >
            {loadingIntel ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            {loadingIntel ? "Loading team strength…" : "Load Match Intel"}
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <TeamInput
            label="Home Team"
            value={homeTeam}
            onChange={(v) => {
              setHomeTeam(v);
              setIntel(null);
              setAutoFixtureNote(null);
            }}
            onCommitTeam={lookupUpcomingOpponent}
            teams={teams}
            placeholder="e.g. Arsenal or Sunderland"
          />
          <TeamInput
            label="Away Team"
            value={awayTeam}
            onChange={(v) => {
              setAwayTeam(v);
              setIntel(null);
              setAutoFixtureNote(null);
            }}
            onCommitTeam={lookupUpcomingOpponent}
            teams={teams}
            placeholder="Auto-loads next opponent"
          />
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Competition Stage</label>
            <select
              value={stage}
              onChange={(e) => {
                setStage(e.target.value as CompetitionStage);
                setIntel(null);
              }}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
            >
              {STAGES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Lineup Strength</label>
            <div className="grid grid-cols-2 gap-1.5">
              <select
                aria-label="Home lineup"
                value={homeLineup}
                onChange={(e) => {
                  setHomeLineup(e.target.value as LineupStatus);
                  setIntel(null);
                }}
                className="h-10 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-800"
              >
                {LINEUPS.map((l) => (
                  <option key={l.value} value={l.value}>H: {l.label}</option>
                ))}
              </select>
              <select
                aria-label="Away lineup"
                value={awayLineup}
                onChange={(e) => {
                  setAwayLineup(e.target.value as LineupStatus);
                  setIntel(null);
                }}
                className="h-10 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-800"
              >
                {LINEUPS.map((l) => (
                  <option key={l.value} value={l.value}>A: {l.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {autoFixtureNote && (
          <p className="text-xs font-medium text-teal-700">{autoFixtureNote}</p>
        )}

        {/* Loaded Football Intelligence Strip */}
        {intel && (
          <div className="space-y-2 border-l-4 border-teal-500 bg-slate-50/80 px-4 py-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-slate-900">
                {intel.homeTeam} vs {intel.awayTeam} — {intel.strengthEdgeLabel}
              </span>
              <span className="tabular-nums font-semibold text-teal-800">
                Projected xG: {intel.lambdaHome.toFixed(2)} – {intel.lambdaAway.toFixed(2)} · 1X2:{" "}
                {Math.round(intel.markets.homeWin * 100)}% / {Math.round(intel.markets.draw * 100)}% /{" "}
                {Math.round(intel.markets.awayWin * 100)}%
              </span>
            </div>
            {intel.markets.topScorelines.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-700">
                <span>
                  <strong className="text-slate-900">Most Likely Scores:</strong>{" "}
                  {intel.markets.topScorelines
                    .slice(0, 3)
                    .map((s) => `${s.score} (${Math.round(s.prob * 100)}%)`)
                    .join(" · ")}
                </span>
                <span>
                  <strong className="text-slate-900">Top Conservative Options:</strong>{" "}
                  {[
                    { label: "1X", p: intel.markets.doubleChanceHD },
                    { label: "X2", p: intel.markets.doubleChanceDA },
                    { label: "Over 1.5", p: intel.markets.over15 },
                    { label: `${intel.homeTeam} O0.5`, p: intel.markets.homeOver05 },
                    { label: `${intel.awayTeam} O0.5`, p: intel.markets.awayOver05 },
                  ]
                    .sort((a, b) => b.p - a.p)
                    .slice(0, 3)
                    .map((o) => `${o.label} (${Math.round(o.p * 100)}%)`)
                    .join(" · ")}
                </span>
              </div>
            )}
            {intel.factors.length > 0 && (
              <p className="text-slate-600">{intel.factors.join(" · ")}</p>
            )}
            {intel.riskNotes.length > 0 && (
              <p className="font-medium text-amber-800">⚠ {intel.riskNotes.join(" · ")}</p>
            )}
          </div>
        )}

        {/* Market, Odds, Stake & Action */}
        <div className="flex flex-wrap items-end gap-3 pt-1">
          <div className="space-y-1 min-w-[140px]">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Market</label>
            <select
              value={market}
              onChange={(e) => handleMarketChange(e.target.value as SimMarket)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
            >
              {SIM_MARKETS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1 w-28">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Odds</label>
            <input
              inputMode="decimal"
              value={odds}
              onChange={(e) => setOdds(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm tabular-nums text-slate-900"
            />
          </div>

          <div className="space-y-1 w-32">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Stake (₦)</label>
            <input
              inputMode="decimal"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm tabular-nums text-slate-900"
            />
          </div>

          {mode === "accumulator" ? (
            <>
              <button
                type="button"
                disabled={loadingIntel}
                onClick={addMatchToAcca}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                <Plus className="h-4 w-4" /> Add Match to Slip
              </button>
              <button
                type="button"
                disabled={isPending || accaLegs.length < 2}
                onClick={simulateNow}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#3D2DFF] px-5 text-sm font-semibold text-white hover:bg-[#3D2DFF]/90 disabled:opacity-50"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Simulate {accaLegs.length}-Leg Slip
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={isPending || loadingIntel}
              onClick={simulateNow}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#3D2DFF] px-6 text-sm font-semibold text-white hover:bg-[#3D2DFF]/90 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Simulate Match
            </button>
          )}
        </div>

        {errorMsg && <p className="text-xs font-medium text-rose-600">{errorMsg}</p>}

        {/* Accumulator slip legs list */}
        {mode === "accumulator" && accaLegs.length > 0 && (
          <div className="space-y-2 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">
                Accumulator Slip ({accaLegs.length} matches · Combined Odds {accaOdds.toFixed(2)})
              </span>
              <button
                type="button"
                onClick={() => setAccaLegs([])}
                className="text-slate-400 hover:text-rose-600"
              >
                Clear slip
              </button>
            </div>
            <ul className="divide-y divide-slate-200 border-y border-slate-200">
              {accaLegs.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-2 py-2 text-xs">
                  <div>
                    <span className="font-semibold text-slate-900">
                      {l.homeTeam} vs {l.awayTeam}
                    </span>{" "}
                    <span className="text-slate-500">· {l.market}</span>{" "}
                    <span className="text-teal-700">({l.strengthLabel})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold tabular-nums text-slate-800">@ {l.odds.toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={() => setAccaLegs((prev) => prev.filter((x) => x.id !== l.id))}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Latest Simulated Match Outcome */}
      {lastSim && (
        <section className="space-y-3 border-t border-slate-200 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {lastSim.outcome === "win" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <XCircle className="h-5 w-5 text-rose-600" />
              )}
              <h3 className="text-sm font-bold text-slate-900">
                Simulated Result: {lastSim.outcome === "win" ? "WON" : "LOST"} (
                {lastSim.profitLoss >= 0 ? "+" : "-"}
                {formatMoney(Math.abs(lastSim.profitLoss))})
              </h3>
              <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-teal-800">
                Win Chance: {lastSim.simulatedWinPct.toFixed(1)}%
                {lastSim.topScoreline ? ` · Most Likely: ${lastSim.topScoreline}` : ""}
              </span>
            </div>
            <span className="text-xs tabular-nums text-slate-500">
              Stake {formatMoney(lastSim.stake)} @ {lastSim.odds.toFixed(2)} → Bankroll {formatMoney(lastSim.balanceAfter)}
            </span>
          </div>

          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-slate-50/60">
            {lastSim.scorelines.map((s, idx) => (
              <li key={idx} className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs">
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-slate-900">{s.match}</span>
                  <span className="ml-2 inline-block text-slate-500">
                    Pick: {s.market}
                    {s.legWinPct != null ? ` (${Math.round(s.legWinPct)}%)` : ""}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2.5">
                  <span className="whitespace-nowrap rounded border border-slate-200 bg-white px-2 py-0.5 font-bold tabular-nums text-slate-900">
                    FT {s.score}
                  </span>
                  <span className={cn("w-10 text-right font-bold", s.won ? "text-emerald-600" : "text-rose-600")}>
                    {s.won ? "WON" : "LOST"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Simulation Performance History */}
      {history.length > 0 && (
        <section className="space-y-3 border-t border-slate-200 pt-6">
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Simulation History ({history.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-xs">
              <thead className="border-b border-slate-200 text-left text-slate-400">
                <tr>
                  <th className="pb-2 pr-3 font-medium">Match / Slip</th>
                  <th className="pb-2 pr-3 font-medium">Score(s)</th>
                  <th className="pb-2 pr-3 text-right font-medium">Odds</th>
                  <th className="pb-2 pr-3 text-right font-medium">Stake</th>
                  <th className="pb-2 pr-3 text-right font-medium">P&amp;L</th>
                  <th className="pb-2 text-right font-medium">Bankroll</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 tabular-nums">
                {history.slice(0, 20).map((h) => (
                  <tr key={h.id}>
                    <td className="py-2.5 pr-3 font-medium text-slate-900">{h.label}</td>
                    <td className="py-2.5 pr-3 text-slate-600">
                      {h.scorelines.map((s) => s.score).join(", ")}
                    </td>
                    <td className="whitespace-nowrap py-2.5 pr-3 text-right text-slate-700">
                      {h.odds.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap py-2.5 pr-3 text-right text-slate-700">
                      {formatMoney(h.stake)}
                    </td>
                    <td
                      className={cn(
                        "whitespace-nowrap py-2.5 pr-3 text-right font-bold",
                        h.profitLoss >= 0 ? "text-emerald-600" : "text-rose-600",
                      )}
                    >
                      {h.profitLoss >= 0 ? "+" : "-"}
                      {formatMoney(Math.abs(h.profitLoss))}
                    </td>
                    <td className="whitespace-nowrap py-2.5 text-right font-semibold text-slate-900">
                      {formatMoney(h.balanceAfter)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
