import Link from "next/link";
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
}

export function CtaSection({
  className,
  title = "Start building your sports intelligence today.",
  description = "Free to begin. No credit card required. No tips, no noise — just structured knowledge.",
  primaryLabel = "Create Free Account",
  primaryHref = "/register",
  secondaryLabel = "View Curriculum",
  secondaryHref = "/sports-university",
}: CtaSectionProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-[#0f172a] py-20 sm:py-28",
        className
      )}
    >
      {/* Teal accent glow */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[400px] w-[700px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[#3D2DFF] opacity-[0.08] blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#3D2DFF]">
          Get Started
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/50">
          {description}
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button size="lg" asChild className="gap-2 px-8">
            <Link href={primaryHref}>
              {primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            <Link href={secondaryHref}>{secondaryLabel}</Link>
          </Button>
        </div>
        <p className="mt-8 text-xs text-white/25">
          PunterStat is an educational platform. We do not process real-money
          transactions, provide betting tips, or facilitate gambling of any kind.
        </p>
      </div>
    </section>
  );
}
