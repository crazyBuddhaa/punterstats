import type { Metadata } from "next";
import Link from "next/link";
import { User, KeyRound, CreditCard } from "lucide-react";
import { requireAuth } from "@/lib/auth/helpers";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { AvatarUpload } from "@/components/dashboard/avatar-upload";
import { WeeklyReportToggle } from "@/components/dashboard/weekly-report-toggle";
import { BetCsvImportPanel, type BookmakerSummary } from "@/components/bet-assist/bet-csv-import";
import { getJournal } from "@/lib/bet-assist/journal-actions";
import { getWeeklyReportPreference } from "@/lib/report-card/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Profile Settings — Dashboard — PunterStat" };

export default async function ProfilePage() {
  const profile = await requireAuth();

  // Fetch avatar_url, weekly report email preference, and bet counts per bookmaker
  const supabase = await createClient();
  const [{ data: userData }, weeklyReportEnabled, bets] = await Promise.all([
    supabase
      .from("users")
      .select("avatar_url")
      .eq("id", profile.userId)
      .single(),
    getWeeklyReportPreference(),
    getJournal(),
  ]);
  const avatarUrl = userData?.avatar_url ?? null;

  const bookieMap = new Map<string, number>();
  for (const b of bets) {
    const label = b.bookmaker?.trim() || "Unspecified";
    bookieMap.set(label, (bookieMap.get(label) ?? 0) + 1);
  }
  const bookmakerCounts: BookmakerSummary[] = Array.from(bookieMap.entries())
    .map(([bookmaker, count]) => ({ bookmaker, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Profile Settings</h1>
        <p className="mt-1 text-sm text-[#1e293b]/60">
          Manage your profile, betting history data by bookmaker, and email preferences.
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

      {/* Betting History & Bookmaker Data (shared across Bet Tracker, Report Card & Recommendations) */}
      <div className="max-w-xl">
        <BetCsvImportPanel
          bookmakerCounts={bookmakerCounts}
          className="rounded-2xl border border-border bg-white p-6 shadow-sm space-y-4"
        />
      </div>

      {/* Email preferences */}
      <WeeklyReportToggle initialEnabled={weeklyReportEnabled} />

      {/* Security & Billing shortcuts */}
      <div className="max-w-xl rounded-2xl border border-border bg-white p-6 shadow-sm space-y-3">
        <h2 className="font-semibold text-[#0f172a]">Security &amp; Billing</h2>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/update-password"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-xs font-semibold text-[#0f172a] transition hover:bg-slate-50"
          >
            <KeyRound className="h-3.5 w-3.5 text-[#3D2DFF]" />
            Change Password
          </Link>
          <Link
            href="/dashboard/subscription"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-xs font-semibold text-[#0f172a] transition hover:bg-slate-50"
          >
            <CreditCard className="h-3.5 w-3.5 text-teal-600" />
            Manage Subscription
          </Link>
        </div>
      </div>

      {/* Danger zone */}
      <div className="max-w-xl rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <div className="mb-3 flex items-center gap-2">
          <User className="h-4 w-4 text-rose-600" />
          <h2 className="font-semibold text-rose-700">Account</h2>
        </div>
        <p className="text-sm text-rose-700/80">
          To delete your account or request a data export, contact{" "}
          <a href="mailto:support@punterstat.site" className="underline hover:text-rose-800">
            support@punterstat.site
          </a>
          .
        </p>
      </div>
    </div>
  );
}
