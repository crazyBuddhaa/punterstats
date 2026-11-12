import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import type { UserProfile } from "@/types";

export type AdminApiAuthResult =
  | { authorized: true; profile: UserProfile; response?: undefined }
  | { authorized: false; profile?: undefined; response: NextResponse };

export async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (profileError) {
    // PGRST116 = "no rows returned" — treat as missing profile, not a crash.
    // Any other code is a genuine DB/network error worth surfacing in logs.
    if (profileError.code !== "PGRST116") {
      console.error("[getUserProfile] DB error:", profileError.code, profileError.message);
    }
    return null;
  }
  if (!data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
    bio: data.bio,
    role: data.role,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/** Redirect to /login if not authenticated. Returns the profile. */
export async function requireAuth(): Promise<UserProfile> {
  const profile = await getUserProfile();
  if (!profile) redirect("/login");
  return profile;
}

/** Redirect to /dashboard if not admin. Returns the admin profile. */
export async function requireAdmin(): Promise<UserProfile> {
  const profile = await requireAuth();
  if (profile.role !== "admin") redirect("/dashboard");
  return profile;
}

/**
 * Verify admin privileges inside API Route Handlers without calling redirect().
 * Returns 401 JSON when unauthenticated, 403 JSON when signed in without admin role.
 */
export async function requireAdminApi(): Promise<AdminApiAuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  const { data, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (profileError || !data || data.role !== "admin") {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: "Forbidden: admin role required" },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    profile: {
      id: data.id,
      userId: data.user_id,
      displayName: data.display_name,
      avatarUrl: data.avatar_url,
      bio: data.bio,
      role: data.role,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  };
}
