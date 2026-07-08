-- ============================================================
-- PunterStat — R2 Sync Log Table
--
-- Tracks every data sync run (cron or manual) that writes to
-- Cloudflare R2 and/or ingests into Supabase. Provides an
-- audit trail and makes it easy to debug sync failures from
-- the admin panel.
--
-- Run after 037_historical_matches_extend.sql
-- ============================================================

create table if not exists public.r2_sync_log (
  id                    uuid        primary key default gen_random_uuid(),
  run_id                text        not null unique,            -- e.g. "cron_1720348800000"
  trigger               text        not null                    -- "cron" | "manual" | "backfill"
                          check (trigger in ('cron', 'manual', 'backfill')),
  started_at            timestamptz not null,
  completed_at          timestamptz,
  leagues_synced        text[]      not null default '{}',      -- league codes that succeeded
  seasons_synced        text[]      not null default '{}',      -- season codes that succeeded
  total_matches_upserted integer    not null default 0,
  total_odds_upserted   integer     not null default 0,
  error_count           integer     not null default 0,
  errors                text[]      not null default '{}',
  r2_log_key            text,                                   -- R2 object key of the full JSON log
  created_at            timestamptz not null default now()
);

-- Index for admin panel queries (most recent first)
create index if not exists r2_sync_log_started_at_idx
  on public.r2_sync_log (started_at desc);

create index if not exists r2_sync_log_trigger_idx
  on public.r2_sync_log (trigger);

-- ── Row-level security ────────────────────────────────────────────────────────
alter table public.r2_sync_log enable row level security;

-- Admins can read all rows
create policy "r2_sync_log_admin_read"
  on public.r2_sync_log
  for select
  using (
    exists (
      select 1 from public.admin_roles
      where user_id = auth.uid()
    )
  );

-- Only service role may insert / update (cron + admin API routes use admin client)
create policy "r2_sync_log_service_write"
  on public.r2_sync_log
  for all
  using     (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- ── Helper: record a completed sync run ───────────────────────────────────────
-- Called from API routes after a sync completes.
-- Usage: select record_r2_sync_run('cron_123', 'cron', ...);
create or replace function public.record_r2_sync_run(
  p_run_id                text,
  p_trigger               text,
  p_started_at            timestamptz,
  p_completed_at          timestamptz,
  p_leagues_synced        text[],
  p_seasons_synced        text[],
  p_total_matches_upserted integer,
  p_total_odds_upserted   integer,
  p_errors                text[],
  p_r2_log_key            text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.r2_sync_log (
    run_id, trigger, started_at, completed_at,
    leagues_synced, seasons_synced,
    total_matches_upserted, total_odds_upserted,
    error_count, errors, r2_log_key
  ) values (
    p_run_id, p_trigger, p_started_at, p_completed_at,
    p_leagues_synced, p_seasons_synced,
    p_total_matches_upserted, p_total_odds_upserted,
    cardinality(p_errors), p_errors, p_r2_log_key
  )
  on conflict (run_id) do update set
    completed_at             = excluded.completed_at,
    total_matches_upserted   = excluded.total_matches_upserted,
    total_odds_upserted      = excluded.total_odds_upserted,
    error_count              = excluded.error_count,
    errors                   = excluded.errors,
    r2_log_key               = excluded.r2_log_key;
end;
$$;
