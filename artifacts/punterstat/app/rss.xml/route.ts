/**
 * GET /rss.xml
 *
 * RSS 2.0 feed of published blog posts, newest first.
 * Revalidated every 30 minutes (matching the blog page ISR cadence).
 *
 * Feed is publicly accessible — no auth required.
 * Useful for readers, podcast tools, and aggregators that monitor the blog.
 */

import { createClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";

export const revalidate = 1800; // 30 minutes

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://punterstat.site";
const FEED_TITLE       = "PunterStat Blog";
const FEED_DESCRIPTION = "Analysis, education, and insight on football, probability, and sports intelligence from PunterStat.";
const FEED_LANGUAGE    = "en-gb";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("title, slug, excerpt, content, tags, published_at, updated_at, author_name")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(50);

  const items = (posts ?? [])
    .map((post) => {
      const link        = `${BASE_URL}/blog/${post.slug}`;
      const pubDate     = new Date(
        post.published_at ?? post.updated_at ?? Date.now()
      ).toUTCString();
      const description = post.excerpt
        ? escapeXml(post.excerpt)
        : escapeXml(stripHtml(post.content ?? "").slice(0, 300));

      const categories = (post.tags as string[] ?? [])
        .map((t: string) => `<category>${escapeXml(t)}</category>`)
        .join("\n      ");

      const author = post.author_name
        ? `<dc:creator>${escapeXml(post.author_name)}</dc:creator>`
        : "";

      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      ${author}
      ${categories}
    </item>`;
    })
    .join("\n");

  const lastBuildDate = posts?.[0]?.published_at
    ? new Date(posts[0].published_at).toUTCString()
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${BASE_URL}/blog</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>${FEED_LANGUAGE}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${BASE_URL}/logo.png</url>
      <title>${escapeXml(FEED_TITLE)}</title>
      <link>${BASE_URL}/blog</link>
    </image>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
