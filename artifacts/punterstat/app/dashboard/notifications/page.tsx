import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/helpers";
import { getNotifications } from "@/lib/dashboard/queries";
import { NotificationsClient } from "@/components/dashboard/notifications-client";

export const metadata: Metadata = { title: "Notifications — Dashboard — PunterStat" };

export default async function NotificationsPage() {
  const profile = await requireAuth();
  const notifications = await getNotifications(profile.userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Notifications</h1>
        <p className="mt-1 text-sm text-[#1e293b]/60">
          Updates about your learning progress and account.
        </p>
      </div>
      <NotificationsClient notifications={notifications} />
    </div>
  );
}
