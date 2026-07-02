-- ============================================================
-- Stage 7 — Match Breakdown Engine
-- Table: match_analyses
-- Stores user-saved match probability analyses (JSONB payload)
-- ============================================================

create table if not exists public.match_analyses (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references auth.users(id) on delete cascade,
  home_team_name   text        not null check (char_length(home_team_name) <= 100),
  away_team_name   text        not null check (char_length(away_team_name) <= 100),
  analysis_input   jsonb       not null,
  analysis_result  jsonb       not null,
  created_at       timestamptz not null default now()
);

-- ── RLS ──────────────────────────────────────────────────────
alter table public.match_analyses enable row level security;

create policy "Users can view own analyses"
  on public.match_analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert own analyses"
  on public.match_analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own analyses"
  on public.match_analyses for delete
  using (auth.uid() = user_id);

-- ── Indexes ───────────────────────────────────────────────────
create index if not exists match_analyses_user_id_idx   on public.match_analyses (user_id);
create index if not exists match_analyses_created_at_idx on public.match_analyses (created_at desc);
