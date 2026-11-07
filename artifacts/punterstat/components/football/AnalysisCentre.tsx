import React, { useState, useMemo } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BrainCircuit,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Dices,
  Flame,
  HelpCircle,
  History,
  Layers,
  LineChart,
  Play,
  Plus,
  RotateCcw,
  Save,
  Shield,
  Sliders,
  Sparkles,
  Swords,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import type { NavPillar } from "@/types/football";
import { TEAMS_DATA, PLAYERS_DATA } from "@/data/footballIntelligenceData";

export interface AnalysisCentreProps {
  onNavigatePillar: (pillar: NavPillar) => void;
  onOpenContextualEducation: (topicKey: string, title: string, explanation: string, lessonId?: string) => void;
  savedAnalyses?: any[];
  onSaveAnalysis?: (item: any) => void;
  onLogBetFromAnalysis?: (payload: {
    eventName: string;
    market: string;
    selection: string;
    odds: number;
    yourProb: number;
  }) => void;
}

type AnalysisPillarTab =
  | "tactical-analysis"
  | "team-analysis"
  | "player-analysis"
  | "advanced-stats"
  | "match-breakdown"
  | "spot-the-value"
  | "simulation";

export function AnalysisCentre({
  onNavigatePillar,
  onOpenContextualEducation,
  savedAnalyses = [],
  onSaveAnalysis,
  onLogBetFromAnalysis,
}: AnalysisCentreProps) {
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<AnalysisPillarTab>("tactical-analysis");
  const [selectedTeamId, setSelectedTeamId] = useState("liv");
  const [selectedPlayerId, setSelectedPlayerId] = useState("ply-salah");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Match Breakdown Tool State
  const [mbHomeTeam, setMbHomeTeam] = useState("Liverpool");
  const [mbAwayTeam, setMbAwayTeam] = useState("Arsenal");
  const [mbHomeForm, setMbHomeForm] = useState(4); // 1-5
  const [mbAwayForm, setMbAwayForm] = useState(4);
  const [mbH2hHomeWins, setMbH2hHomeWins] = useState(4);
  const [mbH2hDraws, setMbH2hDraws] = useState(4);
  const [mbH2hAwayWins, setMbH2hAwayWins] = useState(2);
  const [mbHomeGoalsAvg, setMbHomeGoalsAvg] = useState(2.4);
  const [mbAwayGoalsAvg, setMbAwayGoalsAvg] = useState(1.8);

  // Spot The Value Tool State
  const [stvEvent, setStvEvent] = useState("Liverpool vs Arsenal");
  const [stvMarket, setStvMarket] = useState("Match Result");
  const [stvSelection, setStvSelection] = useState("Liverpool Win");
  const [stvModelProb, setStvModelProb] = useState(48.0);
  const [stvOdds, setStvOdds] = useState(2.18);

  // Simulation Tool State
  const [simWinProb, setSimWinProb] = useState(50);
  const [simOdds, setSimOdds] = useState(2.10);
  const [simStake, setSimStake] = useState(50);
  const [simNumBets, setSimNumBets] = useState(100);
  const [simResults, setSimResults] = useState<{
    finalBankroll: number;
    roiPct: number;
    wins: number;
    losses: number;
    maxDrawdown: number;
  } | null>(null);

  const team = TEAMS_DATA.find((t) => t.id === selectedTeamId) ?? TEAMS_DATA[0];
  const player = PLAYERS_DATA.find((p) => p.id === selectedPlayerId) ?? PLAYERS_DATA[0];

  const analysisTabs: { id: AnalysisPillarTab; label: string; tag: string }[] = [
    { id: "tactical-analysis", label: "Tactical & Matchup Systems", tag: "Tactics" },
    { id: "team-analysis", label: "Team Profiler & Form", tag: "Teams" },
    { id: "player-analysis", label: "Player Radar & Efficiency", tag: "Players" },
    { id: "advanced-stats", label: "Advanced xG & xGA Models", tag: "Quantitative" },
    { id: "match-breakdown", label: "Interactive 6-Factor Analyzer", tag: "Tool" },
    { id: "spot-the-value", label: "Spot The Value Line-Shopper", tag: "Tool" },
    { id: "simulation", label: "Monte Carlo & Poisson Simulator", tag: "Tool" },
  ];

  // Calculated Match Breakdown Poisson Probabilities
  const computedBreakdown = useMemo(() => {
    const homeAttack = mbHomeGoalsAvg * (0.8 + mbHomeForm * 0.08) * 1.15; // Home advantage
    const awayAttack = mbAwayGoalsAvg * (0.8 + mbAwayForm * 0.08);

    const homeWinProb = Math.min(85, Math.max(15, Math.round((homeAttack / (homeAttack + awayAttack + 1.2)) * 100)));
    const awayWinProb = Math.min(75, Math.max(10, Math.round((awayAttack / (homeAttack + awayAttack + 1.2)) * 100)));
    const drawProb = 100 - homeWinProb - awayWinProb;

    const totalXg = homeAttack + awayAttack;
    const over25 = Math.min(88, Math.max(25, Math.round((1 - Math.exp(-totalXg * 0.85)) * 100)));
    const btts = Math.min(85, Math.max(20, Math.round((1 - Math.exp(-homeAttack)) * (1 - Math.exp(-awayAttack)) * 100)));

    return {
      homeWinProb,
      drawProb,
      awayWinProb,
      totalXg: totalXg.toFixed(2),
      over25,
      btts,
    };
  }, [mbHomeGoalsAvg, mbAwayGoalsAvg, mbHomeForm, mbAwayForm]);

  // Calculated Spot The Value Metrics
  const computedValue = useMemo(() => {
    const impliedProb = stvOdds > 1 ? (1 / stvOdds) * 100 : 0;
    const valueEdge = stvModelProb - impliedProb;
    const ev = (stvModelProb / 100) * stvOdds - 1;
    const fairOdds = stvModelProb > 0 ? 1 / (stvModelProb / 100) : 0;

    return {
      impliedProb: impliedProb.toFixed(1),
      valueEdge: valueEdge.toFixed(1),
      ev: (ev * 100).toFixed(1),
      fairOdds: fairOdds.toFixed(2),
      hasValue: valueEdge > 0,
    };
  }, [stvModelProb, stvOdds]);

  const handleRunSimulation = () => {
    const startBankroll = 1000;
    let bankroll = startBankroll;
    let peak = startBankroll;
    let maxDrawdown = 0;
    let wins = 0;
    let losses = 0;

    for (let i = 0; i < simNumBets; i++) {
      const outcome = Math.random() * 100 < simWinProb;
      if (outcome) {
        wins++;
        bankroll += simStake * (simOdds - 1);
      } else {
        losses++;
        bankroll -= simStake;
      }
      if (bankroll > peak) peak = bankroll;
      const dd = peak > 0 ? ((peak - bankroll) / peak) * 100 : 0;
      if (dd > maxDrawdown) maxDrawdown = dd;
    }

    const totalStaked = simNumBets * simStake;
    const netProfit = bankroll - startBankroll;
    const roiPct = totalStaked > 0 ? (netProfit / totalStaked) * 100 : 0;

    setSimResults({
      finalBankroll: Math.round(bankroll),
      roiPct: Number(roiPct.toFixed(1)),
      wins,
      losses,
      maxDrawdown: Number(maxDrawdown.toFixed(1)),
    });
  };

  const handleSaveMatchBreakdown = () => {
    if (onSaveAnalysis) {
      onSaveAnalysis({
        id: `analysis-${Date.now()}`,
        match: `${mbHomeTeam} vs ${mbAwayTeam}`,
        date: new Date().toISOString(),
        homeProb: computedBreakdown.homeWinProb,
        drawProb: computedBreakdown.drawProb,
        awayProb: computedBreakdown.awayWinProb,
        totalXg: computedBreakdown.totalXg,
      });
      setToastMsg("Analysis breakdown saved successfully!");
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  const handleLogSpotTheValue = () => {
    if (onLogBetFromAnalysis) {
      onLogBetFromAnalysis({
        eventName: stvEvent,
        market: stvMarket,
        selection: stvSelection,
        odds: stvOdds,
        yourProb: stvModelProb / 100,
      });
      setToastMsg(`Logged "${stvSelection}" to Bet Tracker!`);
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5ef] text-[#0b1713] pb-24">
      {/* Toast Notice */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#0b1713] px-4 py-3 text-sm font-semibold text-[#d7f35f] shadow-2xl flex items-center gap-2 border border-white/10">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="border-b border-white/10 bg-[#0b1713] text-white">
        <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-10 lg:px-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#d7f35f]">
            04 · Statistical Analysis Centre
          </span>
          <h1 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight text-white">
            Deep tactical breakdowns & analytical engines.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
            Examine team styles, player performance radars, pressing intensity (PPDA), and access the integrated 6-factor Match Breakdown and Monte Carlo simulators.
          </p>

          {/* Sub-Navigation Tabs */}
          <div className="mt-8 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-white/10 pt-4">
            {analysisTabs.map((t) => {
              const isActive = activeAnalysisTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveAnalysisTab(t.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-[#d7f35f] text-[#0b1713]"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span>{t.label}</span>
                  <span className={`text-[10px] font-mono opacity-60 ${isActive ? "text-[#0b1713]" : "text-white/50"}`}>
                    [{t.tag}]
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-16 pt-8">
        {/* ========================================================
            1. TACTICAL ANALYSIS
           ======================================================== */}
        {activeAnalysisTab === "tactical-analysis" && (
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black text-[#0b1713]">Tactical Archetypes in Modern Football</h3>
                  <button
                    onClick={() =>
                      onOpenContextualEducation(
                        "tactics",
                        "Tactical Systems & Matchups",
                        "How high pressing, low blocks, and half-space overloads create structural mismatches.",
                        "les-fundamentals-1"
                      )
                    }
                    className="text-xs font-bold text-[#0f766e] hover:underline"
                  >
                    Learn Tactics
                  </button>
                </div>
                <div className="space-y-4 text-xs leading-relaxed text-[#0b1713]/80">
                  <div className="p-3.5 rounded-xl bg-black/5">
                    <p className="font-bold text-sm text-[#0b1713]">1. Vertical High-Press (Liverpool / Leverkusen)</p>
                    <p className="mt-1 text-[#0b1713]/70">
                      Aggressive rest-defense, sub-9.0 PPDA, rapid 8-second counter-attacks triggered upon turnovers in the middle third.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/5">
                    <p className="font-bold text-sm text-[#0b1713]">2. Positional Control & Box Build-up (Arsenal / Man City)</p>
                    <p className="mt-1 text-[#0b1713]/70">
                      Structured 3-2-5 in possession, territorial asphyxiation (field tilt &gt;65%), highly controlled set-piece routines.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/5">
                    <p className="font-bold text-sm text-[#0b1713]">3. Fluid Half-Space Transitions (Real Madrid)</p>
                    <p className="mt-1 text-[#0b1713]/70">
                      Relies on dynamic interplay between wide forwards and late-arriving central midfielders into zone 14.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-black text-[#0b1713] mb-4">Tactical Matchup Matrix</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/5">
                    <div>
                      <p className="font-bold text-[#0b1713]">High Press vs Low Block</p>
                      <p className="text-[#0b1713]/60">Favors corners and late goals as defending side tires.</p>
                    </div>
                    <span className="font-mono font-bold text-[#0f766e]">High Corners Edge</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/5">
                    <div>
                      <p className="font-bold text-[#0b1713]">High Press vs High Press</p>
                      <p className="text-[#0b1713]/60">Chaos game with broken lines, high transition frequency.</p>
                    </div>
                    <span className="font-mono font-bold text-[#0f766e]">BTTS & Over 2.5 Edge</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/5">
                    <div>
                      <p className="font-bold text-[#0b1713]">Possession Control vs Mid-Block Counter</p>
                      <p className="text-[#0b1713]/60">Prone to low first-half goal counts; patient probing.</p>
                    </div>
                    <span className="font-mono font-bold text-[#0b1713]/70">Under 1.5 1H Edge</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            2. TEAM PROFILER & FORM
           ======================================================== */}
        {activeAnalysisTab === "team-analysis" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-[#0b1713]">Team Performance Profiler</h3>
                <p className="text-xs text-[#0b1713]/60">Select any top European club to examine underlying tactical and statistical metrics.</p>
              </div>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs font-bold"
              >
                {TEAMS_DATA.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.league})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <span className="text-xs text-[#0b1713]/50 uppercase font-semibold">Attacking Dominance</span>
                <p className="font-mono text-3xl font-black text-[#0b1713] mt-1">{team.goalsFor} Goals</p>
                <div className="mt-4 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="font-sans text-[#0b1713]/60">Total xG Created:</span>
                    <span className="font-bold">{team.xG}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-[#0b1713]/60">xG Per Match:</span>
                    <span className="font-bold text-[#0f766e]">{(team.xG / team.played).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-[#0b1713]/60">Avg Shots on Target:</span>
                    <span className="font-bold">{team.avgShotsOnTarget} / game</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <span className="text-xs text-[#0b1713]/50 uppercase font-semibold">Defensive Resilience</span>
                <p className="font-mono text-3xl font-black text-[#0b1713] mt-1">{team.goalsAgainst} Conceded</p>
                <div className="mt-4 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="font-sans text-[#0b1713]/60">Total xGA Allowed:</span>
                    <span className="font-bold">{team.xGA}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-[#0b1713]/60">Clean Sheets:</span>
                    <span className="font-bold text-[#0f766e]">{team.cleanSheets} of {team.played}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-[#0b1713]/60">Home Win Rate:</span>
                    <span className="font-bold">{team.homeWinPct}%</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <span className="text-xs text-[#0b1713]/50 uppercase font-semibold">Tactical Style</span>
                <h4 className="text-lg font-black text-[#0b1713] mt-1">{team.name}</h4>
                <p className="text-xs text-[#0b1713]/70 mt-2 leading-relaxed">
                  {team.tacticalStyle}
                </p>
                <div className="mt-4 pt-3 border-t border-black/5 text-xs">
                  <span className="font-semibold text-[#0b1713] block mb-1">Key Strengths:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {team.strengths.map((str, i) => (
                      <span key={i} className="bg-black/5 px-2 py-0.5 rounded text-[11px] text-[#0b1713]/80">
                        {str}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            3. PLAYER RADAR & EFFICIENCY
           ======================================================== */}
        {activeAnalysisTab === "player-analysis" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-[#0b1713]">Player Performance Radar</h3>
                <p className="text-xs text-[#0b1713]/60">Deep dive into player scoring efficiency, non-penalty xG, key passes, and defensive actions.</p>
              </div>
              <select
                value={selectedPlayerId}
                onChange={(e) => setSelectedPlayerId(e.target.value)}
                className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs font-bold"
              >
                {PLAYERS_DATA.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.team})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <span className="text-xs text-[#0b1713]/50 uppercase font-semibold">Player Identity</span>
                <h4 className="text-2xl font-black text-[#0b1713] mt-1">{player.name}</h4>
                <p className="text-xs text-[#0b1713]/60">{player.team} · {player.position} · {player.nationality} ({player.age} yrs)</p>
                <div className="mt-6 space-y-2 font-mono text-xs tabular-nums">
                  <div className="flex justify-between py-1 border-b border-black/5">
                    <span className="font-sans text-[#0b1713]/60">Appearances:</span>
                    <span className="font-bold">{player.appearances} ({player.minutes} mins)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-black/5">
                    <span className="font-sans text-[#0b1713]/60">Goals / Assists:</span>
                    <span className="font-bold text-[#0f766e]">{player.goals} G / {player.assists} A</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-sans text-[#0b1713]/60">Pass Accuracy:</span>
                    <span className="font-bold">{player.passAccuracyPct}%</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <span className="text-xs text-[#0b1713]/50 uppercase font-semibold">Shooting Profile</span>
                <p className="font-mono text-3xl font-black text-[#0b1713] mt-1">{player.shotsPer90} Shots/90</p>
                <div className="mt-4 space-y-2 font-mono text-xs tabular-nums">
                  <div className="flex justify-between py-1 border-b border-black/5">
                    <span className="font-sans text-[#0b1713]/60">Target Accuracy:</span>
                    <span className="font-bold text-[#0f766e]">{player.shotsOnTargetPct}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-black/5">
                    <span className="font-sans text-[#0b1713]/60">Expected Goals (xG):</span>
                    <span className="font-bold">{player.xG}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-sans text-[#0b1713]/60">Expected Assists (xA):</span>
                    <span className="font-bold">{player.xA}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <span className="text-xs text-[#0b1713]/50 uppercase font-semibold">Playmaking & Defense</span>
                <div className="mt-4 space-y-2 font-mono text-xs tabular-nums">
                  <div className="flex justify-between py-1.5 border-b border-black/5">
                    <span className="font-sans text-[#0b1713]/60">Key Passes / 90:</span>
                    <span className="font-bold text-base text-[#0b1713]">{player.keyPassesPer90}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-black/5">
                    <span className="font-sans text-[#0b1713]/60">Tackles / 90:</span>
                    <span className="font-bold text-base text-[#0b1713]">{player.tacklesPer90}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="font-sans text-[#0b1713]/60">Interceptions / 90:</span>
                    <span className="font-bold text-base text-[#0b1713]">{player.interceptionsPer90}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            4. ADVANCED STATS MODELS (xPTS)
           ======================================================== */}
        {activeAnalysisTab === "advanced-stats" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-black text-[#0b1713] mb-3">Expected Points (xPTS) Table vs Actual Standings</h3>
              <p className="text-xs text-[#0b1713]/60 mb-6">
                Expected Points simulates each league match 1,000 times using xG shot quality to assess whether teams are over- or under-performing their true creation.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono tabular-nums">
                  <thead className="border-b border-black/10 text-[#0b1713]/60 font-sans">
                    <tr>
                      <th className="py-2.5 font-bold">Team</th>
                      <th className="py-2.5">Actual Pts</th>
                      <th className="py-2.5 font-bold text-[#0f766e]">Expected Pts (xPTS)</th>
                      <th className="py-2.5">xG Created</th>
                      <th className="py-2.5">xGA Conceded</th>
                      <th className="py-2.5">Delta (Finishing/Luck)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    <tr className="hover:bg-black/5">
                      <td className="py-3 font-sans font-bold">Liverpool</td>
                      <td className="py-3">63</td>
                      <td className="py-3 font-bold text-[#0f766e]">61.4</td>
                      <td className="py-3">62.4</td>
                      <td className="py-3">24.1</td>
                      <td className="py-3 text-emerald-700">+1.6 (Normal)</td>
                    </tr>
                    <tr className="hover:bg-black/5">
                      <td className="py-3 font-sans font-bold">Arsenal</td>
                      <td className="py-3">60</td>
                      <td className="py-3 font-bold text-[#0f766e]">58.9</td>
                      <td className="py-3">56.8</td>
                      <td className="py-3">21.2</td>
                      <td className="py-3 text-emerald-700">+1.1 (Normal)</td>
                    </tr>
                    <tr className="hover:bg-black/5">
                      <td className="py-3 font-sans font-bold">Real Madrid</td>
                      <td className="py-3">66</td>
                      <td className="py-3 font-bold text-[#0f766e]">62.2</td>
                      <td className="py-3">65.1</td>
                      <td className="py-3">26.0</td>
                      <td className="py-3 text-amber-700">+3.8 (Elite Finishing)</td>
                    </tr>
                    <tr className="hover:bg-black/5">
                      <td className="py-3 font-sans font-bold">Barcelona</td>
                      <td className="py-3">64</td>
                      <td className="py-3 font-bold text-[#0f766e]">63.8</td>
                      <td className="py-3">71.3</td>
                      <td className="py-3">29.5</td>
                      <td className="py-3 text-emerald-700">+0.2 (High Calibration)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            5. INTERACTIVE 6-FACTOR ANALYZER
           ======================================================== */}
        {activeAnalysisTab === "match-breakdown" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-black/10 pb-5 mb-6">
                <div>
                  <h3 className="text-xl font-black text-[#0b1713]">Interactive 6-Factor Fixture Analyzer</h3>
                  <p className="text-xs text-[#0b1713]/60">Adjust team attack rates, recent form ratings, and head-to-head records to simulate outcome probabilities in real time.</p>
                </div>
                <button
                  onClick={handleSaveMatchBreakdown}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#0b1713] px-3.5 py-2 text-xs font-bold text-[#d7f35f] hover:bg-[#17231c]"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Breakdown</span>
                </button>
              </div>

              {/* Input Sliders */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4 p-5 rounded-xl bg-black/5">
                  <h4 className="font-bold text-sm text-[#0b1713]">Home Team Factors: {mbHomeTeam}</h4>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Home Scoring Rate (Goals/Game):</span>
                      <strong className="font-mono">{mbHomeGoalsAvg.toFixed(1)}</strong>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="3.5"
                      step="0.1"
                      value={mbHomeGoalsAvg}
                      onChange={(e) => setMbHomeGoalsAvg(parseFloat(e.target.value))}
                      className="w-full accent-[#0b1713]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Recent Form Rating (Last 5 Games):</span>
                      <strong className="font-mono">{mbHomeForm} / 5</strong>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={mbHomeForm}
                      onChange={(e) => setMbHomeForm(parseInt(e.target.value))}
                      className="w-full accent-[#0b1713]"
                    />
                  </div>
                </div>

                <div className="space-y-4 p-5 rounded-xl bg-black/5">
                  <h4 className="font-bold text-sm text-[#0b1713]">Away Team Factors: {mbAwayTeam}</h4>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Away Scoring Rate (Goals/Game):</span>
                      <strong className="font-mono">{mbAwayGoalsAvg.toFixed(1)}</strong>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="3.5"
                      step="0.1"
                      value={mbAwayGoalsAvg}
                      onChange={(e) => setMbAwayGoalsAvg(parseFloat(e.target.value))}
                      className="w-full accent-[#0b1713]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Recent Form Rating (Last 5 Games):</span>
                      <strong className="font-mono">{mbAwayForm} / 5</strong>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={mbAwayForm}
                      onChange={(e) => setMbAwayForm(parseInt(e.target.value))}
                      className="w-full accent-[#0b1713]"
                    />
                  </div>
                </div>
              </div>

              {/* Real-Time Mathematical Output Bar */}
              <div className="mt-8 pt-6 border-t border-black/10">
                <h4 className="font-bold text-sm text-[#0b1713] mb-4">Real-Time Computed Model Probabilities</h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center font-mono tabular-nums text-xs">
                  <div className="p-3 bg-black/5 rounded-xl">
                    <span className="font-sans text-[#0b1713]/60 block">{mbHomeTeam} Win</span>
                    <span className="text-xl font-black text-[#0b1713]">{computedBreakdown.homeWinProb}%</span>
                  </div>
                  <div className="p-3 bg-black/5 rounded-xl">
                    <span className="font-sans text-[#0b1713]/60 block">Draw</span>
                    <span className="text-xl font-black text-[#0b1713]">{computedBreakdown.drawProb}%</span>
                  </div>
                  <div className="p-3 bg-black/5 rounded-xl">
                    <span className="font-sans text-[#0b1713]/60 block">{mbAwayTeam} Win</span>
                    <span className="text-xl font-black text-[#0b1713]">{computedBreakdown.awayWinProb}%</span>
                  </div>
                  <div className="p-3 bg-black/5 rounded-xl">
                    <span className="font-sans text-[#0b1713]/60 block">Over 2.5 Goals</span>
                    <span className="text-xl font-black text-[#0f766e]">{computedBreakdown.over25}%</span>
                  </div>
                  <div className="p-3 bg-black/5 rounded-xl">
                    <span className="font-sans text-[#0b1713]/60 block">BTTS Yes</span>
                    <span className="text-xl font-black text-[#0f766e]">{computedBreakdown.btts}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            6. SPOT THE VALUE LINE-SHOPPER
           ======================================================== */}
        {activeAnalysisTab === "spot-the-value" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-black/10 pb-5 mb-6">
                <div>
                  <h3 className="text-xl font-black text-[#0b1713]">Spot The Value: Edge Calculator</h3>
                  <p className="text-xs text-[#0b1713]/60">Compare your true model probability against bookmaker odds to detect positive mathematical expectation (+EV).</p>
                </div>
                <button
                  onClick={handleLogSpotTheValue}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#0b1713] px-3.5 py-2 text-xs font-bold text-[#d7f35f] hover:bg-[#17231c]"
                >
                  <Plus className="h-4 w-4" />
                  <span>Log to Bet Tracker</span>
                </button>
              </div>

              {/* Calculator Inputs */}
              <div className="grid gap-4 sm:grid-cols-4 text-xs">
                <div>
                  <label className="font-bold text-[#0b1713] block mb-1">Fixture / Match</label>
                  <input
                    type="text"
                    value={stvEvent}
                    onChange={(e) => setStvEvent(e.target.value)}
                    className="w-full rounded-lg border border-black/15 p-2 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#0b1713] block mb-1">Market Selection</label>
                  <input
                    type="text"
                    value={stvSelection}
                    onChange={(e) => setStvSelection(e.target.value)}
                    className="w-full rounded-lg border border-black/15 p-2 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#0b1713] block mb-1">Your Model Prob (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="99"
                    value={stvModelProb}
                    onChange={(e) => setStvModelProb(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-black/15 p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#0b1713] block mb-1">Bookmaker Odds</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.01"
                    max="50"
                    value={stvOdds}
                    onChange={(e) => setStvOdds(parseFloat(e.target.value) || 1.01)}
                    className="w-full rounded-lg border border-black/15 p-2 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Value Evaluation Result */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono tabular-nums text-xs">
                <div className="p-4 rounded-xl bg-black/5">
                  <span className="font-sans text-[#0b1713]/60 block">Implied Market Prob</span>
                  <span className="text-xl font-bold text-[#0b1713] mt-1 block">{computedValue.impliedProb}%</span>
                </div>
                <div className="p-4 rounded-xl bg-black/5">
                  <span className="font-sans text-[#0b1713]/60 block">Value Edge</span>
                  <span className={`text-xl font-bold mt-1 block ${computedValue.hasValue ? "text-emerald-700" : "text-rose-700"}`}>
                    {computedValue.hasValue ? `+${computedValue.valueEdge}%` : `${computedValue.valueEdge}%`}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-black/5">
                  <span className="font-sans text-[#0b1713]/60 block">Expected Value (+EV)</span>
                  <span className={`text-xl font-bold mt-1 block ${computedValue.hasValue ? "text-emerald-700" : "text-rose-700"}`}>
                    {computedValue.ev}%
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-black/5">
                  <span className="font-sans text-[#0b1713]/60 block">Fair Price</span>
                  <span className="text-xl font-bold text-[#0b1713] mt-1 block">{computedValue.fairOdds}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            7. MONTE CARLO & POISSON SIMULATION ENGINE
           ======================================================== */}
        {activeAnalysisTab === "simulation" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-black/10 pb-5 mb-6">
                <div>
                  <h3 className="text-xl font-black text-[#0b1713]">Monte Carlo Variance & Bankroll Simulator</h3>
                  <p className="text-xs text-[#0b1713]/60">Simulate sequences of 100 to 1,000 bets to visualize variance, drawdown probability, and long-run outcome dispersion.</p>
                </div>
                <button
                  onClick={handleRunSimulation}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#0b1713] px-4 py-2 text-xs font-bold text-[#d7f35f] hover:bg-[#17231c]"
                >
                  <Play className="h-4 w-4" />
                  <span>Run Simulation</span>
                </button>
              </div>

              {/* Simulation Configuration Inputs */}
              <div className="grid gap-4 sm:grid-cols-4 text-xs">
                <div>
                  <label className="font-bold text-[#0b1713] block mb-1">Win Probability (%)</label>
                  <input
                    type="number"
                    min="10"
                    max="90"
                    value={simWinProb}
                    onChange={(e) => setSimWinProb(parseInt(e.target.value) || 50)}
                    className="w-full rounded-lg border border-black/15 p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#0b1713] block mb-1">Decimal Odds</label>
                  <input
                    type="number"
                    step="0.05"
                    min="1.1"
                    max="10"
                    value={simOdds}
                    onChange={(e) => setSimOdds(parseFloat(e.target.value) || 2.0)}
                    className="w-full rounded-lg border border-black/15 p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#0b1713] block mb-1">Stake Per Bet (£)</label>
                  <input
                    type="number"
                    step="10"
                    min="5"
                    max="500"
                    value={simStake}
                    onChange={(e) => setSimStake(parseInt(e.target.value) || 50)}
                    className="w-full rounded-lg border border-black/15 p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#0b1713] block mb-1">Number of Trials</label>
                  <select
                    value={simNumBets}
                    onChange={(e) => setSimNumBets(parseInt(e.target.value))}
                    className="w-full rounded-lg border border-black/15 p-2 font-bold"
                  >
                    <option value={100}>100 Bets</option>
                    <option value={250}>250 Bets</option>
                    <option value={500}>500 Bets</option>
                    <option value={1000}>1,000 Bets</option>
                  </select>
                </div>
              </div>

              {/* Simulation Output Cards */}
              {simResults ? (
                <div className="mt-8 pt-6 border-t border-black/10">
                  <h4 className="font-bold text-sm text-[#0b1713] mb-4">Simulation Results (Starting Bankroll: £1,000)</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono tabular-nums text-xs">
                    <div className="p-4 rounded-xl bg-black/5">
                      <span className="font-sans text-[#0b1713]/60 block">Ending Bankroll</span>
                      <span className={`text-2xl font-black mt-1 block ${simResults.finalBankroll >= 1000 ? "text-emerald-700" : "text-rose-700"}`}>
                        £{simResults.finalBankroll}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-black/5">
                      <span className="font-sans text-[#0b1713]/60 block">Simulated ROI</span>
                      <span className={`text-2xl font-black mt-1 block ${simResults.roiPct >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                        {simResults.roiPct > 0 ? `+${simResults.roiPct}%` : `${simResults.roiPct}%`}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-black/5">
                      <span className="font-sans text-[#0b1713]/60 block">Win / Loss Breakdown</span>
                      <span className="text-xl font-bold text-[#0b1713] mt-1 block">
                        {simResults.wins}W - {simResults.losses}L
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-black/5">
                      <span className="font-sans text-[#0b1713]/60 block">Max Drawdown</span>
                      <span className="text-xl font-bold text-rose-700 mt-1 block">
                        -{simResults.maxDrawdown}%
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-8 p-6 text-center text-xs text-[#0b1713]/60 bg-black/5 rounded-xl border border-black/5">
                  Click &quot;Run Simulation&quot; above to execute a Monte Carlo run and observe sample variance and maximum drawdowns.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
