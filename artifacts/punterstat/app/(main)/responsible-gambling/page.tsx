import type { Metadata } from "next";
import Link from "next/link";
import { LifeBuoy } from "lucide-react";
import { ToolHero } from "@/components/bet-assist/tool-hero";

export const metadata: Metadata = {
  title: "Responsible Gambling — PunterStat",
  description:
    "PunterStat is for adults 18+. How to keep betting under control, warning signs of problem gambling, and where to get free, confidential help.",
};

const RULES = [
  { t: "Set a bankroll", d: "Decide on an amount you can afford to lose completely, separate from money for bills and savings. Never top it up to chase losses." },
  { t: "Fix your stake size", d: "Stake a small, fixed percentage of your bankroll (1–2% is common). Our Kelly calculator and picks never suggest more than 2%." },
  { t: "Expect losing runs", d: "Even bettors with a real edge lose most bets at longer odds, and runs of 10+ losses are normal. Losing runs are not a sign you are 'due' a win." },
  { t: "Keep records", d: "Log every bet in the Bet Tracker. Honest numbers stop you remembering the wins and forgetting the losses." },
  { t: "Set limits with your bookmaker", d: "Licensed bookmakers offer deposit limits, time-outs and self-exclusion. Set them before you need them." },
  { t: "Never bet to fix a problem", d: "Betting is not a way to pay debts or make an income. Don't bet when stressed, drunk or upset." },
];

const SIGNS = [
  "Spending more money or time on betting than you planned",
  "Chasing losses or increasing stakes to win money back",
  "Borrowing, selling things or missing bills to bet",
  "Hiding betting from family or friends",
  "Feeling anxious, irritable or low when you aren't betting",
];

export default function ResponsibleGamblingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <ToolHero
        icon={LifeBuoy}
        title="Responsible Gambling"
        description="PunterStat helps you analyse and understand bets. It does not take bets. Betting should always be entertainment you can afford — here's how to keep it that way."
        backHref="/"
        backLabel="Home"
      />
      <div className="container mx-auto max-w-4xl space-y-10 px-4 py-10">
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-900">
          <p className="font-semibold">18+ only.</p>
          <p className="mt-1">
            You must be 18 or over (or the legal age for gambling where you live) to use PunterStat&apos;s betting tools.
            Only bet with licensed operators in your country.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold text-[#0f172a]">Rules that keep betting fun</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {RULES.map((r) => (
              <div key={r.t} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                <p className="font-semibold text-[#0f172a]">{r.t}</p>
                <p className="mt-1 text-sm leading-relaxed text-[#1e293b]/65">{r.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-xl font-bold text-[#0f172a]">Warning signs</h2>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-[#1e293b]/70">
            {SIGNS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-[#1e293b]/70">
            If any of these sound familiar, take a break and talk to someone. Help is free and confidential.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-xl font-bold text-[#0f172a]">Where to get help</h2>
          <ul className="space-y-2 text-sm text-[#1e293b]/75">
            <li>
              <a href="https://www.gamblingtherapy.org" target="_blank" rel="noopener noreferrer" className="font-medium text-[#3D2DFF] hover:underline">
                Gambling Therapy
              </a>{" "}
              — free international support by live chat and forums, in several languages.
            </li>
            <li>
              <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer" className="font-medium text-[#3D2DFF] hover:underline">
                BeGambleAware
              </a>{" "}
              — advice, self-assessment and support (UK).
            </li>
            <li>
              <a href="https://www.gamblersanonymous.org" target="_blank" rel="noopener noreferrer" className="font-medium text-[#3D2DFF] hover:underline">
                Gamblers Anonymous
              </a>{" "}
              — peer support meetings worldwide.
            </li>
            <li>
              <a href="https://www.gamban.com" target="_blank" rel="noopener noreferrer" className="font-medium text-[#3D2DFF] hover:underline">
                Gamban
              </a>{" "}
              — software that blocks gambling sites and apps on your devices.
            </li>
          </ul>
          <p className="mt-4 text-sm text-[#1e293b]/60">
            Questions about PunterStat? <Link href="/contact" className="text-[#3D2DFF] hover:underline">Contact us</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
