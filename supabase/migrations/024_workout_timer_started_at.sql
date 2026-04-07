-- When the user taps "Start workout" on the active screen; NULL = setup before the session timer runs.
ALTER TABLE public.workout_sessions
  ADD COLUMN IF NOT EXISTS timer_started_at timestamptz;

COMMENT ON COLUMN public.workout_sessions.timer_started_at IS 'User pressed Start on active workout; elapsed timer uses this. started_at remains session creation from program pick.';
