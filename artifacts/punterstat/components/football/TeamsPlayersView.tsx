import React, { useState } from "react";
import {
  ArrowLeftRight,
  BarChart2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Search,
  Shield,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import type { NavPillar, TeamProfile, PlayerProfile } from "@/types/football";
import { TEAMS_DATA, PLAYERS_DATA } from "@/data/footballIntelligenceData";

interface TeamsPlayersViewProps {
  onNavigateToMatch: (matchId: string) => void;
  onNavigatePillar: (pillar: NavPillar) => void;
}

type ViewMode = "teams" | "players" | "team-compare" | "player-compare";

export function TeamsPlayersView({ onNavigateToMatch, onNavigatePillar }: TeamsPlayersViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("teams");
  const [selectedTeamId, setSelectedTeamId] = useState<string>("liv");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("ply-salah");

  // Comparison selectors
  const [compareTeamA, setCompareTeamA] = useState<string>("liv");
  const [compareTeamB, setCompareTeamB] = useState<string>("ars");
  const [comparePlayerA, setComparePlayerA] = useState<string>("ply-salah");
  const [comparePlayerB, setComparePlayerB] = useState<string>("ply-saka");

  const currentTeam = TEAMS_DATA.find((t) => t.id === selectedTeamId) ?? TEAMS_DATA[0];
  const currentPlayer = PLAYERS_DATA.find((p) => p.id === selectedPlayerId) ?? PLAYERS_DATA[0];

  const teamA = TEAMS_DATA.find((t) => t.id === compareTeamA) ?? TEAMS_DATA[0];
  const teamB = TEAMS_DATA.find((t) => t.id === compareTeamB) ?? TEAMS_DATA[1];

  const playerA = PLAYERS_DATA.find((p) => p.id === comparePlayerA) ?? PLAYERS_DATA[0];
  const playerB = PLAYERS_DATA.find((p) => p.id === comparePlayerB) ?? PLAYERS_DATA[1];

  return (
    <div className="min-h-screen bg-[#f4f5ef] text-[#0b1713] pb-24">
      {/* Header Banner */}
      <div className="border-b border-white/10 bg-[#0b1713] text-white">
        <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-10 lg:px-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#d7f35f]">
            06 · Clubs & Athletes Directory
          </span>
          <h1 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight text-white">
            Team profiles & player performance radar.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
            Detailed statistical dossiers for European football clubs and elite athletes, with side-by-side comparative matrices.
          </p>

          {/* Mode Switcher */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto border-t border-white/10 pt-4">
            {[
              { id: "teams", label: "Team Dossiers" },
              { id: "players", label: "Player Profiles" },
              { id: "team-compare", label: "Team-to-Team Comparison" },
              { id: "player-compare", label: "Player-to-Player Comparison" },
            ].map((tab) => {
              const isActive = viewMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id as ViewMode)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-[#d7f35f] text-[#0b1713]"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-16 pt-8">
        {/* ========================================================
            1. TEAM DOSSIERS
           ======================================================== */}
        {viewMode === "teams" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-[#0b1713]">Select Club Profile</h2>
                <p className="text-xs text-[#0b1713]/60">Comprehensive club statistics, squad performance and tactical metrics.</p>
              </div>

              {/* Selector */}
              <div className="flex items-center gap-2">
                {TEAMS_DATA.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTeamId(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      selectedTeamId === t.id
                        ? "bg-[#0b1713] text-[#d7f35f]"
                        : "bg-white border border-black/10 text-[#0b1713] hover:border-black/30"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Club Main Overview Card */}
            <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-6">
                <div>
                  <span className="font-mono text-xs font-bold text-[#0f766e]">{currentTeam.league}</span>
                  <h3 className="text-3xl sm:text-4xl font-black text-[#0b1713] mt-1">{currentTeam.name}</h3>
                  <p className="text-xs text-[#0b1713]/60 mt-1">
                    Stadium: {currentTeam.stadium} · Manager: {currentTeam.manager}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-center font-mono tabular-nums">
                  <div className="p-3 bg-black/5 rounded-xl">
                    <p className="text-[10px] text-[#0b1713]/50 font-sans uppercase">League Rank</p>
                    <p className="text-2xl font-black text-[#0b1713]">#{currentTeam.rank}</p>
                  </div>
                  <div className="p-3 bg-black/5 rounded-xl">
                    <p className="text-[10px] text-[#0b1713]/50 font-sans uppercase">Points</p>
                    <p className="text-2xl font-black text-[#0f766e]">{currentTeam.points}</p>
                  </div>
                  <div className="p-3 bg-black/5 rounded-xl">
                    <p className="text-[10px] text-[#0b1713]/50 font-sans uppercase">GD</p>
                    <p className="text-2xl font-black text-[#0b1713]">+{currentTeam.goalsFor - currentTeam.goalsAgainst}</p>
                  </div>
                </div>
              </div>

              {/* Statistical Grids */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono tabular-nums text-xs">
                <div className="p-4 rounded-xl bg-black/5">
                  <p className="text-[#0b1713]/60 font-sans">xG Created / Match</p>
                  <p className="text-xl font-black text-[#0b1713] mt-1">{(currentTeam.xG / currentTeam.played).toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-xl bg-black/5">
                  <p className="text-[#0b1713]/60 font-sans">xGA Allowed / Match</p>
                  <p className="text-xl font-black text-[#0b1713] mt-1">{(currentTeam.xGA / currentTeam.played).toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-xl bg-black/5">
                  <p className="text-[#0b1713]/60 font-sans">Avg Match Corners</p>
                  <p className="text-xl font-black text-[#0b1713] mt-1">{currentTeam.avgCorners}</p>
                </div>
                <div className="p-4 rounded-xl bg-black/5">
                  <p className="text-[#0b1713]/60 font-sans">Clean Sheet Rate</p>
                  <p className="text-xl font-black text-[#0f766e] mt-1">{((currentTeam.cleanSheets / currentTeam.played) * 100).toFixed(0)}%</p>
                </div>
              </div>

              {/* Squad List */}
              <div className="mt-8 pt-6 border-t border-black/10">
                <h4 className="font-bold text-sm text-[#0b1713] mb-4">Core Squad & Player Efficiency</h4>
                <div className="space-y-2">
                  {currentTeam.squad.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-black/5 text-xs font-mono tabular-nums"
                    >
                      <div className="flex items-center gap-3 font-sans">
                        <span className="font-mono font-bold w-6 text-center text-[#0b1713]/60">{player.number}</span>
                        <div>
                          <p className="font-bold text-[#0b1713]">{player.name}</p>
                          <p className="text-[11px] text-[#0b1713]/50">{player.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span>{player.goalsThisSeason} Goals</span>
                        <span>{player.assistsThisSeason} Assists</span>
                        <span className="font-bold text-[#0f766e]">Rating: {player.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            2. PLAYER PROFILES
           ======================================================== */}
        {viewMode === "players" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-[#0b1713]">Select Player Profile</h2>
                <p className="text-xs text-[#0b1713]/60">Comprehensive athletic profile, xG quality, shooting efficiency, and radar indicators.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {PLAYERS_DATA.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlayerId(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      selectedPlayerId === p.id
                        ? "bg-[#0b1713] text-[#d7f35f]"
                        : "bg-white border border-black/10 text-[#0b1713] hover:border-black/30"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Player Card */}
            <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-6">
                <div>
                  <span className="font-mono text-xs font-bold text-[#0f766e]">{currentPlayer.team} · {currentPlayer.position}</span>
                  <h3 className="text-3xl sm:text-4xl font-black text-[#0b1713] mt-1">{currentPlayer.name}</h3>
                  <p className="text-xs text-[#0b1713]/60 mt-1">
                    Nationality: {currentPlayer.nationality} · Age: {currentPlayer.age} yrs · {currentPlayer.appearances} Appearances ({currentPlayer.minutes} mins)
                  </p>
                </div>

                <div className="flex items-center gap-3 font-mono tabular-nums text-center">
                  <div className="p-3 bg-black/5 rounded-xl">
                    <p className="text-[10px] text-[#0b1713]/50 font-sans uppercase">Goals</p>
                    <p className="text-2xl font-black text-[#0b1713]">{currentPlayer.goals}</p>
                  </div>
                  <div className="p-3 bg-black/5 rounded-xl">
                    <p className="text-[10px] text-[#0b1713]/50 font-sans uppercase">Assists</p>
                    <p className="text-2xl font-black text-[#0f766e]">{currentPlayer.assists}</p>
                  </div>
                  <div className="p-3 bg-black/5 rounded-xl">
                    <p className="text-[10px] text-[#0b1713]/50 font-sans uppercase">xG</p>
                    <p className="text-2xl font-black text-[#0b1713]">{currentPlayer.xG}</p>
                  </div>
                </div>
              </div>

              {/* Radar Grid */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono tabular-nums text-xs">
                <div className="p-4 rounded-xl bg-black/5">
                  <p className="text-[#0b1713]/60 font-sans">Shots Per 90</p>
                  <p className="text-xl font-black text-[#0b1713] mt-1">{currentPlayer.shotsPer90}</p>
                </div>
                <div className="p-4 rounded-xl bg-black/5">
                  <p className="text-[#0b1713]/60 font-sans">Shooting Accuracy</p>
                  <p className="text-xl font-black text-[#0f766e] mt-1">{currentPlayer.shotsOnTargetPct}%</p>
                </div>
                <div className="p-4 rounded-xl bg-black/5">
                  <p className="text-[#0b1713]/60 font-sans">Key Passes / 90</p>
                  <p className="text-xl font-black text-[#0b1713] mt-1">{currentPlayer.keyPassesPer90}</p>
                </div>
                <div className="p-4 rounded-xl bg-black/5">
                  <p className="text-[#0b1713]/60 font-sans">Pass Accuracy</p>
                  <p className="text-xl font-black text-[#0b1713] mt-1">{currentPlayer.passAccuracyPct}%</p>
                </div>
              </div>

              {/* Recent Match Log */}
              <div className="mt-8 pt-6 border-t border-black/10">
                <h4 className="font-bold text-sm text-[#0b1713] mb-4">Recent Individual Performances</h4>
                <div className="space-y-2">
                  {currentPlayer.recentPerformances.map((perf, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-black/5 text-xs font-mono tabular-nums">
                      <div>
                        <span className="font-bold text-[#0b1713] font-sans">vs {perf.opponent}</span>
                        <span className="text-[#0b1713]/50 ml-2 font-sans">{perf.date}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <span>{perf.minutes} mins</span>
                        <span>{perf.goals} goals</span>
                        <span>{perf.assists} assists</span>
                        <span className="font-bold text-[#0f766e]">Rating: {perf.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            3. TEAM-TO-TEAM COMPARISON
           ======================================================== */}
        {viewMode === "team-compare" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-[#0b1713]">Team-to-Team Comparative Matrix</h2>
                <p className="text-xs text-[#0b1713]/60">Side-by-side benchmark of two clubs across offensive, defensive, and tactical vectors.</p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={compareTeamA}
                  onChange={(e) => setCompareTeamA(e.target.value)}
                  className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs font-bold"
                >
                  {TEAMS_DATA.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <span className="font-mono text-xs font-bold text-[#0b1713]/40">VS</span>
                <select
                  value={compareTeamB}
                  onChange={(e) => setCompareTeamB(e.target.value)}
                  className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs font-bold"
                >
                  {TEAMS_DATA.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-sm">
              <div className="grid grid-cols-3 p-5 bg-black/5 border-b border-black/10 font-bold text-sm">
                <span className="text-left text-[#0f766e]">{teamA.name}</span>
                <span className="text-center text-[#0b1713]/60">Metric</span>
                <span className="text-right text-[#0f766e]">{teamB.name}</span>
              </div>

              <div className="divide-y divide-black/5 text-xs font-mono tabular-nums">
                {[
                  { label: "League Rank", valA: `#${teamA.rank}`, valB: `#${teamB.rank}` },
                  { label: "Total Points", valA: teamA.points, valB: teamB.points },
                  { label: "Goals Scored / Match", valA: (teamA.goalsFor / teamA.played).toFixed(2), valB: (teamB.goalsFor / teamB.played).toFixed(2) },
                  { label: "Goals Conceded / Match", valA: (teamA.goalsAgainst / teamA.played).toFixed(2), valB: (teamB.goalsAgainst / teamB.played).toFixed(2) },
                  { label: "Expected Goals (xG) / Match", valA: (teamA.xG / teamA.played).toFixed(2), valB: (teamB.xG / teamB.played).toFixed(2) },
                  { label: "Expected Goals Against (xGA) / Match", valA: (teamA.xGA / teamA.played).toFixed(2), valB: (teamB.xGA / teamB.played).toFixed(2) },
                  { label: "Average Possession %", valA: `${teamA.avgPossession}%`, valB: `${teamB.avgPossession}%` },
                  { label: "Corners Won / Match", valA: teamA.avgCorners, valB: teamB.avgCorners },
                  { label: "Clean Sheet Rate", valA: `${((teamA.cleanSheets / teamA.played) * 100).toFixed(0)}%`, valB: `${((teamB.cleanSheets / teamB.played) * 100).toFixed(0)}%` },
                ].map((row, idx) => (
                  <div key={idx} className="grid grid-cols-3 p-4 hover:bg-black/5 transition items-center">
                    <span className="text-left font-bold text-[#0b1713]">{row.valA}</span>
                    <span className="text-center font-sans font-semibold text-[#0b1713]/60">{row.label}</span>
                    <span className="text-right font-bold text-[#0b1713]">{row.valB}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            4. PLAYER-TO-PLAYER COMPARISON
           ======================================================== */}
        {viewMode === "player-compare" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-[#0b1713]">Player-to-Player Head-to-Head</h2>
                <p className="text-xs text-[#0b1713]/60">Comparative radar metrics between two attacking stars.</p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={comparePlayerA}
                  onChange={(e) => setComparePlayerA(e.target.value)}
                  className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs font-bold"
                >
                  {PLAYERS_DATA.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.team})</option>
                  ))}
                </select>
                <span className="font-mono text-xs font-bold text-[#0b1713]/40">VS</span>
                <select
                  value={comparePlayerB}
                  onChange={(e) => setComparePlayerB(e.target.value)}
                  className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs font-bold"
                >
                  {PLAYERS_DATA.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.team})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-sm">
              <div className="grid grid-cols-3 p-5 bg-black/5 border-b border-black/10 font-bold text-sm">
                <span className="text-left text-[#0f766e]">{playerA.name} ({playerA.team})</span>
                <span className="text-center text-[#0b1713]/60">Metric</span>
                <span className="text-right text-[#0f766e]">{playerB.name} ({playerB.team})</span>
              </div>

              <div className="divide-y divide-black/5 text-xs font-mono tabular-nums">
                {[
                  { label: "Goals Scored", valA: playerA.goals, valB: playerB.goals },
                  { label: "Assists Completed", valA: playerA.assists, valB: playerB.assists },
                  { label: "Expected Goals (xG)", valA: playerA.xG, valB: playerB.xG },
                  { label: "Expected Assists (xA)", valA: playerA.xA, valB: playerB.xA },
                  { label: "Shots Per 90", valA: playerA.shotsPer90, valB: playerB.shotsPer90 },
                  { label: "Shots on Target %", valA: `${playerA.shotsOnTargetPct}%`, valB: `${playerB.shotsOnTargetPct}%` },
                  { label: "Key Passes Per 90", valA: playerA.keyPassesPer90, valB: playerB.keyPassesPer90 },
                  { label: "Pass Accuracy", valA: `${playerA.passAccuracyPct}%`, valB: `${playerB.passAccuracyPct}%` },
                  { label: "Tackles Per 90", valA: playerA.tacklesPer90, valB: playerB.tacklesPer90 },
                ].map((row, idx) => (
                  <div key={idx} className="grid grid-cols-3 p-4 hover:bg-black/5 transition items-center">
                    <span className="text-left font-bold text-[#0b1713]">{row.valA}</span>
                    <span className="text-center font-sans font-semibold text-[#0b1713]/60">{row.label}</span>
                    <span className="text-right font-bold text-[#0b1713]">{row.valB}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
