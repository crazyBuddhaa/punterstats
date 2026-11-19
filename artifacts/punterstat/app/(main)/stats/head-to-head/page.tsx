import Link from "next/link";
import { getUserProfile } from "@/lib/auth/helpers";
import { H2HView } from "@/components/stats/h2h-view";

export const metadata = { title: "Head-to-Head | PunterStat" };

export default async function HeadToHeadPage() {
  const profile = await getUserProfile();
  const isLoggedIn = Boolean(profile);

  return (
    <main className={isLoggedIn ? "space-y-6 py-2" : "min-h-screen bg-[#f8fafc] px-4 py-10"}>
      <div className={isLoggedIn ? "space-y-6" : "mx-auto max-w-5xl space-y-6"}>
        <div>
          <Link href="/stats" className="mb-1.5 inline-block text-xs font-semibold text-teal-700 hover:underline">
            ← Stats Centre
          </Link>
          <h1 className={isLoggedIn ? "text-xl font-bold text-slate-950 sm:text-2xl" : "text-3xl font-bold text-slate-950"}>
            Head-to-Head
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Compare any two teams to see their full historical record — every meeting, result, BTTS %, and Over 1.5 / 2.5 % trend.
          </p>
        </div>
        <H2HView light />
      </div>
    </main>
  );
}
