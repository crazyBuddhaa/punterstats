-- Stage 1 of "Suggested Features" plan: analytics event tracking.
--
-- Lightweight product-analytics table, separate from audit_logs (which is a
-- security/audit trail). analytics_events captures user-facing product
-- events so later stages (Calibration Dashboard, Learning Path
-- Recommendations) can query behavioural signal.

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_name text not null,
  properties jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_user_id_idx on public.analytics_events(user_id);
create index if not exists analytics_events_event_name_idx on public.analytics_events(event_name);
create index if not exists analytics_events_created_at_idx on public.analytics_events(created_at desc);

alter table public.analytics_events enable row level security;

-- Clients must never be able to forge analytics records — writes only via
-- the service-role client (see lib/analytics/tracker.ts), same pattern as
-- audit_logs. No INSERT policy is defined for anon/authenticated roles.

-- Users may read their own event history (used by future recommendation UI).
create policy "Users can view their own analytics events"
  on public.analytics_events for select
  using (auth.uid() = user_id);

-- Admins can read all events (used by the Admin Data Health / analytics views).
create policy "Admins can view all analytics events"
  on public.analytics_events for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid() and profiles.role = 'admin'
    )
  );
