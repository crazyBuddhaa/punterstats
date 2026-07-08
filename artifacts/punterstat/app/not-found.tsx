import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8fafc] px-4 text-center">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <Image src="/logo.png" alt="PunterStat" width={36} height={36} className="rounded-lg" />
        <span className="text-lg font-bold text-[#0f172a] tracking-tight">PunterStat</span>
      </Link>

      <div className="mb-6 text-[7rem] font-black leading-none tracking-tighter text-[#3D2DFF]/10 select-none">
        404
      </div>

      <h1 className="mb-3 text-2xl font-bold text-[#0f172a]">Page not found</h1>
      <p className="mb-8 max-w-sm text-sm text-[#1e293b]/60 leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/sports-university">Explore courses</Link>
        </Button>
      </div>

      <div className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-[#1e293b]/40">
        <Link href="/sports-university" className="hover:text-[#3D2DFF]">Sports University</Link>
        <Link href="/betting-academy" className="hover:text-[#3D2DFF]">Betting Academy</Link>
        <Link href="/simulation-engine" className="hover:text-[#3D2DFF]">Simulation Engine</Link>
        <Link href="/match-breakdown" className="hover:text-[#3D2DFF]">Match Breakdown</Link>
        <Link href="/blog" className="hover:text-[#3D2DFF]">Blog</Link>
      </div>
    </div>
  );
}
