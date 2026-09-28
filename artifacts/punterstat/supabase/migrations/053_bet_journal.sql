-- Migration 053: Bet Journal (Bet Assist → Bet Tracker)
--
-- Lets signed-in users log the bets they place elsewhere and track ROI,
-- strike rate, closing-line value and bankroll over time. PunterStat never
-- takes bets — this is a personal record only.
--
-- NOTE: DEVELOPMENT_LOG.md previously reserved 052–057 for content work, but
-- 052 is already used by sportsapipro_season_cache. Planned content
-- migrations shift up by two (054+).

create table if not exists public.bet_journal (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,

  placed_at      timestamptz not null default now(),
  sport          text not null default 'football',
  event_name     text not null check (char_length(event_name) between 1 and 200),
  market         text not null default '1X2' check (char_length(market) <= 80),
  selection      text not null check (char_length(selection) between 1 and 200),
  bookmaker      text check (char_length(bookmaker) <= 80),

  odds           numeric(8, 3) not null check (odds > 1),
  stake          numeric(12, 2) not null check (stake > 0),
  -- The user's own probability estimate when they placed the bet (0–1), optional.
  your_prob      numeric(5, 4) check (your_prob is null or (your_prob > 0 and your_prob < 1)),
  -- Price at kick-off, for closing-line-value tracking, optional.
  closing_odds   numeric(8, 3) check (closing_odds is null or closing_odds > 1),

  status         text not null default 'pending'
                 check (status in ('pending', 'won', 'lost', 'void', 'half_won', 'half_lost', 'cashed_out')),
  -- Only used when status = 'cashed_out'.
  cashout_amount numeric(12, 2) check (cashout_amount is null or cashout_amount >= 0),
  notes          text check (char_length(notes) <= 1000),

  settled_at     timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists bet_journal_user_placed_idx
  on public.bet_journal (user_id, placed_at desc);

create trigger set_bet_journal_updated_at
  before update on public.bet_journal
  for each row execute procedure public.update_updated_at();

alter table public.bet_journal enable row level security;

create policy "Users manage own bet journal"
  on public.bet_journal for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
