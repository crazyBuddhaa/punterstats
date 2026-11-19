import {
  MODEL_VERSION,
  TEMPERATURE_DC_MLE,
  applyTemperature1x2,
  deriveFullMarkets,
  getLeagueReliability,
  getLeagueRho,
  predictMatchFromModel,
} from "@/lib/model/dixon-coles-engine";
import type {
  DerivedMarkets,
  MatchAnalysisInput,
  MatchAnalysisResult,
  MatchResult,
  ProbabilityFactor,
} from "./types";

function derivedMarkets(
  homeXG: number,
  awayXG: number,
  homeWin: number,
  draw: number,
  awayWin: number,
  rho: number
): DerivedMarkets {
  // Derive all score-based markets from the Dixon-Coles corrected joint
  // probability matrix using the league's validation-fitted rho.
  const full = deriveFullMarkets(homeXG, awayXG, rho, 5);
  const nonDraw = Math.max(1e-9, homeWin + awayWin);

  return {
    over25: full.over25,
    under25: full.under25,
    over15: full.over15,
    under15: full.under15,
    over35: full.over35,
    under35: full.under35,
    over05: full.over05,
    under05: full.under05,
    over45: full.over45,
    under45: full.under45,
    btts: full.btts,
    noBtts: full.noBtts,
    doubleChanceHD: homeWin + draw,
    doubleChanceDA: draw + awayWin,
    doubleChanceHA: homeWin + awayWin,
    homeDnb: homeWin / nonDraw,
    awayDnb: awayWin / nonDraw,
    homeCleanSheet: full.homeCleanSheet,
    awayCleanSheet: full.awayCleanSheet,
    homeOver05: full.homeOver05,
    homeOver15: full.homeOver15,
    awayOver05: full.awayOver05,
    awayOver15: full.awayOver15,
    ahHomeMinus15: full.ahHomeMinus15,
    ahHomePlus15: full.ahHomePlus15,
    topScorelines: full.topScorelines,
  };
}

