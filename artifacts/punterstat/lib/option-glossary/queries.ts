import { createClient } from "@/lib/supabase/server";
import type { BetCategory, BetTypeEntry } from "./types";

// ── Mappers ────────────────────────────────────────────────

function mapCategory(row: Record<string, unknown>): BetCategory {
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    sortOrder: row.sort_order as number,
  };
}

function mapEntry(row: Record<string, unknown>): BetTypeEntry {
  const cat = row.bet_categories as Record<string, unknown> | null;
  return {
    id: row.id as string,
    categoryId: row.category_id as string,
    slug: row.slug as string,
    name: row.name as string,
    sortOrder: row.sort_order as number,
    explanation: row.explanation as string,
    workedExample: row.worked_example as string,
    volatilityNote: row.volatility_note as string,
    commonMisreadings: row.common_misreadings as string[],
    isPublished: row.is_published as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    category: cat ? mapCategory(cat) : undefined,
  };
}

// ── Queries ────────────────────────────────────────────────

export async function getBetCategories(): Promise<BetCategory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bet_categories")
    .select("*")
    .order("sort_order");
  return (data ?? []).map(mapCategory);
}

export async function getAllEntries(): Promise<BetTypeEntry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bet_type_glossary")
    .select("*, bet_categories(id, slug, name, sort_order)")
    .eq("is_published", true)
    .order("sort_order");
  return (data ?? []).map(mapEntry);
}

export async function getEntriesByCategory(categorySlug: string): Promise<BetTypeEntry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bet_type_glossary")
    .select("*, bet_categories!inner(id, slug, name, sort_order)")
    .eq("is_published", true)
    .eq("bet_categories.slug", categorySlug)
    .order("sort_order");
  return (data ?? []).map(mapEntry);
}

export async function getEntryCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("bet_type_glossary")
    .select("id", { count: "exact", head: true })
    .eq("is_published", true);
  return count ?? 0;
}
