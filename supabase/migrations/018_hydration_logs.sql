CREATE TABLE IF NOT EXISTS hydration_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount_ml integer NOT NULL,
  logged_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE hydration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own hydration logs"
  ON hydration_logs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS hydration_logs_user_date_idx
  ON hydration_logs (user_id, logged_at DESC);

-- Add daily water goal to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS daily_water_goal_ml integer DEFAULT 2500;
