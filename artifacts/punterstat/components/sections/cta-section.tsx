"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const trustMarks = [
  "No credit card required",
  "No betting tips",
  "No real-money features",
  "Free to start",
];

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
  description = "Join thousands of sports thinkers learning probability, analytics, and structured decision-making — no noise, no tips, just knowledge.",
  primaryLabel,
  primaryHref,
  secondaryLabel = "View pricing",
  secondaryHref = "/pricing",
  isAuthenticated = false,
}: CtaSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const resolvedPrimaryLabel =
    primaryLabel ?? (isAuthenticated ? "Go to Dashboard" : "Create Free Account");
  const resolvedPrimaryHref =
    primaryHref ?? (isAuthenticated ? "/dashboard" : "/register");

  return (
    <section
      className={cn("relative overflow-hidden bg-[#0f172a] py-24 sm:py-32", className)}
    >
      {/* Top edge glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3D2DFF] opacity-[0.09] blur-3xl" />
      {/* Bottom edge glow */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[#3D2DFF] opacity-[0.06] blur-3xl" />

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "radial-gradient(#3D2DFF 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55 }}
        className="relative mx-auto max-w-3xl px-4 text-center sm:px-6"
      >
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/logo.png"
            alt="PunterStat"
            width={52}
            height={52}
            className="rounded-2xl shadow-lg shadow-[#3D2DFF]/30"
          />
        </div>

        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#3D2DFF]">
          Get Started Free
        </p>
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          {title}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-white/45">{description}</p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            asChild
            className="gap-2 bg-[#3D2DFF] px-10 text-[15px] font-semibold hover:bg-[#3D2DFF]/90"
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
            className="border-white/20 bg-white/[0.04] text-[15px] text-white hover:bg-white/10 hover:text-white"
          >
            <Link href={secondaryHref}>{secondaryLabel}</Link>
          </Button>
        </div>

        {/* Trust marks */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {trustMarks.map((mark) => (
            <div key={mark} className="flex items-center gap-1.5 text-xs text-white/35">
              <span className="h-1 w-1 rounded-full bg-[#3D2DFF]" />
              {mark}
            </div>
          ))}
        </div>

        <p className="mt-8 text-[11px] text-white/20">
          PunterStat is an educational platform. We do not process real-money transactions, provide
          betting tips, or facilitate gambling of any kind.
        </p>
      </motion.div>
    </section>
  );
}
