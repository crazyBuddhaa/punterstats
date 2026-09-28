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

/** Dark page header shared by Bet Analysis / Bet Learning / Bet Assist pages. */
export function ToolHero({
  icon: Icon,
  title,
  description,
  backHref = "/bet-assist",
  backLabel = "Bet Assist",
  eyebrow,
}: ToolHeroProps) {
  return (
    <div className="border-b border-white/10 bg-[#0f172a]">
      <div className="container mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <Link
          href={backHref}
          className="mb-6 inline-flex items-center gap-1 text-xs text-white/40 transition hover:text-white/70"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          {backLabel}
        </Link>
        <div className="flex items-start gap-4">
          <div className="shrink-0 rounded-xl bg-[#3D2DFF]/20 p-3">
            <Icon className="h-7 w-7 text-[#3D2DFF]" />
          </div>
          <div>
            {eyebrow && (
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#3D2DFF]">{eyebrow}</p>
            )}
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/60">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
