import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  "Bet Analysis": [
    { href: "/match-breakdown", label: "Match Breakdown" },
    { href: "/spot-the-value", label: "Spot The Value" },
    { href: "/simulation-engine", label: "Simulation Engine" },
    { href: "/stats", label: "Historical Stats" },
    { href: "/stats/head-to-head", label: "Head-to-Head" },
  ],
  "Bet Learning": [
    { href: "/betting-academy", label: "Betting Academy" },
    { href: "/sports-university", label: "Sports University" },
    { href: "/betting-academy/option-glossary", label: "Option Glossary" },
    { href: "/league-glossary", label: "League Profiles" },
    { href: "/blog", label: "Blog" },
  ],
  "Bet Assist": [
    { href: "/bet-assist/slip-checker", label: "Bet Slip Checker" },
    { href: "/bet-assist/calculators", label: "Betting Calculators" },
    { href: "/dashboard/bet-tracker", label: "Bet Tracker" },
    { href: "/dashboard/report-card", label: "Betting Report Card" },
    { href: "/dashboard/calibration", label: "Calibration Trainer" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/pricing", label: "Pricing" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/responsible-gambling", label: "Responsible Gambling" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="container mx-auto px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" prefetch={false} className="flex items-center gap-2.5 font-bold text-slate-900">
              <Image
                src="/logo.png"
                alt="PunterStat"
                width={30}
                height={30}
                className="rounded-lg"
              />
              <span className="text-lg tracking-tight">PunterStat</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              Learn the maths of betting, analyse matches with transparent
              probabilities, and check your slips with calculators and a tracker.
            </p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-teal-700">
              Knowledge Before Decision
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                {section}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      prefetch={false}
                      className="text-sm text-slate-600 transition-colors hover:text-slate-950"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 bg-slate-200" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} PunterStat. All rights reserved.
          </p>
          <p className="flex max-w-xl items-start gap-2 text-xs text-slate-500">
            <span className="shrink-0 rounded-full border border-slate-300 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
              18+
            </span>
            <span>
              PunterStat provides sports betting analysis, education and tools. We do
              not take bets, hold customer funds or give tips. Probabilities are
              model estimates, not guarantees — only bet what you can afford to lose.{" "}
              <Link href="/responsible-gambling" prefetch={false} className="underline underline-offset-2 hover:text-slate-900">
                Gamble responsibly
              </Link>
              .
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
