-- ============================================================
-- PunterStat — Stage 9: Admin RLS bypass policies
-- ============================================================

-- Helper: returns true if the current authenticated user is an admin
create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- PROFILES — admins can read and update all profiles
-- ============================================================
create policy "Admins read all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Admins update all profiles"
  on public.profiles for update
  using (public.is_admin());

-- ============================================================
-- SUBSCRIPTIONS — admins can read and update all subscriptions
-- ============================================================
create policy "Admins read all subscriptions"
  on public.subscriptions for select
  using (public.is_admin());

create policy "Admins update all subscriptions"
  on public.subscriptions for update
  using (public.is_admin());

-- ============================================================
-- COURSES — admins can do full CRUD
-- ============================================================
create policy "Admins full access to courses"
  on public.courses for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- LESSONS — admins can do full CRUD
-- ============================================================
create policy "Admins full access to lessons"
  on public.lessons for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- COURSE CATEGORIES — admins can do full CRUD
-- ============================================================
create policy "Admins full access to course categories"
  on public.course_categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- BLOG POSTS — admins can do full CRUD
-- ============================================================
create policy "Admins full access to blog posts"
  on public.blog_posts for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- NOTIFICATIONS — admins can read all notifications
-- ============================================================
create policy "Admins read all notifications"
  on public.notifications for select
  using (public.is_admin());

-- ============================================================
-- FEATURE FLAGS — enable RLS + admin full access
-- ============================================================
alter table public.feature_flags enable row level security;

create policy "Admins full access to feature flags"
  on public.feature_flags for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- AUDIT LOGS — enable RLS + admin read access
-- ============================================================
alter table public.audit_logs enable row level security;

create policy "Admins read all audit logs"
  on public.audit_logs for select
  using (public.is_admin());

create policy "Service insert audit logs"
  on public.audit_logs for insert
  with check (true);

-- ============================================================
-- ADMIN ROLES — admins can read the admin_roles table
-- ============================================================
alter table public.admin_roles enable row level security;

create policy "Admins read admin roles"
  on public.admin_roles for select
  using (public.is_admin());
