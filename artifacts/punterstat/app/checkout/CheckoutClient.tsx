"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Building2, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlanId } from "@/lib/payments/types";

interface Props {
  planId: PlanId;
  planName: string;
  displayGbp: string;
  displayNgn: string;
}

type Provider = "stripe" | "paystack" | "remita";

interface ProviderOption {
  id: Provider;
  label: string;
  sublabel: string;
  currency: string;
  icon: React.ReactNode;
  badge?: string;
}

// ── Remita RRR result displayed in-app ────────────────────────────────────

interface RemitaResult {
  rrr: string;
  orderId: string;
  amountNgn: number;
  paymentUrl: string;
}

export function CheckoutClient({ planId, planName, displayGbp, displayNgn }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remitaResult, setRemitaResult] = useState<RemitaResult | null>(null);
  const [copied, setCopied] = useState(false);

  const providers: ProviderOption[] = [
    {
      id: "stripe",
      label: "Pay with card",
      sublabel: "UK / International · Visa, Mastercard, Apple Pay",
      currency: displayGbp + "/month",
      icon: <CreditCard className="h-5 w-5" />,
      badge: "Recommended",
    },
    {
      id: "paystack",
      label: "Pay with Paystack",
      sublabel: "Africa · Cards, Bank Transfer, USSD",
      currency: displayNgn + "/month",
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      id: "remita",
      label: "Pay via bank (Remita)",
      sublabel: "Nigeria · Any bank, USSD, internet banking",
      currency: displayNgn + "/month",
      icon: <Landmark className="h-5 w-5" />,
    },
  ];

  async function handleSelect(provider: Provider) {
    setLoading(provider);
    setError(null);
    setRemitaResult(null);

    try {
      const res = await fetch(`/api/checkout/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }

      if (provider === "remita") {
        // Show RRR in-app — no redirect
        setRemitaResult(data as RemitaResult);
      } else {
        // Stripe / Paystack — redirect to hosted checkout
        router.push(data.redirectUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoading(null);
    }
  }

  async function copyRrr(rrr: string) {
    await navigator.clipboard.writeText(rrr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Remita RRR display ─────────────────────────────────────────────────────
  if (remitaResult) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="text-sm font-medium text-emerald-700 mb-1">Your payment reference (RRR)</p>
          <p className="text-4xl font-mono font-bold text-[#0f172a] tracking-widest my-3">
            {remitaResult.rrr}
          </p>
          <p className="text-sm text-[#1e293b]/60">
            Amount: <strong>₦{remitaResult.amountNgn.toLocaleString()}</strong>
          </p>
        </div>

        <div className="space-y-3">
          <Button
            className="w-full bg-[#3D2DFF] hover:bg-[#3D2DFF]/90"
            onClick={() => copyRrr(remitaResult.rrr)}
          >
            {copied ? "Copied!" : "Copy RRR to clipboard"}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open(remitaResult.paymentUrl, "_blank")}
          >
            Pay via Remita portal →
          </Button>
        </div>

        <div className="rounded-xl border border-border/50 bg-[#f8fafc] p-4 text-sm text-[#1e293b]/60 space-y-1.5">
          <p className="font-medium text-[#0f172a]">How to pay:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Copy the RRR above</li>
            <li>Visit any bank branch, internet banking portal, or use USSD *322#</li>
            <li>Select "Remita" or "RRR payment" and enter the reference</li>
            <li>Your subscription will activate automatically within minutes of payment</li>
          </ol>
        </div>

        <p className="text-center text-xs text-[#1e293b]/40">
          Paid already?{" "}
          <button
            className="underline hover:text-[#1e293b]/70"
            onClick={() => router.push("/dashboard/subscription")}
          >
            Check your subscription status
          </button>
        </p>
      </div>
    );
  }

  // ── Provider selection ─────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {providers.map((p) => (
        <button
          key={p.id}
          disabled={loading !== null}
          onClick={() => handleSelect(p.id)}
          className="w-full rounded-2xl border border-border/60 bg-white p-4 text-left transition hover:border-[#3D2DFF]/40 hover:shadow-sm disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D2DFF]"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f1f5f9] text-[#3D2DFF]">
                {p.icon}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#0f172a] text-sm">{p.label}</span>
                  {p.badge && (
                    <span className="rounded-full bg-[#3D2DFF]/10 px-2 py-0.5 text-[10px] font-semibold text-[#3D2DFF]">
                      {p.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#1e293b]/50 truncate">{p.sublabel}</p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <span className="text-sm font-bold text-[#0f172a]">{p.currency}</span>
              {loading === p.id && (
                <p className="text-xs text-[#3D2DFF] mt-0.5">Redirecting…</p>
              )}
            </div>
          </div>
        </button>
      ))}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <p className="text-center text-xs text-[#1e293b]/40 pt-2">
        No contracts. Cancel anytime. VAT may apply.
      </p>
    </div>
  );
}
