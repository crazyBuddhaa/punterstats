"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import type { PlanRow } from "./plans";

type Currency = "NGN" | "GBP";

interface Props {
  plans: PlanRow[];
}

const TIER_PILL_STYLE: Record<PlanRow["id"], string> = {
  free: "bg-slate-100 text-slate-700 border-slate-200",
  pro: "bg-teal-50 text-teal-800 border-teal-200",
  premium: "bg-amber-50 text-amber-900 border-amber-200",
};

export default function PricingCurrencyToggle({ plans }: Props) {
  // Default to NGN — primary audience is Nigeria/Africa
  const [currency, setCurrency] = useState<Currency>("NGN");

  function price(plan: PlanRow): string | null {
    if (!plan.ngn && !plan.gbp) return null;
    return currency === "NGN" ? plan.ngn : plan.gbp;
  }

  function secondaryPrice(plan: PlanRow): string | null {
    if (!plan.ngn || !plan.gbp) return null;
    return currency === "NGN" ? plan.gbp : plan.ngn;
  }

  return (
    <section className="container mx-auto max-w-5xl px-4 py-14">
      {/* Currency toggle */}
      <div className="mb-10 flex justify-center">
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm">
          {(["NGN", "GBP"] as Currency[]).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`rounded-full px-5 py-1.5 text-sm font-semibold transition-all ${
                currency === c
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {c === "NGN" ? "₦ Naira" : "£ GBP"}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const primaryPrice = price(plan);
          const secondPrice = secondaryPrice(plan);
          const isPro = plan.id === "pro";

          return (
            <Card
              key={plan.id}
              className={`relative flex flex-col bg-white ${
                isPro
                  ? "border-slate-900 shadow-md"
                  : "border-slate-200/90 shadow-sm"
              }`}
            >
              <CardHeader className="pb-4 pt-6">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${TIER_PILL_STYLE[plan.id]}`}
                  >
                    {plan.tierTag}
                  </span>
                  {plan.badge && (
                    <span
                      className={`text-[11px] font-semibold ${
                        isPro ? "text-slate-900" : "text-slate-500"
                      }`}
                    >
                      {plan.badge}
                    </span>
                  )}
                </div>

                <h2 className="mt-3 text-lg font-bold text-slate-950">{plan.name}</h2>
                <div className="mt-1">
                  {primaryPrice ? (
                    <>
                      <div className="flex items-end gap-1">
                        <span className="text-4xl font-bold tabular-nums text-slate-950">
                          {primaryPrice}
                        </span>
                        <span className="mb-1 text-sm text-slate-500">{plan.period}</span>
                      </div>
                      {secondPrice && (
                        <p className="mt-0.5 text-xs text-slate-400">
                          ≈ {secondPrice}/month
                        </p>
                      )}
                    </>
                  ) : (
                    <span className="text-4xl font-bold tabular-nums text-slate-950">₦0</span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{plan.description}</p>
              </CardHeader>

              <CardContent className="flex-1 pb-4">
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f.label} className="flex items-start gap-2.5 text-sm">
                      {f.included ? (
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-700" />
                      ) : (
                        <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-300" />
                      )}
                      <span className={f.included ? "text-slate-700" : "text-slate-400 line-through"}>
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-0">
                <Button
                  variant={plan.ctaVariant}
                  className={`w-full rounded-lg ${
                    isPro
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : plan.ctaVariant === "default"
                        ? "bg-teal-700 text-white hover:bg-teal-800"
                        : "border-slate-300 text-slate-900 hover:bg-slate-50"
                  }`}
                  asChild
                >
                  <Link href={plan.ctaHref}>{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-slate-500">
        NGN plans are locally priced for Nigeria (Paystack cards, bank transfer, OPay/PalmPay &amp; USSD). Billed monthly — cancel anytime.
      </p>
    </section>
  );
}
