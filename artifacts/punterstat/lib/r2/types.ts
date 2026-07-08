/**
 * Cloudflare R2 — shared TypeScript types for the dataset layer.
 */

// ── Manifest ──────────────────────────────────────────────────────────────────

export interface R2SeasonMeta {
  /** Season code used in the R2 key, e.g. "2425" */
  code: string;
  /** Human-readable label, e.g. "2024/25" */
  label: string;
  /** ISO timestamp of when this season file was last written to R2 */
  archivedAt: string;
  /** Number of match rows parsed from the CSV at archive time */
  rowCount: number;
  /** Size of the raw CSV in bytes */
  fileSizeBytes: number;
}

export interface R2LeagueMeta {
  code: string;          // e.g. "E0"
  name: string;          // e.g. "Premier League"
  country: string;
  seasons: R2SeasonMeta[];
  /** ISO timestamp of the most recent successful sync for this league */
  lastSyncAt: string | null;
}

export interface R2Manifest {
  /** Manifest schema version — bump when the shape changes */
  version: number;
  /** ISO timestamp of the last manifest write */
  updatedAt: string;
  leagues: Record<string, R2LeagueMeta>;
}

// ── Sync ──────────────────────────────────────────────────────────────────────

export interface R2SyncResult {
  leagueCode: string;
  seasonCode: string;
  seasonLabel: string;
  /** R2 object key where the CSV was written, e.g. "football/E0/2425.csv" */
  r2Key: string | null;
  rowCount: number;
  fileSizeBytes: number;
  success: boolean;
  error?: string;
}

// ── Ingest ────────────────────────────────────────────────────────────────────

export interface R2IngestResult {
  leagueCode: string;
  seasonCode: string;
  seasonLabel: string;
  matchesUpserted: number;
  oddsUpserted: number;
  success: boolean;
  error?: string;
}

// ── Sync-log entry (written to R2 and optionally to Supabase) ─────────────────

export interface R2SyncLogEntry {
  runId: string;
  startedAt: string;
  completedAt: string;
  trigger: "cron" | "manual" | "backfill";
  syncResults: R2SyncResult[];
  ingestResults: R2IngestResult[];
  totalMatchesUpserted: number;
  totalOddsUpserted: number;
  errors: string[];
}
