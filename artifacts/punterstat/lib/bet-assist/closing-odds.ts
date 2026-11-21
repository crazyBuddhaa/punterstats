import { createAdminClient } from "@/lib/supabase/admin";
import { parseFixtureTeams } from "@/lib/bet-assist/auto-settle";
import { checkSharpMarketOdds } from "@/lib/odds/sharp-check";

export interface CaptureClosingOddsResult {
  success: boolean;
  checked: number;
  updated: number;
  skipped: number;
  error?: string;
}

/** Pure helper: compute Closing Line Value % from taken decimal odds vs fair/sharp closing odds. */
export function computeClvPct(takenOdds: number, closingOdds: number): number | null {
  if (!(takenOdds > 1) || !(closingOdds > 1)) return null;
  return Math.round((takenOdds / closingOdds - 1) * 1000) / 10;
}

/**
 * Snapshot sharp/consensus closing odds from `odds_cache` onto pending `bet_journal`
 * rows that don't have `closing_odds` recorded yet (zero extra Odds API quota).
 *
 * Only updates rows where `closing_odds IS NULL` so manual entries are never overwritten.
 */
export async function capturePendingClosingOdds(limit = 100): Promise<CaptureClosingOddsResult> {
  try {
    const admin = createAdminClient();
    const { data: rows, error } = await admin
      .from("bet_journal")
      .select("id, event_name, selection, odds, leg_count")
      .eq("status", "pending")
      .is("closing_odds", null)
      .order("placed_at", { ascending: false })
      .limit(limit);

    if (error) {
      return { success: false, checked: 0, updated: 0, skipped: 0, error: error.message };
    }

    const pending = (rows ?? []) as Array<{
      id: string;
      event_name: string | null;
      selection: string | null;
      odds: number;
      leg_count: number | null;
    }>;

    let updated = 0;
    let skipped = 0;

    for (const row of pending) {
      // Skip multi-leg accumulators here since single closing_odds applies to single-match 1X2/DC/DNB
      if ((row.leg_count ?? 1) > 1 || !row.event_name || !row.selection) {
        skipped += 1;
        continue;
      }

      const teams = parseFixtureTeams(row.event_name);
      if (!teams) {
        skipped += 1;
        continue;
      }

      const sharp = await checkSharpMarketOdds(
        teams.homeTeam,
        teams.awayTeam,
        row.selection,
        Number(row.odds),
      );
      if (!sharp || !(sharp.sharpFairOdds > 1)) {
        skipped += 1;
        continue;
      }

      const { error: updateErr } = await admin
        .from("bet_journal")
        .update({ closing_odds: sharp.sharpFairOdds })
        .eq("id", row.id)
        .is("closing_odds", null);

      if (!updateErr) {
        updated += 1;
      } else {
        skipped += 1;
      }
    }

    return {
      success: true,
      checked: pending.length,
      updated,
      skipped,
    };
  } catch (err) {
    return {
      success: false,
      checked: 0,
      updated: 0,
      skipped: 0,
      error: err instanceof Error ? err.message : "Failed to capture closing odds",
    };
  }
}
