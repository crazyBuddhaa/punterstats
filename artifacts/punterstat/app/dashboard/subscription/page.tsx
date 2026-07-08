import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard, CheckCircle2, Lock } from "lucide-react";
import { requireAuth } from "@/lib/auth/helpers";
import { getSubscription } from "@/lib/dashboard/queries";

export const metadata: Metadata = { title: "Subscription — Dashboard — PunterStat" };

const planFeatures: Record<string, { included: string[]; locked: string[] }> = {
  free: {
    included: [
      "Access to free courses in Sports University",
      "Betting Academy core modules",
      "Simulation Engine (Bet Simulator + Probability Simulator)",
      "Match Breakdown Analyzer",
      "Save up to 5 match analyses",
    ],
    locked: [
      "Premium Sports University courses",
      "Advanced Betting Academy modules",
      "Unlimited saved analyses",
      "Priority support",
      "Downloadable learning materials",
    ],
  },
  premium: {
    included: [
      "All free features",
      "All premium Sports University courses",
      "Advanced Betting Academy modules",
      "Unlimited saved analyses",
      "Downloadable learning materials",
      "Priority support",
    ],
    locked: [],
  },
  pro: {
    included: [
      "Everything in Premium",
      "Early access to new modules",
      "1-on-1 learning sessions (coming soon)",
      "Advanced analytics on your learning patterns",
    ],
    locked: [],
  },
};

const planColors: Record<string, { badge: string; border: string }> = {
  free: { badge: "bg-slate-100 text-slate-600", border: "border-slate-200" },
  premium: { badge: "bg-amber-100 text-amber-700", border: "border-amber-200" },
  pro: { badge: "bg-violet-100 text-violet-700", border: "border-violet-200" },
};

const statusColors: Record<string, string> = {
  active: "text-emerald-600",
  trialing: "text-teal-600",
  cancelled: "text-amber-600",
  expired: "text-rose-600",
};

export default async function SubscriptionPage() {
  const profile = await requireAuth();
  const subscription = await getSubscription(profile.userId);

  const plan = subscription?.plan ?? "free";
  const features = planFeatures[plan] ?? planFeatures.free;
  const colors = planColors[plan] ?? planColors.free;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Subscription</h1>
        <p className="mt-1 text-sm text-[#1e293b]/60">
          Your current plan and what&apos;s included.
        </p>
      </div>

      {/* Current plan card */}
      <div className={`rounded-2xl border-2 ${colors.border} bg-white p-6 shadow-sm`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#1e293b]" />
              <h2 className="font-semibold text-[#0f172a]">Current Plan</h2>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-sm font-bold uppercase tracking-wide ${colors.badge}`}
              >
                {plan}
              </span>
              {subscription && (
                <span className={`text-sm font-medium ${statusColors[subscription.status] ?? "text-[#1e293b]"}`}>
                  {subscription.status}
                </span>
              )}
            </div>
          </div>
        </div>

        {subscription && (
          <div className="mt-4 grid gap-2 text-sm text-[#1e293b]/60 sm:grid-cols-2">
            <div>
              <span className="font-medium text-[#1e293b]">Period start: </span>
              {new Date(subscription.currentPeriodStart).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
            <div>
              <span className="font-medium text-[#1e293b]">Renews: </span>
              {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        )}
      </div>

      {/* What's included */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-[#0f172a]">What&apos;s included</h2>
        <ul className="space-y-2">
          {features.included.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-[#1e293b]/80">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              {f}
            </li>
          ))}
        </ul>

        {features.locked.length > 0 && (
          <>
            <div className="my-4 border-t border-border" />
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#1e293b]/40">
              Unlock with Premium
            </p>
            <ul className="space-y-2">
              {features.locked.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-[#1e293b]/40">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Upgrade CTA for free users */}
      {plan === "free" && (
        <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-indigo-50 p-6 shadow-sm">
          <h2 className="font-bold text-[#0f172a]">Upgrade to Premium</h2>
          <p className="mt-1 text-sm text-[#1e293b]/70">
            Unlock all courses, unlimited analyses, and downloadable materials.
          </p>
          <Link
            href="/pricing"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 transition hover:bg-teal-700"
          >
            View pricing plans →
          </Link>
        </div>
      )}

      {/* Manage subscription */}
      <div className="rounded-2xl border border-border bg-white p-5 text-sm text-[#1e293b]/60">
        <p>
          To manage billing, cancel, or change your plan, contact{" "}
          <a href="mailto:support@punterstat.site" className="text-teal-600 underline hover:text-teal-700">
            support@punterstat.site
          </a>
          . Full self-serve billing is coming soon.
        </p>
      </div>
    </div>
  );
}
