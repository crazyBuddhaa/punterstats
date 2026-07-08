/**
 * Prediction resolver — matches unresolved prediction_records against
 * historical_matches and writes the actual_result + resolved_at.
 *
 * Matching strategy:
 *   1. Exact match on lower-cased team names + match_date within ±1 day.
 *   2. If no exact match, try pg_trgm similarity >= 0.4 on both team names
 *      within the same ±1 day window.
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
 * Find a historical match for a given prediction.
 * Uses a generous ±36-hour window around the recorded match_date to handle
 * timezone offsets in stored fixtures.
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

  // Exact match (lower-case compare handled by ilike with exact value)
  const { data: exact } = await supabase
    .from("historical_matches")
    .select("id, home_team, away_team, match_date, home_score, away_score")
    .ilike("home_team", homeTeam.trim())
    .ilike("away_team", awayTeam.trim())
    .gte("match_date", from)
    .lte("match_date", to)
    .not("home_score", "is", null)
    .not("away_score", "is", null)
    .limit(1)
    .maybeSingle();

  if (exact) return exact as HistoricalRow;

  // Fuzzy match — pull candidates from the date window, then score in JS
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

  // Jaccard-style token overlap — simple but effective for team name variants
  function similarity(a: string, b: string): number {
    const setA = new Set(a.split(" "));
    const setB = new Set(b.split(" "));
    const intersection = [...setA].filter((t) => setB.has(t)).length;
    const union = new Set([...setA, ...setB]).size;
    return union > 0 ? intersection / union : 0;
  }

  const THRESHOLD = 0.4;
  const scored = candidates
    .map((row) => {
      const h = similarity(normTeam(row.home_team), normHome);
      const a = similarity(normTeam(row.away_team), normAway);
      return { row: row as HistoricalRow, score: (h + a) / 2 };
    })
    .filter((e) => e.score >= THRESHOLD)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.row ?? null;
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
