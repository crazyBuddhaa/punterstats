import React, { useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BrainCircuit,
  Calculator,
  ChevronRight,
  Dices,
  Flame,
  HelpCircle,
  History,
  Layers,
  LineChart,
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
import { AnalysisViews } from "@/components/AnalysisViews";
import type { SavedAnalysis } from "@/lib/match-breakdown/types";

interface AnalysisCentreProps {
  onNavigatePillar: (pillar: NavPillar) => void;
  onOpenContextualEducation: (topicKey: string, title: string, explanation: string, lessonId?: string) => void;
  savedAnalyses: SavedAnalysis[];
  onSaveAnalysis: (item: SavedAnalysis) => void;
  onLogBetFromAnalysis: (payload: {
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
  savedAnalyses,
  onSaveAnalysis,
  onLogBetFromAnalysis,
}: AnalysisCentreProps) {
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<AnalysisPillarTab>("tactical-analysis");
  const [selectedTeamId, setSelectedTeamId] = useState("liv");
  const [selectedPlayerId, setSelectedPlayerId] = useState("ply-salah");

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

  return (
    <div className="min-h-screen bg-[#f4f5ef] text-[#0b1713] pb-24">
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
            4. ADVANCED STATS MODELS
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
                      <th className="py-2.5">Delta (Luck / Finishing)</th>
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
            5. PRESERVED TOOLS: MATCH BREAKDOWN, SPOT THE VALUE, SIMULATION
           ======================================================== */}
        {(activeAnalysisTab === "match-breakdown" ||
          activeAnalysisTab === "spot-the-value" ||
          activeAnalysisTab === "simulation") && (
          <AnalysisViews
            activeSubTab={activeAnalysisTab}
            onChangeSubTab={(sub) => setActiveAnalysisTab(sub as AnalysisPillarTab)}
            savedAnalyses={savedAnalyses}
            onSaveAnalysis={onSaveAnalysis}
            onLogBetFromAnalysis={onLogBetFromAnalysis}
          />
        )}
      </div>
    </div>
  );
}
