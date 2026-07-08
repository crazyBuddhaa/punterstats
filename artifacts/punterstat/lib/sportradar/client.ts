/**
 * Sportradar Soccer v4 — base fetch client
 *
 * Auth:       x-api-key header (40-char key)
 * Rate limit: 1 req/s enforced client-side via a sequential queue
 * Retry:      1 automatic retry on 429 with Retry-After respect
 * Base URL:   trial | production — driven by SPORTRADAR_ENV env var
 *             defaults to "trial" if not set
 *
 * Env vars:
 *   SPORTRADAR_API_KEY  — required
 *   SPORTRADAR_ENV      — "trial" (default) | "production"
 *   SPORTRADAR_LOCALE   — default locale, e.g. "en" (default)
 */

import { SportradarError } from "./types";

const TRIAL_BASE      = "https://api.sportradar.com/soccer/trial/v4";
const PRODUCTION_BASE = "https://api.sportradar.com/soccer/production/v4";

// ── Configuration ─────────────────────────────────────────────────────────────

export function getSportradarKey(): string {
  const key = process.env.SPORTRADAR_API_KEY;
  if (!key) throw new SportradarError(0, "config", "SPORTRADAR_API_KEY is not set");
  return key;
}

export function isSportradarConfigured(): boolean {
  return !!process.env.SPORTRADAR_API_KEY;
}

function getBaseUrl(): string {
  return (process.env.SPORTRADAR_ENV ?? "trial") === "production"
    ? PRODUCTION_BASE
    : TRIAL_BASE;
}

export function getDefaultLocale(): string {
  return process.env.SPORTRADAR_LOCALE ?? "en";
}

// ── Rate limiter — 1 req/s sequential queue ────────────────────────────────────

const MIN_INTERVAL_MS = 1050; // slightly over 1s to stay safely under 1 req/s

let lastRequestAt = 0;
let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const next = queue.then(async () => {
    const now = Date.now();
    const wait = MIN_INTERVAL_MS - (now - lastRequestAt);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastRequestAt = Date.now();
    return fn();
  });
  queue = next.catch(() => {}); // don't let errors block the queue
  return next as Promise<T>;
}

// ── Core fetch ────────────────────────────────────────────────────────────────

export interface SrFetchOptions {
  /** Override locale for this request */
  locale?: string;
  /** Additional query params */
  params?: Record<string, string | number | boolean>;
}

/**
 * Make one authenticated GET request to the Sportradar Soccer v4 API.
 * Rate-limited to 1 req/s. Retries once on 429.
 */
export async function srFetch<T>(
  path: string,
  options: SrFetchOptions = {}
): Promise<T> {
  return enqueue(() => _fetch<T>(path, options));
}

async function _fetch<T>(
  path: string,
  options: SrFetchOptions,
  attempt = 0
): Promise<T> {
  const url = new URL(`${getBaseUrl()}${path}`);

  if (options.params) {
    for (const [k, v] of Object.entries(options.params)) {
      url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url.toString(), {
    headers: {
      "x-api-key": getSportradarKey(),
      "accept": "application/json",
    },
    cache: "no-store",
  });

  if (res.status === 429 && attempt === 0) {
    const retryAfter = parseInt(res.headers.get("Retry-After") ?? "2", 10);
    await new Promise((r) => setTimeout(r, retryAfter * 1000));
    return _fetch<T>(path, options, 1);
  }

  if (res.status === 401) {
    throw new SportradarError(401, path, "Sportradar authentication failed. Check SPORTRADAR_API_KEY.");
  }
  if (res.status === 403) {
    throw new SportradarError(403, path, `Sportradar access denied for ${path}. Your key may not be licensed for this competition or endpoint.`);
  }
  if (res.status === 404) {
    throw new SportradarError(404, path, `Sportradar resource not found: ${path}`);
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "(no body)");
    throw new SportradarError(res.status, path, `Sportradar API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

// ── Path builder helpers ───────────────────────────────────────────────────────

/**
 * Build a localised path.
 *
 * @example srPath("en", "/competitions") → "/en/competitions.json"
 */
export function srPath(locale: string, segment: string): string {
  return `/${locale}${segment}.json`;
}
