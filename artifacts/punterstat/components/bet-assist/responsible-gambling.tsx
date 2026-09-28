import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/** Thin strip shown under tool headers. */
export function ResponsibleGamblingStrip({ className }: { className?: string }) {
  return (
    <div className={cn("border-b border-[#1e293b]/20 bg-[#1e293b]", className)}>
      <div className="container mx-auto max-w-5xl px-4 py-2.5">
        <div className="flex items-start gap-2 text-xs text-white/55">
          <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0 text-teal-400" />
          <span>
            18+ only. PunterStat does not take bets. Probabilities are estimates, not guarantees — never stake
            more than you can afford to lose.{" "}
            <Link href="/responsible-gambling" className="underline underline-offset-2 hover:text-white">
              Play responsibly
            </Link>
            .
          </span>
        </div>
      </div>
    </div>
  );
}

/** Boxed note for the bottom of tool pages. */
export function ResponsibleGamblingNote({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm leading-relaxed text-amber-900",
        className,
      )}
    >
      <p className="font-semibold">Bet with a plan, not a feeling</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-900/80">
        <li>Set a bankroll you can afford to lose and a stake size before you start.</li>
        <li>Even a genuine edge loses often — losing runs of 10+ bets are normal.</li>
        <li>Never chase losses, and take breaks. If betting stops being fun, stop.</li>
      </ul>
      <Link
        href="/responsible-gambling"
        className="mt-3 inline-block font-medium text-amber-900 underline underline-offset-2"
      >
        Responsible gambling tools and support →
      </Link>
    </section>
  );
}
