import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CtaSectionProps {
  className?: string;
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  isAuthenticated?: boolean;
}

export function CtaSection({
  className,
  title = "Start building your sports intelligence today.",
  description = "Free to begin. No credit card required. No tips, no noise — just structured knowledge.",
  primaryLabel,
  primaryHref,
  secondaryLabel = "View pricing",
  secondaryHref = "/pricing",
  isAuthenticated = false,
}: CtaSectionProps) {
  const resolvedPrimaryLabel =
    primaryLabel ??
    (isAuthenticated ? "Go to Dashboard" : "Create free account");
  const resolvedPrimaryHref =
    primaryHref ?? (isAuthenticated ? "/dashboard" : "/register");

  return (
    <section
      className={cn(
        "bg-slate-50 px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8",
        className
      )}
    >
      <div className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-3xl bg-brand-ink px-6 py-16 text-center sm:px-12 sm:py-24">
        {/* Pitch lines + glow */}
        <Image
          src="/illustrations/pitch-pattern.svg"
          alt=""
          fill
          unoptimized
          className="pointer-events-none -z-10 object-cover opacity-80"
        />
        <div className="pointer-events-none absolute left-1/2 top-full -z-10 h-[420px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-blue/40 blur-[100px]" />

        <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-brand-violet">
          Knowledge before decision
        </p>
        <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-[-0.03em] text-white sm:text-5xl sm:leading-[1.05]">
          {title}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-300/80">
          {description}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            asChild
            className="gap-2 bg-brand-blue px-8 text-white shadow-[0_8px_30px_-6px_rgba(61,45,255,0.8)] hover:bg-brand-blue/90"
          >
            <Link href={resolvedPrimaryHref}>
              {resolvedPrimaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="border-white/15 bg-white/[0.04] text-white hover:bg-white/10 hover:text-white"
          >
            <Link href={secondaryHref}>{secondaryLabel}</Link>
          </Button>
        </div>
        <p className="mx-auto mt-10 max-w-lg text-xs leading-relaxed text-slate-500">
          PunterStat is an educational platform. We do not process real-money
          transactions, provide betting tips, or facilitate gambling of any
          kind.
        </p>
      </div>
    </section>
  );
}
