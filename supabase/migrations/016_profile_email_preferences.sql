-- Email preference columns (used by /api/emails/unsubscribe and cron jobs)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS marketing_emails BOOLEAN DEFAULT true;

COMMENT ON COLUMN public.profiles.email_notifications IS 'Product/update emails (day-2 reminder, weekly summary)';
COMMENT ON COLUMN public.profiles.marketing_emails IS 'Optional marketing content';
