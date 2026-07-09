/**
 * Server-side product analytics tracker.
 *
 * Separate from lib/audit/logger.ts (security/audit trail). This module
 * captures user-facing product events — lesson completions, simulator runs,
 * saved analyses, value-comparison views — that feed later features
 * (Calibration Dashboard trend context, Learning Path Recommendations).
 *
 * Uses the service-role client so writes bypass RLS and never fail due to
 * missing client-side INSERT grants — mirrors lib/audit/logger.ts.
 *
 * Import pattern — Server Actions and Route Handlers only:
 *   import { trackEvent, AnalyticsEvent } from "@/lib/analytics/tracker";
 *   await trackEvent(userId, AnalyticsEvent.LESSON_COMPLETED, { lessonId });
 */

import { createAdminClient } from "@/lib/supabase/admin";

export const AnalyticsEvent = {
  LESSON_COMPLETED: "lesson_completed",
  SIMULATOR_RUN: "simulator_run",
  MATCH_ANALYSIS_SAVED: "match_analysis_saved",
  VALUE_COMPARISON_VIEWED: "value_comparison_viewed",
} as const;

export type AnalyticsEventValue = (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

/**
 * Writes one row to public.analytics_events via the service-role client.
 *
 * Failures are swallowed with a console.error — analytics tracking must
 * never crash a user-facing action.
 *
 * @param userId     The auth.users.id of the acting user, or null for
 *                   anonymous/unauthenticated events (e.g. a logged-out
 *                   user viewing Spot The Value).
 * @param eventName  One of AnalyticsEvent or a freeform string.
 * @param properties Optional structured payload (sanitise before passing —
 *                   never include passwords, tokens, or PII).
 */
export async function trackEvent(
  userId: string | null,
  eventName: AnalyticsEventValue | string,
  properties?: Record<string, unknown>,
): Promise<void> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("analytics_events").insert({
      user_id: userId,
      event_name: eventName,
      properties: properties ?? null,
    });
    if (error) {
      console.error("[analytics] insert failed:", error.message, { userId, eventName });
    }
  } catch (err) {
    console.error("[analytics] unexpected error:", err);
  }
}
