import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Payment received — PunterStat",
};

interface Props {
  searchParams: Promise<{ provider?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { provider } = await searchParams;

  const providerLabel =
    provider === "paystack" ? "Paystack" :
    provider === "remita"   ? "Remita" :
    "Stripe";

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Payment received!</h1>
          <p className="mt-2 text-sm text-[#1e293b]/60 leading-relaxed">
            Your {providerLabel} payment was successful. Your subscription is being
            activated — this usually takes less than a minute.
          </p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-white p-5 text-sm text-[#1e293b]/60 text-left space-y-2">
          <p className="font-medium text-[#0f172a]">What happens next?</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Your account is upgraded automatically</li>
            <li>All premium features unlock immediately</li>
            <li>You&apos;ll receive a confirmation email shortly</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Button asChild className="bg-[#3D2DFF] hover:bg-[#3D2DFF]/90">
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/subscription">View subscription details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
