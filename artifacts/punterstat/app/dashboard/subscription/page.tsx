import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard, CheckCircle2, Lock, ExternalLink } from "lucide-react";
import { requireAuth } from "@/lib/auth/helpers";
import { getSubscription } from "@/lib/dashboard/queries";
import { getFullSubscription } from "@/lib/payments/subscriptions";
import { ManageBillingButton } from "./ManageBillingButton";

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
  free:    { badge: "bg-slate-100 text-slate-600",   border: "border-slate-200"  },
  premium: { badge: "bg-amber-100 text-amber-700",   border: "border-amber-200"  },
  pro:     { badge: "bg-violet-100 text-violet-700", border: "border-violet-200" },
};

const statusColors: Record<string, string> = {
  active:    "text-emerald-600",
  trialing:  "text-teal-600",
  cancelled: "text-amber-600",
  expired:   "text-rose-600",
};

const providerLabels: Record<string, string> = {
  stripe:   "Stripe",
  paystack: "Paystack",
  remita:   "Remita",
};

export default async function SubscriptionPage() {
  const profile      = await requireAuth();
  const subscription = await getSubscription(profile.userId);
  const full         = await getFullSubscription(profile.userId);

  const plan     = subscription?.plan ?? "free";
  const features = planFeatures[plan] ?? planFeatures.free;
  const colors   = planColors[plan]   ?? planColors.free;

  const hasStripe   = !!full?.stripeCustomerId;
  const hasPaystack = !!full?.paystackCustomerCode;
  const hasRemita   = !!full?.remitaRrr;
  const provider    = full?.paymentProvider;

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
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#1e293b]" />
              <h2 className="font-semibold text-[#0f172a]">Current Plan</h2>
            </div>
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <span className={`rounded-full px-3 py-1 text-sm font-bold uppercase tracking-wide ${colors.badge}`}>
                {plan}
              </span>
              {subscription && (
                <span className={`text-sm font-medium ${statusColors[subscription.status] ?? "text-[#1e293b]"}`}>
                  {subscription.status}
                </span>
              )}
              {provider && (
                <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-xs text-[#1e293b]/60">
                  via {providerLabels[provider] ?? provider}
                </span>
              )}
            </div>
          </div>

          {/* Self-serve billing actions */}
          {plan !== "free" && subscription?.status === "active" && (
            <div className="flex flex-col gap-2 items-end">
              {hasStripe && <ManageBillingButton />}
              {(hasPaystack || hasRemita) && (
                <p className="text-xs text-[#1e293b]/50 max-w-[200px] text-right">
                  To cancel, email{" "}
                  <a href="mailto:support@punterstat.site" className="underline">
                    support@punterstat.site
                  </a>
                </p>
              )}
            </div>
          )}
        </div>

        {subscription && (
          <div className="mt-4 grid gap-2 text-sm text-[#1e293b]/60 sm:grid-cols-2">
            <div>
              <span className="font-medium text-[#1e293b]">Period start: </span>
              {new Date(subscription.currentPeriodStart).toLocaleDateString("en-GB", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </div>
            <div>
              <span className="font-medium text-[#1e293b]">Renews: </span>
              {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-GB", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </div>
          </div>
        )}

        {/* Remita: show RRR for re-payment reference */}
        {provider === "remita" && full?.remitaRrr && subscription?.status === "trialing" && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
            <p className="font-semibold text-amber-800 mb-1">Awaiting payment</p>
            <p className="text-amber-700">
              Your RRR: <span className="font-mono font-bold">{full.remitaRrr}</span>
            </p>
            <p className="text-amber-700 text-xs mt-1">
              Pay this at any Nigerian bank or via USSD *322# to activate your subscription.
            </p>
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
            Pay via card, Paystack, or Nigerian bank transfer.
          </p>
          <Link
            href="/pricing"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 transition hover:bg-teal-700"
          >
            View pricing plans
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
