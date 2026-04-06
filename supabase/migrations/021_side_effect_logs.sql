CREATE TABLE IF NOT EXISTS side_effect_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logged_date date NOT NULL DEFAULT CURRENT_DATE,
  nausea_level integer CHECK (nausea_level BETWEEN 0 AND 5),
  energy_level integer CHECK (energy_level BETWEEN 0 AND 5),
  appetite_level integer CHECK (appetite_level BETWEEN 0 AND 5),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, logged_date)
);

ALTER TABLE side_effect_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own side effect logs"
  ON side_effect_logs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS side_effect_logs_user_date_idx
  ON side_effect_logs (user_id, logged_date DESC);
