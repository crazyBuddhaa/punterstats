import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  Platform: [
    { href: "/sports-university", label: "Sports University" },
    { href: "/betting-academy", label: "Betting Academy" },
    { href: "/simulation-engine", label: "Simulation Engine" },
    { href: "/match-breakdown", label: "Match Analysis" },
    { href: "/spot-the-value", label: "Spot The Value" },
    { href: "/league-glossary", label: "League Glossary" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/pricing", label: "Pricing" },
    { href: "/contact", label: "Contact" },
  ],
  Legal: [
    { href: "/terms", label: "Terms of Service" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/faq", label: "FAQ" },
  ],
};

export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-white/[0.06] bg-brand-ink text-slate-400">
      <Image
        src="/illustrations/pitch-pattern.svg"
        alt=""
        width={1200}
        height={780}
        unoptimized
        className="pointer-events-none absolute -right-40 top-0 -z-10 w-[900px] max-w-none opacity-60"
      />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 font-bold text-white"
            >
              <Image
                src="/logo-mark.svg"
                alt=""
                width={32}
                height={32}
                unoptimized
                className="rounded-lg"
              />
              <span className="text-lg tracking-tight">PunterStat</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Sports intelligence and education platform. We teach sports
              systems, probability, and analytical thinking.
            </p>
            <p className="mt-5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-brand-violet">
              {"// Knowledge before decision"}
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                {section}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-300/80 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/[0.06] pt-8 sm:flex-row sm:items-start sm:justify-between">
          <p className="font-mono text-xs text-slate-500">
            © {new Date().getFullYear()} PunterStat. All rights reserved.
          </p>
          <p className="max-w-md text-xs leading-relaxed text-slate-500">
            PunterStat is an educational platform. We do not process real-money
            transactions, provide betting tips, or facilitate gambling of any
            kind. For educational purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}
