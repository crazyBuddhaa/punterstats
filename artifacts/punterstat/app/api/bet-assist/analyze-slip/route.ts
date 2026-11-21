import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  estimateSelectionProb,
  getMatchIntel,
  suggestMarketAlternatives,
  type CompetitionStage,
  type LineupStatus,
  type MarketAlternative,
} from "@/lib/football/match-intel";
import { checkSharpMarketOdds, type SharpMarketCheck } from "@/lib/odds/sharp-check";
import { parseFixtureTeams } from "@/lib/bet-assist/auto-settle";

const legInputSchema = z.object({
  event: z.string().max(200).optional().default(""),
  selection: z.string().max(200).optional().default(""),
  decimalOdds: z.number().gt(1).lt(10000),
  competitionStage: z
    .enum(["league", "cup_group", "cup_knockout", "derby", "relegation_or_title"])
    .optional()
    .default("league"),
  homeLineup: z
    .enum(["full_strength", "minor_absences", "key_starters_out", "heavy_rotation"])
    .optional()
    .default("full_strength"),
  awayLineup: z
    .enum(["full_strength", "minor_absences", "key_starters_out", "heavy_rotation"])
    .optional()
    .default("full_strength"),
});

const bodySchema = z.object({
  legs: z.array(legInputSchema).min(1).max(30),
});

export interface FootballLegReview {
  index: number;
  matchedTeams: boolean;
  footballProb: number | null;
  impliedProb: number;
  edgePct: number | null;
  isTrapLeg: boolean;
  strengthEdgeLabel: string | null;
  homeForm: string | null;
  awayForm: string | null;
  h2hSummary: string | null;
  factors: string[];
  riskNotes: string[];
  /** Live sharp/consensus market check from cached odds (proxy for team news & line drift). */
  sharpCheck?: SharpMarketCheck | null;
  /** Cleaner same-match alternatives when backing a tight heavy favourite (<= 1.38). */
  alternatives?: MarketAlternative[];
  /** Expected corners & cards summary when historical micro-market stats exist. */
  microSummary?: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid slip payload" },
        { status: 400 },
      );
    }

    const reviews: FootballLegReview[] = await Promise.all(
      parsed.data.legs.map(async (leg, index) => {
        const impliedProb = 1 / leg.decimalOdds;
        const teams = parseFixtureTeams(leg.event);
        if (!teams) {
          return {
            index,
            matchedTeams: false,
            footballProb: null,
            impliedProb,
            edgePct: null,
            isTrapLeg: leg.decimalOdds < 1.3 && leg.competitionStage === "cup_knockout",
            strengthEdgeLabel: null,
            homeForm: null,
            awayForm: null,
            h2hSummary: null,
            factors: [],
            riskNotes:
              leg.competitionStage === "cup_knockout"
                ? ["Knockout match carries elevated upset risk."]
                : [],
            sharpCheck: null,
            alternatives: [],
            microSummary: null,
          };
        }

        const [intel, sharpCheck] = await Promise.all([
          getMatchIntel(teams.homeTeam, teams.awayTeam, {
            competitionStage: leg.competitionStage as CompetitionStage,
            homeLineup: leg.homeLineup as LineupStatus,
            awayLineup: leg.awayLineup as LineupStatus,
          }),
          checkSharpMarketOdds(teams.homeTeam, teams.awayTeam, leg.selection, leg.decimalOdds),
        ]);

        const footballProb = estimateSelectionProb(intel, leg.selection);
        const edgePct =
          footballProb !== null ? Math.round((footballProb * leg.decimalOdds - 1) * 1000) / 10 : null;

        const riskNotes = [...intel.riskNotes];
        if (sharpCheck?.isDriftWarning) {
          riskNotes.push(
            `${sharpCheck.sourceLabel} fair chance is ${(sharpCheck.sharpFairProb * 100).toFixed(0)}% vs your slip's ${(impliedProb * 100).toFixed(0)}% — check team news/lineups before staking.`,
          );
        }

        const alternatives = suggestMarketAlternatives(intel, leg.selection, leg.decimalOdds);
        const microParts: string[] = [];
        if (intel.microMarkets?.corners) {
          microParts.push(`${intel.microMarkets.corners.expectedTotal.toFixed(1)} corners`);
        }
        if (intel.microMarkets?.cards) {
          microParts.push(`${intel.microMarkets.cards.expectedTotal.toFixed(1)} cards`);
        }
        const microSummary = microParts.length > 0 ? `Exp. ${microParts.join(" · ")}` : null;

        // A "trap leg" is a short-priced banker (< 1.55) where football factors say true chance is meaningfully lower than implied,
        // OR sharp consensus has drifted strongly against the pick, OR strong negative edge (< -12%) / knockout red flags.
        const isTrapLeg =
          (footballProb !== null && leg.decimalOdds <= 1.55 && footballProb < impliedProb - 0.06) ||
          (edgePct !== null && edgePct < -12) ||
          Boolean(sharpCheck?.isDriftWarning) ||
          (leg.competitionStage === "cup_knockout" && leg.decimalOdds <= 1.45);

        return {
          index,
          matchedTeams: intel.dataSource !== "baseline",
          footballProb,
          impliedProb,
          edgePct,
          isTrapLeg,
          strengthEdgeLabel: intel.strengthEdgeLabel,
          homeForm: intel.home.last5.length > 0 ? intel.home.last5.join("-") : null,
          awayForm: intel.away.last5.length > 0 ? intel.away.last5.join("-") : null,
          h2hSummary:
            intel.h2h.meetings > 0
              ? `${intel.h2h.homeWins}W-${intel.h2h.draws}D-${intel.h2h.awayWins}L (${intel.h2h.avgGoals.toFixed(1)} avg goals)`
              : null,
          factors: intel.factors,
          riskNotes,
          sharpCheck,
          alternatives,
          microSummary,
        };
      }),
    );

    return NextResponse.json({ success: true, reviews });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to analyze slip";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
