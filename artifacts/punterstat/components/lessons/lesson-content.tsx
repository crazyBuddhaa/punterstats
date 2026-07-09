import { getBlockStat, type BlockFactor } from "@/lib/lessons/data-blocks";

const VALID_FACTORS: BlockFactor[] = ["home_win_rate", "avg_goals", "btts_rate", "over25_rate"];

// ─── HTML entity decoder ──────────────────────────────────────────────────────

/**
 * Decode HTML entities stored in the DB. Some lessons were saved via a
 * plain textarea where the browser submitted entity-encoded text. This is
 * a no-op when content already contains real tags.
 */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&"); // must be last — avoids double-decoding &amp;lt;
}

// ─── Content chunk parser ─────────────────────────────────────────────────────

type ContentChunk =
  | { kind: "html"; content: string }
  | { kind: "block"; factor: BlockFactor; league?: string; seasons?: number };

/**
 * Splits raw lesson HTML into alternating HTML segments and data-block markers.
 *
 * Canonical marker format:
 *   <div data-block="stat" data-factor="home_win_rate" data-league="E0" data-seasons="5"></div>
 *
 * Both `></div>` (standard) and `/>` (self-closing) closing styles are accepted.
 *
 * Supported factors: home_win_rate | avg_goals | btts_rate | over25_rate
 * Unknown factors are logged and skipped — the surrounding HTML is left intact.
 */
function parseChunks(html: string): ContentChunk[] {
  const chunks: ContentChunk[] = [];
  // (?:\/\s*>|><\/div>) — matches self-closing /> or standard ></div>
  // [^>\/]* before the closing — excludes / so self-closing /> isn't consumed
  const BLOCK_RE = /<div\s[^>]*data-block="[^"]*"[^>\/]*(?:\/\s*>|><\/div>)/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = BLOCK_RE.exec(html)) !== null) {
    if (match.index > lastIndex) {
      chunks.push({ kind: "html", content: html.slice(lastIndex, match.index) });
    }

    const tag = match[0];
    const factorRaw = tag.match(/data-factor="([^"]*)"/)?.[1] ?? "";

    if (!VALID_FACTORS.includes(factorRaw as BlockFactor)) {
      // Unknown factor — leave as empty comment; do not discard surrounding HTML
      console.warn(`[lesson-content] Unknown data-factor "${factorRaw}" — skipping block.`);
      lastIndex = match.index + match[0].length;
      continue;
    }

    const league = tag.match(/data-league="([^"]*)"/)?.[1];
    const seasonsStr = tag.match(/data-seasons="([^"]*)"/)?.[1];
    const seasons = seasonsStr ? parseInt(seasonsStr, 10) : undefined;

    chunks.push({ kind: "block", factor: factorRaw as BlockFactor, league, seasons });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < html.length) {
    chunks.push({ kind: "html", content: html.slice(lastIndex) });
  }
  return chunks;
}

// ─── Data block renderer ──────────────────────────────────────────────────────

interface DataBlockProps {
  factor: BlockFactor;
  league?: string;
  seasons?: number;
}

async function DataBlock({ factor, league, seasons }: DataBlockProps) {
  const stat = await getBlockStat({ factor, league, seasons });

  if (!stat) {
    return (
      <div className="my-4 rounded-xl border border-border bg-slate-50 px-4 py-3 text-xs text-[#1e293b]/40 italic">
        Stat unavailable — data loading
      </div>
    );
  }

  return (
    <div className="my-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600">
        Live from the dataset
      </p>
      <p className="mt-1 text-2xl font-bold text-[#0f172a]">{stat.value}</p>
      <p className="text-sm font-medium text-[#1e293b]/80">{stat.label}</p>
      <p className="mt-0.5 text-xs text-[#1e293b]/50">{stat.context}</p>
    </div>
  );
}

// ─── Prose class shared across both lesson sections ───────────────────────────

function proseClass(variant: "betting-academy" | "sports-university") {
  const linkColor =
    variant === "betting-academy" ? "text-emerald-600" : "text-[#3D2DFF]";
  const blockquoteBorder =
    variant === "betting-academy" ? "border-emerald-500/30" : "border-[#3D2DFF]/30";

  return [
    "text-sm text-[#1e293b] leading-relaxed",
    "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-[#0f172a] [&_h1]:mt-6 [&_h1]:mb-3",
    "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-[#0f172a] [&_h2]:mt-5 [&_h2]:mb-2",
    "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[#0f172a] [&_h3]:mt-4 [&_h3]:mb-1.5",
    "[&_p]:mb-3 [&_p]:leading-relaxed",
    "[&_ul]:list-disc [&_ul]:list-outside [&_ul]:ml-5 [&_ul]:mb-3 [&_ul]:space-y-1.5",
    "[&_ol]:list-decimal [&_ol]:list-outside [&_ol]:ml-5 [&_ol]:mb-3 [&_ol]:space-y-1.5",
    "[&_li]:text-[#1e293b]/80 [&_li]:leading-relaxed",
    `[&_a]:${linkColor} [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:opacity-80`,
    "[&_img]:rounded-xl [&_img]:max-w-full [&_img]:my-4 [&_img]:block [&_img]:mx-auto",
    "[&_hr]:border-border [&_hr]:my-6",
    "[&_strong]:font-semibold [&_em]:italic [&_u]:underline",
    `[&_blockquote]:border-l-4 [&_blockquote]:${blockquoteBorder} [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[#1e293b]/60 [&_blockquote]:my-4`,
    "[&_table]:w-full [&_table]:text-xs [&_table]:border-collapse [&_table]:mb-4",
    "[&_th]:text-left [&_th]:font-semibold [&_th]:text-[#0f172a] [&_th]:border-b [&_th]:border-border [&_th]:pb-1.5 [&_th]:pr-4",
    "[&_td]:text-[#1e293b]/80 [&_td]:border-b [&_td]:border-border/50 [&_td]:py-1.5 [&_td]:pr-4",
  ].join(" ");
}

// ─── Public component ─────────────────────────────────────────────────────────

interface LessonContentProps {
  html: string;
  variant?: "betting-academy" | "sports-university";
}

/**
 * Server component that renders lesson HTML with optional live data block support.
 *
 * For lessons without any `data-block` markers (all current lessons), this is
 * equivalent to a plain `dangerouslySetInnerHTML` render — no DB queries are made.
 *
 * When a lesson contains a data-block marker, e.g.:
 *   <div data-block="stat" data-factor="home_win_rate" data-league="E0"></div>
 * the component queries the historical_matches dataset server-side and renders
 * a live stat card inline.
 */
export async function LessonContent({
  html,
  variant = "sports-university",
}: LessonContentProps) {
  const decoded = decodeHtmlEntities(html);
  const chunks = parseChunks(decoded);
  const className = proseClass(variant);

  // Fast path: no data-block markers — single render, no async work
  if (chunks.length === 1 && chunks[0].kind === "html") {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: chunks[0].content }}
      />
    );
  }

  // Mixed path: render HTML segments and live blocks interspersed
  return (
    <div className={className}>
      {chunks.map((chunk, i) => {
        if (chunk.kind === "html") {
          return (
            <div
              key={i}
              dangerouslySetInnerHTML={{ __html: chunk.content }}
            />
          );
        }
        return (
          <DataBlock
            key={i}
            factor={chunk.factor}
            league={chunk.league}
            seasons={chunk.seasons}
          />
        );
      })}
    </div>
  );
}
