"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import type { PLAN_ROWS } from "./page";

type PlanRow = (typeof PLAN_ROWS)[number];
type Currency = "NGN" | "GBP";

interface Props {
  plans: PlanRow[];
}

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
      <div className="mb-8 flex justify-center">
        <div className="inline-flex items-center rounded-full border border-border/60 bg-white p-1 shadow-sm">
          {(["NGN", "GBP"] as Currency[]).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`rounded-full px-5 py-1.5 text-sm font-semibold transition-all ${
                currency === c
                  ? "bg-[#3D2DFF] text-white shadow"
                  : "text-[#1e293b]/50 hover:text-[#1e293b]"
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
          const primaryPrice  = price(plan);
          const secondPrice   = secondaryPrice(plan);

          return (
            <Card
              key={plan.name}
              className={`relative flex flex-col border-border/50 ${plan.badge ? "border-[#3D2DFF]/40 shadow-lg shadow-[#3D2DFF]/5" : ""}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-0 right-0 flex justify-center">
                  <Badge className="bg-[#3D2DFF] text-white text-xs px-3">
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4 pt-6">
                <h2 className="text-lg font-bold text-[#0f172a]">{plan.name}</h2>
                <div className="mt-1">
                  {primaryPrice ? (
                    <>
                      <div className="flex items-end gap-1">
                        <span className="text-4xl font-bold text-[#0f172a]">{primaryPrice}</span>
                        <span className="mb-1 text-sm text-[#1e293b]/50">{plan.period}</span>
                      </div>
                      {secondPrice && (
                        <p className="mt-0.5 text-xs text-[#1e293b]/40">
                          ≈ {secondPrice}/month
                        </p>
                      )}
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-[#0f172a]">Free</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-[#1e293b]/60 leading-relaxed">{plan.description}</p>
              </CardHeader>

              <CardContent className="flex-1 pb-4">
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f.label} className="flex items-start gap-2.5 text-sm">
                      {f.included ? (
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#3D2DFF]" />
                      ) : (
                        <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-400" />
                      )}
                      <span className={f.included ? "text-[#1e293b]/80" : "text-[#1e293b]/40 line-through"}>
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-0">
                <Button
                  variant={plan.ctaVariant}
                  className={`w-full ${plan.ctaVariant === "default" ? "bg-[#3D2DFF] hover:bg-[#3D2DFF]/90" : ""}`}
                  asChild
                >
                  <Link href={plan.ctaHref}>{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-[#1e293b]/40">
        NGN rates are approximate (1 GBP ≈ ₦1,900). All plans billed monthly — no contracts.
      </p>
    </section>
  );
}
