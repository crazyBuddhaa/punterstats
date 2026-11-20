-- ============================================================
-- PunterStat — Migration 063: Supabase Storage Avatars Bucket
-- & Distinct Historical Stats RPC Functions
-- ============================================================

-- 1. Public avatars storage bucket (5 MB limit, images only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS policies for avatars bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read access for avatars'
  ) THEN
    CREATE POLICY "Public read access for avatars"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'avatars');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload own avatar'
  ) THEN
    CREATE POLICY "Users can upload own avatar"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update own avatar'
  ) THEN
    CREATE POLICY "Users can update own avatar"
      ON storage.objects FOR UPDATE TO authenticated
      USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete own avatar'
  ) THEN
    CREATE POLICY "Users can delete own avatar"
      ON storage.objects FOR DELETE TO authenticated
      USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

-- 2. Distinct historical_matches RPCs (avoids PostgREST 1,000-row cap)

CREATE OR REPLACE FUNCTION public.get_distinct_historical_leagues()
RETURNS TABLE (league_code text, league_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT ON (hm.league_code)
    hm.league_code,
    hm.league_name
  FROM public.historical_matches hm
  WHERE hm.league_code IS NOT NULL AND hm.league_code <> ''
  ORDER BY hm.league_code, hm.match_date DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_distinct_historical_seasons(p_league_code text DEFAULT NULL)
RETURNS TABLE (season text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT hm.season
  FROM public.historical_matches hm
  WHERE hm.season IS NOT NULL
    AND hm.season <> ''
    AND (p_league_code IS NULL OR p_league_code = '' OR hm.league_code = p_league_code)
  ORDER BY hm.season DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_distinct_historical_teams(
  p_league_code text DEFAULT NULL,
  p_season text DEFAULT NULL,
  p_search text DEFAULT NULL
)
RETURNS TABLE (team_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH all_teams AS (
    SELECT hm.home_team AS team_name
    FROM public.historical_matches hm
    WHERE hm.home_team IS NOT NULL AND hm.home_team <> ''
      AND (p_league_code IS NULL OR p_league_code = '' OR hm.league_code = p_league_code)
      AND (p_season IS NULL OR p_season = '' OR hm.season = p_season)
    UNION
    SELECT hm.away_team AS team_name
    FROM public.historical_matches hm
    WHERE hm.away_team IS NOT NULL AND hm.away_team <> ''
      AND (p_league_code IS NULL OR p_league_code = '' OR hm.league_code = p_league_code)
      AND (p_season IS NULL OR p_season = '' OR hm.season = p_season)
  )
  SELECT t.team_name
  FROM all_teams t
  WHERE (p_search IS NULL OR p_search = '' OR t.team_name ILIKE '%' || p_search || '%')
  ORDER BY t.team_name ASC;
$$;

GRANT EXECUTE ON FUNCTION public.get_distinct_historical_leagues() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_distinct_historical_seasons(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_distinct_historical_teams(text, text, text) TO anon, authenticated, service_role;
