import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  Platform: [
    { href: "/sports-university", label: "Sports University" },
    { href: "/betting-academy", label: "Betting Academy" },
    { href: "/simulation", label: "Simulation Engine" },
    { href: "/match-analysis", label: "Match Analysis" },
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
    <footer className="border-t border-border/50 bg-[#0f172a] text-white/70">
      <div className="container mx-auto px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
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
              Sports intelligence and education platform. We teach sports
              systems, probability, and analytical thinking.
            </p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-[#0d9488]">
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
          <p className="max-w-md text-xs text-white/30">
            PunterStat is an educational platform. We do not process real-money
            transactions, provide betting tips, or facilitate gambling of any
            kind. For educational purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}
