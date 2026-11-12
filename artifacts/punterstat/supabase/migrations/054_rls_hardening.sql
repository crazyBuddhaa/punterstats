-- ============================================================
-- Migration 054: RLS Privilege-Escalation Fixes & Row Ownership Hardening
--
-- Fixes:
--   1. profiles:
--      - Recreate "Users update own profile" with WITH CHECK (auth.uid() = user_id).
--      - Recreate "Admins update all profiles" with WITH CHECK (public.is_admin()).
--      - Add BEFORE UPDATE trigger (public.protect_profile_columns) blocking
--        non-admin / non-service_role changes to role, user_id, id, created_at,
--        and welcome_sent.
--   2. subscriptions:
--      - Drop "Users update own subscription" (all writes go via service_role /
--        createAdminClient()).
--      - Recreate "Admins update all subscriptions" with WITH CHECK (public.is_admin()).
--   3. User-owned tables:
--      - Add explicit WITH CHECK clauses to all FOR ALL / FOR UPDATE own-row
--        policies across lesson_progress, bookmarks, simulation_sessions,
--        simulation_history, notifications, certification_progress_hidden,
--        prediction_records, and bet_journal.
--   4. webhook_events:
--      - Add service-role-only idempotency table for Stripe, Paystack, and
--        Remita webhook event deduplication.
--
-- Idempotent: safe to re-run (DROP POLICY IF EXISTS / DROP TRIGGER IF EXISTS).
-- ============================================================

-- ── 1. PROFILES: RLS policies + sensitive-column guard trigger ──────────────

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins update all profiles" ON public.profiles;
CREATE POLICY "Admins update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.protect_profile_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service_role (webhooks, auth callback, server jobs) and admins
  IF coalesce(auth.role(), '') = 'service_role' OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'permission denied: cannot modify profiles.role'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'permission denied: cannot modify profiles.user_id'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'permission denied: cannot modify profiles.id'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'permission denied: cannot modify profiles.created_at'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.welcome_sent IS DISTINCT FROM OLD.welcome_sent THEN
    RAISE EXCEPTION 'permission denied: cannot modify profiles.welcome_sent'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profiles_sensitive_columns ON public.profiles;
CREATE TRIGGER protect_profiles_sensitive_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.protect_profile_columns();

-- ── 2. SUBSCRIPTIONS: remove user self-update policy ────────────────────────

DROP POLICY IF EXISTS "Users update own subscription" ON public.subscriptions;

DROP POLICY IF EXISTS "Admins update all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins update all subscriptions"
  ON public.subscriptions
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── 3. USER-OWNED TABLES: enforce WITH CHECK on FOR ALL / FOR UPDATE ────────

-- lesson_progress
DROP POLICY IF EXISTS "Users manage own lesson progress" ON public.lesson_progress;
CREATE POLICY "Users manage own lesson progress"
  ON public.lesson_progress
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- bookmarks
DROP POLICY IF EXISTS "Users manage own bookmarks" ON public.bookmarks;
CREATE POLICY "Users manage own bookmarks"
  ON public.bookmarks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- simulation_sessions
DROP POLICY IF EXISTS "Users manage own simulation sessions" ON public.simulation_sessions;
CREATE POLICY "Users manage own simulation sessions"
  ON public.simulation_sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- simulation_history (ownership verified through parent simulation_sessions row)
DROP POLICY IF EXISTS "Users manage own simulation history" ON public.simulation_history;
CREATE POLICY "Users manage own simulation history"
  ON public.simulation_history
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.simulation_sessions s
      WHERE s.id = session_id AND s.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.simulation_sessions s
      WHERE s.id = session_id AND s.user_id = auth.uid()
    )
  );

-- notifications
DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- certification_progress_hidden
DROP POLICY IF EXISTS "Users manage own cert progress" ON public.certification_progress_hidden;
CREATE POLICY "Users manage own cert progress"
  ON public.certification_progress_hidden
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- prediction_records
DROP POLICY IF EXISTS "prediction_records_update_own" ON public.prediction_records;
CREATE POLICY "prediction_records_update_own"
  ON public.prediction_records
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- bet_journal
DROP POLICY IF EXISTS "Users manage own bet journal" ON public.bet_journal;
CREATE POLICY "Users manage own bet journal"
  ON public.bet_journal
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 4. WEBHOOK EVENTS: service-role idempotency log ─────────────────────────

CREATE TABLE IF NOT EXISTS public.webhook_events (
  provider     text        NOT NULL CHECK (provider IN ('stripe', 'paystack', 'remita')),
  event_id     text        NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (provider, event_id)
);

CREATE INDEX IF NOT EXISTS webhook_events_processed_at_idx
  ON public.webhook_events (processed_at DESC);

ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
-- No policies for anon/authenticated: only service_role may read/write.
