import DOMPurify from "isomorphic-dompurify";

/**
 * Allowed HTML tags for PunterStat lessons and blog posts.
 * Covers headings, paragraphs, lists, tables, inline emphasis, links,
 * images, blockquotes, code blocks, and live data-block marker divs.
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

const ALLOWED_ATTR = [
  "href",
  "target",
  "rel",
  "title",
  "src",
  "alt",
  "width",
  "height",
  "loading",
  "colspan",
  "rowspan",
  "scope",
  // Live lesson data-block markers (<div data-block="stat" data-factor="..." ...>)
  "data-block",
  "data-factor",
  "data-league",
  "data-seasons",
];

/**
 * Sanitize lesson or blog HTML at render time and on save.
 * Strips scripts, event handlers, iframes, style tags, and unsafe URLs
 * while preserving the structural markup used by lessons and articles.
 */
export function sanitizeContentHtml(html: string): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}
