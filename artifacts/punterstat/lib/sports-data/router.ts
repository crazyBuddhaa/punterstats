import { createAdminClient } from "@/lib/supabase/admin";
import { getFootballDataFixtures } from "./football-data";
import { getFootballDataIoFixtures } from "./footballdata-io";
import type { FixturesResult, SportsDataSource } from "./types";

/**
 * Free-tier quota budgets per provider.
 *
 * footballdata.io:  1 000 req/month → ~33/day — primary source.
 *   The 1–2 hour adaptive cache means we typically issue ≤1 call/hour per
 *   cache group, keeping well within the monthly cap. We track a 24-hour
 *   rolling window and gate fallback at 50% of daily budget.
 *
 * football-data.org:  10 req/min, NO monthly cap — fallback source.
 *   Used only when footballdata.io fails outright or its budget is too low.
 *   Covers PL, La Liga, Bundesliga, Serie A, Ligue 1.
 */
const QUOTAS: Record<SportsDataSource, { limit: number; windowMs: number }> = {
  "footballdata-io": { limit: 33, windowMs: 24 * 60 * 60 * 1000 },    // ~33 req/day
  "football-data":   { limit: 10, windowMs: 60 * 1000 },              // 10 req/min
};

/**
 * Hysteresis threshold: once footballdata.io's daily usage reaches this
 * fraction of its limit, switch to football-data.org until usage drops back.
 */
const RECOVERY_THRESHOLD = 0.5;

function currentWindow(source: SportsDataSource): { start: Date; end: Date } {
  const { windowMs } = QUOTAS[source];
  const now = Date.now();
  const start = new Date(Math.floor(now / windowMs) * windowMs);
  const end = new Date(start.getTime() + windowMs);
  return { start, end };
}

/**
 * Record one API call against a provider's current quota window.
 * Each provider client calls this after every live (non-cached) request.
 */
export async function recordApiUsage(source: SportsDataSource): Promise<void> {
  const supabase = createAdminClient();
  const { start, end } = currentWindow(source);

  const { data: existing } = await supabase
    .from("api_quota_log")
    .select("id, request_count")
    .eq("provider", source)
    .eq("window_start", start.toISOString())
    .maybeSingle();

  if (existing) {
    await supabase
      .from("api_quota_log")
      .update({
        request_count: existing.request_count + 1,
        last_request_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("api_quota_log").insert({
      provider: source,
      request_count: 1,
      window_start: start.toISOString(),
      window_end: end.toISOString(),
    });
  }
}

async function getUsage(source: SportsDataSource): Promise<number> {
  const supabase = createAdminClient();
  const { start } = currentWindow(source);

  const { data } = await supabase
    .from("api_quota_log")
    .select("request_count")
    .eq("provider", source)
    .eq("window_start", start.toISOString())
    .maybeSingle();

  return data?.request_count ?? 0;
}

/**
 * Get fixtures using footballdata.io as the primary source (1 000 req/month,
 * adaptive cache keeps actual usage ≤1 call/hour per cache group) and falling
 * back to football-data.org (no monthly cap, 10 req/min) when the primary
 * fails or its daily budget is too low.
 *
 * Routing rules:
 *   1. Check footballdata.io's rolling 24-hour usage first.
 *   2. If usage < 50% of daily limit, call footballdata.io — return on success.
 *   3. If footballdata.io fails OR budget is at/above threshold, call
 *      football-data.org (covers PL, La Liga, Bundesliga, Serie A, Ligue 1).
 *   4. If both fail, surface the footballdata.io error.
 *
 * Callers should always go through this function — never call individual
 * provider clients directly — so quota tracking and fallback stay consistent.
 */
export async function getFixtures(options?: {
  league?: string;
  search?: string;
  forceRefresh?: boolean;
}): Promise<FixturesResult> {
  // ── Primary: footballdata.io (monthly-capped) ────────────────────────────
  const primaryUsage = await getUsage("footballdata-io");
  const primaryLimit = QUOTAS["footballdata-io"].limit;

  if (primaryUsage < primaryLimit * RECOVERY_THRESHOLD) {
    const primaryResult = await getFootballDataIoFixtures(options);
    if (primaryResult.success) return primaryResult;
    // Primary failed — fall through to secondary.
  }

  // ── Fallback: football-data.org (unlimited) ──────────────────────────────
  return getFootballDataFixtures(options);
}
