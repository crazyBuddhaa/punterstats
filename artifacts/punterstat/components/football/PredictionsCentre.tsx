import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Filter,
  HelpCircle,
  Percent,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";
import type { NavPillar, PredictionFeedItem } from "@/types/football";
import { PREDICTIONS_FEED } from "@/data/footballIntelligenceData";

interface PredictionsCentreProps {
  onNavigateToMatch: (matchId: string) => void;
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

type MarketCategory = "all" | "match-results" | "goals" | "corners" | "player-markets" | "other";

export function PredictionsCentre({
  onNavigateToMatch,
  onNavigatePillar,
  onOpenContextualEducation,
  onLogBetFromAnalysis,
}: PredictionsCentreProps) {
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory>("all");
  const [confidenceFilter, setConfidenceFilter] = useState<"all" | "High" | "Medium" | "Low">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const categories: { id: MarketCategory; label: string }[] = [
    { id: "all", label: "All Markets" },
    { id: "match-results", label: "Match Results (1X2, DNB)" },
    { id: "goals", label: "Goals & BTTS" },
    { id: "corners", label: "Corners" },
    { id: "player-markets", label: "Player Props" },
    { id: "other", label: "Cards & Specials" },
  ];

  const filteredPredictions = PREDICTIONS_FEED.filter((item) => {
    if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
    if (confidenceFilter !== "all" && item.confidence !== confidenceFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.fixtureTitle.toLowerCase();
      const sel = item.selection.toLowerCase();
      const mkt = item.market.toLowerCase();
      return matchTitle.includes(q) || sel.includes(q) || mkt.includes(q);
    }
    return true;
  });

  const handleTrackPrediction = (item: PredictionFeedItem) => {
    if (onLogBetFromAnalysis) {
      onLogBetFromAnalysis({
        eventName: item.fixtureTitle,
        market: item.market,
        selection: item.selection,
        odds: item.odds,
        yourProb: item.probability,
      });
      setToastMsg(`Tracked "${item.selection}" in Bet Journal`);
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5ef] text-[#0b1713] pb-24">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#0b1713] px-4 py-3 text-sm font-semibold text-[#d7f35f] shadow-2xl flex items-center gap-2 border border-white/10">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Predictions Header & Model Calibration Stats */}
      <div className="border-b border-white/10 bg-[#0b1713] text-white">
        <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-10 lg:px-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#d7f35f]">
                03 · Prediction Modelling & Evidence
              </span>
              <h1 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight text-white">
                Probabilistic forecasts with transparent evidence.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
                Predictions are estimated probabilities derived from statistical models, never guarantees. We explicitly distinguish probability from confidence.
              </p>
            </div>

            {/* Model Evaluation & Brier Score Stats */}
            <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/15 bg-white/5 p-4 text-center font-mono tabular-nums">
              <div>
                <p className="text-[10px] text-white/60 font-sans uppercase">Model Calibration</p>
                <p className="text-xl font-black text-[#d7f35f]">94.2%</p>
                <p className="text-[10px] text-white/50">Well Calibrated</p>
              </div>
              <div>
                <p className="text-[10px] text-white/60 font-sans uppercase">Brier Score</p>
                <p className="text-xl font-black text-white">0.174</p>
                <p className="text-[10px] text-white/50">Top Decile</p>
              </div>
              <div>
                <p className="text-[10px] text-white/60 font-sans uppercase">Tracked Picks</p>
                <p className="text-xl font-black text-white">412</p>
                <p className="text-[10px] text-white/50">Verified Records</p>
              </div>
            </div>
          </div>

          {/* Education Callout on Probability vs Confidence */}
          <div className="mt-8 rounded-xl border border-white/10 bg-[#17231c] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-[#d7f35f]" />
              <span className="text-white/80">
                <strong>Why Probability ≠ Confidence:</strong> A fixture can have 75% estimated probability but LOW confidence if lineup data is incomplete or sample size is small.
              </span>
            </div>
            <button
              onClick={() =>
                onOpenContextualEducation(
                  "p-vs-c",
                  "Probability vs Confidence",
                  "Probability is the model's computed chance of an outcome (0-100%). Confidence reflects how complete, stable, and verified the underlying evidence is.",
                  "les-prob-vs-confidence"
                )
              }
              className="text-[#d7f35f] font-bold hover:underline shrink-0"
            >
              Read Full Explanation →
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Content Area */}
      <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-16 pt-8 space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/10 pb-5">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition ${
                  selectedCategory === c.id
                    ? "bg-[#0b1713] text-[#d7f35f]"
                    : "text-[#0b1713]/70 hover:text-[#0b1713] hover:bg-black/5"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Search & Confidence Filter */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search market, team or pick..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs text-[#0b1713] placeholder:text-black/40 focus:outline-none focus:border-[#0b1713] w-48 sm:w-64"
              />
            </div>

            <select
              value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(e.target.value as any)}
              className="rounded-lg border border-black/15 bg-white px-2.5 py-1.5 text-xs text-[#0b1713] font-semibold focus:outline-none"
            >
              <option value="all">All Confidence</option>
              <option value="High">High Confidence Only</option>
              <option value="Medium">Medium Confidence</option>
              <option value="Low">Low Confidence</option>
            </select>
          </div>
        </div>

        {/* Prediction Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPredictions.map((pred) => (
            <div
              key={pred.id}
              className="flex flex-col justify-between rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition hover:border-[#0b1713]"
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between text-xs text-[#0b1713]/60 mb-2">
                  <span className="font-semibold text-[#0b1713]">{pred.fixtureTitle}</span>
                  <span
                    className={`font-mono text-[11px] px-2 py-0.5 rounded font-bold ${
                      pred.confidence === "High"
                        ? "bg-emerald-100 text-emerald-800"
                        : pred.confidence === "Medium"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {pred.confidence} Confidence
                  </span>
                </div>

                <p className="text-xs text-[#0b1713]/50">{pred.market}</p>
                <h3 className="text-xl font-black text-[#0b1713] mt-1">{pred.selection}</h3>

                {/* Metrics Matrix */}
                <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-black/5 p-3 text-center font-mono tabular-nums">
                  <div>
                    <span className="text-[10px] text-[#0b1713]/60 font-sans uppercase block">Model Prob</span>
                    <span className="text-base font-bold text-[#0b1713]">
                      {(pred.probability * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#0b1713]/60 font-sans uppercase block">Odds</span>
                    <span className="text-base font-bold text-[#0b1713]">
                      {pred.odds.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#0b1713]/60 font-sans uppercase block">Value Edge</span>
                    <span className="text-base font-bold text-[#0f766e]">
                      +{pred.valueEdge.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Evidence Points */}
                <div className="mt-4 space-y-2 border-t border-black/5 pt-3 text-xs text-[#0b1713]/80">
                  <p className="font-semibold text-[#0b1713]">Supporting Statistical Evidence:</p>
                  <ul className="space-y-1.5 list-disc pl-4 text-[#0b1713]/70">
                    {pred.evidence.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>

                  <p className="mt-3 text-[11px] text-[#0b1713]/60">
                    <strong>Confidence Reasoning:</strong> {pred.confidenceExplanation}
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between text-xs">
                <button
                  onClick={() => onNavigateToMatch(pred.matchId)}
                  className="font-bold text-[#0b1713] hover:text-[#0f766e] transition"
                >
                  Match Centre →
                </button>

                <div className="flex items-center gap-2">
                  {pred.educationalLink && (
                    <button
                      onClick={() =>
                        onOpenContextualEducation(
                          pred.educationalLink!.topicId,
                          pred.educationalLink!.label,
                          pred.evidence[0],
                          "les-prob-vs-confidence"
                        )
                      }
                      className="text-[#0f766e] font-semibold hover:underline text-[11px]"
                    >
                      Explain
                    </button>
                  )}
                  <button
                    onClick={() => handleTrackPrediction(pred)}
                    className="rounded-lg bg-[#0b1713] px-3 py-1.5 font-bold text-[#d7f35f] hover:bg-[#17231c] transition"
                  >
                    Track
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
