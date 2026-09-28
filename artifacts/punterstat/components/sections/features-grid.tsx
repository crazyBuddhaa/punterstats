import Link from "next/link";
import { ArrowRight, BarChart3, GraduationCap, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { PILLARS } from "@/lib/bet-assist/pillars";

const ICONS = { analysis: BarChart3, learning: GraduationCap, assist: Target } as const;

interface FeaturesGridProps {
  className?: string;
}

/** Homepage: the three pillars, each with its tools. */
export function FeaturesGrid({ className }: FeaturesGridProps) {
  return (
    <section className={cn("bg-[#f8fafc] py-20 sm:py-28", className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#3D2DFF]">
            Everything in one place
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">
            Bet Analysis. Bet Learning. Bet Assist.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#1e293b]/60">
            Three pillars built around one idea: better bets come from better information, better
            understanding and better discipline.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {PILLARS.map((pillar) => {
            const Icon = ICONS[pillar.key];
            const accent = pillar.key === "assist";
            return (
              <div
                key={pillar.key}
                className={cn(
                  "flex flex-col rounded-2xl border p-7 transition-shadow hover:shadow-md",
                  accent ? "border-[#3D2DFF]/30 bg-[#3D2DFF]/5" : "border-[#0f172a]/8 bg-white",
                )}
              >
                <div
                  className={cn(
                    "mb-5 flex h-11 w-11 items-center justify-center rounded-xl",
                    accent ? "bg-[#3D2DFF] text-white" : "bg-[#0f172a]/6 text-[#3D2DFF]",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-[#0f172a]">{pillar.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#1e293b]/60">{pillar.tagline}</p>
                <ul className="mt-5 flex-1 space-y-3">
                  {pillar.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="group block">
                        <span className="text-sm font-medium text-[#0f172a] group-hover:text-[#3D2DFF]">
                          {l.label}
                        </span>
                        <span className="block text-xs text-[#1e293b]/50">{l.description}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={pillar.href}
                  className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[#3D2DFF]"
                >
                  Explore {pillar.label} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
