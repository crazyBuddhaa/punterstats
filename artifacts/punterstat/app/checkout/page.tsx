import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { requireAuth } from "@/lib/auth/helpers";
import { PLAN_CONFIG } from "@/lib/payments";
import { CheckoutClient } from "./CheckoutClient";
import type { PlanId } from "@/lib/payments/types";

export const metadata: Metadata = {
  title: "Checkout — PunterStat",
  description: "Subscribe to PunterStat Premium or Pro.",
};

interface Props {
  searchParams: Promise<{ plan?: string }>;
}

export default async function CheckoutPage({ searchParams }: Props) {
  const { plan } = await searchParams;

  // Validate plan before hitting auth
  const planId = plan as PlanId | undefined;
  const config = planId ? PLAN_CONFIG[planId] ?? null : null;

  if (!config) {
    redirect("/pricing");
  }

  // Require auth — middleware also guards /checkout
  await requireAuth();

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <header className="border-b border-border/50 bg-white px-4 py-4">
        <div className="container mx-auto max-w-lg flex items-center justify-between">
          <Link
            href="/pricing"
            className="flex items-center gap-1.5 text-sm text-[#1e293b]/60 hover:text-[#1e293b] transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to pricing
          </Link>
          <span className="text-sm font-bold text-[#0f172a]">PunterStat</span>
        </div>
      </header>

      <main className="container mx-auto max-w-lg px-4 py-10 space-y-6">
        {/* Plan summary */}
        <div className="rounded-2xl border-2 border-[#3D2DFF]/20 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#3D2DFF]">
                Your plan
              </p>
              <h1 className="mt-1 text-2xl font-bold text-[#0f172a]">{config.name}</h1>
              <p className="mt-1 text-sm text-[#1e293b]/60 leading-relaxed max-w-xs">
                {config.description}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-[#0f172a]">{config.displayGbp}</p>
              <p className="text-xs text-[#1e293b]/40">/month · billed monthly</p>
            </div>
          </div>
        </div>

        {/* Payment method selection */}
        <div>
          <h2 className="mb-4 text-sm font-semibold text-[#0f172a]">Choose payment method</h2>
          <CheckoutClient
            planId={config.id}
            planName={config.name}
            displayGbp={config.displayGbp}
            displayNgn={config.displayNgn}
          />
        </div>

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-2 text-xs text-[#1e293b]/40 pt-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          Payments processed securely by Stripe, Paystack, or Remita
        </div>
      </main>
    </div>
  );
}
