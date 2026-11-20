/**
 * Subscription-tier access control helpers.
 *
 * Tier hierarchy (lowest → highest):
 *   free (0)  <  pro (1)  <  premium (2)  <  admin (99)
 *
 * Resolution order:
 *   1. profiles.role === "admin" -> "admin" (always passes every check)
 *   2. Active row in public.subscriptions (status in active/trialing):
 *        plan === "premium" -> "premium"
 *        plan === "pro"     -> "pro"
 *   3. Fallback to profiles.role ("premium" | "pro") for admin-granted upgrades
 *   4. Otherwise -> "free"
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/types";

// ── Tier definition ────────────────────────────────────────────────────────

export type SubscriptionTier = "free" | "pro" | "premium" | "admin";

const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 1,
  premium: 2,
  admin: 99,
};

function profileToTier(role: string): SubscriptionTier {
  if (role === "admin") return "admin";
  if (role === "premium") return "premium";
  if (role === "pro") return "pro";
  return "free";
}

function tierRank(tier: SubscriptionTier): number {
  return TIER_RANK[tier] ?? 0;
}

/**
 * Pure tier resolver combining profile role and optional subscription record.
 * Safe to unit test with zero I/O.
 */
export function resolveUserTier(
  profile: Pick<UserProfile, "role"> | null,
  subscription?: { plan?: string | null; status?: string | null } | null,
): SubscriptionTier {
  if (!profile) return "free";
  if (profile.role === "admin") return "admin";

  const isActiveSub =
    subscription?.status === "active" || subscription?.status === "trialing";

  if (isActiveSub) {
    if (subscription?.plan === "premium") return "premium";
    if (subscription?.plan === "pro") return "pro";
  }

  return profileToTier(profile.role ?? "user");
}

/**
 * Pure comparison helper between two resolved tiers.
 */
export function hasPlanAccess(
  current: SubscriptionTier,
  required: SubscriptionTier,
): boolean {
  return tierRank(current) >= tierRank(required);
}

// ── Server helpers ─────────────────────────────────────────────────────────

/**
 * Resolves the effective tier for an already-loaded UserProfile by checking
 * `profiles.role` and any active row in `public.subscriptions`.
 */
export async function getEffectiveTierForProfile(
  profile: UserProfile | null,
): Promise<SubscriptionTier> {
  if (!profile) return "free";
  if (profile.role === "admin") return "admin";

  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", profile.userId)
    .maybeSingle();

  return resolveUserTier(profile, data);
}

/**
 * Returns the subscription tier for the currently authenticated user,
 * or null if unauthenticated.
 */
export async function getCurrentTier(): Promise<SubscriptionTier | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: prof }, { data: sub }] = await Promise.all([
    supabase.from("profiles").select("role").eq("user_id", user.id).single(),
    supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (!prof) return null;
  return resolveUserTier({ role: prof.role ?? "user" }, sub);
}

/**
 * Synchronous role-only check (kept for backward compatibility where only
 * UserProfile is available). For subscription-aware Pro/Premium checks, prefer
 * `getEffectiveTierForProfile(profile)` + `hasPlanAccess(tier, required)`.
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
 */
export async function requireTier(
  required: SubscriptionTier,
): Promise<UserProfile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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

  const tier = await getEffectiveTierForProfile(profile);
  if (!hasPlanAccess(tier, required)) {
    redirect(`/pricing?reason=upgrade-required&plan=${required}`);
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
 */
export function tierLabel(isPremium: boolean): string {
  return isPremium ? " · Premium" : "";
}
