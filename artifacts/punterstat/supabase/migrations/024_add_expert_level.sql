-- ============================================================
-- 024 — Extend courses.level check constraint to include 'expert'
-- Run this in Supabase SQL Editor before re-running migrations 019 and 021,
-- which insert courses at level = 'expert'.
-- ============================================================

alter table public.courses
  drop constraint if exists courses_level_check;

alter table public.courses
  add constraint courses_level_check
    check (level in ('beginner', 'intermediate', 'advanced', 'expert'));
