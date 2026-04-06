ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS gdpr_consent boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS gdpr_consent_at timestamptz;

COMMENT ON COLUMN public.profiles.gdpr_consent IS 'User accepted Privacy Policy, Terms, and health data processing at signup';
COMMENT ON COLUMN public.profiles.gdpr_consent_at IS 'Timestamp when GDPR consent was recorded';
