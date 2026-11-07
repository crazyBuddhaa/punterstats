import React, { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  BarChart2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Download,
  Filter,
  Layers,
  Search,
  Sparkles,
  Table,
  Trophy,
} from "lucide-react";
import type { NavPillar } from "@/types/football";
import { STATISTICAL_EXPLORER_TABLES } from "@/data/footballIntelligenceData";

interface StatisticsExplorerProps {
  onNavigatePillar: (pillar: NavPillar) => void;
  onNavigateToMatch: (matchId: string) => void;
}

type ExplorerMetricTab =
  | "highest-scoring"
  | "best-defense"
  | "highest-corners"
  | "player-scorers"
  | "league-comparison";

export function StatisticsExplorer({ onNavigatePillar, onNavigateToMatch }: StatisticsExplorerProps) {
  const [metricTab, setMetricTab] = useState<ExplorerMetricTab>("highest-scoring");
  const [leagueFilter, setLeagueFilter] = useState<string>("all");
  const [venueFilter, setVenueFilter] = useState<"all" | "home" | "away">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const metricTabs: { id: ExplorerMetricTab; label: string }[] = [
    { id: "highest-scoring", label: "Highest-Scoring Teams" },
    { id: "best-defense", label: "Best Defensive Records" },
    { id: "highest-corners", label: "Highest Corner Averages" },
    { id: "player-scorers", label: "Player Scoring & Shot Conversion" },
    { id: "league-comparison", label: "European League Comparisons" },
  ];

  return (
    <div className="min-h-screen bg-[#f4f5ef] text-[#0b1713] pb-24">
      {/* Header Banner */}
      <div className="border-b border-white/10 bg-[#0b1713] text-white">
        <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-10 lg:px-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#d7f35f]">
                07 · Independent Statistical Explorer
              </span>
              <h1 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight text-white">
                Discover European football trends.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
                Explore verified league leaderboards, corner rates, defensive resilience, and player finishing efficiency across major European leagues. Sample sizes clearly disclosed.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/5 p-4 text-xs font-mono text-white/80">
              <span className="text-[#d7f35f] font-bold block mb-1">Data Governance</span>
              <span>2025/2026 Season · Sample size: 24–28 matchweeks · Verified statistics</span>
            </div>
          </div>

          {/* Metric Selector Tabs */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto border-t border-white/10 pt-4 no-scrollbar">
            {metricTabs.map((tab) => {
              const isActive = metricTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setMetricTab(tab.id)}
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

      <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-16 pt-8 space-y-6">
        {/* Controls and Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-5">
          <div className="flex items-center gap-3">
            {/* League Dropdown */}
            <select
              value={leagueFilter}
              onChange={(e) => setLeagueFilter(e.target.value)}
              className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs font-bold text-[#0b1713]"
            >
              <option value="all">All Competitions</option>
              <option value="Premier League">Premier League</option>
              <option value="La Liga">La Liga</option>
              <option value="Bundesliga">Bundesliga</option>
              <option value="Serie A">Serie A</option>
            </select>

            {/* Venue Filter */}
            <div className="flex items-center rounded-lg border border-black/15 bg-white p-0.5 text-xs">
              {(["all", "home", "away"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setVenueFilter(v)}
                  className={`px-2.5 py-1 rounded-md font-semibold capitalize transition ${
                    venueFilter === v ? "bg-[#0b1713] text-[#d7f35f]" : "text-[#0b1713]/60"
                  }`}
                >
                  {v === "all" ? "Overall" : v}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Filter by team or player..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs text-[#0b1713] placeholder:text-black/40 focus:outline-none w-48 sm:w-60"
            />
          </div>
        </div>

        {/* 1. HIGHEST SCORING TEAMS */}
        {metricTab === "highest-scoring" && (
          <div className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-black/5 border-b border-black/10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#0b1713]">Highest Scoring Football Clubs in Europe</h3>
                <p className="text-[11px] text-[#0b1713]/60">Ranked by actual goals and Expected Goals (xG) generation per match.</p>
              </div>
              <span className="font-mono text-xs text-[#0b1713]/50">Sample: 2025/2026 League Fixtures</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono tabular-nums">
                <thead className="border-b border-black/10 text-[#0b1713]/60 font-sans">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-center w-12">#</th>
                    <th className="px-6 py-3 font-semibold">Club</th>
                    <th className="px-6 py-3 font-semibold">League</th>
                    <th className="px-6 py-3 font-semibold text-center">Played</th>
                    <th className="px-6 py-3 font-semibold text-center">Total Goals</th>
                    <th className="px-6 py-3 font-semibold text-center text-[#0f766e]">Goals / Match</th>
                    <th className="px-6 py-3 font-semibold text-center">xG / Match</th>
                    <th className="px-6 py-3 font-semibold text-center">Shot Conversion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {STATISTICAL_EXPLORER_TABLES.highestScoringTeams
                    .filter((t) => (leagueFilter === "all" ? true : t.league === leagueFilter))
                    .filter((t) => (searchQuery ? t.team.toLowerCase().includes(searchQuery.toLowerCase()) : true))
                    .map((team) => (
                      <tr key={team.rank} className="hover:bg-black/5 transition">
                        <td className="px-6 py-3.5 text-center font-bold text-[#0b1713]/40">{team.rank}</td>
                        <td className="px-6 py-3.5 font-sans font-bold text-[#0b1713]">{team.team}</td>
                        <td className="px-6 py-3.5 font-sans text-[#0b1713]/70">{team.league}</td>
                        <td className="px-6 py-3.5 text-center">{team.played}</td>
                        <td className="px-6 py-3.5 text-center font-bold">{team.goals}</td>
                        <td className="px-6 py-3.5 text-center font-bold text-[#0f766e] text-sm">{team.goalsPerMatch.toFixed(2)}</td>
                        <td className="px-6 py-3.5 text-center">{team.xGPerMatch.toFixed(2)}</td>
                        <td className="px-6 py-3.5 text-center">{team.shotConversionPct}%</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. BEST DEFENSIVE TEAMS */}
        {metricTab === "best-defense" && (
          <div className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-black/5 border-b border-black/10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#0b1713]">Best Defensive Records in Europe</h3>
                <p className="text-[11px] text-[#0b1713]/60">Ranked by lowest goals conceded per match and clean sheet frequency.</p>
              </div>
              <span className="font-mono text-xs text-[#0b1713]/50">Sample: 2025/2026 League Fixtures</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono tabular-nums">
                <thead className="border-b border-black/10 text-[#0b1713]/60 font-sans">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-center w-12">#</th>
                    <th className="px-6 py-3 font-semibold">Club</th>
                    <th className="px-6 py-3 font-semibold">League</th>
                    <th className="px-6 py-3 font-semibold text-center">Played</th>
                    <th className="px-6 py-3 font-semibold text-center">Conceded</th>
                    <th className="px-6 py-3 font-semibold text-center text-[#0f766e]">Conceded / Match</th>
                    <th className="px-6 py-3 font-semibold text-center">xGA / Match</th>
                    <th className="px-6 py-3 font-semibold text-center">Clean Sheet Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {STATISTICAL_EXPLORER_TABLES.bestDefensiveTeams
                    .filter((t) => (leagueFilter === "all" ? true : t.league === leagueFilter))
                    .filter((t) => (searchQuery ? t.team.toLowerCase().includes(searchQuery.toLowerCase()) : true))
                    .map((team) => (
                      <tr key={team.rank} className="hover:bg-black/5 transition">
                        <td className="px-6 py-3.5 text-center font-bold text-[#0b1713]/40">{team.rank}</td>
                        <td className="px-6 py-3.5 font-sans font-bold text-[#0b1713]">{team.team}</td>
                        <td className="px-6 py-3.5 font-sans text-[#0b1713]/70">{team.league}</td>
                        <td className="px-6 py-3.5 text-center">{team.played}</td>
                        <td className="px-6 py-3.5 text-center font-bold">{team.conceded}</td>
                        <td className="px-6 py-3.5 text-center font-bold text-[#0f766e] text-sm">{team.concededPerMatch.toFixed(2)}</td>
                        <td className="px-6 py-3.5 text-center">{team.xGAPerMatch.toFixed(2)}</td>
                        <td className="px-6 py-3.5 text-center">{team.cleanSheetPct}% ({team.cleanSheets} clean sheets)</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. HIGHEST CORNER AVERAGES */}
        {metricTab === "highest-corners" && (
          <div className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-black/5 border-b border-black/10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#0b1713]">Highest Corner Generation Clubs</h3>
                <p className="text-[11px] text-[#0b1713]/60">Ranked by team corners won and match total corner frequency.</p>
              </div>
              <span className="font-mono text-xs text-[#0b1713]/50">Sample: 2025/2026 League Fixtures</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono tabular-nums">
                <thead className="border-b border-black/10 text-[#0b1713]/60 font-sans">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-center w-12">#</th>
                    <th className="px-6 py-3 font-semibold">Club</th>
                    <th className="px-6 py-3 font-semibold">League</th>
                    <th className="px-6 py-3 font-semibold text-center">Played</th>
                    <th className="px-6 py-3 font-semibold text-center text-[#0f766e]">Corners Won / Match</th>
                    <th className="px-6 py-3 font-semibold text-center">Corners Allowed</th>
                    <th className="px-6 py-3 font-semibold text-center">Match Total Avg</th>
                    <th className="px-6 py-3 font-semibold text-center">Over 9.5 Corners %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {STATISTICAL_EXPLORER_TABLES.highestCornersTeams
                    .filter((t) => (leagueFilter === "all" ? true : t.league === leagueFilter))
                    .filter((t) => (searchQuery ? t.team.toLowerCase().includes(searchQuery.toLowerCase()) : true))
                    .map((team) => (
                      <tr key={team.rank} className="hover:bg-black/5 transition">
                        <td className="px-6 py-3.5 text-center font-bold text-[#0b1713]/40">{team.rank}</td>
                        <td className="px-6 py-3.5 font-sans font-bold text-[#0b1713]">{team.team}</td>
                        <td className="px-6 py-3.5 font-sans text-[#0b1713]/70">{team.league}</td>
                        <td className="px-6 py-3.5 text-center">{team.played}</td>
                        <td className="px-6 py-3.5 text-center font-bold text-[#0f766e] text-sm">{team.cornersForAvg.toFixed(1)}</td>
                        <td className="px-6 py-3.5 text-center">{team.cornersAgainstAvg.toFixed(1)}</td>
                        <td className="px-6 py-3.5 text-center font-bold">{team.matchTotalAvg.toFixed(1)}</td>
                        <td className="px-6 py-3.5 text-center">{team.over95Pct}%</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. PLAYER SCORING & SHOT CONVERSION */}
        {metricTab === "player-scorers" && (
          <div className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-black/5 border-b border-black/10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#0b1713]">Top European Goalscorers & Shooting Efficiency</h3>
                <p className="text-[11px] text-[#0b1713]/60">Ranked by goals, Expected Goals (xG), shots per 90, and conversion rates.</p>
              </div>
              <span className="font-mono text-xs text-[#0b1713]/50">Sample: 2025/2026 Domestic Seasons</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono tabular-nums">
                <thead className="border-b border-black/10 text-[#0b1713]/60 font-sans">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-center w-12">#</th>
                    <th className="px-6 py-3 font-semibold">Player</th>
                    <th className="px-6 py-3 font-semibold">Club</th>
                    <th className="px-6 py-3 font-semibold">League</th>
                    <th className="px-6 py-3 font-semibold text-center text-[#0f766e]">Goals</th>
                    <th className="px-6 py-3 font-semibold text-center">Assists</th>
                    <th className="px-6 py-3 font-semibold text-center">xG</th>
                    <th className="px-6 py-3 font-semibold text-center">Shots / 90</th>
                    <th className="px-6 py-3 font-semibold text-center">Shot Conversion %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {STATISTICAL_EXPLORER_TABLES.topScorersLeaders
                    .filter((p) => (leagueFilter === "all" ? true : p.league === leagueFilter))
                    .filter((p) => (searchQuery ? p.player.toLowerCase().includes(searchQuery.toLowerCase()) : true))
                    .map((item) => (
                      <tr key={item.rank} className="hover:bg-black/5 transition">
                        <td className="px-6 py-3.5 text-center font-bold text-[#0b1713]/40">{item.rank}</td>
                        <td className="px-6 py-3.5 font-sans font-bold text-[#0b1713]">{item.player}</td>
                        <td className="px-6 py-3.5 font-sans text-[#0b1713]/70">{item.team}</td>
                        <td className="px-6 py-3.5 font-sans text-[#0b1713]/60">{item.league}</td>
                        <td className="px-6 py-3.5 text-center font-bold text-[#0f766e] text-base">{item.goals}</td>
                        <td className="px-6 py-3.5 text-center font-bold">{item.assists}</td>
                        <td className="px-6 py-3.5 text-center">{item.xG.toFixed(1)}</td>
                        <td className="px-6 py-3.5 text-center">{item.shotsPer90.toFixed(1)}</td>
                        <td className="px-6 py-3.5 text-center font-bold">{item.shotConversionPct}%</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. LEAGUE COMPARISON */}
        {metricTab === "league-comparison" && (
          <div className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-black/5 border-b border-black/10">
              <h3 className="font-bold text-sm text-[#0b1713]">Cross-League Statistical Averages</h3>
              <p className="text-[11px] text-[#0b1713]/60">Comparative environment across Premier League, La Liga, Bundesliga, and Serie A.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono tabular-nums">
                <thead className="border-b border-black/10 text-[#0b1713]/60 font-sans">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Competition</th>
                    <th className="px-6 py-3 font-semibold text-center">Avg Goals / Game</th>
                    <th className="px-6 py-3 font-semibold text-center">Over 2.5 %</th>
                    <th className="px-6 py-3 font-semibold text-center">BTTS %</th>
                    <th className="px-6 py-3 font-semibold text-center">Avg Corners</th>
                    <th className="px-6 py-3 font-semibold text-center">Avg Yellow Cards</th>
                    <th className="px-6 py-3 font-semibold text-center">Home Win %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {[
                    { league: "Bundesliga (Germany)", goals: "3.18", over25: "62.4%", btts: "58.2%", corners: "10.4", cards: "3.9", homeWin: "45.2%" },
                    { league: "Premier League (England)", goals: "3.02", over25: "58.6%", btts: "54.8%", corners: "10.6", cards: "4.4", homeWin: "46.8%" },
                    { league: "La Liga (Spain)", goals: "2.68", over25: "51.2%", btts: "49.5%", corners: "9.8", cards: "5.1", homeWin: "44.1%" },
                    { league: "Serie A (Italy)", goals: "2.61", over25: "48.9%", btts: "48.2%", corners: "9.6", cards: "4.8", homeWin: "43.5%" },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-black/5 transition">
                      <td className="px-6 py-3.5 font-sans font-bold text-[#0b1713]">{row.league}</td>
                      <td className="px-6 py-3.5 text-center font-bold text-[#0f766e]">{row.goals}</td>
                      <td className="px-6 py-3.5 text-center">{row.over25}</td>
                      <td className="px-6 py-3.5 text-center">{row.btts}</td>
                      <td className="px-6 py-3.5 text-center">{row.corners}</td>
                      <td className="px-6 py-3.5 text-center">{row.cards}</td>
                      <td className="px-6 py-3.5 text-center font-bold">{row.homeWin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
