-- Stage 3 of "Suggested Features" plan: Admin Data Health Panel.
--
-- api_quota_log (migration 008) tracks our own request counts per provider
-- window, but The Odds API also reports its own remaining-credit count via
-- response headers (x-requests-remaining / x-requests-used). Persist that
-- provider-reported number so the admin health panel can show real quota
-- status instead of just our local call count.

ALTER TABLE public.api_quota_log
  ADD COLUMN IF NOT EXISTS provider_remaining integer;

COMMENT ON COLUMN public.api_quota_log.provider_remaining IS
  'Remaining-credits count as reported directly by the provider (e.g. The Odds API x-requests-remaining header). Null for providers that do not report this.';
