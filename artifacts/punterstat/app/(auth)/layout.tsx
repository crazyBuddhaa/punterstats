import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: { default: "Account", template: "%s | PunterStat" },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f5ef] text-[#0b1713] lg:grid lg:grid-cols-[0.85fr_1.15fr]">
      <aside className="relative hidden min-h-screen overflow-hidden bg-[#0b1713] text-[#f4f5ef] lg:block">
        <Image
          src="/hero-pitch.jpg"
          alt=""
          fill
          priority
          sizes="42vw"
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0b1713] via-[#0b1713]/80 to-[#0b1713]/20" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(215,243,95,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(215,243,95,.16)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="relative flex min-h-screen flex-col justify-between p-10 xl:p-16">
          <Link
            href="/"
            className="flex w-fit items-center gap-2 rounded-lg text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d7f35f]"
          >
            <Image src="/logo.png" alt="PunterStat" width={36} height={36} className="rounded-xl" />
            <span className="text-xl font-bold tracking-tight">PunterStat</span>
          </Link>

          <div className="max-w-md">
            <p className="mb-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[#d7f35f]">
              <span className="h-2 w-2 rounded-full bg-[#d7f35f]" />
              Knowledge before decision
            </p>
            <h1 className="text-6xl font-black leading-[0.9] tracking-[-0.07em] xl:text-7xl">
              Read the
              <span className="block text-[#d7f35f]">game.</span>
              Then decide.
            </h1>
            <p className="mt-7 max-w-sm text-sm leading-6 text-white/55">
              Match analysis, practical learning and tools for a more disciplined
              betting process.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-white/35">
            <span className="h-px w-10 bg-[#d7f35f]" />
            18+ · Gamble responsibly
          </div>
        </div>
      </aside>

      <main className="flex min-h-screen flex-col items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link
              href="/"
              className="flex w-fit items-center gap-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7653]"
            >
              <Image src="/logo.png" alt="PunterStat" width={36} height={36} className="rounded-xl" />
              <span className="text-xl font-bold tracking-tight">PunterStat</span>
            </Link>
          </div>

          {children}

          <p className="mt-8 text-center text-xs leading-relaxed text-[#0b1713]/40">
            18+ only. PunterStat provides betting analysis, education and tools —
            we never take bets or deposits.
          </p>
        </div>
      </main>
    </div>
  );
}
