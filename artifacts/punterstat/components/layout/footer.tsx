import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  "Bet Analysis": [
    { href: "/match-breakdown", label: "Match Analysis" },
    { href: "/spot-the-value", label: "Spot The Value" },
    { href: "/simulation-engine", label: "Simulation Engine" },
    { href: "/stats/results", label: "Results & H2H" },
  ],
  "Bet Learning": [
    { href: "/betting-academy", label: "Betting Academy" },
    { href: "/sports-university", label: "Sports University" },
    { href: "/league-glossary", label: "League Glossary" },
    { href: "/blog", label: "Blog" },
  ],
  "Bet Assist": [
    { href: "/bet-assist/picks", label: "Data-Driven Picks" },
    { href: "/bet-assist/slip-checker", label: "Bet Slip Checker" },
    { href: "/bet-assist/calculators", label: "Calculators" },
    { href: "/dashboard/bet-tracker", label: "Bet Tracker" },
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
    <footer className="border-t border-border/50 bg-[#0f172a] text-white/70">
      <div className="container mx-auto px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-white">
              <Image
                src="/logo.png"
                alt="PunterStat"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-lg tracking-tight">PunterStat</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
              Bet analysis, bet learning and bet assist — data-driven tools and
              courses for smarter, more disciplined betting.
            </p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-[#3D2DFF]">
              Knowledge Before Decision
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">
                {section}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 bg-white/10" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} PunterStat. All rights reserved.
          </p>
          <p className="flex max-w-xl items-start gap-2 text-xs text-white/40">
            <span className="shrink-0 rounded-full border border-white/30 px-1.5 py-0.5 text-[10px] font-bold text-white/70">
              18+
            </span>
            <span>
              PunterStat provides sports betting analysis, education and tools. We do
              not take bets or hold customer funds. Picks and probabilities are
              estimates, not guarantees — only bet what you can afford to lose.{" "}
              <Link href="/responsible-gambling" className="underline underline-offset-2 hover:text-white">
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
