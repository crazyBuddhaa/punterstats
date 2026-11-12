-- ============================================================
-- Migration 055: Email Preferences for Weekly Betting Report Card
--
-- Creates public.email_preferences:
--   - user_id (PK -> auth.users ON DELETE CASCADE)
--   - weekly_report (boolean, default true)
--   - unsubscribe_token (uuid, default gen_random_uuid(), unique)
--   - updated_at (timestamptz, default now())
--
-- Security & RLS:
--   - Users may SELECT and UPDATE only their own row (WITH CHECK auth.uid() = user_id).
--   - Users cannot INSERT rows directly; rows are provisioned by the
--     auth.users after-insert trigger or via the service_role admin client.
--   - A BEFORE UPDATE trigger prevents non-service_role sessions from
--     tampering with user_id or unsubscribe_token.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.email_preferences (
  user_id           uuid        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  weekly_report     boolean     NOT NULL DEFAULT true,
  unsubscribe_token uuid        NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_preferences_weekly_report_idx
  ON public.email_preferences (weekly_report)
  WHERE weekly_report = true;

DROP TRIGGER IF EXISTS set_email_preferences_updated_at ON public.email_preferences;
CREATE TRIGGER set_email_preferences_updated_at
  BEFORE UPDATE ON public.email_preferences
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_updated_at();

-- Prevent authenticated users from modifying user_id or unsubscribe_token
CREATE OR REPLACE FUNCTION public.protect_email_preferences_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF coalesce(auth.role(), '') = 'service_role' OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'permission denied: cannot modify email_preferences.user_id'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.unsubscribe_token IS DISTINCT FROM OLD.unsubscribe_token THEN
    RAISE EXCEPTION 'permission denied: cannot modify email_preferences.unsubscribe_token'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_email_preferences_columns_trigger ON public.email_preferences;
CREATE TRIGGER protect_email_preferences_columns_trigger
  BEFORE UPDATE ON public.email_preferences
  FOR EACH ROW
  EXECUTE PROCEDURE public.protect_email_preferences_columns();

-- Auto-insert email_preferences row when a new auth.users row is created
CREATE OR REPLACE FUNCTION public.handle_new_user_email_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.email_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_email_preferences ON auth.users;
CREATE TRIGGER on_auth_user_created_email_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user_email_preferences();

-- Backfill existing users
INSERT INTO public.email_preferences (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Row-Level Security
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users select own email preferences" ON public.email_preferences;
CREATE POLICY "Users select own email preferences"
  ON public.email_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own email preferences" ON public.email_preferences;
CREATE POLICY "Users update own email preferences"
  ON public.email_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Bet Journal: Explicit leg_count column for Single vs Accumulator
-- ============================================================
ALTER TABLE public.bet_journal
  ADD COLUMN IF NOT EXISTS leg_count smallint NOT NULL DEFAULT 1
    CHECK (leg_count BETWEEN 1 AND 50);

-- Backfill existing accumulator rows where leg_count is still the default 1
UPDATE public.bet_journal
SET leg_count = 2
WHERE leg_count = 1
  AND lower(market) = 'accumulator';

