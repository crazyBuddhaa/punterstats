-- ============================================================
-- PunterStat — Migration 010: Access Control, Audit Log RLS,
--              Data Isolation gaps, Performance Indexes
-- Target scale: 100 K registered users, 10 K concurrent
--
-- SAFE TO RE-RUN: every policy creation is wrapped in a DO
-- block that checks pg_policies before acting.
-- ============================================================

-- ── 1. AUDIT LOGS — complete the RLS setup started in migration 005 ──────
--
-- Migration 005 already did:
--   • ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY
--   • "Admins read all audit logs"  (admin SELECT)
--   • "Service insert audit logs" WITH CHECK (true)   ← too permissive
--
-- Migration 010 adds:
--   • User self-read policy (GDPR / transparency)
--   • Admin delete policy (retention management)
--   • Replaces the permissive "Service insert" policy with a
--     service-role-only INSERT so clients cannot forge audit records.
--     (No INSERT policy visible to authenticated role → only the service
--     role, which bypasses RLS entirely, may write.)

-- 1a. User self-read (idempotent guard)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'audit_logs'
      AND policyname = 'Users read own audit logs'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Users read own audit logs"
        ON public.audit_logs FOR SELECT TO authenticated
        USING (auth.uid() = user_id)
    $p$;
  END IF;
END $$;

-- 1b. Admin delete (retention management, idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'audit_logs'
      AND policyname = 'Admins delete audit logs'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Admins delete audit logs"
        ON public.audit_logs FOR DELETE
        USING (public.is_admin())
    $p$;
  END IF;
END $$;

-- 1c. Drop the over-permissive insert policy from migration 005 and do not
-- replace it with an authenticated-role INSERT policy.  The server-side
-- audit logger (lib/audit/logger.ts) uses createAdminClient() which runs
-- as the service role and therefore bypasses RLS entirely — it needs no
-- explicit policy.  Removing the old policy closes the forgery vector.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'audit_logs'
      AND policyname = 'Service insert audit logs'
  ) THEN
    EXECUTE $p$ DROP POLICY "Service insert audit logs" ON public.audit_logs $p$;
  END IF;
END $$;

-- ── 2. PREDICTION RECORDS — admin visibility (idempotent) ───────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'prediction_records'
      AND policyname = 'Admins read all prediction records'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Admins read all prediction records"
        ON public.prediction_records FOR SELECT
        USING (public.is_admin())
    $p$;
  END IF;
END $$;

-- ── 3. FIXTURES CACHE — admin write access (idempotent) ─────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'fixtures_cache'
      AND policyname = 'Admins manage fixtures cache'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Admins manage fixtures cache"
        ON public.fixtures_cache FOR ALL
        USING (public.is_admin())
        WITH CHECK (public.is_admin())
    $p$;
  END IF;
END $$;

-- ── 4. ODDS CACHE — admin write access (idempotent) ─────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'odds_cache'
      AND policyname = 'Admins manage odds cache'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Admins manage odds cache"
        ON public.odds_cache FOR ALL
        USING (public.is_admin())
        WITH CHECK (public.is_admin())
    $p$;
  END IF;
END $$;

-- ── 5. API QUOTA LOG — admin read access (idempotent) ───────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'api_quota_log'
      AND policyname = 'Admins read api quota log'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Admins read api quota log"
        ON public.api_quota_log FOR SELECT
        USING (public.is_admin())
    $p$;
  END IF;
END $$;

-- ── 6. MATCH ANALYSES — admin read access (idempotent) ──────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'match_analyses'
      AND policyname = 'Admins read all match analyses'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Admins read all match analyses"
        ON public.match_analyses FOR SELECT
        USING (public.is_admin())
    $p$;
  END IF;
END $$;

-- ── 7. PERFORMANCE INDEXES for 100 K users / 10 K concurrent ────────────
--
-- Design notes:
--   • lesson_progress and bookmarks are the hottest tables — every
--     dashboard load hits them per user.
--   • subscriptions partial index on active rows only (status = 'active'),
--     covering (user_id, current_period_end) for tier expiry checks.
--   • notifications partial index on unread rows eliminates full scans.
--   • audit_logs composite indexes: (user_id, created_at DESC) for paged
--     user-facing queries; (action, created_at DESC) for admin filtering.
--   • prediction_records partial index on resolved rows for calibration.
--   • All indexes use IF NOT EXISTS — safe to re-run.

-- lesson_progress
CREATE INDEX IF NOT EXISTS lesson_progress_user_lesson_idx
  ON public.lesson_progress (user_id, lesson_id);

CREATE INDEX IF NOT EXISTS lesson_progress_user_completed_idx
  ON public.lesson_progress (user_id, completed);

-- bookmarks
CREATE INDEX IF NOT EXISTS bookmarks_user_lesson_idx
  ON public.bookmarks (user_id, lesson_id);

-- subscriptions — access control tier check (partial: active rows only)
-- Column is current_period_end (not expires_at).
CREATE INDEX IF NOT EXISTS subscriptions_user_status_period_idx
  ON public.subscriptions (user_id, status, current_period_end)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS subscriptions_plan_status_idx
  ON public.subscriptions (plan, status);

-- notifications — unread count per user
-- Column is is_read (not read).
CREATE INDEX IF NOT EXISTS notifications_user_unread_idx
  ON public.notifications (user_id, created_at DESC)
  WHERE is_read = false;

-- simulation_history
CREATE INDEX IF NOT EXISTS simulation_history_session_created_idx
  ON public.simulation_history (session_id, created_at DESC);

-- simulation_sessions
CREATE INDEX IF NOT EXISTS simulation_sessions_user_created_idx
  ON public.simulation_sessions (user_id, created_at DESC);

-- match_analysis uses author_id (not user_id) — see migration 001
CREATE INDEX IF NOT EXISTS match_analysis_author_created_idx
  ON public.match_analysis (author_id, created_at DESC);

-- audit_logs
CREATE INDEX IF NOT EXISTS audit_logs_user_created_idx
  ON public.audit_logs (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS audit_logs_action_created_idx
  ON public.audit_logs (action, created_at DESC);

-- prediction_records — calibration query
CREATE INDEX IF NOT EXISTS prediction_records_user_resolved_idx
  ON public.prediction_records (user_id, resolved_at DESC)
  WHERE resolved_at IS NOT NULL;

-- blog_posts — published listing
CREATE INDEX IF NOT EXISTS blog_posts_published_at_idx
  ON public.blog_posts (published_at DESC)
  WHERE is_published = true;

-- courses — published listing per category
CREATE INDEX IF NOT EXISTS courses_category_published_order_idx
  ON public.courses (category_id, sort_order)
  WHERE is_published = true;

-- lessons — published listing per course
CREATE INDEX IF NOT EXISTS lessons_course_published_order_idx
  ON public.lessons (course_id, sort_order)
  WHERE is_published = true;

-- profiles — role-based admin queries
CREATE INDEX IF NOT EXISTS profiles_role_idx
  ON public.profiles (role)
  WHERE role != 'user';
