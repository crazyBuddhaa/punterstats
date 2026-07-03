import type { Metadata } from "next";
import { User } from "lucide-react";
import { requireAuth } from "@/lib/auth/helpers";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { AvatarUpload } from "@/components/dashboard/avatar-upload";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Profile Settings — Dashboard — PunterStat" };

export default async function ProfilePage() {
  const profile = await requireAuth();

  // Fetch avatar_url from users table
  const supabase = await createClient();
  const { data: userData } = await supabase
    .from("users")
    .select("avatar_url")
    .eq("id", profile.userId)
    .single();
  const avatarUrl = userData?.avatar_url ?? null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Profile Settings</h1>
        <p className="mt-1 text-sm text-[#1e293b]/60">
          Update your display name, bio, and profile photo.
        </p>
      </div>

      <div className="max-w-xl rounded-2xl border border-border bg-white p-6 shadow-sm">
        {/* Avatar upload */}
        <div className="mb-6 flex items-center gap-5">
          <AvatarUpload
            currentUrl={avatarUrl}
            displayName={profile.displayName ?? "User"}
          />
          <div>
            <p className="font-semibold text-[#0f172a]">{profile.displayName ?? "User"}</p>
            <p className="text-sm text-[#1e293b]/50 capitalize">{profile.role} account</p>
          </div>
        </div>

        <div className="mb-6 border-t border-border" />

        <ProfileForm profile={profile} />
      </div>

      {/* Danger zone */}
      <div className="max-w-xl rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <div className="mb-3 flex items-center gap-2">
          <User className="h-4 w-4 text-rose-600" />
          <h2 className="font-semibold text-rose-700">Account</h2>
        </div>
        <p className="text-sm text-rose-700/80">
          To delete your account or request a data export, contact{" "}
          <a href="mailto:support@punterstats.com" className="underline hover:text-rose-800">
            support@punterstats.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
