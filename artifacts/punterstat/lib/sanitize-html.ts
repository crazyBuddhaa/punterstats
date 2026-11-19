import sanitizeHtml from "sanitize-html";

/**
 * Allowed HTML tags for PunterStat lessons and blog posts.
 * Covers headings, paragraphs, lists, tables, inline emphasis, links,
 * images, blockquotes, code blocks, and live data-block marker divs.
 *
 * NOTE: We intentionally use `sanitize-html` (pure-JS, htmlparser2-based)
 * instead of `isomorphic-dompurify`. The latter depends on jsdom on the
 * server, which cannot run inside the Cloudflare Workers runtime (OpenNext)
 * and caused every lesson and blog page to throw a 500.
 */
const ALLOWED_TAGS = [
  "h1",
  "h2",
  "h3",
  "h4",
  "p",
  "ul",
  "ol",
  "li",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "a",
  "img",
  "blockquote",
  "hr",
  "br",
  "code",
  "pre",
  "span",
  "div",
  "sup",
  "sub",
];

const GLOBAL_ATTR = ["title"];

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] = {
  "*": GLOBAL_ATTR,
  a: ["href", "target", "rel"],
  img: ["src", "alt", "width", "height", "loading"],
  th: ["colspan", "rowspan", "scope"],
  td: ["colspan", "rowspan", "scope"],
  // Live lesson data-block markers (<div data-block="stat" data-factor="..." ...>)
  div: ["data-block", "data-factor", "data-league", "data-seasons"],
};

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: ALLOWED_ATTRIBUTES,
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https", "data"] },
  allowProtocolRelative: false,
  // Drop the contents of dangerous elements entirely, not just the tags.
  nonTextTags: ["script", "style", "textarea", "option", "noscript", "iframe", "object", "embed"],
  disallowedTagsMode: "discard",
};

/**
 * Sanitize lesson or blog HTML at render time and on save.
 * Strips scripts, event handlers, iframes, style tags, and unsafe URLs
 * while preserving the structural markup used by lessons and articles.
 */
export function sanitizeContentHtml(html: string): string {
  if (!html) return "";
  return sanitizeHtml(html, OPTIONS);
}
