import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ToolHeroProps {
  icon: LucideIcon;
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
  eyebrow?: string;
}

/** Light editorial page header shared by Bet Analysis / Bet Learning / Bet Assist pages. */
export function ToolHero({
  icon: Icon,
  title,
  description,
  backHref = "/bet-assist",
  backLabel = "Bet Assist",
  eyebrow,
}: ToolHeroProps) {
  return (
    <div className="border-b border-slate-200/80 bg-white">
      <div className="container mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <Link
          href={backHref}
          className="mb-5 inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          {backLabel}
        </Link>
        <div className="flex items-start gap-4">
          <div className="shrink-0 rounded-xl border border-teal-200 bg-teal-50 p-3 text-teal-700">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            {eyebrow && (
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
                {eyebrow}
              </p>
            )}
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
            <p className="mt-2.5 max-w-2xl text-base leading-relaxed text-slate-600">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
