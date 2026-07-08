import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white py-16 text-center">
      <div className="mb-4 rounded-2xl bg-slate-100 p-4">
        <Icon className="h-7 w-7 text-[#1e293b]/40" />
      </div>
      <p className="mb-1 font-semibold text-[#0f172a]">{title}</p>
      <p className="mb-5 max-w-xs text-sm text-[#1e293b]/60">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
