import { H2HView } from "@/components/stats/h2h-view";

export const metadata = { title: "Head-to-Head | PunterStat" };

export default function HeadToHeadPage() {
  return (
    <main className="min-h-screen bg-[#0f172a] py-10 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <a href="/stats" className="text-sm text-[#7B7BFF] hover:underline mb-2 inline-block">
            ← Stats Centre
          </a>
          <h1 className="text-3xl font-bold text-white">Head-to-Head</h1>
          <p className="mt-1 text-white/50">
            Enter two teams to see their full historical record — every meeting, result, and goal.
          </p>
        </div>
        <H2HView />
      </div>
    </main>
  );
}
