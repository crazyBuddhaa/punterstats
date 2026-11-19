import Link from "next/link";
import { getUserProfile } from "@/lib/auth/helpers";
import { H2HView } from "@/components/stats/h2h-view";

export const metadata = { title: "Head-to-Head | PunterStat" };

export default async function HeadToHeadPage() {
  const profile = await getUserProfile();
  const isLoggedIn = Boolean(profile);

  if (isLoggedIn) {
    return (
      <div className="space-y-6 py-2">
        <div>
          <Link href="/stats" className="text-xs font-medium text-[#3D2DFF] hover:underline mb-1.5 inline-block">
            ← Stats Centre
          </Link>
          <h1 className="text-xl font-bold text-[#0f172a] sm:text-2xl">Head-to-Head</h1>
          <p className="mt-1 text-xs text-[#1e293b]/55">
            Compare any two teams to see historical results, BTTS %, Over 1.5 / 2.5 %, and goals per meeting.
          </p>
        </div>
        <H2HView light />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f172a] py-10 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <Link href="/stats" className="text-sm text-[#7B7BFF] hover:underline mb-2 inline-block">
            ← Stats Centre
          </Link>
          <h1 className="text-3xl font-bold text-white">Head-to-Head</h1>
          <p className="mt-1 text-white/50">
            Enter two teams to see their full historical record — every meeting, result, BTTS %, and Over 2.5 % trend.
          </p>
        </div>
        <H2HView />
      </div>
    </main>
  );
}
