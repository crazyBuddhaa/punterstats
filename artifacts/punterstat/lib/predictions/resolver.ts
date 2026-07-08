/**
 * Prediction resolver — matches unresolved prediction_records against
 * historical_matches and writes the actual_result + resolved_at.
 *
 * Matching strategy:
 *   1. Exact (case-insensitive) match on normalised team names + ±36 h window.
 *   2. If no exact match, fetch candidates from the same window and rank by
 *      Jaccard token-overlap (threshold ≥ 0.4).
 *      – If the top two candidates are within 0.05 score of each other the
 *        match is considered ambiguous and the row is left unresolved rather
 *        than risking a wrong outcome that corrupts calibration.
 *
 * Called by the /api/cron/resolve-predictions endpoint.
 */

import { createAdminClient } from "@/lib/supabase/admin";

export interface ResolutionResult {
  processed: number;
  resolved: number;
  unmatched: number;
  errors: number;
}

type HistoricalRow = {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  home_score: number | null;
  away_score: number | null;
};

function toOutcome(
  homeScore: number,
  awayScore: number
): "home_win" | "draw" | "away_win" {
  if (homeScore > awayScore) return "home_win";
  if (homeScore < awayScore) return "away_win";
  return "draw";
}

function normTeam(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Strip SQL wildcard characters before using a string in an ilike query.
 * Team names never legitimately contain % or _ so this is safe to drop them.
 */
function safeLike(name: string): string {
  return name.trim().replace(/[%_\\]/g, "");
}

/**
 * Jaccard similarity on space-tokenised strings.
 */
function jaccard(a: string, b: string): number {
  const setA = new Set(a.split(" ").filter(Boolean));
  const setB = new Set(b.split(" ").filter(Boolean));
  if (setA.size === 0 && setB.size === 0) return 1;
  const intersection = [...setA].filter((t) => setB.has(t)).length;
  const union = new Set([...setA, ...setB]).size;
  return union > 0 ? intersection / union : 0;
}

/**
 * Find a historical match for a given prediction.
 *
 * Uses a generous ±36 h window to handle timezone offsets in stored fixtures.
 * Returns null when the match can't be identified unambiguously.
 */
async function findHistoricalMatch(
  supabase: ReturnType<typeof createAdminClient>,
  homeTeam: string,
  awayTeam: string,
  matchDate: string
): Promise<HistoricalRow | null> {
  const dt = new Date(matchDate);
  const from = new Date(dt.getTime() - 36 * 60 * 60 * 1000).toISOString();
  const to   = new Date(dt.getTime() + 36 * 60 * 60 * 1000).toISOString();

  // ── Exact (case-insensitive) match ─────────────────────────────────────────
  // We use ilike with sanitised names to prevent % / _ wildcard expansion.
  const safeHome = safeLike(homeTeam);
  const safeAway = safeLike(awayTeam);

  const { data: exact } = await supabase
    .from("historical_matches")
    .select("id, home_team, away_team, match_date, home_score, away_score")
    .ilike("home_team", safeHome)
    .ilike("away_team", safeAway)
    .gte("match_date", from)
    .lte("match_date", to)
    .not("home_score", "is", null)
    .not("away_score", "is", null)
    .limit(1)
    .maybeSingle();

  if (exact) return exact as HistoricalRow;

  // ── Fuzzy match — fetch candidates, rank in JS ─────────────────────────────
  const { data: candidates } = await supabase
    .from("historical_matches")
    .select("id, home_team, away_team, match_date, home_score, away_score")
    .gte("match_date", from)
    .lte("match_date", to)
    .not("home_score", "is", null)
    .not("away_score", "is", null)
    .limit(50);

  if (!candidates?.length) return null;

  const normHome = normTeam(homeTeam);
  const normAway = normTeam(awayTeam);

  const THRESHOLD = 0.4;
  // Ambiguity gap: if two candidates are within this score of each other we
  // refuse to pick a winner to avoid writing a wrong outcome.
  const AMBIGUITY_GAP = 0.05;

  const scored = candidates
    .map((row) => {
      const h = jaccard(normTeam(row.home_team), normHome);
      const a = jaccard(normTeam(row.away_team), normAway);
      const combined = (h + a) / 2;

      // Tie-break 1: prefer the candidate whose date is closest to matchDate.
      const dateDeltaMs = Math.abs(new Date(row.match_date).getTime() - dt.getTime());

      return { row: row as HistoricalRow, score: combined, dateDeltaMs };
    })
    .filter((e) => e.score >= THRESHOLD)
    // Primary sort: highest score; secondary: closest date.
    .sort((a, b) =>
      b.score !== a.score
        ? b.score - a.score
        : a.dateDeltaMs - b.dateDeltaMs
    );

  if (scored.length === 0) return null;

  // If the second-best candidate is nearly as good as the best, the match is
  // ambiguous — return null rather than risk corrupting calibration data.
  if (
    scored.length >= 2 &&
    scored[0].score - scored[1].score < AMBIGUITY_GAP
  ) {
    return null;
  }

  return scored[0].row;
}

/**
 * Resolve all unresolved predictions whose match_date is at least 2 hours
 * in the past. Matches against historical_matches and writes actual_result.
 *
 * Safe to call multiple times — already-resolved rows are skipped by the
 * `actual_result IS NULL` filter.
 */
export async function resolveUnresolved(
  options?: { limit?: number }
): Promise<ResolutionResult> {
  const supabase = createAdminClient();
  const limit = options?.limit ?? 200;

  const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  // Fetch unresolved predictions with a known match_date in the past
  const { data: pending, error } = await supabase
    .from("prediction_records")
    .select("id, home_team, away_team, match_date")
    .is("actual_result", null)
    .not("match_date", "is", null)
    .lte("match_date", cutoff)
    .order("match_date", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[resolver] Failed to fetch pending predictions:", error.message);
    return { processed: 0, resolved: 0, unmatched: 0, errors: 1 };
  }

  const rows = pending ?? [];
  let resolved = 0;
  let unmatched = 0;
  let errors = 0;

  for (const row of rows) {
    try {
      const match = await findHistoricalMatch(
        supabase,
        row.home_team,
        row.away_team,
        row.match_date!
      );

      if (!match || match.home_score === null || match.away_score === null) {
        unmatched++;
        continue;
      }

      const actualResult = toOutcome(match.home_score, match.away_score);
      const { error: updateError } = await supabase
        .from("prediction_records")
        .update({
          actual_result: actualResult,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", row.id);

      if (updateError) {
        console.error("[resolver] Update failed for row", row.id, updateError.message);
        errors++;
      } else {
        resolved++;
      }
    } catch (err) {
      console.error("[resolver] Unexpected error for row", row.id, err);
      errors++;
    }
  }

  return { processed: rows.length, resolved, unmatched, errors };
}
