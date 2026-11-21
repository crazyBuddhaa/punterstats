import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://punterstat.site";

function url(
  path: string,
  priority = 0.7,
  freq: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly"
): MetadataRoute.Sitemap[number] {
  return { url: `${BASE_URL}${path}`, lastModified: new Date(), changeFrequency: freq, priority };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    url("/", 1.0, "daily"),
    url("/sports-university", 0.9, "weekly"),
    url("/betting-academy", 0.9, "weekly"),
    url("/betting-academy/option-glossary", 0.85, "monthly"),
    url("/league-glossary", 0.85, "monthly"),
    url("/simulation-engine", 0.9, "weekly"),
    url("/simulation-engine/probability-simulator", 0.8, "monthly"),
    url("/simulation-engine/bet-simulator", 0.8, "monthly"),
    url("/match-breakdown", 0.9, "weekly"),
    url("/match-breakdown/analyzer", 0.8, "weekly"),
    url("/stats", 0.85, "weekly"),
    url("/stats/results", 0.8, "weekly"),
    url("/stats/head-to-head", 0.8, "weekly"),
    url("/bet-analysis", 0.9, "weekly"),
    url("/bet-learning", 0.9, "weekly"),
    url("/bet-assist", 0.95, "weekly"),
    url("/bet-assist/slip-checker", 0.9, "monthly"),
    url("/spot-the-value", 0.85, "daily"),
    url("/blog", 0.85, "daily"),
    url("/pricing", 0.85, "monthly"),
    url("/about", 0.6, "monthly"),
    url("/faq", 0.6, "monthly"),
    url("/contact", 0.5, "monthly"),
    url("/responsible-gambling", 0.5, "monthly"),
    url("/terms", 0.3, "monthly"),
    url("/privacy", 0.3, "monthly"),
  ];

  const dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    const supabase = await createClient();

    // Published courses (with category info for route building)
    const { data: courses } = await supabase
      .from("courses")
      .select("slug, updated_at, category:course_categories(slug, section)")
      .eq("is_published", true);

    if (courses) {
      for (const course of courses) {
        const cat = Array.isArray(course.category) ? course.category[0] : course.category;
        if (!cat?.slug || !cat?.section) continue;
        const base = cat.section === "betting_academy" ? "/betting-academy" : "/sports-university";
        dynamicRoutes.push({
          url: `${BASE_URL}${base}/${cat.slug}/${course.slug}`,
          lastModified: course.updated_at ? new Date(course.updated_at) : new Date(),
          changeFrequency: "weekly",
          priority: 0.75,
        });
      }
    }

    // Published blog posts
    const { data: posts } = await supabase
      .from("blog_posts")
      .select("slug, updated_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(200);

    if (posts) {
      for (const post of posts) {
        dynamicRoutes.push({
          url: `${BASE_URL}/blog/${post.slug}`,
          lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }
    }

    // League glossary profiles
    const { data: leagues } = await supabase
      .from("leagues")
      .select("slug, updated_at")
      .order("name", { ascending: true })
      .limit(200);

    if (leagues) {
      for (const league of leagues) {
        dynamicRoutes.push({
          url: `${BASE_URL}/league-glossary/${league.slug}`,
          lastModified: league.updated_at ? new Date(league.updated_at) : new Date(),
          changeFrequency: "monthly",
          priority: 0.65,
        });
      }
    }
  } catch {
    // Supabase not configured — return static routes only
  }

  return [...staticRoutes, ...dynamicRoutes];
}
