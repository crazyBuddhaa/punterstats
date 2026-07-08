"use client";

import { useTransition, useState } from "react";
import { Bell, CheckCheck, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/dashboard/actions";
import type { DashboardNotification } from "@/lib/dashboard/queries";

interface NotificationsClientProps {
  notifications: DashboardNotification[];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function NotificationsClient({ notifications: initial }: NotificationsClientProps) {
  const [items, setItems] = useState(initial);
  const [isPending, startTransition] = useTransition();

  function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    startTransition(async () => {
      await markNotificationRead(id);
    });
  }

  function markAll() {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    startTransition(async () => {
      await markAllNotificationsRead();
    });
  }

  const unread = items.filter((n) => !n.isRead).length;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white py-16 text-center">
        <div className="mb-4 rounded-2xl bg-slate-100 p-4">
          <Bell className="h-7 w-7 text-[#1e293b]/40" />
        </div>
        <p className="font-semibold text-[#0f172a]">No notifications yet</p>
        <p className="mt-1 text-sm text-[#1e293b]/60">
          You&apos;ll see updates about your learning and account here.
        </p>
      </div>
    );
  }

  return (
    <div>
      {unread > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-[#1e293b]/60">
            <span className="font-semibold text-[#0f172a]">{unread}</span> unread
          </p>
          <button
            onClick={markAll}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-[#1e293b] transition hover:bg-slate-50 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCheck className="h-3.5 w-3.5" />
            )}
            Mark all as read
          </button>
        </div>
      )}

      <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white">
        {items.map((n) => (
          <div
            key={n.id}
            className={`flex items-start gap-4 px-5 py-4 transition-colors ${
              n.isRead ? "bg-white" : "bg-teal-50/50"
            }`}
          >
            {/* Unread dot */}
            <div className="mt-1.5 flex-shrink-0">
              <span
                className={`block h-2 w-2 rounded-full ${
                  n.isRead ? "bg-transparent" : "bg-teal-500"
                }`}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm font-semibold ${n.isRead ? "text-[#1e293b]" : "text-[#0f172a]"}`}>
                  {n.title}
                </p>
                <span className="shrink-0 text-[11px] text-[#1e293b]/40">{timeAgo(n.createdAt)}</span>
              </div>
              <p className="mt-0.5 text-sm text-[#1e293b]/60 leading-relaxed">{n.body}</p>
              <div className="mt-2 flex items-center gap-3">
                {n.link && (
                  <Link
                    href={n.link}
                    className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700"
                  >
                    View <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
                {!n.isRead && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="text-xs text-[#1e293b]/40 hover:text-[#1e293b] transition-colors"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
