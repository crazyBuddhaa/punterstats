import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: { default: "Account", template: "%s | PunterStat" },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8fafc] px-4 py-12">
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D2DFF] rounded-lg">
          <Image src="/logo.png" alt="PunterStat" width={36} height={36} className="rounded-xl" />
          <span className="text-xl font-bold text-[#0f172a] tracking-tight">PunterStat</span>
        </Link>
      </div>

      <div className="w-full max-w-md">{children}</div>

      <p className="mt-8 text-center text-xs text-[#1e293b]/40 max-w-sm leading-relaxed">
        PunterStat is an educational platform. No real money is involved.
        For learning purposes only.
      </p>
    </div>
  );
}
