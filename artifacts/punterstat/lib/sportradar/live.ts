/**
 * Sportradar Soccer v4 — Live endpoints
 *
 * Endpoints:
 *   GET /{locale}/schedules/live/schedules       → getLiveSchedules
 *   GET /{locale}/schedules/live/summaries       → getLiveSummaries
 *   GET /{locale}/schedules/live/timelines       → getLiveTimelines
 *   GET /{locale}/schedules/live/timelines_delta → getLiveTimelinesDelta
 *
 * Match window: fixtures appear 10 min before kick-off, disappear 10 min
 * after full time.
 *
 * ── Polling guidance ──────────────────────────────────────────────────────────
 * Non-live day   → no need to poll these endpoints at all
 * Before kick-off → getLiveSchedules once every 60s
 * In play         → getLiveTimelinesDelta every 10–15s (returns ONLY events
 *                   that changed in the last 10 seconds, very efficient)
 * Full time       → getLiveSummaries once to capture final stats
 *
 * Push streams (getStreamEvents / getStreamStatistics) deliver the same data
 * as a Server-Sent Event without polling — but require the Realtime add-on.
 * See the Sportradar docs to upgrade: developer.sportradar.com.
 */

import { srFetch, srPath, getDefaultLocale } from "./client";
import type {
  LiveSchedulesResponse,
  LiveSummariesResponse,
  LiveTimelinesResponse,
  LiveTimelinesDeltaResponse,
} from "./types";

type Locale = string;

/**
 * All live fixtures right now — schedule metadata only (no score or stats).
 * Useful to know which matches are currently in play.
 */
export async function getLiveSchedules(locale: Locale = getDefaultLocale()) {
  return srFetch<LiveSchedulesResponse>(
    srPath(locale, "/schedules/live/schedules")
  );
}

/**
 * Live summaries — current score + team stats for every in-play match.
 * Pull once per minute during live matches; stats update every ~30s.
 */
export async function getLiveSummaries(locale: Locale = getDefaultLocale()) {
  return srFetch<LiveSummariesResponse>(
    srPath(locale, "/schedules/live/summaries")
  );
}

/**
 * Full timelines for every live match — all events from kick-off to now.
 * Expensive: returns the complete timeline for every live match.
 * Prefer getLiveTimelinesDelta for efficient polling.
 */
export async function getLiveTimelines(locale: Locale = getDefaultLocale()) {
  return srFetch<LiveTimelinesResponse>(
    srPath(locale, "/schedules/live/timelines")
  );
}

/**
 * Delta timelines — ONLY events from the last 10 seconds, for matches
 * where something actually happened. The most efficient live polling option:
 * - Empty response ⟹ nothing changed, no work needed
 * - Non-empty ⟹ process only the changed events
 *
 * Recommended polling interval: 10s
 */
export async function getLiveTimelinesDelta(locale: Locale = getDefaultLocale()) {
  return srFetch<LiveTimelinesDeltaResponse>(
    srPath(locale, "/schedules/live/timelines_delta")
  );
}
