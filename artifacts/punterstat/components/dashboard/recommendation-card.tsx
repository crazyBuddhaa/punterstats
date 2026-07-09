import Link from "next/link";
import type { ElementType } from "react";
import { ArrowRight, BookOpen, FlaskConical, BarChart2, TrendingUp, Compass } from "lucide-react";
import type { Recommendation } from "@/lib/dashboard/recommendations";

const HREF_ICONS: Record<string, ElementType> = {
  "/simulation-engine": FlaskConical,
  "/match-breakdown": BarChart2,
  "/spot-the-value": TrendingUp,
  "/betting-academy": BookOpen,
  "/sports-university": BookOpen,
};

function iconForHref(href: string): ElementType {
  // Exact match first, then prefix match for deep lesson paths
  if (HREF_ICONS[href]) return HREF_ICONS[href];
  for (const [prefix, Icon] of Object.entries(HREF_ICONS)) {
    if (href.startsWith(prefix)) return Icon;
  }
  return Compass;
}

export function RecommendationCard({ rec }: { rec: Recommendation }) {
  const Icon = iconForHref(rec.href);

  return (
    <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-5 shadow-sm">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-teal-600">
        Next up
      </p>
      <div className="flex items-start gap-4">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100">
          <Icon className="h-5 w-5 text-teal-700" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#0f172a]">{rec.title}</p>
          <p className="mt-0.5 text-sm text-[#1e293b]/70">{rec.description}</p>
          <p className="mt-2 text-xs italic text-[#1e293b]/50">{rec.reason}</p>
          <Link
            href={rec.href}
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800"
          >
            Go there <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
