import { getCachedOdds, writeOddsCache, releaseOddsLock } from "./cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OddsBookmaker, OddsEvent, OddsMarket, OddsOutcome, OddsResult } from "./types";

const ODDS_API_BASE = "https://api.the-odds-api.com/v4";

interface RawOddsApiOutcome {
  name: string;
  price: number;
  point?: number;
}

interface RawOddsApiMarket {
  key: string;
  outcomes: RawOddsApiOutcome[];
}

interface RawOddsApiBookmaker {
  key: string;
  title: string;
  markets: RawOddsApiMarket[];
}

interface RawOddsApiEvent {
  id: string;
  sport_key: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: RawOddsApiBookmaker[];
}

function mapRawEvent(raw: RawOddsApiEvent): OddsEvent {
  const bookmakers: OddsBookmaker[] = raw.bookmakers.map((b) => ({
    key: b.key,
    title: b.title,
    markets: b.markets.map(
      (m): OddsMarket => ({
        key: m.key,
        outcomes: m.outcomes.map(
          (o): OddsOutcome => ({ name: o.name, price: o.price, point: o.point })
        ),
      })
    ),
  }));

  return {
    id: raw.id,
    sportKey: raw.sport_key,
    homeTeam: raw.home_team,
    awayTeam: raw.away_team,
    commenceTime: raw.commence_time,
    bookmakers,
  };
}

/**
 * Fetch odds for a sport using an adaptive 1–2 hour cache backed by Supabase.
 *
 * Cache behaviour (via cache_refresh_locks):
 *   0–1 h since last fetch  →  always served from cache
 *   1–2 h, low traffic      →  still served from cache (stale-while-revalidate)
 *   1–2 h, high traffic     →  one request refreshes; all others get stale
 *   > 2 h                   →  one request refreshes; all others get stale
 *
 * On any API failure the lock is released and stale data is returned so the
 * user experience is not broken by a transient upstream error.
 */
export async function getOdds(
  sportKey: string,
  options?: { forceRefresh?: boolean }
): Promise<OddsResult> {
  let staleEvents: OddsEvent[] = [];

  if (!options?.forceRefresh) {
    const { events, shouldRefresh } = await getCachedOdds(sportKey);
    staleEvents = events;

    if (!shouldRefresh) {
      // Fresh or stale-while-revalidate — serve immediately.
      return { success: true, events, fromCache: true };
    }
    // shouldRefresh = true: this caller holds the lock and must hit the API.
  }

  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) {
    console.warn("[odds/client] ODDS_API_KEY is not set — cannot fetch live odds.");
    await releaseOddsLock(sportKey);
    if (staleEvents.length > 0) {
      return { success: true, events: staleEvents, fromCache: true };
    }
    return { success: false, error: "Odds data is not configured yet" };
  }

  try {
    const url = new URL(`${ODDS_API_BASE}/sports/${sportKey}/odds`);
    url.searchParams.set("apiKey", apiKey);
    url.searchParams.set("regions", "uk,eu");
    url.searchParams.set("markets", "h2h");
    url.searchParams.set("oddsFormat", "decimal");

    const res = await fetch(url.toString());

    // Log quota headers on every live call so we can track exhaustion risk.
    const remaining = res.headers.get("x-requests-remaining");
    const used      = res.headers.get("x-requests-used");
    if (remaining !== null) {
      const rem = parseInt(remaining, 10);
      if (rem < 50) {
        console.warn(
          `[odds/client] ⚠ Odds API quota critically low: ${rem} requests remaining (used: ${used ?? "?"}).`
        );
      } else if (rem < 150) {
        console.warn(
          `[odds/client] Odds API quota getting low: ${rem} remaining (used: ${used ?? "?"}).`
        );
      }

      // Persist the provider-reported remaining count so the Admin Data
      // Health Panel can show real quota status. Best-effort — never let a
      // logging failure break odds fetching.
      try {
        const admin = createAdminClient();
        const now = new Date();
        await admin.from("api_quota_log").insert({
          provider: "odds-api",
          request_count: 1,
          provider_remaining: rem,
          window_start: now.toISOString(),
          window_end: now.toISOString(),
          last_request_at: now.toISOString(),
        });
      } catch (err) {
        console.error("[odds/client] Failed to persist quota log:", err);
      }
    }

    if (!res.ok) {
      // 401 = key invalid; 422 = invalid sport key; 429 = quota exhausted
      const body = await res.text();
      await releaseOddsLock(sportKey);
      if (staleEvents.length > 0) {
        // Serve stale data rather than breaking the user experience.
        return { success: true, events: staleEvents, fromCache: true };
      }
      if (res.status === 429) {
        return { success: false, error: "Odds API quota exhausted — data temporarily unavailable." };
      }
      return { success: false, error: `Odds API error ${res.status}: ${body.slice(0, 200)}` };
    }

    const raw = (await res.json()) as RawOddsApiEvent[];
    const events = raw.map(mapRawEvent);

    // Write cache + release lock (writeLock called inside writeOddsCache).
    // sportKey is passed explicitly so the lock is finalised even on empty payload.
    await writeOddsCache(sportKey, events);

    return { success: true, events, fromCache: false };
  } catch (err) {
    await releaseOddsLock(sportKey);
    if (staleEvents.length > 0) {
      return { success: true, events: staleEvents, fromCache: true };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error fetching odds",
    };
  }
}

/**
 * Convert a decimal odds price into implied probability (0-1).
 * Used by Spot The Value to compare against the analyzer's model probability.
 */
export function impliedProbabilityFromDecimalOdds(decimalOdds: number): number {
  if (decimalOdds <= 1) return 0;
  return 1 / decimalOdds;
}

export interface OddsApiSport {
  key: string;
  group: string;
  title: string;
  description: string;
  active: boolean;
  has_outrights: boolean;
}

/**
 * Fetch the full list of active sports from The Odds API and optionally
 * filter by a search query against title, description, or key.
 * Results are NOT cached — this endpoint is quota-free on The Odds API.
 */
export async function getSports(query?: string): Promise<OddsApiSport[]> {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) return [];

  try {
    const url = new URL(`${ODDS_API_BASE}/sports`);
    url.searchParams.set("apiKey", apiKey);

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) return [];

    const all = (await res.json()) as OddsApiSport[];

    if (!query || query.trim() === "") return all;

    const q = query.toLowerCase();
    return all.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.key.toLowerCase().includes(q)
    );
  } catch {
    return [];
  }
}
