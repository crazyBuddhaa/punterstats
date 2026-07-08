-- ============================================================
-- PunterStat — Initial Database Schema
-- Run this against your Supabase project via:
--   Supabase Dashboard > SQL Editor, or
--   supabase db push (with Supabase CLI)
-- ============================================================

-- Required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ============================================================
-- SHARED TRIGGER — auto-update updated_at
-- ============================================================
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade not null unique,
  display_name  text,
  avatar_url    text,
  bio           text,
  role          text not null default 'user'
                  check (role in ('user', 'premium', 'admin')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-create a profile row when a new Supabase Auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (user_id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1)
    )
  );

  -- Also create a free subscription row
  insert into public.subscriptions (user_id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- COURSE CATEGORIES
-- ============================================================
create table public.course_categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  description text,
  icon_name   text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- COURSES
-- ============================================================
create table public.courses (
  id            uuid primary key default uuid_generate_v4(),
  category_id   uuid references public.course_categories(id) on delete set null,
  title         text not null,
  slug          text not null unique,
  description   text not null default '',
  thumbnail_url text,
  level         text not null default 'beginner'
                  check (level in ('beginner', 'intermediate', 'advanced')),
  is_premium    boolean not null default false,
  is_published  boolean not null default false,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger set_courses_updated_at
  before update on public.courses
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- LESSONS
-- ============================================================
create table public.lessons (
  id               uuid primary key default uuid_generate_v4(),
  course_id        uuid references public.courses(id) on delete cascade not null,
  title            text not null,
  slug             text not null,
  content          text,
  video_url        text,
  duration_seconds integer,
  sort_order       integer not null default 0,
  is_published     boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (course_id, slug)
);

create trigger set_lessons_updated_at
  before update on public.lessons
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- LESSON PROGRESS
-- ============================================================
create table public.lesson_progress (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  lesson_id    uuid references public.lessons(id) on delete cascade not null,
  completed    boolean not null default false,
  completed_at timestamptz,
  progress_pct integer not null default 0
                 check (progress_pct between 0 and 100),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create trigger set_lesson_progress_updated_at
  before update on public.lesson_progress
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- BOOKMARKS
-- ============================================================
create table public.bookmarks (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  lesson_id  uuid references public.lessons(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

-- ============================================================
-- SIMULATION SESSIONS
-- ============================================================
create table public.simulation_sessions (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references auth.users(id) on delete cascade not null,
  type             text not null check (type in ('bet', 'probability')),
  virtual_balance  numeric(12, 2) not null default 10000.00,
  starting_balance numeric(12, 2) not null default 10000.00,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger set_simulation_sessions_updated_at
  before update on public.simulation_sessions
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- SIMULATION HISTORY
-- ============================================================
create table public.simulation_history (
  id            uuid primary key default uuid_generate_v4(),
  session_id    uuid references public.simulation_sessions(id) on delete cascade not null,
  odds          numeric(8, 2) not null,
  stake         numeric(12, 2) not null,
  outcome       text not null check (outcome in ('win', 'loss')),
  profit_loss   numeric(12, 2) not null,
  balance_after numeric(12, 2) not null,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- SPORTS MATCHES
-- ============================================================
create table public.sports_matches (
  id          uuid primary key default uuid_generate_v4(),
  home_team   text not null,
  away_team   text not null,
  competition text not null,
  match_date  timestamptz not null,
  status      text not null default 'upcoming'
                check (status in ('upcoming', 'live', 'completed')),
  home_score  integer,
  away_score  integer,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger set_sports_matches_updated_at
  before update on public.sports_matches
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- MATCH ANALYSIS
-- ============================================================
create table public.match_analysis (
  id               uuid primary key default uuid_generate_v4(),
  match_id         uuid references public.sports_matches(id) on delete cascade not null,
  author_id        uuid references auth.users(id) on delete set null,
  content          text not null,
  home_form_rating integer check (home_form_rating between 1 and 10),
  away_form_rating integer check (away_form_rating between 1 and 10),
  is_published     boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger set_match_analysis_updated_at
  before update on public.match_analysis
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- BLOG POSTS
-- ============================================================
create table public.blog_posts (
  id            uuid primary key default uuid_generate_v4(),
  author_id     uuid references auth.users(id) on delete set null,
  title         text not null,
  slug          text not null unique,
  excerpt       text,
  content       text not null,
  thumbnail_url text,
  tags          text[] not null default '{}',
  is_published  boolean not null default false,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index blog_posts_slug_idx on public.blog_posts (slug);
create index blog_posts_tags_idx on public.blog_posts using gin (tags);

create trigger set_blog_posts_updated_at
  before update on public.blog_posts
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
create table public.subscriptions (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid references auth.users(id) on delete cascade not null unique,
  plan                 text not null default 'free'
                         check (plan in ('free', 'premium', 'pro')),
  status               text not null default 'active'
                         check (status in ('active', 'cancelled', 'expired', 'trialing')),
  current_period_start timestamptz not null default now(),
  current_period_end   timestamptz not null default (now() + interval '1 month'),
  cancelled_at         timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create trigger set_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  title      text not null,
  body       text not null,
  is_read    boolean not null default false,
  link       text,
  created_at timestamptz not null default now()
);

create index notifications_user_id_idx on public.notifications (user_id);

-- ============================================================
-- ADMIN ROLES
-- ============================================================
create table public.admin_roles (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade not null unique,
  granted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- FEATURE FLAGS
-- ============================================================
create table public.feature_flags (
  id          uuid primary key default uuid_generate_v4(),
  key         text not null unique,
  enabled     boolean not null default false,
  description text,
  updated_at  timestamptz not null default now()
);

insert into public.feature_flags (key, enabled, description) values
  ('certification_engine',    false, 'Hidden: certification and exam system'),
  ('match_analysis_live',     false, 'Live match analysis feed'),
  ('premium_subscriptions',   false, 'Subscription gating for premium content'),
  ('blog',                    true,  'Public blog section');

-- ============================================================
-- AUDIT LOGS
-- ============================================================
create table public.audit_logs (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete set null,
  action      text not null,
  entity_type text not null,
  entity_id   uuid,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

create index audit_logs_user_id_idx    on public.audit_logs (user_id);
create index audit_logs_created_at_idx on public.audit_logs (created_at desc);

-- ============================================================
-- CERTIFICATIONS — hidden, schema only, no UI exposure
-- ============================================================
create table public.certifications_hidden (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  slug          text not null unique,
  description   text,
  course_id     uuid references public.courses(id) on delete set null,
  passing_score integer not null default 80,
  is_active     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger set_certifications_updated_at
  before update on public.certifications_hidden
  for each row execute procedure public.update_updated_at();

create table public.certification_progress_hidden (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid references auth.users(id) on delete cascade not null,
  certification_id  uuid references public.certifications_hidden(id) on delete cascade not null,
  status            text not null default 'not_started'
                      check (status in ('not_started', 'in_progress', 'passed', 'failed')),
  score             integer,
  attempts          integer not null default 0,
  last_attempt_at   timestamptz,
  certificate_url   text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (user_id, certification_id)
);

create trigger set_cert_progress_updated_at
  before update on public.certification_progress_hidden
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles
alter table public.profiles enable row level security;
create policy "Users read own profile"   on public.profiles for select using (auth.uid() = user_id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = user_id);

-- Lesson progress
alter table public.lesson_progress enable row level security;
create policy "Users manage own lesson progress" on public.lesson_progress for all using (auth.uid() = user_id);

-- Bookmarks
alter table public.bookmarks enable row level security;
create policy "Users manage own bookmarks" on public.bookmarks for all using (auth.uid() = user_id);

-- Simulation sessions
alter table public.simulation_sessions enable row level security;
create policy "Users manage own simulation sessions" on public.simulation_sessions for all using (auth.uid() = user_id);

-- Simulation history (access via session ownership)
alter table public.simulation_history enable row level security;
create policy "Users manage own simulation history" on public.simulation_history for all
  using (exists (
    select 1 from public.simulation_sessions s
    where s.id = session_id and s.user_id = auth.uid()
  ));

-- Subscriptions
alter table public.subscriptions enable row level security;
create policy "Users read own subscription"   on public.subscriptions for select using (auth.uid() = user_id);
create policy "Users update own subscription" on public.subscriptions for update using (auth.uid() = user_id);

-- Notifications
alter table public.notifications enable row level security;
create policy "Users read own notifications"   on public.notifications for select using (auth.uid() = user_id);
create policy "Users update own notifications" on public.notifications for update using (auth.uid() = user_id);

-- Certification progress (hidden)
alter table public.certification_progress_hidden enable row level security;
create policy "Users manage own cert progress" on public.certification_progress_hidden for all using (auth.uid() = user_id);

-- Public read for published content
alter table public.courses           enable row level security;
alter table public.lessons           enable row level security;
alter table public.course_categories enable row level security;
alter table public.blog_posts        enable row level security;
alter table public.sports_matches    enable row level security;
alter table public.match_analysis    enable row level security;

create policy "Public read published courses"         on public.courses           for select using (is_published = true);
create policy "Public read published lessons"         on public.lessons           for select using (is_published = true);
create policy "Public read course categories"         on public.course_categories for select using (true);
create policy "Public read published blog posts"      on public.blog_posts        for select using (is_published = true);
create policy "Public read sports matches"            on public.sports_matches    for select using (true);
create policy "Public read published match analysis"  on public.match_analysis    for select using (is_published = true);
