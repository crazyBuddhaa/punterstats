import Link from "next/link";
import { ArrowRight, BookOpen, FlaskConical, BarChart2, TrendingUp, Compass } from "lucide-react";
import type { Recommendation } from "@/lib/dashboard/recommendations";

function RecommendationIcon({ href, className }: { href: string; className?: string }) {
  if (href === "/simulation-engine" || href.startsWith("/simulation-engine")) {
    return <FlaskConical className={className} />;
  }
  if (href === "/match-breakdown" || href.startsWith("/match-breakdown")) {
    return <BarChart2 className={className} />;
  }
  if (href === "/spot-the-value" || href.startsWith("/spot-the-value")) {
    return <TrendingUp className={className} />;
  }
  if (
    href === "/betting-academy" ||
    href.startsWith("/betting-academy") ||
    href === "/sports-university" ||
    href.startsWith("/sports-university")
  ) {
    return <BookOpen className={className} />;
  }
  return <Compass className={className} />;
}

export function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-5 shadow-sm">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-teal-600">
        Next up
      </p>
      <div className="flex items-start gap-4">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100">
          <RecommendationIcon href={rec.href} className="h-5 w-5 text-teal-700" />
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
