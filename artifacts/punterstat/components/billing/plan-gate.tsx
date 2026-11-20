import Link from "next/link";
import { ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SubscriptionTier } from "@/lib/auth/access";

interface PlanGateProps {
  requiredPlan: "pro" | "premium";
  currentTier: SubscriptionTier;
  toolName: string;
  description: string;
  highlights: string[];
}

const PLAN_META = {
  pro: {
    name: "Pro",
    priceNgn: "₦700/mo",
    priceGbp: "£4/mo",
    badgeClass: "bg-[#3D2DFF]/10 text-[#3D2DFF] border-[#3D2DFF]/20",
    checkoutHref: "/checkout?plan=pro",
  },
  premium: {
    name: "Premium",
    priceNgn: "₦1,500/mo",
    priceGbp: "£9/mo",
    badgeClass: "bg-teal-50 text-teal-800 border-teal-200",
    checkoutHref: "/checkout?plan=premium",
  },
} as const;

export function PlanGate({
  requiredPlan,
  currentTier,
  toolName,
  description,
  highlights,
}: PlanGateProps) {
  const meta = PLAN_META[requiredPlan];
  const currentLabel =
    currentTier === "pro" ? "Pro" : currentTier === "free" ? "Free" : currentTier;

  return (
    <div className="mx-auto max-w-2xl py-6">
      <div className="rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${meta.badgeClass}`}
          >
            <Lock className="h-3.5 w-3.5" />
            {meta.name} Plan Feature ({meta.priceNgn} · {meta.priceGbp})
          </span>
          <span className="text-xs text-[#1e293b]/55">
            Your plan: <strong className="text-[#0f172a] capitalize">{currentLabel}</strong>
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">{toolName}</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#1e293b]/65">{description}</p>
        </div>

        <ul className="space-y-2.5 rounded-xl border border-border bg-slate-50/70 p-4">
          {highlights.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-[#0f172a]">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button variant="teal" asChild>
            <Link href={meta.checkoutHref} className="gap-1.5">
              Upgrade to {meta.name} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/pricing">Compare all plans</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
