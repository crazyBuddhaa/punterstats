export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="text-center px-4">
        <div className="inline-flex items-center gap-2 bg-[#0d9488]/10 text-[#0d9488] text-sm font-medium px-3 py-1 rounded-full mb-6 border border-[#0d9488]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488] animate-pulse" />
          Building in progress
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-[#0f172a] tracking-tight mb-4">
          PunterStat
        </h1>

        <p className="text-lg text-[#1e293b]/70 max-w-md mx-auto mb-8 leading-relaxed">
          Sports intelligence and education platform.
          <br />
          <span className="font-semibold text-[#0f172a]">
            Knowledge Before Decision.
          </span>
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <div className="px-5 py-2.5 bg-[#0f172a] text-white rounded-lg text-sm font-medium cursor-default">
            Coming Soon
          </div>
          <div className="px-5 py-2.5 border border-[#0f172a]/20 text-[#0f172a] rounded-lg text-sm font-medium cursor-default">
            Learn More
          </div>
        </div>

        <p className="mt-16 text-xs text-[#1e293b]/40 max-w-sm mx-auto">
          PunterStat is an educational platform. We do not process real-money
          transactions, provide betting tips, or facilitate gambling of any
          kind.
        </p>
      </div>
    </main>
  );
}
