/**
 * Subscription-tier access control helpers.
 *
 * Tier hierarchy (lowest → highest):
 *   free (role = "user")  <  premium (role = "premium")  <  admin
 *
 * Design notes:
 *   • Source of truth for tier is profiles.role, not subscriptions.plan.
 *     The admin panel's updateUserRole action keeps the two in sync.
 *   • All helpers are async Server-only (import from server components /
 *     Server Actions only — they call cookies() internally via createClient).
 *   • Admins pass every tier check automatically.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/types";

// ── Tier definition ────────────────────────────────────────────────────────

export type SubscriptionTier = "free" | "premium" | "admin";

const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  premium: 1,
  admin: 99,
};

function profileToTier(role: string): SubscriptionTier {
  if (role === "admin") return "admin";
  if (role === "premium") return "premium";
  return "free";
}

function tierRank(tier: SubscriptionTier): number {
  return TIER_RANK[tier] ?? 0;
}

// ── Public helpers ─────────────────────────────────────────────────────────

/**
 * Returns the subscription tier for the currently authenticated user,
 * or null if unauthenticated.
 */
export async function getCurrentTier(): Promise<SubscriptionTier | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!data) return null;
  return profileToTier(data.role ?? "user");
}

/**
 * Returns true if the given profile has at least the required tier.
 * Use this for conditional rendering — does NOT redirect.
 *
 * @example
 *   const canAccess = hasTierAccess(profile, "premium");
 */
export function hasTierAccess(
  profile: UserProfile,
  required: SubscriptionTier,
): boolean {
  const current = profileToTier(profile.role ?? "user");
  return tierRank(current) >= tierRank(required);
}

/**
 * Asserts the currently authenticated user has at least `required` tier.
 * Redirects to /pricing if not, /login if unauthenticated.
 *
 * @example
 *   // In a Server Component or Server Action:
 *   const profile = await requireTier("premium");
 */
export async function requireTier(required: SubscriptionTier): Promise<UserProfile> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!data) redirect("/login");

  const profile: UserProfile = {
    id: data.id,
    userId: data.user_id,
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
    bio: data.bio,
    role: data.role,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };

  if (!hasTierAccess(profile, required)) {
    redirect("/pricing?reason=upgrade-required");
  }

  return profile;
}

/**
 * Convenience: require premium or above.
 */
export async function requirePremium(): Promise<UserProfile> {
  return requireTier("premium");
}

/**
 * Check if a premium lesson/course is accessible to the given profile.
 * Returns true for premium users and admins; false for free-tier users.
 */
export function canAccessPremiumContent(profile: UserProfile | null): boolean {
  if (!profile) return false;
  return hasTierAccess(profile, "premium");
}

/**
 * Build a tier-aware metadata description suffix for SEO.
 * Attaches "(Premium)" to the description when the resource is gated.
 */
export function tierLabel(isPremium: boolean): string {
  return isPremium ? " · Premium" : "";
}
