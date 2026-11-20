-- ============================================================
-- PunterStat — Migration 065: Bet Journal Legs (Per-Leg Acca Tracking)
--
-- Tracks each individual selection inside an accumulator (or single),
-- enabling per-leg accuracy analytics, manual per-leg settlement, and
-- automatic match-result settlement where 1+ lost leg marks the entire
-- accumulator lost.
-- ============================================================

create table if not exists public.bet_journal_legs (
  id           uuid primary key default gen_random_uuid(),
  bet_id       uuid not null references public.bet_journal (id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade,

  position     integer not null default 0,
  event_name   text not null check (char_length(event_name) between 1 and 200),
  home_team    text check (char_length(home_team) <= 100),
  away_team    text check (char_length(away_team) <= 100),
  match_date   timestamptz,
  market       text not null default '1X2' check (char_length(market) <= 80),
  selection    text not null check (char_length(selection) between 1 and 200),
  odds         numeric(8, 3) not null check (odds > 1),

  status       text not null default 'pending'
               check (status in ('pending', 'won', 'lost', 'void')),
  result_score text check (char_length(result_score) <= 32),
  settled_at   timestamptz,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists bet_journal_legs_bet_pos_idx
  on public.bet_journal_legs (bet_id, position);

create index if not exists bet_journal_legs_user_status_idx
  on public.bet_journal_legs (user_id, status);

drop trigger if exists set_bet_journal_legs_updated_at on public.bet_journal_legs;
create trigger set_bet_journal_legs_updated_at
  before update on public.bet_journal_legs
  for each row execute procedure public.update_updated_at();

alter table public.bet_journal_legs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'bet_journal_legs'
      and policyname = 'Users manage own bet legs'
  ) then
    create policy "Users manage own bet legs"
      on public.bet_journal_legs for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;
