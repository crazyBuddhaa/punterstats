import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface PillarItem {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
}

export function PillarGrid({ items }: { items: PillarItem[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ href, title, description, icon: Icon, badge }) => (
        <Link
          key={href}
          href={href}
          className="group flex flex-col rounded-2xl border border-border bg-white p-6 shadow-sm transition hover:border-[#3D2DFF]/30 hover:shadow-md"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="inline-flex rounded-xl bg-[#3D2DFF]/10 p-2.5">
              <Icon className="h-5 w-5 text-[#3D2DFF]" />
            </div>
            {badge && (
              <span className="rounded-full bg-[#3D2DFF] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                {badge}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-[#0f172a]">{title}</h3>
          <p className="mt-1.5 flex-1 text-sm leading-relaxed text-[#1e293b]/60">{description}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#3D2DFF]">
            Open <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </Link>
      ))}
    </div>
  );
}
