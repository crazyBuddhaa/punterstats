/**
 * Sportradar Soccer v4 — Match (Sport Event) endpoints
 *
 * Endpoints:
 *   GET /{locale}/sport_events/{urn}/summary         → getMatchSummary
 *   GET /{locale}/sport_events/{urn}/timeline        → getMatchTimeline
 *   GET /{locale}/sport_events/{urn}/league_timeline → getMatchLeagueTimeline
 *   GET /{locale}/sport_events/{urn}/lineups         → getMatchLineups
 *   GET /{locale}/sport_events/{urn}/momentum        → getMatchMomentum
 *   GET /{locale}/sport_events/{urn}/fun_facts       → getMatchFunFacts
 *   GET /{locale}/sport_events/created               → getSportEventsCreated
 *   GET /{locale}/sport_events/removed               → getSportEventsRemoved
 *   GET /{locale}/sport_events/updated               → getSportEventsUpdated
 *
 * TTL: summary/timeline 60s during live, 300s post-match.
 * For live polling use the delta endpoint in live.ts instead.
 */

import { srFetch, srPath, getDefaultLocale } from "./client";
import type {
  SportEventSummaryResponse,
  SportEventTimelineResponse,
  SportEventLineupsResponse,
  SportEventMomentumResponse,
  SportEventFunFactsResponse,
  SportEventsCreatedResponse,
  SportEventsRemovedResponse,
  SportEventsUpdatedResponse,
} from "./types";

type Locale = string;

/**
 * Full result + team/player stats for one match.
 * The primary endpoint for post-match data ingestion.
 *
 * Stats depth depends on coverage tier:
 *   Tier 1 → 40+ fields per team + per player (xG, possession, shots, etc.)
 *   Tier 2 → team stats (shots, corners, cards, fouls)
 *   Tier 3 → goals, cards, substitutions only
 */
export async function getMatchSummary(
  sportEventId: string,
  locale: Locale = getDefaultLocale()
) {
  return srFetch<SportEventSummaryResponse>(
    srPath(locale, `/sport_events/${sportEventId}/summary`)
  );
}

/**
 * Summary + full event timeline (goals, cards, subs, VAR, shots, corners…).
 * Extended fields (x/y coordinates, xG per shot, counterattack) available for
 * Tier 1 competitions.
 */
export async function getMatchTimeline(
  sportEventId: string,
  locale: Locale = getDefaultLocale()
) {
  return srFetch<SportEventTimelineResponse>(
    srPath(locale, `/sport_events/${sportEventId}/timeline`)
  );
}

/**
 * Like getMatchTimeline but sourced from official league data feeds
 * (more accurate; delayed vs. live scout feed).
 */
export async function getMatchLeagueTimeline(
  sportEventId: string,
  locale: Locale = getDefaultLocale()
) {
  return srFetch<SportEventTimelineResponse>(
    srPath(locale, `/sport_events/${sportEventId}/league_timeline`)
  );
}

/**
 * Pre-match and confirmed lineups (with formations for Tier 1/2).
 * Available ~60–90 min before kick-off once team sheets are published.
 */
export async function getMatchLineups(
  sportEventId: string,
  locale: Locale = getDefaultLocale()
) {
  return srFetch<SportEventLineupsResponse>(
    srPath(locale, `/sport_events/${sportEventId}/lineups`)
  );
}

/**
 * Momentum graph data — minute-by-minute match control values.
 * Useful for visualising game flow on match pages.
 */
export async function getMatchMomentum(
  sportEventId: string,
  locale: Locale = getDefaultLocale()
) {
  return srFetch<SportEventMomentumResponse>(
    srPath(locale, `/sport_events/${sportEventId}/momentum`)
  );
}

/** AI-generated or scout-derived narrative facts about the match */
export async function getMatchFunFacts(
  sportEventId: string,
  locale: Locale = getDefaultLocale()
) {
  return srFetch<SportEventFunFactsResponse>(
    srPath(locale, `/sport_events/${sportEventId}/fun_facts`)
  );
}

// ── Change feeds ──────────────────────────────────────────────────────────────

/** Sport events created in the last 24 hours (newly added fixtures) */
export async function getSportEventsCreated(
  opts: { offset?: number; start?: number; limit?: number; locale?: Locale } = {}
) {
  const { locale = getDefaultLocale(), ...params } = opts;
  return srFetch<SportEventsCreatedResponse>(
    srPath(locale, "/sport_events/created"),
    { params }
  );
}

/** Sport events removed or disabled */
export async function getSportEventsRemoved(
  opts: { offset?: number; start?: number; limit?: number; locale?: Locale } = {}
) {
  const { locale = getDefaultLocale(), ...params } = opts;
  return srFetch<SportEventsRemovedResponse>(
    srPath(locale, "/sport_events/removed"),
    { params }
  );
}

/** Sport events updated in the last 24 hours (status, score, time changes) */
export async function getSportEventsUpdated(
  opts: { offset?: number; start?: number; limit?: number; locale?: Locale } = {}
) {
  const { locale = getDefaultLocale(), ...params } = opts;
  return srFetch<SportEventsUpdatedResponse>(
    srPath(locale, "/sport_events/updated"),
    { params }
  );
}
