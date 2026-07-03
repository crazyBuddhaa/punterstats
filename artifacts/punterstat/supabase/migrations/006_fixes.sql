-- ============================================================
-- PunterStat — Migration 006: Bug Fix Additions
-- Run in order after 005_admin_rls.sql
-- ============================================================

-- ── 1. welcome_sent guard on profiles ─────────────────────────────────────────
-- Prevents duplicate welcome emails when a user clicks the confirmation
-- link more than once. The auth callback checks this flag before sending
-- and marks it true immediately after queueing the email.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS welcome_sent boolean NOT NULL DEFAULT false;

-- ── 2. Denormalised author_name on blog_posts ──────────────────────────────────
-- auth.users is not queryable by the anon key (Supabase security model).
-- Rather than changing RLS or adding a public profiles join, we store the
-- author's display name at write time so the public blog never needs to
-- look up auth.users.
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS author_name text;

-- Backfill existing posts from the profiles table (best-effort — posts
-- whose author has been deleted will remain NULL, which is handled in UI).
UPDATE public.blog_posts bp
SET    author_name = p.display_name
FROM   public.profiles p
WHERE  bp.author_id = p.user_id
  AND  bp.author_name IS NULL;
