-- Add tracking fields to workout_sessions
ALTER TABLE workout_sessions ADD COLUMN IF NOT EXISTS
  duration_minutes INTEGER,
  notes TEXT,
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  nausea_level INTEGER CHECK (nausea_level >= 0 AND nausea_level <= 3),
  overall_feeling TEXT,
  is_dose_day BOOLEAN DEFAULT false,
  dose_day_offset INTEGER;

-- Add created_at if missing
ALTER TABLE workout_sessions ADD COLUMN IF NOT EXISTS
  created_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for history queries
CREATE INDEX IF NOT EXISTS idx_workout_sessions_history 
ON workout_sessions(user_id, completed_at DESC NULLS LAST) 
WHERE completed_at IS NOT NULL;

-- Create stats view
CREATE OR REPLACE VIEW workout_stats AS
SELECT 
  user_id,
  COUNT(*) as total_workouts,
  COUNT(*) FILTER (WHERE completed_at >= NOW() - INTERVAL '30 days') as workouts_last_30_days,
  COUNT(*) FILTER (WHERE completed_at >= NOW() - INTERVAL '7 days') as workouts_last_7_days,
  AVG(duration_minutes) as avg_duration,
  MAX(completed_at) as last_workout_date
FROM workout_sessions
WHERE completed_at IS NOT NULL
GROUP BY user_id;

-- Add comments
COMMENT ON COLUMN workout_sessions.duration_minutes IS 'Total workout duration in minutes';
COMMENT ON COLUMN workout_sessions.energy_level IS 'Energy level during workout (1-5)';
COMMENT ON COLUMN workout_sessions.nausea_level IS 'Nausea level during workout (0-3, for GLP-1 tracking)';
COMMENT ON COLUMN workout_sessions.is_dose_day IS 'Whether this workout was on a medication dose day';
COMMENT ON COLUMN workout_sessions.dose_day_offset IS 'Days since last dose (for GLP-1 pattern tracking)';
COMMENT ON VIEW workout_stats IS 'Aggregated workout statistics per user';