// Weighted form score: more recent = more weight
function formScore(results: MatchResult[]): number {
  const weights = [0.35, 0.25, 0.20, 0.12, 0.08];
  let score = 0;
  for (let i = 0; i < Math.min(results.length, 5); i++) {
    const r = results[i];
    const pts = r === "W" ? 1 : r === "D" ? 0.4 : 0;
    score += pts * (weights[i] ?? 0.08);
  }
  return score;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function analyzeMatch(input: MatchAnalysisInput): MatchAnalysisResult {
  const factors: ProbabilityFactor[] = [];

  // ── Factor 1: Home Advantage ──────────────────────────────────────────────
  factors.push({
    name: "Home Advantage",
    description: "Playing at home historically boosts win probability by 8–15%",
    homeEdge: 0.12,
    confidence: "high",
    explanation:
      "Home teams benefit from crowd support, pitch familiarity, and reduced travel fatigue. Across the top five European leagues, home teams win ~45% of matches vs ~28% for away teams.",
  });

  // ── Factor 2: Recent Form ─────────────────────────────────────────────────
  const homeFS = formScore(input.homeTeam.last5);
  const awayFS = formScore(input.awayTeam.last5);
  const formEdge = clamp((homeFS - awayFS) * 0.3, -0.18, 0.18);
  factors.push({
    name: "Recent Form",
    description: `${input.homeTeam.name}: ${(homeFS * 100).toFixed(0)}% form — ${input.awayTeam.name}: ${(awayFS * 100).toFixed(0)}% form`,
    homeEdge: formEdge,
    confidence: "medium",
    explanation:
      "The last five matches are the strongest short-term predictor. Teams on winning runs carry momentum — higher tactical cohesion and confidence — which measurably raises their expected output.",
  });

  // ── Factor 3: Head-to-Head Record ─────────────────────────────────────────
  const h2h = input.headToHead;
  const totalH2H = h2h.homeWins + h2h.draws + h2h.awayWins;
  let h2hEdge = 0;
  if (totalH2H >= 3) {
    const homeRate = h2h.homeWins / totalH2H;
    const awayRate = h2h.awayWins / totalH2H;
    h2hEdge = clamp((homeRate - awayRate) * 0.15, -0.1, 0.1);
  }
  factors.push({
    name: "Head-to-Head Record",
    description:
      totalH2H >= 3
        ? `${h2h.homeWins}W – ${h2h.draws}D – ${h2h.awayWins}L over ${totalH2H} meetings`
        : "Insufficient data (< 3 meetings) — factor weight reduced",
    homeEdge: h2hEdge,
    confidence: totalH2H >= 5 ? "medium" : "low",
    explanation:
      "Historical meetings reveal persistent tactical asymmetries and psychological patterns. Factor weight decays as meetings get older — squad changes reduce the relevance of results from 3+ seasons ago.",
  });

  // ── Factor 4: Goal Scoring & Defensive Strength ───────────────────────────
  const homeAtk = input.homeTeam.goalsScored;
  const awayAtk = input.awayTeam.goalsScored;
  const homeDef = input.homeTeam.goalsConceded;
  const awayDef = input.awayTeam.goalsConceded;

  // Simple Dixon-Coles-inspired xG estimate
  const leagueAvg = 1.35;
  const homeXG = clamp(homeAtk * (leagueAvg / Math.max(awayDef, 0.4)), 0.3, 4.5);
  const awayXG = clamp(awayAtk * (leagueAvg / Math.max(homeDef, 0.4)), 0.3, 4.5);
  const goalEdge = clamp((homeAtk - awayAtk - (homeDef - awayDef)) * 0.05, -0.18, 0.18);
  factors.push({
    name: "Goal Scoring & Defensive Strength",
    description: `${input.homeTeam.name}: ${homeAtk.toFixed(1)} scored / ${homeDef.toFixed(1)} conceded pg — ${input.awayTeam.name}: ${awayAtk.toFixed(1)} scored / ${awayDef.toFixed(1)} conceded pg`,
    homeEdge: goalEdge,
    confidence: "medium",
    explanation:
      "Attacking output relative to opponent defensive solidity is one of the most stable pre-match signals. Expected goals (xG) weights shot quality over raw counts, producing more accurate probability shifts.",
  });

  // ── Factor 5: Key Player Availability ────────────────────────────────────
  const injuryMap: Record<string, number> = {
    none: 0,
    minor: 0.02,
    moderate: 0.05,
    significant: 0.09,
    major: 0.14,
  };
  const homePenalty = injuryMap[input.homeInjuries.impactRating] ?? 0;
  const awayPenalty = injuryMap[input.awayInjuries.impactRating] ?? 0;
  const injuryEdge = clamp(awayPenalty - homePenalty, -0.14, 0.14);
  factors.push({
    name: "Key Player Availability",
    description: `${input.homeTeam.name} absences: ${input.homeInjuries.impactRating} — ${input.awayTeam.name} absences: ${input.awayInjuries.impactRating}`,
    homeEdge: injuryEdge,
    confidence: "medium",
    explanation:
      "Losing a key creator or defensive anchor measurably shifts expected output. Research across top leagues shows teams score ~15% fewer goals when their top scorer is absent; defensive injuries raise xGA by a similar margin.",
  });

  // ── Factor 6: Match Stakes ────────────────────────────────────────────────
  const importanceMap: Record<string, number> = {
    friendly: -0.05,
    league: 0,
    cup: 0.02,
    playoff: 0.03,
    "title-decider": 0.04,
  };
  const importanceEdge = importanceMap[input.leagueImportance] ?? 0;
  factors.push({
    name: "Match Stakes",
    description: `Context: ${input.leagueImportance.replace("-", " ")}`,
    homeEdge: importanceEdge,
    confidence: "low",
    explanation:
      "High-stakes matches tend to be more cautious, lower-scoring affairs. Home crowds exert stronger pressure in decisive games, amplifying the base home advantage. Friendlies see reduced effort and squad rotation.",
  });

  // ── Aggregate probability (v2.0 Dixon-Coles MLE when teams match, else heuristic) ──
  const dcMatch = predictMatchFromModel(
    input.homeTeam.name,
    input.awayTeam.name,
    input.leagueCode
  );
  const resolvedLeagueCode = dcMatch?.leagueCode ?? input.leagueCode ?? null;
  const leagueRho = dcMatch?.rho ?? getLeagueRho(resolvedLeagueCode);
  const reliabilityTier = dcMatch?.reliabilityTier ?? getLeagueReliability(resolvedLeagueCode);

  let finalHomeXG = homeXG;
  let finalAwayXG = awayXG;
  let homeWin: number;
  let draw: number;
  let awayWin: number;

  if (dcMatch) {
    // Anchor expected goals to the time-decayed Dixon-Coles MLE strengths,
    // then apply the user's manual injury & match-stakes adjustments smoothly.
    const homeMult = clamp(1 - homePenalty + importanceEdge * 0.5, 0.7, 1.25);
    const awayMult = clamp(1 - awayPenalty - importanceEdge * 0.25, 0.7, 1.25);
    finalHomeXG = clamp(dcMatch.lambdaHome * homeMult, 0.2, 5.0);
    finalAwayXG = clamp(dcMatch.lambdaAway * awayMult, 0.2, 5.0);

    const adjustedFull = deriveFullMarkets(finalHomeXG, finalAwayXG, leagueRho, 5);
    [homeWin, draw, awayWin] = applyTemperature1x2(
      [adjustedFull.homeWin, adjustedFull.draw, adjustedFull.awayWin],
      TEMPERATURE_DC_MLE
    );
  } else {
    const totalEdge = factors.reduce((sum, f) => sum + f.homeEdge, 0);
    // Empirical baseline: home 42%, draw 26%, away 32%
    homeWin = clamp(0.42 + totalEdge, 0.10, 0.85);
    awayWin = clamp(0.32 - totalEdge * 0.65, 0.06, 0.80);
    draw = clamp(1 - homeWin - awayWin, 0.08, 0.40);
    const sum = homeWin + draw + awayWin;
    homeWin /= sum;
    awayWin /= sum;
    draw /= sum;
  }

  // ── Key insights ──────────────────────────────────────────────────────────
  const insights: string[] = [];
  if (homeFS > 0.62)
    insights.push(`${input.homeTeam.name} is in excellent form — high momentum entering this match.`);
  if (awayFS > 0.62)
    insights.push(`${input.awayTeam.name} carries strong away form — do not discount the visitor.`);
  if (totalH2H >= 3 && h2h.draws / totalH2H > 0.4)
    insights.push("These sides draw frequently — the draw market deserves attention.");
  if (finalHomeXG + finalAwayXG > 3.0)
    insights.push(
      "High combined xG suggests an open, goal-heavy game — over markets look well-supported."
    );
  if (finalHomeXG + finalAwayXG < 1.8)
    insights.push(
      "Low combined xG — both defences are dominant. Under 2.5 goals markets look statistically favoured."
    );
  if (input.homeInjuries.impactRating === "major")
    insights.push(
      `${input.homeTeam.name} has major absences — the home advantage is significantly undermined.`
    );
  if (input.awayInjuries.impactRating === "major")
    insights.push(`${input.awayTeam.name} is severely depleted — away performance likely compromised.`);
  if (insights.length === 0)
    insights.push(
      "No dominant signal — this match is statistically balanced. Edge comes from line value, not directional confidence."
    );

  const markets = derivedMarkets(finalHomeXG, finalAwayXG, homeWin, draw, awayWin, leagueRho);
  const r3 = (n: number) => Math.round(n * 1000) / 1000;

  return {
    homeWinProb: r3(homeWin),
    drawProb: r3(draw),
    awayWinProb: r3(awayWin),
    factors,
    expectedGoals: {
      home: Math.round(finalHomeXG * 10) / 10,
      away: Math.round(finalAwayXG * 10) / 10,
    },
    derivedMarkets: {
      over25: r3(markets.over25),
      under25: r3(markets.under25),
      over15: r3(markets.over15),
      under15: r3(markets.under15),
      over35: r3(markets.over35),
      under35: r3(markets.under35),
      over05: r3(markets.over05 ?? 0),
      under05: r3(markets.under05 ?? 0),
      over45: r3(markets.over45 ?? 0),
      under45: r3(markets.under45 ?? 0),
      btts: r3(markets.btts),
      noBtts: r3(markets.noBtts),
      doubleChanceHD: r3(markets.doubleChanceHD),
      doubleChanceDA: r3(markets.doubleChanceDA),
      doubleChanceHA: r3(markets.doubleChanceHA),
      homeDnb: r3(markets.homeDnb ?? 0),
      awayDnb: r3(markets.awayDnb ?? 0),
      homeCleanSheet: r3(markets.homeCleanSheet),
      awayCleanSheet: r3(markets.awayCleanSheet),
      homeOver05: r3(markets.homeOver05 ?? 0),
      homeOver15: r3(markets.homeOver15 ?? 0),
      awayOver05: r3(markets.awayOver05 ?? 0),
      awayOver15: r3(markets.awayOver15 ?? 0),
      ahHomeMinus15: r3(markets.ahHomeMinus15 ?? 0),
      ahHomePlus15: r3(markets.ahHomePlus15 ?? 0),
      topScorelines: markets.topScorelines,
    },
    keyInsights: insights,
    educationalNote: dcMatch
      ? `Calibrated using PunterStat v${MODEL_VERSION} time-decayed Dixon-Coles MLE (${resolvedLeagueCode}, ρ = ${leagueRho.toFixed(3)}) overlaid with your manual injury and match-stakes inputs. Probabilities are for educational analysis — not betting tips.`
      : "These probabilities are generated from the factors you entered using a simplified educational model. They illustrate how analysts weight different signals — not a prediction of any actual match outcome. Professional models incorporate thousands of data points and continuous calibration.",
    modelMeta: {
      source: dcMatch ? "dixon-coles-v2" : "heuristic",
      modelVersion: MODEL_VERSION,
      leagueCode: resolvedLeagueCode,
      leagueRho,
      reliabilityTier,
    },
  };
}
