-- Optional free-text notes on protein logs (e.g. AI meal analysis context)
ALTER TABLE public.protein_logs
  ADD COLUMN IF NOT EXISTS notes TEXT;

COMMENT ON COLUMN public.protein_logs.notes IS 'Optional notes (e.g. AI estimation details)';
