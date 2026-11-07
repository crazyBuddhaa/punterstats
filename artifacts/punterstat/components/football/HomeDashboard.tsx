import React, { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart2,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Flame,
  GraduationCap,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import type { MatchCentreData, NavPillar, PredictionFeedItem, TeamProfile, PlayerProfile } from "@/types/football";
import {
  MATCH_CENTRE_FIXTURES,
  PREDICTIONS_FEED,
  TEAMS_DATA,
  PLAYERS_DATA,
  LEARNING_PATHS,
  COMPREHENSIVE_LESSONS,
} from "@/data/footballIntelligenceData";

interface HomeDashboardProps {
  onNavigateToMatch: (matchId: string) => void;
  onNavigatePillar: (pillar: NavPillar) => void;
  onOpenLesson: (lessonId: string) => void;
  onToggleFavouriteMatch: (matchId: string) => void;
  isMatchFavourited: (matchId: string) => boolean;
}

export function HomeDashboard({
  onNavigateToMatch,
  onNavigatePillar,
  onOpenLesson,
  onToggleFavouriteMatch,
  isMatchFavourited,
}: HomeDashboardProps) {
  const [fixtureFilter, setFixtureFilter] = useState<"all" | "today" | "live" | "upcoming" | "completed">("today");

  // Filter fixtures based on selection
  const displayedFixtures = MATCH_CENTRE_FIXTURES.filter((f) => {
    if (fixtureFilter === "all") return true;
    if (fixtureFilter === "today") return true; // Featured sample matches scheduled today/this weekend
    if (fixtureFilter === "live") return f.status === "live";
    if (fixtureFilter === "upcoming") return f.status === "scheduled";
    if (fixtureFilter === "completed") return f.status === "finished";
    return true;
  });

  const featuredPredictions = PREDICTIONS_FEED.slice(0, 3);
  const featuredLesson = COMPREHENSIVE_LESSONS[0];

  return (
    <div className="bg-[#f4f5ef] text-[#0b1713] pb-24">
      {/* 1. Hero Pitch & Model Intelligence Banner */}
      <section className="relative overflow-hidden bg-[#0b1713] text-[#f4f5ef]">
        <div className="pointer-events-none absolute inset-0 opacity-15 [background-image:linear-gradient(rgba(215,243,95,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(215,243,95,.18)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="relative mx-auto max-w-[1440px] px-5 py-14 sm:px-10 lg:px-16 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="max-w-2xl">
              <div className="mb-4 flex items-center gap-2 text-xs font-bold tracking-widest text-[#d7f35f]">
                <span>DISCOVER</span>
                <span aria-hidden="true">·</span>
                <span>ANALYSE</span>
                <span aria-hidden="true">·</span>
                <span>PREDICT</span>
                <span aria-hidden="true">·</span>
                <span>LEARN</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-black leading-[0.95] tracking-tight">
                Football intelligence backed by <span className="text-[#d7f35f]">statistical rigor.</span>
              </h1>
              <p className="mt-5 text-base sm:text-lg leading-relaxed text-white/70">
                PunterStat combines 6-factor fixture modeling, Expected Goals (xG) analysis, transparent prediction confidence, and interactive football education in one cohesive platform.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => onNavigateToMatch("liv-ars")}
                  className="group inline-flex items-center gap-2 rounded-full bg-[#d7f35f] px-6 py-3 text-sm font-bold text-[#0b1713] transition hover:bg-white"
                >
                  Explore Liverpool vs Arsenal Match Centre
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
                <button
                  onClick={() => onNavigatePillar("learning")}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white transition hover:border-[#d7f35f] hover:text-[#d7f35f]"
                >
                  <BookOpen className="h-4 w-4" />
                  Football Academy
                </button>
              </div>
            </div>

            {/* Featured Match Card Showcase */}
            <div className="rounded-2xl border border-white/15 bg-[#14231b] p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#d7f35f]">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Featured Match Centre</span>
                </div>
                <span className="font-mono text-xs text-white/50">Sat 17:30 GMT</span>
              </div>

              <div className="py-6">
                <p className="text-xs text-white/60">Premier League · Matchweek 28 · Anfield</p>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <div className="flex-1 text-left">
                    <p className="text-2xl font-black text-white">Liverpool</p>
                    <p className="text-xs text-[#d7f35f]">Rank #1 · 63 pts · Form WW</p>
                  </div>
                  <div className="text-center px-3">
                    <span className="font-mono text-xs font-bold text-white/40">VS</span>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-2xl font-black text-white">Arsenal</p>
                    <p className="text-xs text-white/60">Rank #2 · 60 pts · Form WDW</p>
                  </div>
                </div>

                {/* Model Probability Bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-xs font-mono text-white/70 mb-1.5">
                    <span>LIV 48%</span>
                    <span>Draw 27%</span>
                    <span>ARS 25%</span>
                  </div>
                  <div className="flex h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div style={{ width: "48%" }} className="bg-[#d7f35f]" />
                    <div style={{ width: "27%" }} className="bg-white/40" />
                    <div style={{ width: "25%" }} className="bg-[#ff7653]" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <div className="text-xs text-white/60">
                  <span className="font-semibold text-white">Key Edge:</span> BTTS Yes (62% model prob vs 1.75 odds)
                </div>
                <button
                  onClick={() => onNavigateToMatch("liv-ars")}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#d7f35f] hover:underline"
                >
                  Full 11-Factor Breakdown →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Statistical Highlights Strip */}
      <section className="border-b border-[#0b1713]/10 bg-[#d7f35f]">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 divide-y divide-[#0b1713]/15 px-5 sm:grid-cols-4 sm:divide-x sm:divide-y-0 sm:px-10 lg:px-16">
          {[
            { value: "4", label: "Fundamental Pillars: Discover, Analyse, Predict & Learn" },
            { value: "11", label: "Dedicated Match Centre Analytical Dimensions" },
            { value: "10", label: "Structured Educational Categories in Learning Centre" },
            { value: "100%", label: "Mathematical transparency with sample sizes & confidence" },
          ].map((stat, idx) => (
            <div key={idx} className="py-5 px-3 sm:py-6 sm:px-6">
              <p className="font-mono text-3xl sm:text-4xl font-black tracking-tight text-[#0b1713] tabular-nums">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-semibold leading-tight text-[#0b1713]/75">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Home Content Grid */}
      <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-16 pt-12 space-y-16">
        {/* 3. Today & Upcoming Fixtures */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0b1713]">
                Fixtures & Match Centres
              </h2>
              <p className="text-sm text-[#0b1713]/60 mt-0.5">
                Select any fixture to view deep H2H, projected lineups, xG goals, tempo, and predictions.
              </p>
            </div>

            {/* Interactive Segmented Filter */}
            <div className="flex items-center gap-1 rounded-xl border border-black/10 bg-white p-1">
              {[
                { id: "today", label: "Today / Weekend" },
                { id: "upcoming", label: "Upcoming" },
                { id: "completed", label: "Results" },
                { id: "all", label: "All Fixtures" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFixtureFilter(tab.id as any)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    fixtureFilter === tab.id
                      ? "bg-[#0b1713] text-[#d7f35f]"
                      : "text-[#0b1713]/70 hover:text-[#0b1713] hover:bg-black/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayedFixtures.map((fixture) => (
              <div
                key={fixture.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition hover:border-[#0b1713] hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#0b1713]/60 mb-3">
                    <span className="font-semibold text-[#0b1713]/80">{fixture.competition}</span>
                    <span className="font-mono">{fixture.kickoff}</span>
                  </div>

                  {/* Teams Row */}
                  <div className="space-y-2 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-[#0b1713] group-hover:text-[#0f766e] transition">
                        {fixture.homeTeam.name}
                      </span>
                      <span className="font-mono text-xs font-semibold text-[#0b1713]/60">
                        {fixture.homeTeam.form.join(" ")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-[#0b1713] group-hover:text-[#0f766e] transition">
                        {fixture.awayTeam.name}
                      </span>
                      <span className="font-mono text-xs font-semibold text-[#0b1713]/60">
                        {fixture.awayTeam.form.join(" ")}
                      </span>
                    </div>
                  </div>

                  {/* Summary metric */}
                  <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-xs text-[#0b1713]/70">
                    <span>Model xG: <strong className="font-mono text-[#0b1713]">{fixture.goalAnalysis.homeXg.toFixed(2)} - {fixture.goalAnalysis.awayXg.toFixed(2)}</strong></span>
                    <span className="font-mono text-[11px] bg-black/5 px-2 py-0.5 rounded">H2H: {fixture.h2h.avgGoals} g/m</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-black/5 flex items-center justify-between">
                  <button
                    onClick={() => onToggleFavouriteMatch(fixture.id)}
                    className="text-xs text-[#0b1713]/50 hover:text-[#0b1713] transition"
                  >
                    {isMatchFavourited(fixture.id) ? "★ Saved" : "☆ Save"}
                  </button>
                  <button
                    onClick={() => onNavigateToMatch(fixture.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0b1713] group-hover:text-[#0f766e] transition"
                  >
                    Open Match Centre →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Featured Predictions & Confidence Classification */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0b1713]">
                Featured Predictions & Mathematical Edges
              </h2>
              <p className="text-sm text-[#0b1713]/60 mt-0.5">
                Every prediction features transparent probabilities, evidence justifications, and confidence ratings.
              </p>
            </div>
            <button
              onClick={() => onNavigatePillar("predictions")}
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-[#0f766e] hover:underline"
            >
              View Predictions Centre →
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {featuredPredictions.map((pred) => (
              <div
                key={pred.id}
                className="flex flex-col justify-between rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#0b1713]/60 mb-2">
                    <span className="font-semibold text-[#0b1713]">{pred.fixtureTitle}</span>
                    <span className="font-mono text-[11px] bg-[#d7f35f]/40 px-2 py-0.5 rounded text-[#0b1713] font-bold">
                      {pred.confidence} Confidence
                    </span>
                  </div>

                  <p className="text-xs text-[#0b1713]/50">{pred.market}</p>
                  <p className="text-lg font-black text-[#0b1713] mt-1">{pred.selection}</p>

                  <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-black/5 p-3 text-center">
                    <div>
                      <p className="text-[10px] text-[#0b1713]/60 uppercase">Model Prob</p>
                      <p className="font-mono text-base font-bold text-[#0b1713]">
                        {(pred.probability * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#0b1713]/60 uppercase">Odds</p>
                      <p className="font-mono text-base font-bold text-[#0b1713]">
                        {pred.odds.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#0b1713]/60 uppercase">Edge</p>
                      <p className="font-mono text-base font-bold text-[#0f766e]">
                        +{pred.valueEdge.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-[#0b1713]/70 leading-relaxed border-t border-black/5 pt-3">
                    <p className="font-semibold text-[#0b1713] mb-1">Statistical Justification:</p>
                    <p>{pred.evidence[0]}</p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-black/5 flex items-center justify-between text-xs">
                  <span className="text-[#0b1713]/50 font-mono text-[11px]">{pred.sampleSize}</span>
                  <button
                    onClick={() => onNavigateToMatch(pred.matchId)}
                    className="font-bold text-[#0b1713] hover:text-[#0f766e] transition"
                  >
                    Match Analysis →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Recommended Learning Content (Core Pillar Integration) */}
        <section className="rounded-3xl border border-black/10 bg-[#0b1713] text-white p-8 sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#d7f35f]/20 px-3 py-1 text-xs font-bold text-[#d7f35f] mb-4">
                <GraduationCap className="h-4 w-4" />
                <span>PunterStat Academy</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Master the mathematics of football prediction.
              </h2>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/70">
                10 comprehensive curriculum categories covering Expected Goals (xG), match tempo indicators, Poisson modeling, Kelly bankroll math, and avoiding common statistical pitfalls.
              </p>

              <div className="mt-6 flex flex-wrap gap-4 text-xs text-white/60">
                <span>· 10 Learning Categories</span>
                <span>· Interactive Knowledge Quizzes</span>
                <span>· Practical Match Case Studies</span>
                <span>· Market & League Glossaries</span>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => onNavigatePillar("learning")}
                  className="rounded-full bg-[#d7f35f] px-6 py-3 text-sm font-bold text-[#0b1713] transition hover:bg-white"
                >
                  Explore All 10 Categories
                </button>
              </div>
            </div>

            {/* Featured Lesson Highlight Box */}
            <div className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur">
              <span className="font-mono text-xs font-semibold text-[#d7f35f]">Featured Lesson</span>
              <h3 className="text-xl font-bold text-white mt-1">
                {featuredLesson.title}
              </h3>
              <p className="text-xs text-white/70 mt-2 leading-relaxed">
                {featuredLesson.summary}
              </p>

              <div className="mt-5 space-y-2 border-t border-white/10 pt-4">
                <p className="text-xs font-semibold text-white/80">Key takeaways from this module:</p>
                {featuredLesson.keyTakeaways.map((takeaway, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-white/70">
                    <span className="text-[#d7f35f]">✓</span>
                    <span>{takeaway}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  onNavigatePillar("learning");
                  onOpenLesson(featuredLesson.id);
                }}
                className="mt-6 w-full rounded-xl bg-white/10 py-2.5 text-center text-xs font-bold text-[#d7f35f] hover:bg-white/20 transition"
              >
                Start Lesson & Quiz (8 min) →
              </button>
            </div>
          </div>
        </section>

        {/* 6. Featured Teams & Players Spotlight */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0b1713]">
                Teams & Players Intelligence
              </h2>
              <p className="text-sm text-[#0b1713]/60 mt-0.5">
                Profiles, squad performance metrics, tactical styles, and head-to-head comparisons.
              </p>
            </div>
            <button
              onClick={() => onNavigatePillar("teams-players")}
              className="text-sm font-bold text-[#0f766e] hover:underline"
            >
              View All Profiles →
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Team Spotlight Card */}
            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0b1713]/50">Team Profile Spotlight</span>
              <div className="flex items-center justify-between mt-2">
                <div>
                  <h3 className="text-2xl font-black text-[#0b1713]">Liverpool FC</h3>
                  <p className="text-xs text-[#0b1713]/60">Premier League · Manager: Arne Slot</p>
                </div>
                <div className="font-mono text-xl font-black text-[#0b1713] bg-[#d7f35f]/50 px-3 py-1 rounded-lg">
                  Rank #1
                </div>
              </div>

              <div className="mt-5 grid grid-cols-4 gap-2 rounded-xl bg-black/5 p-3 text-center">
                <div>
                  <p className="text-[10px] text-[#0b1713]/50">xG/Match</p>
                  <p className="font-mono text-sm font-bold text-[#0b1713]">2.31</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#0b1713]/50">Possession</p>
                  <p className="font-mono text-sm font-bold text-[#0b1713]">58.4%</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#0b1713]/50">Corners</p>
                  <p className="font-mono text-sm font-bold text-[#0b1713]">6.8</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#0b1713]/50">Clean Sheets</p>
                  <p className="font-mono text-sm font-bold text-[#0b1713]">12</p>
                </div>
              </div>

              <button
                onClick={() => onNavigatePillar("teams-players")}
                className="mt-5 text-xs font-bold text-[#0b1713] hover:text-[#0f766e] transition"
              >
                Inspect Squad & Tactical Style →
              </button>
            </div>

            {/* Player Spotlight Card */}
            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0b1713]/50">Player Performance Spotlight</span>
              <div className="flex items-center justify-between mt-2">
                <div>
                  <h3 className="text-2xl font-black text-[#0b1713]">Mohamed Salah</h3>
                  <p className="text-xs text-[#0b1713]/60">Liverpool · Right Winger · 33 yrs</p>
                </div>
                <div className="font-mono text-xl font-black text-[#0b1713] bg-[#d7f35f]/50 px-3 py-1 rounded-lg">
                  19 Goals
                </div>
              </div>

              <div className="mt-5 grid grid-cols-4 gap-2 rounded-xl bg-black/5 p-3 text-center">
                <div>
                  <p className="text-[10px] text-[#0b1713]/50">Assists</p>
                  <p className="font-mono text-sm font-bold text-[#0b1713]">11</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#0b1713]/50">xG</p>
                  <p className="font-mono text-sm font-bold text-[#0b1713]">18.2</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#0b1713]/50">Shots/90</p>
                  <p className="font-mono text-sm font-bold text-[#0b1713]">3.6</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#0b1713]/50">Key Passes</p>
                  <p className="font-mono text-sm font-bold text-[#0b1713]">2.4</p>
                </div>
              </div>

              <button
                onClick={() => onNavigatePillar("teams-players")}
                className="mt-5 text-xs font-bold text-[#0b1713] hover:text-[#0f766e] transition"
              >
                Inspect Player Radar & Shot Profile →
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
