-- ============================================================
-- PunterStat — Option Glossary Schema
-- Creates bet_categories and bet_type_glossary tables with RLS.
-- Run after 028_league_glossary_seed.sql (independent of league
-- glossary schema/seed but numbered sequentially for clarity).
-- ============================================================

-- ============================================================
-- BET CATEGORIES (static reference data)
-- ============================================================
create table public.bet_categories (
  id         uuid primary key default uuid_generate_v4(),
  slug       text not null unique,
  name       text not null,
  sort_order integer not null default 0
);

-- Pre-insert the five canonical categories
insert into public.bet_categories (slug, name, sort_order) values
  ('match-result',   'Match Result',   1),
  ('goals-markets',  'Goals Markets',  2),
  ('handicaps',      'Handicaps',      3),
  ('correct-score',  'Correct Score',  4),
  ('player-props',   'Player Props',   5);

-- ============================================================
-- BET TYPE GLOSSARY
-- ============================================================
create table public.bet_type_glossary (
  id                 uuid primary key default uuid_generate_v4(),
  category_id        uuid references public.bet_categories(id) on delete restrict not null,
  slug               text not null unique,
  name               text not null,
  sort_order         integer not null default 0,
  explanation        text not null,   -- plain English, no jargon
  worked_example     text not null,   -- real numbers, step-by-step walk-through
  volatility_note    text not null,   -- variance level and why
  common_misreadings text[] not null default '{}', -- 2-4 bullets of what people get wrong
  is_published       boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create trigger set_bet_type_glossary_updated_at
  before update on public.bet_type_glossary
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- INDEXES
-- ============================================================
create index bet_type_glossary_category_published_sort_idx
  on public.bet_type_glossary (category_id, is_published, sort_order);

create index bet_type_glossary_slug_idx
  on public.bet_type_glossary (slug);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.bet_categories     enable row level security;
alter table public.bet_type_glossary  enable row level security;

-- bet_categories: fully public read (no published flag — they are reference data)
create policy "Public read bet categories"
  on public.bet_categories for select
  using (true);

-- bet_type_glossary: public read published entries only
create policy "Public read published bet type glossary"
  on public.bet_type_glossary for select
  using (is_published = true);

-- Admins: full access to bet_categories
create policy "Admins full access to bet categories"
  on public.bet_categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- Admins: full access to bet_type_glossary
create policy "Admins full access to bet type glossary"
  on public.bet_type_glossary for all
  using (public.is_admin())
  with check (public.is_admin());
