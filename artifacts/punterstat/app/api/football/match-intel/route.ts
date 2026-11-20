import { NextRequest, NextResponse } from "next/server";
import {
  getMatchIntel,
  type CompetitionStage,
  type LineupStatus,
} from "@/lib/football/match-intel";

const VALID_STAGES = new Set<CompetitionStage>([
  "league",
  "cup_group",
  "cup_knockout",
  "derby",
  "relegation_or_title",
]);

const VALID_LINEUPS = new Set<LineupStatus>([
  "full_strength",
  "minor_absences",
  "key_starters_out",
  "heavy_rotation",
]);

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const home = sp.get("home")?.trim() ?? "";
  const away = sp.get("away")?.trim() ?? "";
  const stageRaw = (sp.get("stage") ?? "league") as CompetitionStage;
  const homeLineupRaw = (sp.get("homeLineup") ?? "full_strength") as LineupStatus;
  const awayLineupRaw = (sp.get("awayLineup") ?? "full_strength") as LineupStatus;

  if (home.length < 2 || away.length < 2) {
    return NextResponse.json(
      { success: false, error: "Provide both home and away team names." },
      { status: 400 },
    );
  }

  try {
    const intel = await getMatchIntel(home, away, {
      competitionStage: VALID_STAGES.has(stageRaw) ? stageRaw : "league",
      homeLineup: VALID_LINEUPS.has(homeLineupRaw) ? homeLineupRaw : "full_strength",
      awayLineup: VALID_LINEUPS.has(awayLineupRaw) ? awayLineupRaw : "full_strength",
    });

    return NextResponse.json({ success: true, intel });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to compute match intelligence";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
