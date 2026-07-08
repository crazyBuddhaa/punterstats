/**
 * Cloudflare R2 dataset layer — barrel export.
 *
 * Import from "@/lib/r2" for the full public API.
 * Import from "@/lib/r2/client" etc. directly when you only need one module.
 */

export { getR2Client, getR2Bucket, isR2Configured } from "./client";

export {
  MANIFEST_KEY,
  footballCsvKey,
  syncLogKey,
  putObject,
  getObject,
  objectExists,
  listObjects,
  deleteObject,
  getManifest,
  putManifest,
  putFootballCsv,
  getFootballCsv,
  listArchivedSeasons,
} from "./dataset";

export {
  parseFDCsv,
  rowToMatch,
  rowToOdds,
  upsertMatchesAndOdds,
  parseDate,
  buildExternalId,
  slugify,
  num,
  int,
  BOOKMAKERS,
} from "./csv-parser";

export {
  SYNC_LEAGUES,
  yearToSeasonCode,
  seasonCodeToLabel,
  currentSeasonCodes,
  allSeasonCodes,
  syncOneSeason,
  syncCurrentSeasons,
  syncAllHistorical,
  updateManifestWithResults,
} from "./sync";

export {
  ingestOneSeason,
  ingestFromR2,
  syncAndIngest,
} from "./ingest";

export type {
  R2SeasonMeta,
  R2LeagueMeta,
  R2Manifest,
  R2SyncResult,
  R2IngestResult,
  R2SyncLogEntry,
} from "./types";
