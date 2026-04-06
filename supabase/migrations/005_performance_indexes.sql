-- Add performance indexes for commonly queried columns
-- Run this migration to improve query performance

-- Profiles table indexes (if not already exist)
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_plan ON public.profiles(subscription_plan) WHERE subscription_plan IS NOT NULL;

-- Protein logs indexes (for faster queries by user and date)
CREATE INDEX IF NOT EXISTS idx_protein_logs_user_date ON public.protein_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_protein_logs_date ON public.protein_logs(date DESC);
CREATE INDEX IF NOT EXISTS idx_protein_logs_logged_at ON public.protein_logs(logged_at DESC);

-- Workout sessions indexes (for faster queries by user and date)
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_started ON public.workout_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_completed ON public.workout_sessions(user_id, completed_at DESC) WHERE completed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workout_sessions_active ON public.workout_sessions(user_id) WHERE completed_at IS NULL;

-- Exercise sets indexes (for faster aggregations)
CREATE INDEX IF NOT EXISTS idx_exercise_sets_session ON public.exercise_sets(session_id);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_exercise ON public.exercise_sets(exercise_id);

-- Weight logs indexes (for progress tracking)
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_logged ON public.weight_logs(user_id, logged_at DESC);

-- Progress photos indexes
CREATE INDEX IF NOT EXISTS idx_progress_photos_user_taken ON public.progress_photos(user_id, taken_at DESC);
CREATE INDEX IF NOT EXISTS idx_progress_photos_angle ON public.progress_photos(user_id, angle);

-- Workout programs (rarely change, but good for lookups)
CREATE INDEX IF NOT EXISTS idx_workout_programs_difficulty ON public.workout_programs(difficulty_level);

-- Workouts (for program lookups)
CREATE INDEX IF NOT EXISTS idx_workouts_program ON public.workouts(program_id, order_in_program);

-- Exercises (for workout lookups)
CREATE INDEX IF NOT EXISTS idx_exercises_workout ON public.exercises(workout_id, order_in_workout);

-- Note: VACUUM ANALYZE cannot run inside a transaction block
-- If you want to update statistics, run these commands separately:
-- VACUUM ANALYZE public.profiles;
-- VACUUM ANALYZE public.protein_logs;
-- VACUUM ANALYZE public.workout_sessions;
-- VACUUM ANALYZE public.exercise_sets;
-- VACUUM ANALYZE public.weight_logs;
-- VACUUM ANALYZE public.progress_photos;
-- VACUUM ANALYZE public.workout_programs;
-- VACUUM ANALYZE public.workouts;
-- VACUUM ANALYZE public.exercises;

-- Comments for documentation
COMMENT ON INDEX idx_protein_logs_user_date IS 'Composite index for efficient protein log queries by user and date';
COMMENT ON INDEX idx_workout_sessions_user_started IS 'Composite index for workout session history queries';
COMMENT ON INDEX idx_weight_logs_user_logged IS 'Composite index for weight tracking queries';
COMMENT ON INDEX idx_progress_photos_user_taken IS 'Composite index for progress photo timeline queries';

