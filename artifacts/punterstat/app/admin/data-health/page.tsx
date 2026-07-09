import type { Metadata } from "next";
import { AlertTriangle, CheckCircle2, Database, Gauge, RefreshCw } from "lucide-react";
import { requireAdmin } from "@/lib/auth/helpers";
import { getDataHealthSummary } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Data Health — Admin — PunterStat" };

// If a cache has no rows fetched within this window, flag it as stale rather
// than just "old" — both odds and fixtures are refreshed at least hourly by
// normal traffic, so a longer gap usually means the pipeline stopped.
const STALE_HOURS = 6;
// More than this many predictions overdue for resolution suggests the
// resolve-predictions cron is failing rather than just running behind.
const OVERDUE_WARNING_THRESHOLD = 20;

function hoursSince(iso: string | null): number | null {
  if (!iso) return null;
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60);
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "never";
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusPill({ ok, okLabel, warnLabel }: { ok: boolean; okLabel: string; warnLabel: string }) {
  return ok ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
      <CheckCircle2 className="h-3.5 w-3.5" /> {okLabel}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
      <AlertTriangle className="h-3.5 w-3.5" /> {warnLabel}
    </span>
  );
}

export default async function DataHealthPage() {
  await requireAdmin();
  const health = await getDataHealthSummary();

  const oddsStaleHours = hoursSince(health.oddsCacheFreshness.newestFetchedAt);
  const fixturesStaleHours = hoursSince(health.fixturesCacheFreshness.newestFetchedAt);
  const oddsHealthy = health.oddsCacheFreshness.totalRows === 0 || (oddsStaleHours !== null && oddsStaleHours < STALE_HOURS);
  const fixturesHealthy =
    health.fixturesCacheFreshness.totalRows === 0 || (fixturesStaleHours !== null && fixturesStaleHours < STALE_HOURS);
  const predictionsHealthy = health.overduePredictionResolutions < OVERDUE_WARNING_THRESHOLD;

  const lastSync = health.recentSyncRuns[0] ?? null;
  const lastSyncHealthy = lastSync ? lastSync.errorCount === 0 : true;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Data Health</h1>
        <p className="mt-1 text-sm text-[#1e293b]/60">
          Status of background data pipelines — historical data sync, external API quotas, cache
          freshness, and prediction resolution.
        </p>
      </div>

      {/* Top-line status */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-[#1e293b]/40" />
            <p className="text-sm font-medium text-[#1e293b]/60">Last Historical Sync</p>
          </div>
          <p className="text-lg font-bold text-[#0f172a]">
            {lastSync ? formatDateTime(lastSync.startedAt) : "never run"}
          </p>
          <div className="mt-2">
            <StatusPill ok={lastSyncHealthy} okLabel="No errors" warnLabel={`${lastSync?.errorCount ?? 0} errors`} />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <Database className="h-4 w-4 text-[#1e293b]/40" />
            <p className="text-sm font-medium text-[#1e293b]/60">Odds Cache</p>
          </div>
          <p className="text-lg font-bold text-[#0f172a]">
            {formatDateTime(health.oddsCacheFreshness.newestFetchedAt)}
          </p>
          <div className="mt-2">
            <StatusPill ok={oddsHealthy} okLabel="Fresh" warnLabel="Stale" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <Database className="h-4 w-4 text-[#1e293b]/40" />
            <p className="text-sm font-medium text-[#1e293b]/60">Fixtures Cache</p>
          </div>
          <p className="text-lg font-bold text-[#0f172a]">
            {formatDateTime(health.fixturesCacheFreshness.newestFetchedAt)}
          </p>
          <div className="mt-2">
            <StatusPill ok={fixturesHealthy} okLabel="Fresh" warnLabel="Stale" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <Gauge className="h-4 w-4 text-[#1e293b]/40" />
            <p className="text-sm font-medium text-[#1e293b]/60">Prediction Resolution Backlog</p>
          </div>
          <p className="text-lg font-bold text-[#0f172a]">{health.overduePredictionResolutions} overdue</p>
          <div className="mt-2">
            <StatusPill ok={predictionsHealthy} okLabel="On track" warnLabel="Backing up" />
          </div>
        </div>
      </div>

      {/* API quota status */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-[#1e293b]/60 uppercase tracking-wide">
          External API Quotas
        </h2>
        {health.quotaStatus.length === 0 ? (
          <p className="rounded-2xl border border-border bg-white p-5 text-sm text-[#1e293b]/50 shadow-sm">
            No API usage recorded yet.
          </p>
        ) : (
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            {health.quotaStatus.map((q) => (
              <div key={q.provider} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-[#0f172a]">{q.provider}</p>
                  <p className="text-xs text-[#1e293b]/50">Last request {formatDateTime(q.lastRequestAt)}</p>
                </div>
                <div className="text-right">
                  {q.providerRemaining !== null ? (
                    <p
                      className={`text-sm font-semibold ${
                        q.providerRemaining < 50 ? "text-rose-600" : q.providerRemaining < 150 ? "text-amber-600" : "text-[#0f172a]"
                      }`}
                    >
                      {q.providerRemaining} remaining
                    </p>
                  ) : (
                    <p className="text-sm font-semibold text-[#0f172a]">{q.requestCount} calls this window</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent sync runs */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-[#1e293b]/60 uppercase tracking-wide">
          Recent Historical Data Syncs
        </h2>
        {health.recentSyncRuns.length === 0 ? (
          <p className="rounded-2xl border border-border bg-white p-5 text-sm text-[#1e293b]/50 shadow-sm">
            No sync runs recorded yet.
          </p>
        ) : (
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            {health.recentSyncRuns.map((run) => (
              <div key={run.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#0f172a]">
                    {run.trigger} · {formatDateTime(run.startedAt)}
                  </p>
                  <p className="text-xs text-[#1e293b]/50">
                    {run.leaguesSynced.length} leagues · {run.totalMatchesUpserted} matches ·{" "}
                    {run.totalOddsUpserted} odds rows
                    {!run.completedAt && " · still running"}
                  </p>
                </div>
                <StatusPill ok={run.errorCount === 0} okLabel="OK" warnLabel={`${run.errorCount} errors`} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
