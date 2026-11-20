import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  estimateSelectionProb,
  getMatchIntel,
  type CompetitionStage,
  type LineupStatus,
} from "@/lib/football/match-intel";
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
          };
        }

        const intel = await getMatchIntel(teams.homeTeam, teams.awayTeam, {
          competitionStage: leg.competitionStage as CompetitionStage,
          homeLineup: leg.homeLineup as LineupStatus,
          awayLineup: leg.awayLineup as LineupStatus,
        });

        const footballProb = estimateSelectionProb(intel, leg.selection);
        const edgePct =
          footballProb !== null ? Math.round((footballProb * leg.decimalOdds - 1) * 1000) / 10 : null;

        // A "trap leg" is a short-priced banker (< 1.55) where football factors say true chance is meaningfully lower than implied,
        // OR any leg with strong negative edge (< -12%) or major lineup/knockout red flags.
        const isTrapLeg =
          (footballProb !== null && leg.decimalOdds <= 1.55 && footballProb < impliedProb - 0.06) ||
          (edgePct !== null && edgePct < -12) ||
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
          riskNotes: intel.riskNotes,
        };
      }),
    );

    return NextResponse.json({ success: true, reviews });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to analyze slip";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
