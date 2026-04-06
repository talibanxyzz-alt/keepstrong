-- Ensure at most one profile row holds a given Expo push token (device reinstall / account switch).
CREATE OR REPLACE FUNCTION public.profiles_dedupe_expo_push_token()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.expo_push_token IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles
    SET expo_push_token = NULL
    WHERE expo_push_token = NEW.expo_push_token
      AND id <> NEW.id;
  ELSIF NEW.expo_push_token IS DISTINCT FROM OLD.expo_push_token THEN
    UPDATE public.profiles
    SET expo_push_token = NULL
    WHERE expo_push_token = NEW.expo_push_token
      AND id <> NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_dedupe_expo_push_token ON public.profiles;
CREATE TRIGGER profiles_dedupe_expo_push_token
  BEFORE INSERT OR UPDATE OF expo_push_token ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_dedupe_expo_push_token();

COMMENT ON COLUMN public.profiles.expo_push_token IS 'Latest Expo push token (ExponentPushToken[...] from expo-notifications). Cleared on other users when the same token is registered.';

-- Defense in depth: updated row must still be the authed user.
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
