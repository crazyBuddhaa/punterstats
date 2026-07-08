"use client";

import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth";
import type { UserProfile } from "@/types";

function rowToProfile(row: Record<string, unknown>): UserProfile {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    displayName: row.display_name as string | null,
    avatarUrl: row.avatar_url as string | null,
    bio: row.bio as string | null,
    role: row.role as UserProfile["role"],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
  return data ? rowToProfile(data) : null;
}

type AuthUser = {
  id: string;
  email?: string;
  created_at: string;
  // Supabase types user_metadata as Record<string, unknown>
  user_metadata: Record<string, unknown>;
};

/** Build a minimal profile from Supabase auth user metadata.
 *  Used when the profiles row doesn't exist yet (e.g. first OAuth login
 *  before the DB trigger has run) so the user isn't falsely logged out. */
function profileFromAuthUser(user: AuthUser): UserProfile {
  const meta = user.user_metadata;
  const displayName =
    (meta?.full_name as string | undefined) ??
    (meta?.display_name as string | undefined) ??
    user.email?.split("@")[0] ??
    null;
  return {
    id: user.id,
    userId: user.id,
    displayName,
    avatarUrl: (meta?.avatar_url as string | undefined) ?? null,
    bio: null,
    role: "user",
    createdAt: user.created_at,
    updatedAt: user.created_at,
  };
}

function AuthSync() {
  const setUser = useAuthStore((s) => s.setUser);
  const signOutStore = useAuthStore((s) => s.signOut);

  useEffect(() => {
    const supabase = createClient();

    // Sync on mount — picks up persisted session
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const profile = await fetchProfile(user.id);
        // Fall back to a minimal profile built from auth metadata so the user
        // is never falsely logged out when their profiles row is missing
        // (e.g. first OAuth login before the DB trigger has committed).
        setUser(profile ?? profileFromAuthUser(user as AuthUser));
      } else {
        signOutStore();
      }
    });

    // Keep store in sync with Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user) {
          const profile = await fetchProfile(session.user.id);
          setUser(profile ?? profileFromAuthUser(session.user as AuthUser));
        } else if (event === "SIGNED_OUT") {
          signOutStore();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, signOutStore]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={200}>
      <AuthSync />
      {children}
      <Toaster />
    </TooltipProvider>
  );
}
