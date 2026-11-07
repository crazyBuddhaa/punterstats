import React, { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  BarChart2,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  CornerDownRight,
  Crosshair,
  Flame,
  HelpCircle,
  Info,
  Layers,
  MapPin,
  Play,
  RotateCcw,
  Shield,
  ShieldAlert,
  Sparkles,
  Swords,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import type { MatchCentreData, NavPillar, PlayerLineupItem } from "@/types/football";
import { MATCH_CENTRE_FIXTURES } from "@/data/footballIntelligenceData";

interface MatchCentreProps {
  selectedMatchId: string;
  onSelectMatchId: (id: string) => void;
  onNavigatePillar: (pillar: NavPillar) => void;
  onOpenContextualEducation: (topicKey: string, title: string, explanation: string, lessonId?: string) => void;
  onLogBetFromAnalysis?: (payload: {
    eventName: string;
    market: string;
    selection: string;
    odds: number;
    yourProb: number;
  }) => void;
}

type MatchCentreTab =
  | "overview"
  | "h2h"
  | "lineups"
  | "goals"
  | "corners"
  | "shots"
  | "frequency"
  | "tempo"
  | "players"
  | "goalscorer"
  | "predictions";

export function MatchCentre({
  selectedMatchId,
  onSelectMatchId,
  onNavigatePillar,
  onOpenContextualEducation,
  onLogBetFromAnalysis,
}: MatchCentreProps) {
  const [activeTab, setActiveTab] = useState<MatchCentreTab>("overview");
  const [logSuccessToast, setLogSuccessToast] = useState<string | null>(null);

  const fixture =
    MATCH_CENTRE_FIXTURES.find((f) => f.id === selectedMatchId) ??
    MATCH_CENTRE_FIXTURES[0];

  const tabs: { id: MatchCentreTab; code: string; label: string }[] = [
    { id: "overview", code: "A", label: "Overview" },
    { id: "h2h", code: "B", label: "H2H Records" },
    { id: "lineups", code: "C", label: "Lineups & Tactics" },
    { id: "goals", code: "D", label: "xG & Goals" },
    { id: "corners", code: "E", label: "Corner Analysis" },
    { id: "shots", code: "F", label: "Shots & Accuracy" },
    { id: "frequency", code: "G", label: "Scoring Intervals" },
    { id: "tempo", code: "H", label: "Match Tempo & PPDA" },
    { id: "players", code: "I", label: "Key Players" },
    { id: "goalscorer", code: "J", label: "Player To Score" },
    { id: "predictions", code: "K", label: "Model Predictions" },
  ];

  const handleQuickLog = (market: string, selection: string, odds: number, yourProb: number) => {
    if (onLogBetFromAnalysis) {
      onLogBetFromAnalysis({
        eventName: `${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`,
        market,
        selection,
        odds,
        yourProb,
      });
      setLogSuccessToast(`Logged "${selection}" to Bet Tracker!`);
      setTimeout(() => setLogSuccessToast(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5ef] text-[#0b1713] pb-24">
      {/* Toast Notification */}
      {logSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#0b1713] px-4 py-3 text-sm font-semibold text-[#d7f35f] shadow-2xl flex items-center gap-2 border border-white/10 animate-fade-in">
          <CheckCircle2 className="h-4 w-4" />
          <span>{logSuccessToast}</span>
        </div>
      )}

      {/* Match Fixture Header Banner */}
      <div className="border-b border-white/10 bg-[#0b1713] text-white">
        <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-10 lg:px-16">
          {/* Top Bar: Selector & Meta */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#d7f35f]">
                Flagship Match Centre
              </span>
              <span className="text-white/40">·</span>
              <span className="text-xs text-white/70">{fixture.competition}</span>
              <span className="text-white/40">·</span>
              <span className="text-xs text-white/70 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-white/50" />
                {fixture.venue}
              </span>
            </div>

            {/* Switch Fixture Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/60">Switch Match:</span>
              <select
                value={fixture.id}
                onChange={(e) => onSelectMatchId(e.target.value)}
                className="rounded-lg border border-white/20 bg-[#17231c] px-3 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-[#d7f35f]"
              >
                {MATCH_CENTRE_FIXTURES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.homeTeam.name} vs {m.awayTeam.name} ({m.kickoff})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Main Scoreboard / Matchup Header */}
          <div className="py-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-8">
            {/* Home Team */}
            <div className="flex flex-col items-start sm:items-end text-left sm:text-right">
              <span className="font-mono text-xs text-[#d7f35f] font-semibold">Home Team · Rank #{fixture.homeTeam.leagueRank}</span>
              <h1 className="text-2xl sm:text-5xl font-black tracking-tight text-white mt-1">
                {fixture.homeTeam.name}
              </h1>
              <div className="mt-2 flex items-center gap-1 font-mono text-xs text-white/70">
                <span>Form:</span>
                <span className="font-bold text-white tracking-widest">{fixture.homeTeam.form.join(" ")}</span>
                <span className="text-white/40">·</span>
                <span>{fixture.homeTeam.points} pts</span>
              </div>
            </div>

            {/* Center Status / Time */}
            <div className="flex flex-col items-center justify-center px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-center min-w-[120px] sm:min-w-[140px]">
              <span className="font-mono text-xs text-white/60 uppercase tracking-widest">
                {fixture.status === "live" ? "LIVE" : fixture.status === "finished" ? "FT" : "KICKOFF"}
              </span>
              <span className="font-mono text-xl sm:text-2xl font-black text-white mt-0.5">
                {fixture.status === "finished"
                  ? `${fixture.homeScore} - ${fixture.awayScore}`
                  : fixture.status === "live"
                  ? `${fixture.homeScore ?? 0} - ${fixture.awayScore ?? 0}`
                  : fixture.kickoff.split(" ")[1] ?? "17:30"}
              </span>
              <span className="text-[11px] text-[#d7f35f] mt-1 font-semibold">
                {fixture.kickoff.split(" ")[0]}
              </span>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-end sm:items-start text-right sm:text-left">
              <span className="font-mono text-xs text-white/60 font-semibold">Away Team · Rank #{fixture.awayTeam.leagueRank}</span>
              <h2 className="text-2xl sm:text-5xl font-black tracking-tight text-white mt-1">
                {fixture.awayTeam.name}
              </h2>
              <div className="mt-2 flex items-center gap-1 font-mono text-xs text-white/70">
                <span>Form:</span>
                <span className="font-bold text-white tracking-widest">{fixture.awayTeam.form.join(" ")}</span>
                <span className="text-white/40">·</span>
                <span>{fixture.awayTeam.points} pts</span>
              </div>
            </div>
          </div>

          {/* Quick Pillar Navigation Strip (11 Modules A-K) */}
          <div className="flex items-center gap-1 overflow-x-auto border-t border-white/10 pt-4 pb-1 no-scrollbar">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-[#d7f35f] text-[#0b1713]"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className="font-mono text-[11px] opacity-70">{tab.code}.</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Tab Content Viewport */}
      <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-16 pt-8">
        {/* ========================================================
            A. MATCH OVERVIEW
           ======================================================== */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Top Grid: Key Readouts */}
            <div className="grid gap-6 md:grid-cols-3">
              {/* Home Standings & Form */}
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <span className="text-xs font-semibold text-[#0b1713]/60 uppercase">Home Form & Record</span>
                <h3 className="text-xl font-black text-[#0b1713] mt-1">{fixture.homeTeam.name} at Anfield</h3>
                <div className="mt-4 space-y-2 text-xs font-mono tabular-nums">
                  <div className="flex justify-between py-1 border-b border-black/5">
                    <span className="text-[#0b1713]/60 font-sans">Home Record:</span>
                    <span className="font-bold">{fixture.homeTeam.homeRecord.won}W - {fixture.homeTeam.homeRecord.drawn}D - {fixture.homeTeam.homeRecord.lost}L</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-black/5">
                    <span className="text-[#0b1713]/60 font-sans">Home Goals Scored:</span>
                    <span className="font-bold text-[#0f766e]">{fixture.homeTeam.homeRecord.gf} ({(fixture.homeTeam.homeRecord.gf / fixture.homeTeam.homeRecord.played).toFixed(2)}/g)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-black/5">
                    <span className="text-[#0b1713]/60 font-sans">Home Goals Conceded:</span>
                    <span className="font-bold">{fixture.homeTeam.homeRecord.ga} ({(fixture.homeTeam.homeRecord.ga / fixture.homeTeam.homeRecord.played).toFixed(2)}/g)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#0b1713]/60 font-sans">League Position:</span>
                    <span className="font-bold">1st ({fixture.homeTeam.points} pts)</span>
                  </div>
                </div>
              </div>

              {/* Away Standings & Form */}
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <span className="text-xs font-semibold text-[#0b1713]/60 uppercase">Away Form & Record</span>
                <h3 className="text-xl font-black text-[#0b1713] mt-1">{fixture.awayTeam.name} Away</h3>
                <div className="mt-4 space-y-2 text-xs font-mono tabular-nums">
                  <div className="flex justify-between py-1 border-b border-black/5">
                    <span className="text-[#0b1713]/60 font-sans">Away Record:</span>
                    <span className="font-bold">{fixture.awayTeam.awayRecord.won}W - {fixture.awayTeam.awayRecord.drawn}D - {fixture.awayTeam.awayRecord.lost}L</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-black/5">
                    <span className="text-[#0b1713]/60 font-sans">Away Goals Scored:</span>
                    <span className="font-bold text-[#0f766e]">{fixture.awayTeam.awayRecord.gf} ({(fixture.awayTeam.awayRecord.gf / fixture.awayTeam.awayRecord.played).toFixed(2)}/g)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-black/5">
                    <span className="text-[#0b1713]/60 font-sans">Away Goals Conceded:</span>
                    <span className="font-bold">{fixture.awayTeam.awayRecord.ga} ({(fixture.awayTeam.awayRecord.ga / fixture.awayTeam.awayRecord.played).toFixed(2)}/g)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#0b1713]/60 font-sans">League Position:</span>
                    <span className="font-bold">2nd ({fixture.awayTeam.points} pts)</span>
                  </div>
                </div>
              </div>

              {/* Predicted Model Outcome */}
              <div className="rounded-2xl border border-black/10 bg-[#0b1713] text-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#d7f35f] uppercase">Model Prediction</span>
                  <button
                    onClick={() =>
                      onOpenContextualEducation(
                        "1x2-modelling",
                        "How 1X2 Probabilities Are Generated",
                        "PunterStat calculates 1X2 probabilities using bivariate Poisson distribution calibrated with rolling home/away xG, injury degradation indexes, and historical tactical efficiency.",
                        "les-prob-vs-confidence"
                      )
                    }
                    className="text-white/50 hover:text-white"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="text-xl font-bold mt-1">Liverpool Slight Advantage</h3>
                <p className="text-xs text-white/70 mt-1">48% Win Probability · +4.6% Edge</p>

                <div className="mt-5 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span>Home Win: 48%</span>
                    <span>Draw: 27%</span>
                    <span>Away Win: 25%</span>
                  </div>
                  <div className="flex h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div style={{ width: "48%" }} className="bg-[#d7f35f]" />
                    <div style={{ width: "27%" }} className="bg-white/40" />
                    <div style={{ width: "25%" }} className="bg-[#ff7653]" />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-white/60 font-mono">Pinnacle 2.18 / 3.55 / 3.40</span>
                  <button
                    onClick={() => setActiveTab("predictions")}
                    className="text-xs font-bold text-[#d7f35f] hover:underline"
                  >
                    View All Markets →
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Navigation to other Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { tab: "goals", label: "Goal Analysis (xG 2.15 vs 1.45)", sub: "O/U 2.5 Prob: 61%" },
                { tab: "corners", label: "Corner Analysis (10.6 avg)", sub: "Over 9.5: 62%" },
                { tab: "lineups", label: "Tactical Lineups", sub: "Predicted XI & Formations" },
                { tab: "h2h", label: "H2H Trends", sub: "BTTS in 4 of last 5" },
              ].map((card, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(card.tab as MatchCentreTab)}
                  className="rounded-xl border border-black/10 bg-white p-4 text-left transition hover:border-[#0b1713] hover:shadow-sm"
                >
                  <p className="text-xs font-bold text-[#0b1713]">{card.label}</p>
                  <p className="text-[11px] text-[#0b1713]/60 mt-0.5">{card.sub}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            B. H2H ANALYSIS
           ======================================================== */}
        {activeTab === "h2h" && (
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-4">
              <div className="rounded-2xl border border-black/10 bg-white p-5 text-center">
                <p className="text-xs text-[#0b1713]/60 uppercase font-semibold">Total Meetings</p>
                <p className="font-mono text-3xl font-black text-[#0b1713] mt-1">{fixture.h2h.totalMeetings}</p>
                <p className="text-[11px] text-[#0b1713]/50 mt-1">{fixture.h2h.homeWins} Home · {fixture.h2h.draws} Draw · {fixture.h2h.awayWins} Away</p>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white p-5 text-center">
                <p className="text-xs text-[#0b1713]/60 uppercase font-semibold">Avg Goals Per Match</p>
                <p className="font-mono text-3xl font-black text-[#0b1713] mt-1">{fixture.h2h.avgGoals}</p>
                <p className="text-[11px] text-[#0f766e] mt-1 font-semibold">{fixture.h2h.over25FrequencyPct}% Over 2.5 Rate</p>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white p-5 text-center">
                <p className="text-xs text-[#0b1713]/60 uppercase font-semibold">BTTS Frequency</p>
                <p className="font-mono text-3xl font-black text-[#0b1713] mt-1">{fixture.h2h.bttsFrequencyPct}%</p>
                <p className="text-[11px] text-[#0b1713]/50 mt-1">Both Teams Scored in 15 of 24</p>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white p-5 text-center">
                <p className="text-xs text-[#0b1713]/60 uppercase font-semibold">Corner & Card Averages</p>
                <p className="font-mono text-3xl font-black text-[#0b1713] mt-1">{fixture.h2h.avgCorners}</p>
                <p className="text-[11px] text-[#0b1713]/50 mt-1">{fixture.h2h.avgCards} cards per match</p>
              </div>
            </div>

            {/* Key Trends Box */}
            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#0b1713] mb-4">Historical Head-to-Head Patterns</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {fixture.h2h.trends.map((trend, idx) => (
                  <div key={idx} className="flex items-start gap-3 rounded-xl bg-black/5 p-3.5 text-xs text-[#0b1713]/80">
                    <span className="font-bold text-[#0f766e]">0{idx + 1}.</span>
                    <span>{trend}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Previous Meetings Table */}
            <div className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-black/10 bg-black/5 flex items-center justify-between">
                <h4 className="font-bold text-sm text-[#0b1713]">Recent Head-to-Head Encounters</h4>
                <span className="text-xs text-[#0b1713]/60">Showing last 6 meetings</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono tabular-nums">
                  <thead className="border-b border-black/10 text-[#0b1713]/60">
                    <tr>
                      <th className="px-6 py-3 font-semibold font-sans">Date</th>
                      <th className="px-6 py-3 font-semibold font-sans">Competition</th>
                      <th className="px-6 py-3 font-semibold font-sans">Match</th>
                      <th className="px-6 py-3 font-semibold font-sans text-center">Score</th>
                      <th className="px-6 py-3 font-semibold font-sans text-center">Corners</th>
                      <th className="px-6 py-3 font-semibold font-sans text-center">Cards</th>
                      <th className="px-6 py-3 font-semibold font-sans text-center">BTTS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {fixture.h2h.meetings.map((m, idx) => (
                      <tr key={idx} className="hover:bg-black/5 transition">
                        <td className="px-6 py-3 font-sans text-[#0b1713]/70">{m.date}</td>
                        <td className="px-6 py-3 font-sans text-[#0b1713]/70">{m.competition}</td>
                        <td className="px-6 py-3 font-sans font-bold text-[#0b1713]">{m.homeTeam} vs {m.awayTeam}</td>
                        <td className="px-6 py-3 text-center font-bold text-[#0b1713]">{m.homeScore} - {m.awayScore}</td>
                        <td className="px-6 py-3 text-center text-[#0b1713]/70">{m.homeCorners + m.awayCorners}</td>
                        <td className="px-6 py-3 text-center text-[#0b1713]/70">{m.homeCards + m.awayCards}</td>
                        <td className="px-6 py-3 text-center">
                          {m.btts ? (
                            <span className="text-[#0f766e] font-bold">YES</span>
                          ) : (
                            <span className="text-[#0b1713]/40">NO</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            C. LINEUP ANALYSIS (Predicted vs Confirmed with Formations)
           ======================================================== */}
        {activeTab === "lineups" && (
          <div className="space-y-8">
            {/* Status Disclaimer Banner (Rule 4: Never present predicted as confirmed) */}
            <div className={`rounded-2xl p-5 border flex items-center justify-between ${
              fixture.lineups.isConfirmed
                ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                : "bg-amber-50 border-amber-300 text-amber-900"
            }`}>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <div>
                  <p className="text-sm font-bold">
                    {fixture.lineups.isConfirmed
                      ? "Official Confirmed Starting XI"
                      : "Projected / Predicted Starting XI"}
                  </p>
                  <p className="text-xs opacity-80 mt-0.5">
                    {fixture.lineups.isConfirmed
                      ? "Lineups have been officially published by match officials."
                      : "Status: PREDICTED based on training reports, recovery status, and manager rotation patterns. Confirmed lineups publish 60 mins before kickoff."}
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-white/60">
                {fixture.lineups.isConfirmed ? "CONFIRMED" : "PREDICTED"}
              </span>
            </div>

            {/* Tactical Formations & Lineups Display */}
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Home Starting XI */}
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-4">
                  <div>
                    <h3 className="font-black text-lg text-[#0b1713]">{fixture.homeTeam.name} Starting XI</h3>
                    <p className="text-xs text-[#0b1713]/60">Formation: {fixture.lineups.homeFormation}</p>
                  </div>
                  <span className="font-mono text-xs bg-black/5 px-2.5 py-1 rounded font-bold">4-3-3</span>
                </div>

                <div className="space-y-2">
                  {fixture.lineups.homeStartingXI.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-black/5 transition text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono w-6 text-center font-bold text-[#0b1713]/60">{player.number}</span>
                        <div>
                          <p className="font-bold text-[#0b1713]">{player.name}</p>
                          <p className="text-[11px] text-[#0b1713]/50">{player.role}</p>
                        </div>
                      </div>
                      <div className="text-right font-mono tabular-nums">
                        <span className="font-bold text-[#0f766e]">{player.goalsThisSeason}G / {player.assistsThisSeason}A</span>
                        <span className="text-[11px] text-[#0b1713]/50 block">Rating: {player.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Away Starting XI */}
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-4">
                  <div>
                    <h3 className="font-black text-lg text-[#0b1713]">{fixture.awayTeam.name} Starting XI</h3>
                    <p className="text-xs text-[#0b1713]/60">Formation: {fixture.lineups.awayFormation}</p>
                  </div>
                  <span className="font-mono text-xs bg-black/5 px-2.5 py-1 rounded font-bold">4-2-3-1</span>
                </div>

                <div className="space-y-2">
                  {fixture.lineups.awayStartingXI.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-black/5 transition text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono w-6 text-center font-bold text-[#0b1713]/60">{player.number}</span>
                        <div>
                          <p className="font-bold text-[#0b1713]">{player.name}</p>
                          <p className="text-[11px] text-[#0b1713]/50">{player.role}</p>
                        </div>
                      </div>
                      <div className="text-right font-mono tabular-nums">
                        <span className="font-bold text-[#0f766e]">{player.goalsThisSeason}G / {player.assistsThisSeason}A</span>
                        <span className="text-[11px] text-[#0b1713]/50 block">Rating: {player.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tactical Implications & Injury Matrix */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <h4 className="font-bold text-sm text-[#0b1713] mb-3">Tactical Matchup & Spatial Battle</h4>
                <p className="text-xs text-[#0b1713]/80 leading-relaxed">
                  {fixture.lineups.tacticalImplications}
                </p>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <h4 className="font-bold text-sm text-[#0b1713] mb-3">Injuries & Suspensions Impact</h4>
                <div className="space-y-2.5">
                  {fixture.lineups.injuriesAndSuspensions.map((inj, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-black/5">
                      <div>
                        <span className="font-bold text-[#0b1713]">{inj.playerName}</span>
                        <span className="text-[#0b1713]/50 ml-1.5">({inj.team} · {inj.position})</span>
                      </div>
                      <span className="font-mono text-[11px] font-semibold text-rose-700">{inj.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            D. GOAL ANALYSIS (xG, xGA, Over/Under, Clean Sheets)
           ======================================================== */}
        {activeTab === "goals" && (
          <div className="space-y-8">
            {/* Top Cards: xG and xGA */}
            <div className="grid gap-6 md:grid-cols-4">
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#0b1713]/60 uppercase">Home xG (Projected)</span>
                  <button
                    onClick={() =>
                      onOpenContextualEducation(
                        "xg",
                        "Expected Goals (xG)",
                        "Expected Goals measures the quality of chances created. Liverpool's 2.15 xG reflects high-probability attempts generated via central cutbacks and through-balls.",
                        "les-xg-deepdive"
                      )
                    }
                    className="text-[#0f766e] hover:underline text-[11px] font-bold"
                  >
                    Learn xG
                  </button>
                </div>
                <p className="font-mono text-4xl font-black text-[#0b1713] mt-2">{fixture.goalAnalysis.homeXg.toFixed(2)}</p>
                <p className="text-xs text-[#0b1713]/60 mt-1">Conceding {fixture.goalAnalysis.homeXga.toFixed(2)} xGA per match</p>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#0b1713]/60 uppercase">Away xG (Projected)</span>
                  <button
                    onClick={() =>
                      onOpenContextualEducation(
                        "xg",
                        "Expected Goals (xG)",
                        "Arsenal's 1.45 away xG projects strong counter opportunity, tempered by Liverpool's home defensive compactness.",
                        "les-xg-deepdive"
                      )
                    }
                    className="text-[#0f766e] hover:underline text-[11px] font-bold"
                  >
                    Learn xG
                  </button>
                </div>
                <p className="font-mono text-4xl font-black text-[#0b1713] mt-2">{fixture.goalAnalysis.awayXg.toFixed(2)}</p>
                <p className="text-xs text-[#0b1713]/60 mt-1">Conceding {fixture.goalAnalysis.awayXga.toFixed(2)} xGA per match</p>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#0b1713]/60 uppercase">Over 2.5 Probability</span>
                  <button
                    onClick={() =>
                      onOpenContextualEducation(
                        "over-under",
                        "Over/Under Goal Pricing",
                        "Over/Under lines are priced by simulating 10,000 Poisson trials using each team's attack strength vs opponent defense ratings.",
                        "les-btts-poisson"
                      )
                    }
                    className="text-[#0f766e] hover:underline text-[11px] font-bold"
                  >
                    Learn O/U
                  </button>
                </div>
                <p className="font-mono text-4xl font-black text-[#0f766e] mt-2">
                  {(fixture.goalAnalysis.over25Prob * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-[#0b1713]/60 mt-1">Fair Odds: {(1 / fixture.goalAnalysis.over25Prob).toFixed(2)}</p>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#0b1713]/60 uppercase">BTTS Probability</span>
                  <button
                    onClick={() =>
                      onOpenContextualEducation(
                        "btts",
                        "Both Teams To Score Math",
                        "BTTS requires both teams to score at least once. It is computed as (1 - P(TeamA=0)) * (1 - P(TeamB=0)).",
                        "les-btts-poisson"
                      )
                    }
                    className="text-[#0f766e] hover:underline text-[11px] font-bold"
                  >
                    Learn BTTS
                  </button>
                </div>
                <p className="font-mono text-4xl font-black text-[#0b1713] mt-2">
                  {(fixture.goalAnalysis.bttsYesProb * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-[#0b1713]/60 mt-1">No BTTS: {((1 - fixture.goalAnalysis.bttsYesProb) * 100).toFixed(0)}%</p>
              </div>
            </div>

            {/* Complete Over / Under Matrix */}
            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
              <h4 className="font-bold text-sm text-[#0b1713] mb-4">Over / Under Goal Threshold Probabilities</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono tabular-nums">
                <div className="p-4 rounded-xl bg-black/5">
                  <p className="text-xs font-sans text-[#0b1713]/60">Over 0.5 Goals</p>
                  <p className="text-2xl font-black text-[#0b1713] mt-1">{(fixture.goalAnalysis.over05Prob * 100).toFixed(0)}%</p>
                </div>
                <div className="p-4 rounded-xl bg-black/5">
                  <p className="text-xs font-sans text-[#0b1713]/60">Over 1.5 Goals</p>
                  <p className="text-2xl font-black text-[#0b1713] mt-1">{(fixture.goalAnalysis.over15Prob * 100).toFixed(0)}%</p>
                </div>
                <div className="p-4 rounded-xl bg-black/5">
                  <p className="text-xs font-sans text-[#0b1713]/60">Over 2.5 Goals</p>
                  <p className="text-2xl font-black text-[#0f766e] mt-1">{(fixture.goalAnalysis.over25Prob * 100).toFixed(0)}%</p>
                </div>
                <div className="p-4 rounded-xl bg-black/5">
                  <p className="text-xs font-sans text-[#0b1713]/60">Over 3.5 Goals</p>
                  <p className="text-2xl font-black text-[#0b1713] mt-1">{(fixture.goalAnalysis.over35Prob * 100).toFixed(0)}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            E. CORNER ANALYSIS
           ======================================================== */}
        {activeTab === "corners" && (
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#0b1713]/60 uppercase">Match Avg Corners</span>
                  <button
                    onClick={() =>
                      onOpenContextualEducation(
                        "corners",
                        "Corner Statistics & Models",
                        "Corner volume is driven by wing-width tactical patterns, blocked crosses, and late-game deficit pressure.",
                        "les-corners-tactics"
                      )
                    }
                    className="text-[#0f766e] text-[11px] font-bold hover:underline"
                  >
                    Learn Corners
                  </button>
                </div>
                <p className="font-mono text-4xl font-black text-[#0b1713] mt-2">{fixture.cornerAnalysis.matchAvgCorners}</p>
                <p className="text-xs text-[#0b1713]/60 mt-1">1H Avg: {fixture.cornerAnalysis.firstHalfAvgCorners} · 2H Avg: {fixture.cornerAnalysis.secondHalfAvgCorners}</p>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <span className="text-xs font-semibold text-[#0b1713]/60 uppercase">{fixture.homeTeam.name} Corners</span>
                <p className="font-mono text-4xl font-black text-[#0b1713] mt-2">{fixture.cornerAnalysis.homeAvgCornersFor}</p>
                <p className="text-xs text-[#0b1713]/60 mt-1">Conceding {fixture.cornerAnalysis.homeAvgCornersAgainst} corners/game</p>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <span className="text-xs font-semibold text-[#0b1713]/60 uppercase">{fixture.awayTeam.name} Corners</span>
                <p className="font-mono text-4xl font-black text-[#0b1713] mt-2">{fixture.cornerAnalysis.awayAvgCornersFor}</p>
                <p className="text-xs text-[#0b1713]/60 mt-1">Conceding {fixture.cornerAnalysis.awayAvgCornersAgainst} corners/game</p>
              </div>
            </div>

            {/* Corner Market Over/Under Thresholds */}
            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
              <h4 className="font-bold text-sm text-[#0b1713] mb-4">Corner Market Probabilities</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono tabular-nums">
                <div className="p-4 rounded-xl bg-black/5">
                  <p className="text-xs font-sans text-[#0b1713]/60">Over 8.5 Corners</p>
                  <p className="text-2xl font-black text-[#0b1713] mt-1">{(fixture.cornerAnalysis.over85CornersProb * 100).toFixed(0)}%</p>
                </div>
                <div className="p-4 rounded-xl bg-black/5">
                  <p className="text-xs font-sans text-[#0b1713]/60">Over 9.5 Corners</p>
                  <p className="text-2xl font-black text-[#0f766e] mt-1">{(fixture.cornerAnalysis.over95CornersProb * 100).toFixed(0)}%</p>
                </div>
                <div className="p-4 rounded-xl bg-black/5">
                  <p className="text-xs font-sans text-[#0b1713]/60">Over 10.5 Corners</p>
                  <p className="text-2xl font-black text-[#0b1713] mt-1">{(fixture.cornerAnalysis.over105CornersProb * 100).toFixed(0)}%</p>
                </div>
                <div className="p-4 rounded-xl bg-black/5">
                  <p className="text-xs font-sans text-[#0b1713]/60">Over 11.5 Corners</p>
                  <p className="text-2xl font-black text-[#0b1713] mt-1">{(fixture.cornerAnalysis.over115CornersProb * 100).toFixed(0)}%</p>
                </div>
              </div>

              <p className="text-xs text-[#0b1713]/70 mt-5 border-t border-black/5 pt-4">
                <strong>Tactical Note:</strong> {fixture.cornerAnalysis.cornerDistributionNote}
              </p>
            </div>
          </div>
        )}

        {/* ========================================================
            F. SHOT ANALYSIS
           ======================================================== */}
        {activeTab === "shots" && (
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Home Team Shot Breakdown */}
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <h3 className="font-black text-lg text-[#0b1713] mb-4">{fixture.homeTeam.name} Shot Profile</h3>
                <div className="space-y-3 text-xs font-mono tabular-nums">
                  <div className="flex justify-between py-1.5 border-b border-black/5">
                    <span className="font-sans text-[#0b1713]/60">Total Shots / Game:</span>
                    <span className="font-bold text-base">{fixture.shotAnalysis.homeTotalShotsAvg}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-black/5">
                    <span className="font-sans text-[#0b1713]/60">Shots on Target:</span>
                    <span className="font-bold text-[#0f766e] text-base">{fixture.shotAnalysis.homeShotsOnTargetAvg}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-black/5">
                    <span className="font-sans text-[#0b1713]/60">Shooting Accuracy:</span>
                    <span className="font-bold">{fixture.shotAnalysis.homeAccuracyPct}%</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-black/5">
                    <span className="font-sans text-[#0b1713]/60">Inside the Box %:</span>
                    <span className="font-bold">{fixture.shotAnalysis.homeInsideBoxPct}%</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="font-sans text-[#0b1713]/60">Blocked Shots:</span>
                    <span className="font-bold">{fixture.shotAnalysis.homeBlockedShotsAvg}</span>
                  </div>
                </div>
              </div>

              {/* Away Team Shot Breakdown */}
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <h3 className="font-black text-lg text-[#0b1713] mb-4">{fixture.awayTeam.name} Shot Profile</h3>
                <div className="space-y-3 text-xs font-mono tabular-nums">
                  <div className="flex justify-between py-1.5 border-b border-black/5">
                    <span className="font-sans text-[#0b1713]/60">Total Shots / Game:</span>
                    <span className="font-bold text-base">{fixture.shotAnalysis.awayTotalShotsAvg}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-black/5">
                    <span className="font-sans text-[#0b1713]/60">Shots on Target:</span>
                    <span className="font-bold text-[#0f766e] text-base">{fixture.shotAnalysis.awayShotsOnTargetAvg}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-black/5">
                    <span className="font-sans text-[#0b1713]/60">Shooting Accuracy:</span>
                    <span className="font-bold">{fixture.shotAnalysis.awayAccuracyPct}%</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-black/5">
                    <span className="font-sans text-[#0b1713]/60">Inside the Box %:</span>
                    <span className="font-bold">{fixture.shotAnalysis.awayInsideBoxPct}%</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="font-sans text-[#0b1713]/60">Blocked Shots:</span>
                    <span className="font-bold">{fixture.shotAnalysis.awayBlockedShotsAvg}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            G. SCORING FREQUENCY (15-Minute Intervals)
           ======================================================== */}
        {activeTab === "frequency" && (
          <div className="space-y-8">
            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-black text-lg text-[#0b1713]">Goals by 15-Minute Intervals</h3>
                  <p className="text-xs text-[#0b1713]/60">Distribution of goals scored and conceded across match phases.</p>
                </div>
                <button
                  onClick={() =>
                    onOpenContextualEducation(
                      "frequency",
                      "Scoring Intervals in Football",
                      "Goals naturally cluster in the 76-90+ period due to cumulative physical fatigue and tactical risk-taking by trailing sides.",
                      "les-data-pitfalls"
                    )
                  }
                  className="text-xs font-bold text-[#0f766e] hover:underline"
                >
                  Learn Interval Math
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-6 text-center font-mono text-xs tabular-nums">
                {fixture.scoringFrequency.intervals.map((int) => (
                  <div key={int.interval} className="p-4 rounded-xl bg-black/5">
                    <p className="font-sans font-bold text-[#0b1713]">{int.interval}&apos;</p>
                    <div className="mt-3 space-y-1">
                      <p className="text-[11px] text-[#0f766e] font-bold">LIV: +{int.homeScored}</p>
                      <p className="text-[11px] text-[#ff7653] font-bold">ARS: +{int.awayScored}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-black/5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div>
                  <span className="text-[#0b1713]/60 block font-sans">First Team to Score (LIV):</span>
                  <span className="font-bold text-base text-[#0b1713]">{fixture.scoringFrequency.homeFirstTeamToScorePct}%</span>
                </div>
                <div>
                  <span className="text-[#0b1713]/60 block font-sans">First Team to Score (ARS):</span>
                  <span className="font-bold text-base text-[#0b1713]">{fixture.scoringFrequency.awayFirstTeamToScorePct}%</span>
                </div>
                <div>
                  <span className="text-[#0b1713]/60 block font-sans">Clean Sheets Kept (LIV):</span>
                  <span className="font-bold text-base text-[#0b1713]">{fixture.scoringFrequency.homeCleanSheetCount} matches</span>
                </div>
                <div>
                  <span className="text-[#0b1713]/60 block font-sans">Clean Sheets Kept (ARS):</span>
                  <span className="font-bold text-base text-[#0b1713]">{fixture.scoringFrequency.awayCleanSheetCount} matches</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            H. MATCH TEMPO & PPDA
           ======================================================== */}
        {activeTab === "tempo" && (
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#0b1713]/60 uppercase">Attacking Intensity</span>
                  <button
                    onClick={() =>
                      onOpenContextualEducation(
                        "tempo",
                        "Attacking Intensity & Field Tilt",
                        "Attacking intensity blends passes completed in the final third with dangerous penalty-box entries.",
                        "les-tactics-pressing"
                      )
                    }
                    className="text-xs font-bold text-[#0f766e] hover:underline"
                  >
                    Learn Tempo
                  </button>
                </div>
                <p className="font-mono text-4xl font-black text-[#0b1713] mt-2">{fixture.tempoAnalysis.attackingIntensityIndex}/100</p>
                <p className="text-xs text-[#0b1713]/60 mt-1">Rated High Intensity Transition Game</p>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#0b1713]/60 uppercase">Pressing Intensity (PPDA)</span>
                  <button
                    onClick={() =>
                      onOpenContextualEducation(
                        "ppda",
                        "PPDA (Passes Per Defensive Action)",
                        "PPDA measures how many passes a defending team allows before challenging or intercepting the ball. Lower values (<9.0) reflect relentless high pressing.",
                        "les-tactics-pressing"
                      )
                    }
                    className="text-xs font-bold text-[#0f766e] hover:underline"
                  >
                    Learn PPDA
                  </button>
                </div>
                <div className="font-mono text-2xl font-black text-[#0b1713] mt-2">
                  LIV: {fixture.tempoAnalysis.pressingIntensityPpda.home} · ARS: {fixture.tempoAnalysis.pressingIntensityPpda.away}
                </div>
                <p className="text-xs text-[#0b1713]/60 mt-1">Both sides operate aggressive high pressing systems</p>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <span className="text-xs font-semibold text-[#0b1713]/60 uppercase">Dangerous Attacks Avg</span>
                <p className="font-mono text-2xl font-black text-[#0b1713] mt-2">
                  {fixture.tempoAnalysis.dangerousAttacksAvg.home} vs {fixture.tempoAnalysis.dangerousAttacksAvg.away}
                </p>
                <p className="text-xs text-[#0b1713]/60 mt-1">Transition Speed: {fixture.tempoAnalysis.transitionSpeed}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
              <h4 className="font-bold text-sm text-[#0b1713] mb-2">Tactical Momentum Narrative</h4>
              <p className="text-xs text-[#0b1713]/80 leading-relaxed">
                {fixture.tempoAnalysis.momentumNarrative}
              </p>
            </div>
          </div>
        )}

        {/* ========================================================
            I. KEY PLAYERS
           ======================================================== */}
        {activeTab === "players" && (
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <h3 className="font-black text-lg text-[#0b1713] mb-4">Liverpool Key Performers</h3>
                <div className="space-y-3">
                  {fixture.keyPlayers.home.map((p) => (
                    <div key={p.id} className="p-3 rounded-xl bg-black/5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-[#0b1713]">{p.name} ({p.role})</span>
                        <span className="font-mono text-[#0f766e] font-bold">Rating: {p.rating}</span>
                      </div>
                      <div className="mt-2 grid grid-cols-4 gap-2 font-mono text-[11px] text-[#0b1713]/70">
                        <span>Goals: {p.goalsThisSeason}</span>
                        <span>Assists: {p.assistsThisSeason}</span>
                        <span>Shots/90: {p.shotsPer90}</span>
                        <span>Tackles/90: {p.tacklesPer90}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <h3 className="font-black text-lg text-[#0b1713] mb-4">Arsenal Key Performers</h3>
                <div className="space-y-3">
                  {fixture.keyPlayers.away.map((p) => (
                    <div key={p.id} className="p-3 rounded-xl bg-black/5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-[#0b1713]">{p.name} ({p.role})</span>
                        <span className="font-mono text-[#0f766e] font-bold">Rating: {p.rating}</span>
                      </div>
                      <div className="mt-2 grid grid-cols-4 gap-2 font-mono text-[11px] text-[#0b1713]/70">
                        <span>Goals: {p.goalsThisSeason}</span>
                        <span>Assists: {p.assistsThisSeason}</span>
                        <span>Shots/90: {p.shotsPer90}</span>
                        <span>Tackles/90: {p.tacklesPer90}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            J. PLAYER TO SCORE
           ======================================================== */}
        {activeTab === "goalscorer" && (
          <div className="space-y-8">
            <div className="grid gap-5 md:grid-cols-2">
              {fixture.playerToScoreMarkets.map((market) => (
                <div key={market.playerId} className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-black text-lg text-[#0b1713]">{market.playerName}</h4>
                        <p className="text-xs text-[#0b1713]/60">{market.team} · {market.position}</p>
                      </div>
                      <span className="font-mono text-xs bg-[#d7f35f]/50 px-2.5 py-1 rounded font-bold text-[#0b1713]">
                        {(market.anytimeProb * 100).toFixed(0)}% Prob
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-black/5 p-3 text-center font-mono text-xs tabular-nums">
                      <div>
                        <span className="text-[10px] text-[#0b1713]/50 font-sans block">Anytime Odds</span>
                        <span className="font-bold text-base text-[#0b1713]">{market.anytimeOdds.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#0b1713]/50 font-sans block">First Goal Odds</span>
                        <span className="font-bold text-base text-[#0b1713]">{market.firstGoalOdds.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#0b1713]/50 font-sans block">Shots on Target/90</span>
                        <span className="font-bold text-base text-[#0f766e]">{market.shotsOnTargetPer90}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#0b1713]/70 mt-4 leading-relaxed">
                      <strong>Statistical Evidence:</strong> {market.evidence}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-black/5 flex items-center justify-between">
                    <span className="text-[11px] text-[#0b1713]/50 font-mono">Last 5: {market.goalsLast5} goals</span>
                    <button
                      onClick={() => handleQuickLog("Anytime Goalscorer", `${market.playerName} to score`, market.anytimeOdds, market.anytimeProb)}
                      className="text-xs font-bold text-[#0f766e] hover:underline flex items-center gap-1"
                    >
                      Track Pick +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            K. COMPREHENSIVE MATCH PREDICTIONS
           ======================================================== */}
        {activeTab === "predictions" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-[#0b1713]">Model Probabilities & Statistical Evidence</h3>
                <p className="text-xs text-[#0b1713]/60 mt-0.5">
                  Every prediction carries an explicit statistical justification and confidence rating based on sample completeness.
                </p>
              </div>
              <span className="text-xs font-mono text-[#0b1713]/60">Poisson & xG-Weighted Model</span>
            </div>

            <div className="space-y-4">
              {fixture.predictions.map((pred, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition hover:border-[#0b1713]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-black/5 pb-3">
                    <div>
                      <span className="text-xs text-[#0b1713]/60">{pred.market}</span>
                      <h4 className="text-lg font-black text-[#0b1713]">{pred.selection}</h4>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs bg-[#d7f35f]/50 px-2.5 py-1 rounded font-bold text-[#0b1713]">
                        {pred.confidence} Confidence
                      </span>
                      <span className="font-mono text-sm font-bold text-[#0b1713]">
                        {(pred.probability * 100).toFixed(0)}% Model Prob
                      </span>
                      <span className="font-mono text-sm font-bold text-[#0f766e]">
                        {pred.odds.toFixed(2)} Odds
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] items-start">
                    <div className="space-y-2 text-xs text-[#0b1713]/80">
                      <p>
                        <strong>Evidence:</strong> {pred.evidence}
                      </p>
                      <p className="text-[#0b1713]/60">
                        <strong>Confidence Assessment:</strong> {pred.confidenceReason}
                      </p>
                    </div>

                    <div className="flex sm:flex-col gap-2 shrink-0">
                      <button
                        onClick={() => handleQuickLog(pred.market, pred.selection, pred.odds, pred.probability)}
                        className="rounded-lg bg-[#0b1713] px-3.5 py-2 text-xs font-bold text-[#d7f35f] hover:bg-[#17231c] transition"
                      >
                        Log to Bet Tracker
                      </button>
                      {pred.learnTopicId && (
                        <button
                          onClick={() =>
                            onOpenContextualEducation(
                              pred.learnTopicId!,
                              "Statistical Justification",
                              pred.evidence,
                              "les-prob-vs-confidence"
                            )
                          }
                          className="rounded-lg border border-black/10 px-3.5 py-2 text-xs font-semibold text-[#0b1713] hover:bg-black/5 transition"
                        >
                          Learn Math
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
