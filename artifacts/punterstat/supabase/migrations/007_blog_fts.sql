-- ============================================================
-- PunterStat — Migration 007: Blog Full-Text Search
-- Run after 006_fixes.sql
-- ============================================================

-- Add a stored generated tsvector column that indexes title,
-- excerpt, and content together so textSearch() works across
-- all three fields in a single query.
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector(
      'english',
      coalesce(title, '')   || ' ' ||
      coalesce(excerpt, '') || ' ' ||
      coalesce(content, '')
    )
  ) STORED;

-- GIN index keeps full-text lookups fast even as the post count grows.
CREATE INDEX IF NOT EXISTS blog_posts_fts_idx
  ON public.blog_posts USING gin(fts);
