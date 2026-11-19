"use client";

import { useState } from "react";
import type { MatchAnalysisResult } from "@/lib/match-breakdown/types";
import { Info } from "lucide-react";

interface ProbabilityDisplayProps {
  result: MatchAnalysisResult;
  homeTeamName: string;
  awayTeamName: string;
}

interface OutcomeBarProps {
  label: string;
  prob: number;
  color: string;
  impliedOdds: number;
}

function OutcomeBar({ label, prob, color, impliedOdds }: OutcomeBarProps) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-semibold text-[#0f172a]">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#1e293b]/50">Implied odds: {impliedOdds.toFixed(2)}</span>
          <span className="min-w-[3.5rem] text-right font-bold text-[#0f172a]">
            {(prob * 100).toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${prob * 100}%` }}
        />
      </div>
    </div>
  );
}

// ── Derived market tile ────────────────────────────────────────────────────────
function MarketTile({
  label,
  prob,
  sublabel,
  accent = "teal",
}: {
  label: string;
  prob: number;
  sublabel?: string;
  accent?: "teal" | "indigo" | "amber" | "rose" | "slate";
}) {
  const accentMap: Record<string, { text: string; bg: string; bar: string; badge: string }> = {
    teal:   { text: "text-teal-700",   bg: "bg-teal-50",   bar: "bg-teal-500",   badge: "bg-teal-100 text-teal-700" },
    indigo: { text: "text-indigo-700", bg: "bg-indigo-50", bar: "bg-indigo-500", badge: "bg-indigo-100 text-indigo-700" },
    amber:  { text: "text-amber-700",  bg: "bg-amber-50",  bar: "bg-amber-400",  badge: "bg-amber-100 text-amber-700" },
    rose:   { text: "text-rose-700",   bg: "bg-rose-50",   bar: "bg-rose-500",   badge: "bg-rose-100 text-rose-700" },
    slate:  { text: "text-slate-700",  bg: "bg-slate-50",  bar: "bg-slate-400",  badge: "bg-slate-100 text-slate-600" },
  };
  const c = accentMap[accent];
  const pct = (prob * 100).toFixed(1);
  const odds = (1 / prob).toFixed(2);
  const isValue = prob >= 0.6;

  return (
    <div className={`rounded-xl border border-border ${c.bg} p-4 flex flex-col gap-2`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-[#0f172a] leading-tight">{label}</p>
        {isValue && (
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${c.badge}`}>
            Favoured
          </span>
        )}
      </div>
      {sublabel && <p className="text-[10px] text-[#1e293b]/50">{sublabel}</p>}
      <div className="space-y-1">
        <div className="flex items-end justify-between">
          <span className={`text-2xl font-bold ${c.text}`}>{pct}%</span>
          <span className="text-xs text-[#1e293b]/40">≈ {odds}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/70">
          <div
            className={`h-full rounded-full ${c.bar} transition-all duration-700`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

type MarketGroup = "goals" | "btts" | "double-chance" | "scorelines" | "clean-sheet";

const MARKET_GROUPS: { id: MarketGroup; label: string }[] = [
  { id: "goals",         label: "Goals & Team Totals" },
  { id: "btts",          label: "Both Teams To Score" },
  { id: "double-chance", label: "Double Chance & DNB" },
  { id: "scorelines",    label: "Scorelines & Handicap" },
  { id: "clean-sheet",   label: "Clean Sheet" },
];

const TIER_BADGE_STYLES: Record<"Gold" | "Silver" | "Bronze", string> = {
  Gold:   "border-amber-300 bg-amber-50 text-amber-800",
  Silver: "border-slate-300 bg-slate-100 text-slate-700",
  Bronze: "border-orange-300 bg-orange-50 text-orange-800",
};

export function ProbabilityDisplay({
  result,
  homeTeamName,
  awayTeamName,
}: ProbabilityDisplayProps) {
  const {
    homeWinProb,
    drawProb,
    awayWinProb,
    expectedGoals,
    derivedMarkets,
    keyInsights,
    educationalNote,
    modelMeta,
  } = result;
  const [activeGroup, setActiveGroup] = useState<MarketGroup>("goals");

  return (
    <div className="space-y-6">
      {/* Outcome probability bars */}
      <div className="rounded-xl border border-border bg-white p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold text-[#0f172a]">Outcome Probability Estimate</h3>
          {modelMeta && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
                  modelMeta.source === "dixon-coles-v2"
                    ? "border-teal-200 bg-teal-50 text-teal-700"
                    : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
              >
                {modelMeta.source === "dixon-coles-v2"
                  ? `Dixon-Coles v${modelMeta.modelVersion}${modelMeta.leagueCode ? ` · ${modelMeta.leagueCode}` : ""}`
                  : "Factor Model"}
              </span>
              {modelMeta.reliabilityTier && (
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${TIER_BADGE_STYLES[modelMeta.reliabilityTier]}`}
                >
                  {modelMeta.reliabilityTier} Data
                </span>
              )}
            </div>
          )}
        </div>
        <div className="space-y-4">
          <OutcomeBar
            label={`${homeTeamName} Win`}
            prob={homeWinProb}
            color="bg-teal-500"
            impliedOdds={1 / homeWinProb}
          />
          <OutcomeBar
            label="Draw"
            prob={drawProb}
            color="bg-amber-400"
            impliedOdds={1 / drawProb}
          />
          <OutcomeBar
            label={`${awayTeamName} Win`}
            prob={awayWinProb}
            color="bg-indigo-500"
            impliedOdds={1 / awayWinProb}
          />
        </div>
      </div>

      {/* xG cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-white p-5 text-center">
          <p className="text-xs font-medium text-[#1e293b]/50 uppercase tracking-wide mb-1">
            {homeTeamName} xG
          </p>
          <p className="text-3xl font-bold text-teal-600">{expectedGoals.home.toFixed(1)}</p>
          <p className="mt-1 text-[10px] text-[#1e293b]/40">expected goals</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-5 text-center">
          <p className="text-xs font-medium text-[#1e293b]/50 uppercase tracking-wide mb-1">
            {awayTeamName} xG
          </p>
          <p className="text-3xl font-bold text-indigo-600">{expectedGoals.away.toFixed(1)}</p>
          <p className="mt-1 text-[10px] text-[#1e293b]/40">expected goals</p>
        </div>
      </div>

      {/* Combined xG note */}
      <div className="rounded-lg bg-slate-50 border border-border px-4 py-3">
        <p className="text-xs text-[#1e293b]/60">
          <span className="font-semibold text-[#0f172a]">Combined xG:</span>{" "}
          {(expectedGoals.home + expectedGoals.away).toFixed(1)} — implies{" "}
          {expectedGoals.home + expectedGoals.away > 2.5
            ? "over 2.5 goals is statistically favoured"
            : "under 2.5 goals is statistically favoured"}{" "}
          based on the factors entered.
        </p>
      </div>

      {/* ── Derived markets ────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-white overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <h3 className="font-semibold text-[#0f172a]">Betting Markets</h3>
          <p className="mt-0.5 text-xs text-[#1e293b]/50">
            Derived coherently from the Dixon-Coles joint scoreline distribution — for educational comparison only.
          </p>
        </div>

        {/* Tab strip */}
        <div className="flex gap-0 border-b border-border overflow-x-auto">
          {MARKET_GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGroup(g.id)}
              className={`shrink-0 px-4 py-2.5 text-xs font-semibold transition whitespace-nowrap border-b-2 ${
                activeGroup === g.id
                  ? "border-teal-500 text-teal-700 bg-teal-50/60"
                  : "border-transparent text-[#1e293b]/60 hover:text-[#0f172a] hover:bg-slate-50"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeGroup === "goals" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {typeof derivedMarkets.over05 === "number" && derivedMarkets.over05 > 0 && (
                  <>
                    <MarketTile label="Over 0.5 Goals" prob={derivedMarkets.over05} accent="teal" />
                    <MarketTile label="Under 0.5 Goals" prob={derivedMarkets.under05 ?? 1 - derivedMarkets.over05} accent="slate" />
                  </>
                )}
                <MarketTile label="Over 1.5 Goals"  prob={derivedMarkets.over15}  accent="teal" />
                <MarketTile label="Under 1.5 Goals" prob={derivedMarkets.under15} accent="slate" />
                <MarketTile label="Over 2.5 Goals"  prob={derivedMarkets.over25}  accent="teal" />
                <MarketTile label="Under 2.5 Goals" prob={derivedMarkets.under25} accent="slate" />
                <MarketTile label="Over 3.5 Goals"  prob={derivedMarkets.over35}  accent="indigo" />
                <MarketTile label="Under 3.5 Goals" prob={derivedMarkets.under35} accent="slate" />
                {typeof derivedMarkets.over45 === "number" && derivedMarkets.over45 > 0 && (
                  <>
                    <MarketTile label="Over 4.5 Goals" prob={derivedMarkets.over45} accent="indigo" />
                    <MarketTile label="Under 4.5 Goals" prob={derivedMarkets.under45 ?? 1 - derivedMarkets.over45} accent="slate" />
                  </>
                )}
              </div>

              {typeof derivedMarkets.homeOver05 === "number" && derivedMarkets.homeOver05 > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-border">
                  <p className="text-xs font-semibold text-[#0f172a]">Team Goal Totals</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <MarketTile label={`${homeTeamName} Over 0.5`} prob={derivedMarkets.homeOver05} accent="teal" />
                    <MarketTile label={`${homeTeamName} Over 1.5`} prob={derivedMarkets.homeOver15 ?? 0} accent="teal" />
                    <MarketTile label={`${awayTeamName} Over 0.5`} prob={derivedMarkets.awayOver05 ?? 0} accent="indigo" />
                    <MarketTile label={`${awayTeamName} Over 1.5`} prob={derivedMarkets.awayOver15 ?? 0} accent="indigo" />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeGroup === "btts" && (
            <div className="space-y-4">
              <p className="text-xs text-[#1e293b]/50 leading-relaxed">
                Both Teams To Score (BTTS) is the probability that <em>both</em> sides
                score at least one goal, derived from the Dixon-Coles low-score corrected
                joint scoreline matrix.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <MarketTile label="BTTS — Yes" prob={derivedMarkets.btts}   accent="teal"  sublabel="Both teams score" />
                <MarketTile label="BTTS — No"  prob={derivedMarkets.noBtts} accent="slate" sublabel="At least one keeps a clean sheet" />
              </div>
            </div>
          )}

          {activeGroup === "double-chance" && (
            <div className="space-y-5">
              <p className="text-xs text-[#1e293b]/50 leading-relaxed">
                Double Chance covers two of the three 1X2 outcomes. Draw No Bet (DNB) removes
                the draw by re-normalising Home vs Away win probabilities.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <MarketTile
                  label={`${homeTeamName} or Draw`}
                  sublabel="Home or Draw (1X)"
                  prob={derivedMarkets.doubleChanceHD}
                  accent="teal"
                />
                <MarketTile
                  label="Draw or Away"
                  sublabel={`Draw or ${awayTeamName} (X2)`}
                  prob={derivedMarkets.doubleChanceDA}
                  accent="indigo"
                />
                <MarketTile
                  label="Either Win"
                  sublabel="No draw (12)"
                  prob={derivedMarkets.doubleChanceHA}
                  accent="amber"
                />
              </div>

              {typeof derivedMarkets.homeDnb === "number" && derivedMarkets.homeDnb > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-border">
                  <p className="text-xs font-semibold text-[#0f172a]">Draw No Bet (DNB)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <MarketTile
                      label={`${homeTeamName} DNB`}
                      sublabel="Stake refunded on draw"
                      prob={derivedMarkets.homeDnb}
                      accent="teal"
                    />
                    <MarketTile
                      label={`${awayTeamName} DNB`}
                      sublabel="Stake refunded on draw"
                      prob={derivedMarkets.awayDnb ?? 1 - derivedMarkets.homeDnb}
                      accent="indigo"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeGroup === "scorelines" && (
            <div className="space-y-5">
              {derivedMarkets.topScorelines && derivedMarkets.topScorelines.length > 0 && (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-[#0f172a]">Top 5 Most Probable Scorelines</p>
                    <p className="text-[11px] text-[#1e293b]/50">
                      Exact full-time score probabilities ({homeTeamName} – {awayTeamName}) from the Dixon-Coles matrix.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                    {derivedMarkets.topScorelines.map((s, idx) => (
                      <div
                        key={s.score}
                        className={`rounded-xl border p-3 text-center ${
                          idx === 0
                            ? "border-teal-300 bg-teal-50/70"
                            : "border-border bg-slate-50/60"
                        }`}
                      >
                        <p className="text-lg font-bold tabular-nums text-[#0f172a]">{s.score}</p>
                        <p className="mt-0.5 text-xs font-semibold tabular-nums text-teal-700">
                          {(s.prob * 100).toFixed(1)}%
                        </p>
                        <p className="text-[10px] tabular-nums text-[#1e293b]/45">
                          ≈ {(1 / Math.max(s.prob, 0.001)).toFixed(1)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {typeof derivedMarkets.ahHomeMinus15 === "number" && (
                <div className="space-y-2.5 pt-2 border-t border-border">
                  <p className="text-xs font-semibold text-[#0f172a]">Asian Handicap (Home Side)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <MarketTile
                      label={`${homeTeamName} -1.5`}
                      sublabel="Must win by 2+ goals"
                      prob={derivedMarkets.ahHomeMinus15}
                      accent="teal"
                    />
                    <MarketTile
                      label={`${homeTeamName} +1.5`}
                      sublabel="Win, draw, or lose by 1"
                      prob={derivedMarkets.ahHomePlus15 ?? 0}
                      accent="indigo"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeGroup === "clean-sheet" && (
            <div className="space-y-4">
              <p className="text-xs text-[#1e293b]/50 leading-relaxed">
                Clean Sheet probability is the likelihood that the opponent scores zero goals
                from the Dixon-Coles scoreline matrix.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <MarketTile
                  label={`${homeTeamName} Clean Sheet`}
                  sublabel={`${awayTeamName} scores 0`}
                  prob={derivedMarkets.homeCleanSheet}
                  accent="teal"
                />
                <MarketTile
                  label={`${awayTeamName} Clean Sheet`}
                  sublabel={`${homeTeamName} scores 0`}
                  prob={derivedMarkets.awayCleanSheet}
                  accent="indigo"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Key insights */}
      {keyInsights.length > 0 && (
        <div className="rounded-xl border border-border bg-white p-6">
          <h3 className="mb-4 font-semibold text-[#0f172a]">Key Signals</h3>
          <ul className="space-y-2">
            {keyInsights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#1e293b]/80">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Educational disclaimer */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p className="text-xs leading-relaxed text-amber-800">{educationalNote}</p>
      </div>
    </div>
  );
}
