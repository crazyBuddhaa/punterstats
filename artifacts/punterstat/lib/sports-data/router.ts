import { createAdminClient } from "@/lib/supabase/admin";
import { getSportsApiProFixtures } from "./sportsapipro";
import { getFootballDataFixtures } from "./football-data";
import { getFootballDataIoFixtures } from "./footballdata-io";
import type { FixturesResult, SportsDataSource } from "./types";

/**
 * Free-tier quota budgets per provider.
 *
 * SportsAPIPro:  100 req/day — primary source.
 *   The 1–2 hour adaptive cache means we typically issue ≤1 call/hour per
 *   cache group, keeping well within the daily cap. We track a 24-hour
 *   rolling window and gate fallback at 50% of daily budget, same as the
 *   other providers below.
 *
 * footballdata.io:  1 000 req/month → ~33/day — secondary source.
 *   Used only when SportsAPIPro fails outright or its budget is too low.
 *
 * football-data.org:  10 req/min, NO monthly cap — tertiary/last-resort source.
 *   Used only when both of the above fail. Covers PL, La Liga, Bundesliga,
 *   Serie A, Ligue 1.
 */
const QUOTAS: Record<SportsDataSource, { limit: number; windowMs: number }> = {
  "sportsapipro":    { limit: 100, windowMs: 24 * 60 * 60 * 1000 },   // 100 req/day
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
 * Whether a provider still has headroom under the same 50%-of-budget
 * threshold used for fixtures fallback. Used by on-demand features (e.g.
 * match enrichment) that have no fallback provider of their own, so they
 * skip gracefully instead of pushing SportsAPIPro over budget.
 */
export async function hasQuotaHeadroom(source: SportsDataSource): Promise<boolean> {
  const usage = await getUsage(source);
  return usage < QUOTAS[source].limit * RECOVERY_THRESHOLD;
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

/**
 * Exposed so on-demand, non-fallback-able features (e.g. the SportsAPIPro
 * match-enrichment lookup) can check remaining budget before spending calls
 * that have no fallback provider.
 */
export async function getUsage(source: SportsDataSource): Promise<number> {
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
 * Get fixtures using SportsAPIPro as the primary source (100 req/day,
 * adaptive cache keeps actual usage ≤1 call/hour per cache group), falling
 * back to footballdata.io (1 000 req/month) and then football-data.org (no
 * monthly cap, 10 req/min) when a higher-priority source fails or its daily
 * budget is too low.
 *
 * Routing rules:
 *   1. Check SportsAPIPro's rolling 24-hour usage first.
 *   2. If usage < 50% of daily limit, call SportsAPIPro — return on success.
 *   3. If SportsAPIPro fails OR budget is at/above threshold, try
 *      footballdata.io under the same 50% threshold rule.
 *   4. If that also fails or is throttled, call football-data.org (covers
 *      PL, La Liga, Bundesliga, Serie A, Ligue 1).
 *   5. If all three fail, surface the combined errors.
 *
 * Callers should always go through this function — never call individual
 * provider clients directly — so quota tracking and fallback stay consistent.
 */
export async function getFixtures(options?: {
  league?: string;
  search?: string;
  forceRefresh?: boolean;
}): Promise<FixturesResult> {
  const errors: string[] = [];

  // ── Primary: SportsAPIPro (100 req/day) ──────────────────────────────────
  const proUsage = await getUsage("sportsapipro");
  const proLimit = QUOTAS["sportsapipro"].limit;

  if (proUsage < proLimit * RECOVERY_THRESHOLD) {
    const proResult = await getSportsApiProFixtures(options);
    if (proResult.success) return proResult;
    errors.push(`Primary (SportsAPIPro): ${proResult.error}`);
  }

  // ── Secondary: footballdata.io (monthly-capped) ──────────────────────────
  const secondaryUsage = await getUsage("footballdata-io");
  const secondaryLimit = QUOTAS["footballdata-io"].limit;

  if (secondaryUsage < secondaryLimit * RECOVERY_THRESHOLD) {
    const secondaryResult = await getFootballDataIoFixtures(options);
    if (secondaryResult.success) return secondaryResult;
    errors.push(`Secondary (footballdata.io): ${secondaryResult.error}`);
  }

  // ── Tertiary: football-data.org (unlimited) ──────────────────────────────
  const fallbackResult = await getFootballDataFixtures(options);
  if (fallbackResult.success) return fallbackResult;
  errors.push(`Tertiary (football-data.org): ${fallbackResult.error}`);

  // All providers failed — combine errors so callers and logs get the full picture.
  return { success: false, error: errors.join(" | ") };
}
