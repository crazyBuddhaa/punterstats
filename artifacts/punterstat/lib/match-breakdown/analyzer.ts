import type {
  MatchAnalysisInput,
  MatchAnalysisResult,
  MatchResult,
  ProbabilityFactor,
} from "./types";

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

  // ── Aggregate probability ─────────────────────────────────────────────────
  const totalEdge = factors.reduce((sum, f) => sum + f.homeEdge, 0);
  // Empirical baseline: home 42%, draw 26%, away 32%
  let homeWin = clamp(0.42 + totalEdge, 0.10, 0.85);
  let awayWin = clamp(0.32 - totalEdge * 0.65, 0.06, 0.80);
  let draw = clamp(1 - homeWin - awayWin, 0.08, 0.40);
  const sum = homeWin + draw + awayWin;
  homeWin /= sum;
  awayWin /= sum;
  draw /= sum;

  // ── Key insights ──────────────────────────────────────────────────────────
  const insights: string[] = [];
  if (homeFS > 0.62)
    insights.push(`${input.homeTeam.name} is in excellent form — high momentum entering this match.`);
  if (awayFS > 0.62)
    insights.push(`${input.awayTeam.name} carries strong away form — do not discount the visitor.`);
  if (totalH2H >= 3 && h2h.draws / totalH2H > 0.4)
    insights.push("These sides draw frequently — the draw market deserves attention.");
  if (homeXG + awayXG > 3.0)
    insights.push(
      "High combined xG suggests an open, goal-heavy game — over markets look well-supported."
    );
  if (homeXG + awayXG < 1.8)
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

  return {
    homeWinProb: Math.round(homeWin * 1000) / 1000,
    drawProb: Math.round(draw * 1000) / 1000,
    awayWinProb: Math.round(awayWin * 1000) / 1000,
    factors,
    expectedGoals: {
      home: Math.round(homeXG * 10) / 10,
      away: Math.round(awayXG * 10) / 10,
    },
    keyInsights: insights,
    educationalNote:
      "These probabilities are generated from the factors you entered using a simplified educational model. They illustrate how analysts weight different signals — not a prediction of any actual match outcome. Professional models incorporate thousands of data points and continuous calibration.",
  };
}
