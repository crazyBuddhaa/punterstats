import { predictMatchFromModel } from "@/lib/model/dixon-coles-engine";
import type { Fixture } from "@/lib/sports-data/types";

export type ScreenerPreset =
  | "all"
  | "clean_favorites"
  | "over25"
  | "btts"
  | "acca_anchors"
  | "under25";

export interface ScreenerPickOption {
  selection: string;
  modelProb: number;
  fairOdds: number;
}

export interface ScreenedMatch {
  id: string;
  league: string;
  leagueCode: string | null;
  homeTeam: string;
  awayTeam: string;
  kickoff: string;
  lambdaHome: number;
  lambdaAway: number;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  over15Prob: number;
  over25Prob: number;
  under25Prob: number;
  bttsProb: number;
  homeOver15Prob: number;
  awayOver15Prob: number;
  favoriteSide: "home" | "away";
  favoriteTeam: string;
  favoriteProb: number;
  favoriteFairOdds: number;
  usedPromotedPrior: boolean;
  /** Best balanced 1.35–1.85 fair-odds market on this fixture (great for 5–8 leg slips). */
  anchorPick: ScreenerPickOption | null;
  /** Optional sharp market fair prob for the favorite side from cached odds. */
  sharpFavoriteProb?: number | null;
  sharpSourceLabel?: string | null;
}

function fairOdds(prob: number): number {
  if (prob <= 0.01) return 99;
  return Math.round((1 / prob) * 100) / 100;
}

function r3(v: number): number {
  return Math.round(v * 1000) / 1000;
}

/**
 * Score a list of upcoming scheduled fixtures using the in-memory Dixon-Coles v2.0 engine.
 * Fixtures whose teams cannot be matched in any league are skipped.
 */
export function scoreFixturesForScreener(fixtures: Fixture[]): ScreenedMatch[] {
  const results: ScreenedMatch[] = [];

  for (const f of fixtures) {
    if (f.status !== "scheduled") continue;
    const pred = predictMatchFromModel(f.homeTeam, f.awayTeam);
    if (!pred) continue;

    const m = pred.markets;
    const favoriteSide: "home" | "away" = pred.homeWinProb >= pred.awayWinProb ? "home" : "away";
    const favoriteTeam = favoriteSide === "home" ? f.homeTeam : f.awayTeam;
    const favoriteProb = favoriteSide === "home" ? pred.homeWinProb : pred.awayWinProb;

    // Find best "Acca Anchor" (clean main market in the 0.54–0.74 probability band -> ~1.35–1.85 fair odds)
    const anchorCandidates: ScreenerPickOption[] = [
      { selection: `${f.homeTeam} to win`, modelProb: pred.homeWinProb, fairOdds: fairOdds(pred.homeWinProb) },
      { selection: `${f.awayTeam} to win`, modelProb: pred.awayWinProb, fairOdds: fairOdds(pred.awayWinProb) },
      { selection: "Over 2.5 goals", modelProb: m.over25, fairOdds: fairOdds(m.over25) },
      { selection: "BTTS Yes", modelProb: m.btts, fairOdds: fairOdds(m.btts) },
      { selection: `${f.homeTeam} Over 1.5 Goals`, modelProb: m.homeOver15, fairOdds: fairOdds(m.homeOver15) },
      { selection: "Under 2.5 goals", modelProb: m.under25, fairOdds: fairOdds(m.under25) },
    ];
    const inBand = anchorCandidates
      .filter((c) => c.modelProb >= 0.54 && c.modelProb <= 0.74)
      .sort((a, b) => b.modelProb - a.modelProb);
    const anchorPick = inBand[0]
      ? {
          selection: inBand[0].selection,
          modelProb: r3(inBand[0].modelProb),
          fairOdds: inBand[0].fairOdds,
        }
      : null;

    results.push({
      id: f.id,
      league: f.league,
      leagueCode: pred.leagueCode,
      homeTeam: f.homeTeam,
      awayTeam: f.awayTeam,
      kickoff: f.kickoff,
      lambdaHome: Math.round(pred.lambdaHome * 100) / 100,
      lambdaAway: Math.round(pred.lambdaAway * 100) / 100,
      homeWinProb: r3(pred.homeWinProb),
      drawProb: r3(pred.drawProb),
      awayWinProb: r3(pred.awayWinProb),
      over15Prob: r3(m.over15),
      over25Prob: r3(m.over25),
      under25Prob: r3(m.under25),
      bttsProb: r3(m.btts),
      homeOver15Prob: r3(m.homeOver15),
      awayOver15Prob: r3(m.awayOver15),
      favoriteSide,
      favoriteTeam,
      favoriteProb: r3(favoriteProb),
      favoriteFairOdds: fairOdds(favoriteProb),
      usedPromotedPrior: Boolean(pred.usedPromotedPrior),
      anchorPick,
    });
  }

  return results.sort((a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff));
}

/**
 * Filter & rank screened matches by preset, league, and team search query.
 */
export function filterScreenedMatches(
  matches: ScreenedMatch[],
  options: {
    preset: ScreenerPreset;
    league?: string;
    search?: string;
    minProb?: number;
  },
): ScreenedMatch[] {
  const { preset, league, search, minProb = 0 } = options;
  const q = search?.trim().toLowerCase() ?? "";

  let filtered = matches.filter((m) => {
    if (league && league !== "all" && m.league.toLowerCase() !== league.toLowerCase()) {
      return false;
    }
    if (
      q &&
      !m.homeTeam.toLowerCase().includes(q) &&
      !m.awayTeam.toLowerCase().includes(q) &&
      !m.league.toLowerCase().includes(q)
    ) {
      return false;
    }
    return true;
  });

  switch (preset) {
    case "clean_favorites":
      filtered = filtered
        .filter((m) => m.favoriteProb >= Math.max(0.56, minProb))
        .sort((a, b) => b.favoriteProb - a.favoriteProb);
      break;
    case "over25":
      filtered = filtered
        .filter((m) => m.over25Prob >= Math.max(0.54, minProb))
        .sort((a, b) => b.over25Prob - a.over25Prob);
      break;
    case "btts":
      filtered = filtered
        .filter((m) => m.bttsProb >= Math.max(0.52, minProb))
        .sort((a, b) => b.bttsProb - a.bttsProb);
      break;
    case "acca_anchors":
      filtered = filtered
        .filter((m) => m.anchorPick !== null && m.anchorPick.modelProb >= minProb)
        .sort((a, b) => (b.anchorPick?.modelProb ?? 0) - (a.anchorPick?.modelProb ?? 0));
      break;
    case "under25":
      filtered = filtered
        .filter((m) => m.under25Prob >= Math.max(0.54, minProb))
        .sort((a, b) => b.under25Prob - a.under25Prob);
      break;
    case "all":
    default:
      if (minProb > 0) {
        filtered = filtered.filter((m) => m.favoriteProb >= minProb);
      }
      filtered = [...filtered].sort((a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff));
      break;
  }

  return filtered;
}

export interface ScreenerSlipLeg {
  event: string;
  selection: string;
  odds: string;
}

/** Build a `/bet-assist/slip-checker?legs=...` URL pre-populated with screened picks. */
export function buildSlipCheckerHref(legs: ScreenerSlipLeg[]): string {
  if (legs.length === 0) return "/bet-assist/slip-checker";
  const encoded = encodeURIComponent(JSON.stringify(legs.slice(0, 20)));
  return `/bet-assist/slip-checker?legs=${encoded}`;
}
