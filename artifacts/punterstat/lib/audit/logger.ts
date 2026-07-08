/**
 * Server-side audit logger.
 *
 * Uses the Supabase service-role client so writes bypass RLS and always
 * succeed — even from contexts where the calling user has no INSERT grant
 * on audit_logs (which is intentional: clients must not be able to forge
 * audit records, so the INSERT policy is omitted from migration 010).
 *
 * Import pattern — Server Actions and Route Handlers only:
 *   import { audit, AuditAction } from "@/lib/audit/logger";
 *   await audit(userId, AuditAction.USER_LOGIN, "auth");
 */

import { createAdminClient } from "@/lib/supabase/admin";

// ── Action constants ────────────────────────────────────────────────────────
// Kept as a plain object (not enum) so it tree-shakes cleanly and is
// easy to extend without a migration.
export const AuditAction = {
  // Auth lifecycle
  USER_REGISTERED: "user_registered",
  USER_LOGIN: "user_login",
  USER_LOGOUT: "user_logout",
  PASSWORD_RESET_REQUESTED: "password_reset_requested",
  PASSWORD_UPDATED: "password_updated",

  // Profile
  PROFILE_UPDATED: "profile_updated",
  AVATAR_UPDATED: "avatar_updated",

  // Subscription / access
  SUBSCRIPTION_CHANGED: "subscription_changed",
  ROLE_CHANGED: "role_changed",

  // Content mutations (admin)
  CONTENT_CREATED: "create",
  CONTENT_UPDATED: "update",
  CONTENT_DELETED: "delete",
  CONTENT_PUBLISHED: "publish",
  CONTENT_UNPUBLISHED: "unpublish",

  // Feature flags (admin)
  FLAG_ENABLED: "enable_flag",
  FLAG_DISABLED: "disable_flag",

  // User activity
  PREDICTION_SAVED: "prediction_saved",
  SIMULATION_RUN: "simulation_run",
  MATCH_ANALYSIS_SAVED: "match_analysis_saved",
} as const;

export type AuditActionValue = (typeof AuditAction)[keyof typeof AuditAction];

// ── Logger ──────────────────────────────────────────────────────────────────

/**
 * Writes one row to public.audit_logs via the service-role client.
 *
 * Failures are swallowed with a console.error — audit logging must never
 * crash a user-facing action. If you need guaranteed delivery, swap the
 * Supabase insert for a durable queue (Inngest, Upstash QStash, etc.).
 *
 * @param userId     The auth.users.id of the acting user.
 * @param action     One of AuditAction or a freeform string.
 * @param entityType Logical resource type: "auth", "user", "blog_post", …
 * @param entityId   Optional UUID of the affected row.
 * @param metadata   Optional structured payload (sanitise before passing —
 *                   never include passwords, tokens, or PII).
 */
export async function audit(
  userId: string,
  action: AuditActionValue | string,
  entityType: string,
  entityId?: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("audit_logs").insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId ?? null,
      metadata: metadata ?? null,
    });
    if (error) {
      console.error("[audit] insert failed:", error.message, { userId, action, entityType });
    }
  } catch (err) {
    console.error("[audit] unexpected error:", err);
  }
}
