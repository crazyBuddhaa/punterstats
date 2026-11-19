/**
 * Subscription-tier access control helpers.
 *
 * Tier hierarchy (lowest → highest):
 *   free  <  pro (₦700/mo)  <  premium (₦1,500/mo)  <  admin
 *
 * Design notes:
 *   • Active subscriptions.plan ("free" | "pro" | "premium") is attached to
 *     UserProfile.plan by getUserProfile(). Legacy admin-granted
 *     profiles.role === "premium" continues to map to "premium".
 *   • Admins pass every tier check automatically.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PlanTier, UserProfile } from "@/types";

// ── Tier definition ────────────────────────────────────────────────────────

export type SubscriptionTier = "free" | "pro" | "premium" | "admin";

const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 1,
  premium: 2,
  admin: 99,
};

export function resolveSubscriptionTier(
  profile: Pick<UserProfile, "role" | "plan">,
): SubscriptionTier {
  if (profile.role === "admin") return "admin";
  if (profile.plan === "premium") return "premium";
  if (profile.plan === "pro") return "pro";
  if (profile.role === "premium") return "premium";
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

  const [{ data: profile }, { data: sub }] = await Promise.all([
    supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (!profile) return null;

  const isActiveSub = sub && (sub.status === "active" || sub.status === "trialing");
  const plan: PlanTier =
    isActiveSub && sub.plan === "premium"
      ? "premium"
      : isActiveSub && sub.plan === "pro"
        ? "pro"
        : profile.role === "premium"
          ? "premium"
          : "free";

  return resolveSubscriptionTier({ role: profile.role ?? "user", plan });
}

/**
 * Returns true if the given profile has at least the required tier.
 * Use this for conditional rendering — does NOT redirect.
 *
 * @example
 *   const canAccessPro = hasTierAccess(profile, "pro");
 *   const canAccessPremium = hasTierAccess(profile, "premium");
 */
export function hasTierAccess(
  profile: Pick<UserProfile, "role" | "plan">,
  required: SubscriptionTier,
): boolean {
  const current = resolveSubscriptionTier(profile);
  return tierRank(current) >= tierRank(required);
}

/**
 * Asserts the currently authenticated user has at least `required` tier.
 * Redirects to /pricing if not, /login if unauthenticated.
 */
export async function requireTier(required: SubscriptionTier): Promise<UserProfile> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data }, { data: sub }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (!data) redirect("/login");

  const isActiveSub = sub && (sub.status === "active" || sub.status === "trialing");
  const plan: PlanTier =
    isActiveSub && sub.plan === "premium"
      ? "premium"
      : isActiveSub && sub.plan === "pro"
        ? "pro"
        : data.role === "premium"
          ? "premium"
          : "free";

  const profile: UserProfile = {
    id: data.id,
    userId: data.user_id,
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
    bio: data.bio,
    role: data.role,
    plan,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };

  if (!hasTierAccess(profile, required)) {
    redirect(`/pricing?reason=upgrade-required&required=${required}`);
  }

  return profile;
}

/** Convenience: require pro or above. */
export async function requirePro(): Promise<UserProfile> {
  return requireTier("pro");
}

/** Convenience: require premium or above. */
export async function requirePremium(): Promise<UserProfile> {
  return requireTier("premium");
}

/** Check if a pro-tier tool is accessible to the given profile. */
export function canAccessProContent(profile: UserProfile | null): boolean {
  if (!profile) return false;
  return hasTierAccess(profile, "pro");
}

/** Check if a premium lesson/tool is accessible to the given profile. */
export function canAccessPremiumContent(profile: UserProfile | null): boolean {
  if (!profile) return false;
  return hasTierAccess(profile, "premium");
}

/**
 * Build a tier-aware metadata description suffix for SEO.
 */
export function tierLabel(isPremium: boolean): string {
  return isPremium ? " · Premium" : "";
}
