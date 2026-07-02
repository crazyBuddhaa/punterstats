import type { Metadata } from "next";
import { User } from "lucide-react";
import { requireAuth } from "@/lib/auth/helpers";
import { ProfileForm } from "@/components/dashboard/profile-form";

export const metadata: Metadata = { title: "Profile Settings — Dashboard — PunterStat" };

export default async function ProfilePage() {
  const profile = await requireAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Profile Settings</h1>
        <p className="mt-1 text-sm text-[#1e293b]/60">
          Update your display name and bio.
        </p>
      </div>

      <div className="max-w-xl rounded-2xl border border-border bg-white p-6 shadow-sm">
        {/* Avatar placeholder */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-600 text-2xl font-bold text-white">
            {(profile.displayName ?? "U").slice(0, 1).toUpperCase()}
          </div>
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
