-- =============================================================================
-- COMBINED MIGRATIONS FOR MANUAL RUN (SQL Editor)
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- Use when "supabase db push" fails with TLS/network errors
-- =============================================================================

-- 001_initial_schema.sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    current_weight_kg DECIMAL,
    target_weight_kg DECIMAL,
    height_cm INTEGER,
    glp1_medication TEXT CHECK (glp1_medication IN ('ozempic', 'wegovy', 'mounjaro', 'zepbound', 'other')),
    glp1_start_date DATE,
    daily_protein_target_g INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE public.workout_programs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, description TEXT, difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')), workouts_per_week INTEGER, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE public.workouts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), program_id UUID REFERENCES public.workout_programs(id) ON DELETE CASCADE, name TEXT NOT NULL, description TEXT, order_in_program INTEGER, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE public.exercises (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE, name TEXT NOT NULL, description TEXT, target_sets INTEGER, target_reps_min INTEGER, target_reps_max INTEGER, rest_seconds INTEGER, order_in_workout INTEGER, video_url TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE public.protein_logs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, date DATE NOT NULL DEFAULT CURRENT_DATE, food_name TEXT NOT NULL, protein_grams INTEGER NOT NULL, meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')), logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE public.workout_sessions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, workout_id UUID REFERENCES public.workouts(id) ON DELETE SET NULL, started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), completed_at TIMESTAMP WITH TIME ZONE, notes TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE public.exercise_sets (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE, exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE, set_number INTEGER NOT NULL, weight_kg DECIMAL NOT NULL, reps_completed INTEGER NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE public.progress_photos (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, photo_url TEXT NOT NULL, angle TEXT CHECK (angle IN ('front', 'back', 'side_left', 'side_right')), taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE public.weight_logs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, weight_kg DECIMAL NOT NULL, logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), notes TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE INDEX idx_protein_logs_user_date ON public.protein_logs(user_id, date);
CREATE INDEX idx_workout_sessions_user_start ON public.workout_sessions(user_id, started_at);
CREATE INDEX idx_weight_logs_user_logged ON public.weight_logs(user_id, logged_at);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protein_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to workout programs" ON public.workout_programs FOR SELECT USING (true);
CREATE POLICY "Allow public read access to workouts" ON public.workouts FOR SELECT USING (true);
CREATE POLICY "Allow public read access to exercises" ON public.exercises FOR SELECT USING (true);
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own protein logs" ON public.protein_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own protein logs" ON public.protein_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own protein logs" ON public.protein_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own protein logs" ON public.protein_logs FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own workout sessions" ON public.workout_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout sessions" ON public.workout_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workout sessions" ON public.workout_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workout sessions" ON public.workout_sessions FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own exercise sets" ON public.exercise_sets FOR SELECT USING (EXISTS (SELECT 1 FROM public.workout_sessions WHERE id = public.exercise_sets.session_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own exercise sets" ON public.exercise_sets FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.workout_sessions WHERE id = public.exercise_sets.session_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own exercise sets" ON public.exercise_sets FOR UPDATE USING (EXISTS (SELECT 1 FROM public.workout_sessions WHERE id = public.exercise_sets.session_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete own exercise sets" ON public.exercise_sets FOR DELETE USING (EXISTS (SELECT 1 FROM public.workout_sessions WHERE id = public.exercise_sets.session_id AND user_id = auth.uid()));
CREATE POLICY "Users can view own progress photos" ON public.progress_photos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress photos" ON public.progress_photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress photos" ON public.progress_photos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own progress photos" ON public.progress_photos FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own weight logs" ON public.weight_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weight logs" ON public.weight_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own weight logs" ON public.weight_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own weight logs" ON public.weight_logs FOR DELETE USING (auth.uid() = user_id);
CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER on_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$ BEGIN INSERT INTO public.profiles (id, email, full_name) VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name'); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 002_add_current_program.sql
ALTER TABLE public.profiles ADD COLUMN current_program_id UUID REFERENCES public.workout_programs(id) ON DELETE SET NULL;
CREATE INDEX idx_profiles_current_program ON public.profiles(current_program_id);

-- 003_add_subscription_fields.sql
ALTER TABLE public.profiles ADD COLUMN stripe_customer_id TEXT, ADD COLUMN stripe_subscription_id TEXT, ADD COLUMN subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid')), ADD COLUMN subscription_plan TEXT CHECK (subscription_plan IN ('core', 'premium'));
CREATE INDEX idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);
CREATE INDEX idx_profiles_subscription_status ON public.profiles(subscription_status);
CREATE INDEX idx_profiles_subscription_plan ON public.profiles(subscription_plan);

-- 004_storage_policies.sql
INSERT INTO storage.buckets (id, name, public) VALUES ('progress-photos', 'progress-photos', false) ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;
CREATE POLICY "Users can upload their own photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'progress-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "Users can view their own photos" ON storage.objects;
CREATE POLICY "Users can view their own photos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'progress-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "Users can update their own photos" ON storage.objects;
CREATE POLICY "Users can update their own photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'progress-photos' AND (storage.foldername(name))[1] = auth.uid()::text) WITH CHECK (bucket_id = 'progress-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;
CREATE POLICY "Users can delete their own photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'progress-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 005_performance_indexes.sql
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_plan ON public.profiles(subscription_plan) WHERE subscription_plan IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_protein_logs_date ON public.protein_logs(date DESC);
CREATE INDEX IF NOT EXISTS idx_protein_logs_logged_at ON public.protein_logs(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_started ON public.workout_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_completed ON public.workout_sessions(user_id, completed_at DESC) WHERE completed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workout_sessions_active ON public.workout_sessions(user_id) WHERE completed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_exercise_sets_session ON public.exercise_sets(session_id);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_exercise ON public.exercise_sets(exercise_id);
CREATE INDEX IF NOT EXISTS idx_progress_photos_user_taken ON public.progress_photos(user_id, taken_at DESC);
CREATE INDEX IF NOT EXISTS idx_progress_photos_angle ON public.progress_photos(user_id, angle);
CREATE INDEX IF NOT EXISTS idx_workout_programs_difficulty ON public.workout_programs(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_workouts_program ON public.workouts(program_id, order_in_program);
CREATE INDEX IF NOT EXISTS idx_exercises_workout ON public.exercises(workout_id, order_in_workout);

-- 006_fix_user_creation.sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER SECURITY DEFINER SET search_path = public LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NOW(), NOW());
  RETURN NEW;
EXCEPTION WHEN others THEN
  RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;
CREATE POLICY "System can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);

-- 007_add_meal_timing_preferences.sql
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='meal_timing_alerts') THEN
    ALTER TABLE public.profiles ADD COLUMN meal_timing_alerts BOOLEAN DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='meal_timing_threshold_hours') THEN
    ALTER TABLE public.profiles ADD COLUMN meal_timing_threshold_hours INTEGER DEFAULT 6;
  END IF;
END $$;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS meal_timing_threshold_check;
ALTER TABLE public.profiles ADD CONSTRAINT meal_timing_threshold_check CHECK (meal_timing_threshold_hours >= 5 AND meal_timing_threshold_hours <= 8);

-- 008_food_ratings.sql
CREATE TABLE IF NOT EXISTS public.food_tolerance_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  tolerated BOOLEAN NOT NULL,
  notes TEXT,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_food UNIQUE(user_id, food_name)
);
CREATE INDEX IF NOT EXISTS idx_food_tolerance_votes_food_name ON public.food_tolerance_votes(food_name);
CREATE INDEX IF NOT EXISTS idx_food_tolerance_votes_user_id ON public.food_tolerance_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_food_tolerance_votes_voted_at ON public.food_tolerance_votes(voted_at DESC);
CREATE OR REPLACE VIEW public.food_tolerance_ratings AS
SELECT food_name, COUNT(*) as total_votes, COUNT(*) FILTER (WHERE tolerated = true) as upvotes, COUNT(*) FILTER (WHERE tolerated = false) as downvotes,
  ROUND((COUNT(*) FILTER (WHERE tolerated = true)::NUMERIC / COUNT(*)::NUMERIC) * 100) as tolerance_percentage, MAX(voted_at) as last_voted_at
FROM public.food_tolerance_votes GROUP BY food_name HAVING COUNT(*) >= 3 ORDER BY total_votes DESC, tolerance_percentage DESC;
ALTER TABLE public.food_tolerance_votes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Food votes are publicly readable" ON public.food_tolerance_votes;
CREATE POLICY "Food votes are publicly readable" ON public.food_tolerance_votes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can vote on foods" ON public.food_tolerance_votes;
CREATE POLICY "Users can vote on foods" ON public.food_tolerance_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can change their votes" ON public.food_tolerance_votes;
CREATE POLICY "Users can change their votes" ON public.food_tolerance_votes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their votes" ON public.food_tolerance_votes;
CREATE POLICY "Users can delete their votes" ON public.food_tolerance_votes FOR DELETE USING (auth.uid() = user_id);
CREATE OR REPLACE FUNCTION public.get_food_rating(p_food_name TEXT) RETURNS TABLE (food_name TEXT, total_votes BIGINT, upvotes BIGINT, downvotes BIGINT, tolerance_percentage NUMERIC, last_voted_at TIMESTAMP WITH TIME ZONE) AS $$ BEGIN RETURN QUERY SELECT * FROM public.food_tolerance_ratings WHERE public.food_tolerance_ratings.food_name = p_food_name; END; $$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION public.user_has_voted(p_user_id UUID, p_food_name TEXT) RETURNS BOOLEAN AS $$ BEGIN RETURN EXISTS (SELECT 1 FROM public.food_tolerance_votes WHERE user_id = p_user_id AND food_name = p_food_name); END; $$ LANGUAGE plpgsql;

-- glp1_current_dose (referenced in onboarding + settings, missing from original migrations)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS glp1_current_dose TEXT;

-- 009_dose_schedule.sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS medication_type TEXT CHECK (medication_type IS NULL OR medication_type IN ('ozempic', 'wegovy', 'mounjaro', 'zepbound', 'other'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dose_day_of_week INTEGER CHECK (dose_day_of_week IS NULL OR (dose_day_of_week >= 0 AND dose_day_of_week <= 6));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dose_time TIME;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS started_medication_at DATE;
CREATE OR REPLACE FUNCTION public.is_dose_day(p_user_id UUID) RETURNS BOOLEAN AS $$
DECLARE user_dose_day INTEGER; today_day_of_week INTEGER;
BEGIN
  SELECT dose_day_of_week INTO user_dose_day FROM public.profiles WHERE id = p_user_id;
  IF user_dose_day IS NULL THEN RETURN FALSE; END IF;
  today_day_of_week := EXTRACT(DOW FROM CURRENT_DATE);
  RETURN today_day_of_week = user_dose_day;
END;
$$ LANGUAGE plpgsql STABLE;
CREATE OR REPLACE FUNCTION public.days_since_dose(p_user_id UUID) RETURNS INTEGER AS $$
DECLARE user_dose_day INTEGER; today_day_of_week INTEGER; days_diff INTEGER;
BEGIN
  SELECT dose_day_of_week INTO user_dose_day FROM public.profiles WHERE id = p_user_id;
  IF user_dose_day IS NULL THEN RETURN NULL; END IF;
  today_day_of_week := EXTRACT(DOW FROM CURRENT_DATE);
  days_diff := today_day_of_week - user_dose_day;
  IF days_diff < 0 THEN days_diff := days_diff + 7; END IF;
  RETURN days_diff;
END;
$$ LANGUAGE plpgsql STABLE;
CREATE OR REPLACE FUNCTION public.get_side_effect_level(p_user_id UUID) RETURNS TEXT AS $$
DECLARE days_since INTEGER;
BEGIN
  days_since := public.days_since_dose(p_user_id);
  IF days_since IS NULL THEN RETURN 'normal'; END IF;
  CASE WHEN days_since = 0 THEN RETURN 'dose_day'; WHEN days_since = 1 THEN RETURN 'high'; WHEN days_since = 2 THEN RETURN 'moderate'; WHEN days_since = 3 THEN RETURN 'low'; ELSE RETURN 'normal'; END CASE;
END;
$$ LANGUAGE plpgsql STABLE;
CREATE OR REPLACE VIEW public.user_dose_status AS
SELECT p.id as user_id, p.medication_type, p.dose_day_of_week, p.dose_time, p.started_medication_at,
  CASE WHEN p.started_medication_at IS NOT NULL THEN FLOOR((CURRENT_DATE - p.started_medication_at) / 7)::INTEGER ELSE NULL END as weeks_on_medication,
  public.is_dose_day(p.id) as is_today_dose_day, public.days_since_dose(p.id) as days_since_last_dose, public.get_side_effect_level(p.id) as side_effect_level
FROM public.profiles p;

-- 010_fix_seed_orphans.sql (no-op on fresh DB)
-- 011_add_achievement_tables.sql
CREATE TABLE IF NOT EXISTS public.user_achievements (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, achievement_id TEXT NOT NULL, unlocked_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(user_id, achievement_id));
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own achievements" ON public.user_achievements;
CREATE POLICY "Users can view their own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can unlock achievements" ON public.user_achievements;
CREATE POLICY "Users can unlock achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE TABLE IF NOT EXISTS public.user_streaks (user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE, protein_streak INTEGER DEFAULT 0, protein_best_streak INTEGER DEFAULT 0, workout_streak INTEGER DEFAULT 0, workout_best_streak INTEGER DEFAULT 0, last_calculated_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own streaks" ON public.user_streaks;
CREATE POLICY "Users can view their own streaks" ON public.user_streaks FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own streaks" ON public.user_streaks;
CREATE POLICY "Users can update their own streaks" ON public.user_streaks FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "System can insert streaks" ON public.user_streaks;
CREATE POLICY "System can insert streaks" ON public.user_streaks FOR INSERT WITH CHECK (true);
CREATE OR REPLACE FUNCTION public.update_streaks_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS update_user_streaks_timestamp ON public.user_streaks;
CREATE TRIGGER update_user_streaks_timestamp BEFORE UPDATE ON public.user_streaks FOR EACH ROW EXECUTE FUNCTION public.update_streaks_updated_at();

-- 012_add_meal_rating_prompts_table.sql
CREATE TABLE IF NOT EXISTS public.meal_rating_prompts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, protein_log_id UUID NOT NULL REFERENCES public.protein_logs(id) ON DELETE CASCADE, prompted_at TIMESTAMPTZ DEFAULT NOW(), responded BOOLEAN DEFAULT false, response_vote BOOLEAN, UNIQUE(user_id, protein_log_id));
CREATE INDEX IF NOT EXISTS idx_meal_prompts_user ON public.meal_rating_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_prompts_log ON public.meal_rating_prompts(protein_log_id);
CREATE INDEX IF NOT EXISTS idx_meal_prompts_pending ON public.meal_rating_prompts(user_id, responded) WHERE responded = false;
ALTER TABLE public.meal_rating_prompts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own prompts" ON public.meal_rating_prompts;
CREATE POLICY "Users can view their own prompts" ON public.meal_rating_prompts FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create prompts" ON public.meal_rating_prompts;
CREATE POLICY "Users can create prompts" ON public.meal_rating_prompts FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own prompts" ON public.meal_rating_prompts;
CREATE POLICY "Users can update their own prompts" ON public.meal_rating_prompts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 013_workout_history_enhancements.sql
ALTER TABLE public.workout_sessions ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
ALTER TABLE public.workout_sessions ADD COLUMN IF NOT EXISTS energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5);
ALTER TABLE public.workout_sessions ADD COLUMN IF NOT EXISTS nausea_level INTEGER CHECK (nausea_level >= 0 AND nausea_level <= 3);
ALTER TABLE public.workout_sessions ADD COLUMN IF NOT EXISTS overall_feeling TEXT;
ALTER TABLE public.workout_sessions ADD COLUMN IF NOT EXISTS is_dose_day BOOLEAN DEFAULT false;
ALTER TABLE public.workout_sessions ADD COLUMN IF NOT EXISTS dose_day_offset INTEGER;
CREATE INDEX IF NOT EXISTS idx_workout_sessions_history ON public.workout_sessions(user_id, completed_at DESC NULLS LAST) WHERE completed_at IS NOT NULL;
CREATE OR REPLACE VIEW public.workout_stats AS
SELECT user_id, COUNT(*) as total_workouts, COUNT(*) FILTER (WHERE completed_at >= NOW() - INTERVAL '30 days') as workouts_last_30_days, COUNT(*) FILTER (WHERE completed_at >= NOW() - INTERVAL '7 days') as workouts_last_7_days, AVG(duration_minutes) as avg_duration, MAX(completed_at) as last_workout_date
FROM public.workout_sessions WHERE completed_at IS NOT NULL GROUP BY user_id;


-- ============================================================
-- 015: Add image_url to exercises + seed 3 full workout programs
-- ============================================================
-- ============================================================
-- 015: Add image_url to exercises + seed 3 full workout programs
-- ============================================================

ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ============================================================
-- PROGRAMS
-- ============================================================
INSERT INTO public.workout_programs (id, name, description, difficulty_level, workouts_per_week)
VALUES
  ('11111111-1111-1111-1111-000000000001',
   'Full Body Foundation',
   'Built for GLP-1 beginners. Three full-body sessions per week to build the resistance-training habit while protecting muscle during weight loss. Every session hits all major muscle groups — ideal for the first 2–3 months.',
   'beginner', 3),
  ('11111111-1111-1111-1111-000000000002',
   'Push / Pull / Legs',
   'Classic 3-day split. Push day trains chest/shoulders/triceps, Pull day trains back/biceps, Legs day trains quads/hamstrings/glutes/calves. More volume per muscle group — ideal after 2–3 months of consistent training.',
   'intermediate', 3),
  ('11111111-1111-1111-1111-000000000003',
   'Upper / Lower Split',
   'High-frequency 4-day program. Each muscle group trained twice per week with alternating emphasis (horizontal vs vertical, quad vs hip-dominant). Maximum muscle signal during aggressive fat loss.',
   'advanced', 4)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- PROGRAM 1: Full Body Foundation — 3 Workouts
-- ============================================================
INSERT INTO public.workouts (id, program_id, name, description, order_in_program)
VALUES
  ('22222222-2222-2222-2222-000000000001',
   '11111111-1111-1111-1111-000000000001',
   'Full Body A',
   'Push-focused full body. Compound lower + horizontal push + vertical pull.',
   1),
  ('22222222-2222-2222-2222-000000000002',
   '11111111-1111-1111-1111-000000000001',
   'Full Body B',
   'Pull-focused full body. Compound lower + incline push + vertical pull.',
   2),
  ('22222222-2222-2222-2222-000000000003',
   '11111111-1111-1111-1111-000000000001',
   'Full Body C',
   'Legs-focused full body. Unilateral lower + push + row + carry.',
   3)
ON CONFLICT (id) DO NOTHING;

-- Full Body A exercises
INSERT INTO public.exercises (id, workout_id, name, description, target_sets, target_reps_min, target_reps_max, rest_seconds, order_in_workout, image_url)
VALUES
  ('33333333-0001-0001-0001-000000000001',
   '22222222-2222-2222-2222-000000000001',
   'Goblet Squat',
   'Hold a dumbbell vertically at your chest. Stand shoulder-width apart, push knees out as you descend to parallel. Drive through your heels to stand. Keep chest tall throughout.',
   3, 12, 15, 90, 1, '/images/exercises/squat.jpg'),
  ('33333333-0001-0001-0001-000000000002',
   '22222222-2222-2222-2222-000000000001',
   'Dumbbell Bench Press',
   'Lie on a bench, dumbbells at chest level with elbows at 45°. Press up and slightly in until arms are extended. Control the descent — 2 seconds down, 1 second press.',
   3, 10, 12, 90, 2, '/images/exercises/bench.jpg'),
  ('33333333-0001-0001-0001-000000000003',
   '22222222-2222-2222-2222-000000000001',
   'Dumbbell Row',
   'Place one knee and hand on a bench. Pull the dumbbell to your hip, driving your elbow behind you. Squeeze your lat at the top. Lower with control. Complete all reps one side before switching.',
   3, 10, 12, 90, 3, '/images/exercises/row.jpg'),
  ('33333333-0001-0001-0001-000000000004',
   '22222222-2222-2222-2222-000000000001',
   'Romanian Deadlift',
   'Stand with dumbbells at your hips. Push hips back while lowering weights along your legs — feel the hamstring stretch. Drive hips forward to stand. Keep a neutral spine throughout.',
   3, 12, 12, 90, 4, '/images/exercises/deadlift.jpg'),
  ('33333333-0001-0001-0001-000000000005',
   '22222222-2222-2222-2222-000000000001',
   'Plank Hold',
   'Forearms on the floor, body in a straight line from head to heels. Brace your abs like someone is about to punch you. Breathe steadily. Do not let your hips sag or pike up.',
   3, 30, 45, 60, 5, '/images/exercises/core.jpg')
ON CONFLICT (id) DO NOTHING;

-- Full Body B exercises
INSERT INTO public.exercises (id, workout_id, name, description, target_sets, target_reps_min, target_reps_max, rest_seconds, order_in_workout, image_url)
VALUES
  ('33333333-0002-0002-0002-000000000001',
   '22222222-2222-2222-2222-000000000002',
   'Dumbbell Sumo Squat',
   'Stand wider than shoulder-width, toes turned out. Hold one heavy dumbbell between your legs. Descend until thighs are parallel, driving knees outward. Stand tall and squeeze glutes at the top.',
   3, 12, 15, 90, 1, '/images/exercises/squat.jpg'),
  ('33333333-0002-0002-0002-000000000002',
   '22222222-2222-2222-2222-000000000002',
   'Incline Dumbbell Press',
   'Set bench to 30–45°. Press dumbbells from chest level up and slightly in. Control the descent slowly. The incline shifts emphasis to the upper chest and front of shoulders.',
   3, 10, 12, 90, 2, '/images/exercises/bench.jpg'),
  ('33333333-0002-0002-0002-000000000003',
   '22222222-2222-2222-2222-000000000002',
   'Lat Pulldown',
   'Grip the bar slightly wider than shoulders, palms facing away. Pull the bar to your upper chest by driving elbows down and back. Lean back slightly. Squeeze lats at the bottom, control the ascent.',
   3, 10, 12, 90, 3, '/images/exercises/pullup.jpg'),
  ('33333333-0002-0002-0002-000000000004',
   '22222222-2222-2222-2222-000000000002',
   'Hip Thrust',
   'Sit against a bench, bar or dumbbell across your hips. Plant feet hip-width apart. Drive hips up until your body forms a straight line from shoulders to knees. Squeeze glutes hard at the top for 1 second.',
   3, 12, 15, 60, 4, '/images/exercises/deadlift.jpg'),
  ('33333333-0002-0002-0002-000000000005',
   '22222222-2222-2222-2222-000000000002',
   'Dead Bug',
   'Lie on your back, arms vertical, knees bent at 90°. Slowly extend opposite arm and leg toward the floor — keep your lower back pressed into the floor the entire time. Return and repeat on the other side.',
   3, 8, 10, 60, 5, '/images/exercises/core.jpg')
ON CONFLICT (id) DO NOTHING;

-- Full Body C exercises
INSERT INTO public.exercises (id, workout_id, name, description, target_sets, target_reps_min, target_reps_max, rest_seconds, order_in_workout, image_url)
VALUES
  ('33333333-0003-0003-0003-000000000001',
   '22222222-2222-2222-2222-000000000003',
   'Dumbbell Split Squat',
   'Stand in a split stance, rear foot elevated or flat. Lower your rear knee toward the floor, keeping front shin vertical. Drive through the front heel to stand. Complete all reps before switching sides.',
   3, 10, 12, 90, 1, '/images/exercises/squat.jpg'),
  ('33333333-0003-0003-0003-000000000002',
   '22222222-2222-2222-2222-000000000003',
   'Push-up',
   'Hands slightly wider than shoulders, body in a straight line. Lower chest to an inch above the floor — elbows at 45° to your body, not flared out. Press back up. Add a weight plate on your back to increase difficulty.',
   3, 12, 15, 60, 2, '/images/exercises/bench.jpg'),
  ('33333333-0003-0003-0003-000000000003',
   '22222222-2222-2222-2222-000000000003',
   'Seated Cable Row',
   'Sit upright with a slight lean forward. Pull the handle to your lower chest/upper stomach. Drive elbows behind you, squeeze shoulder blades together. Slowly return with a controlled stretch.',
   3, 10, 12, 90, 3, '/images/exercises/row.jpg'),
  ('33333333-0003-0003-0003-000000000004',
   '22222222-2222-2222-2222-000000000003',
   'Single-Leg Deadlift',
   'Stand on one foot, slight bend in that knee. Hinge forward at the hips, extending the free leg behind you for balance. Lower weights to mid-shin level. Drive the standing hip forward to return. Builds unilateral strength and balance.',
   3, 10, 10, 90, 4, '/images/exercises/deadlift.jpg'),
  ('33333333-0003-0003-0003-000000000005',
   '22222222-2222-2222-2222-000000000003',
   'Farmer''s Carry',
   'Pick up two heavy dumbbells, walk with them at your sides for 30–40 metres. Stand tall, brace your core, and do not let the weights pull you sideways. The carry trains grip, core stability, and total-body strength.',
   3, 30, 40, 60, 5, '/images/exercises/core.jpg')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- PROGRAM 2: Push / Pull / Legs — 3 Workouts
-- ============================================================
INSERT INTO public.workouts (id, program_id, name, description, order_in_program)
VALUES
  ('22222222-2222-2222-2222-000000000004',
   '11111111-1111-1111-1111-000000000002',
   'Push Day',
   'Chest, shoulders, and triceps. Heavy compound pressing followed by isolation work.',
   1),
  ('22222222-2222-2222-2222-000000000005',
   '11111111-1111-1111-1111-000000000002',
   'Pull Day',
   'Back and biceps. Heavy hinge and pull compounds followed by isolation work.',
   2),
  ('22222222-2222-2222-2222-000000000006',
   '11111111-1111-1111-1111-000000000002',
   'Legs Day',
   'Quads, hamstrings, glutes, and calves. Full lower body in one session.',
   3)
ON CONFLICT (id) DO NOTHING;

-- Push Day
INSERT INTO public.exercises (id, workout_id, name, description, target_sets, target_reps_min, target_reps_max, rest_seconds, order_in_workout, image_url)
VALUES
  ('33333333-0004-0004-0004-000000000001',
   '22222222-2222-2222-2222-000000000004',
   'Barbell Bench Press',
   'Lie on a flat bench, grip slightly wider than shoulder-width. Lower the bar to your lower chest with elbows at 45°. Drive the bar up and slightly back toward your face. Plant feet firmly on the floor for leg drive.',
   4, 8, 10, 120, 1, '/images/exercises/bench.jpg'),
  ('33333333-0004-0004-0004-000000000002',
   '22222222-2222-2222-2222-000000000004',
   'Overhead Press',
   'Stand with bar at collarbone height, grip just outside shoulders. Press straight up, finishing with the bar over the back of your head. Engage your glutes and abs to protect your lower back. Lower with control.',
   4, 8, 10, 120, 2, '/images/exercises/shoulders.jpg'),
  ('33333333-0004-0004-0004-000000000003',
   '22222222-2222-2222-2222-000000000004',
   'Incline Dumbbell Press',
   'Bench at 30–45°. Press dumbbells from chest level, keeping the path slightly arched inward. Slower eccentric (3 seconds down) maximises muscle tension for hypertrophy.',
   3, 10, 12, 90, 3, '/images/exercises/bench.jpg'),
  ('33333333-0004-0004-0004-000000000004',
   '22222222-2222-2222-2222-000000000004',
   'Lateral Raise',
   'Stand with dumbbells at your sides. Raise them out to 90° with a slight bend in the elbow — lead with your elbows, not your wrists. Lower slowly. Use a weight where you can complete all reps with strict form.',
   3, 12, 15, 60, 4, '/images/exercises/shoulders.jpg'),
  ('33333333-0004-0004-0004-000000000005',
   '22222222-2222-2222-2222-000000000004',
   'Tricep Rope Pushdown',
   'Attach a rope to the high pulley. Stand close, elbows tucked at your sides. Push the rope down and flare the ends apart at the bottom. Squeeze the triceps hard. Elbows stay fixed throughout.',
   3, 12, 15, 60, 5, '/images/exercises/arms.jpg'),
  ('33333333-0004-0004-0004-000000000006',
   '22222222-2222-2222-2222-000000000004',
   'Overhead Tricep Extension',
   'Hold one dumbbell with both hands overhead, arms extended. Bend only at the elbows to lower the dumbbell behind your head, then press back up. Targets the long head of the tricep which is often undertrained.',
   3, 12, 15, 60, 6, '/images/exercises/arms.jpg')
ON CONFLICT (id) DO NOTHING;

-- Pull Day
INSERT INTO public.exercises (id, workout_id, name, description, target_sets, target_reps_min, target_reps_max, rest_seconds, order_in_workout, image_url)
VALUES
  ('33333333-0005-0005-0005-000000000001',
   '22222222-2222-2222-2222-000000000005',
   'Conventional Deadlift',
   'Feet hip-width, bar over laces. Hinge to grip the bar just outside your legs. Push the floor away (not pull the bar up) while keeping the bar close to your body. Lock out by squeezing glutes. Control the descent.',
   4, 5, 6, 180, 1, '/images/exercises/deadlift.jpg'),
  ('33333333-0005-0005-0005-000000000002',
   '22222222-2222-2222-2222-000000000005',
   'Pull-up',
   'Dead hang, grip slightly wider than shoulders. Pull your chest toward the bar by driving elbows down and back. Clear the bar with your chin, then lower with full control. Use an assisted machine or band if needed.',
   4, 6, 10, 120, 2, '/images/exercises/pullup.jpg'),
  ('33333333-0005-0005-0005-000000000003',
   '22222222-2222-2222-2222-000000000005',
   'Barbell Bent-Over Row',
   'Hinge to ~45° at the hips, grip just wider than shoulders, bar hanging. Row the bar to your lower ribcage, driving elbows past your hips. Squeeze shoulder blades. Keep your lower back neutral throughout.',
   4, 8, 10, 120, 3, '/images/exercises/row.jpg'),
  ('33333333-0005-0005-0005-000000000004',
   '22222222-2222-2222-2222-000000000005',
   'Face Pull',
   'Set a cable to face height, use a rope attachment. Pull toward your forehead with elbows high and wide, rotating your upper arms outward. Hold briefly. This exercise counteracts the rounded-shoulders posture common with heavy pressing.',
   3, 15, 20, 60, 4, '/images/exercises/shoulders.jpg'),
  ('33333333-0005-0005-0005-000000000005',
   '22222222-2222-2222-2222-000000000005',
   'EZ Bar Curl',
   'Grip the angled section of the EZ bar. Curl toward your shoulders without swinging — brace against a wall if needed. Squeeze the bicep at the top, lower slowly (3 seconds). The angled grip reduces wrist strain vs a straight bar.',
   3, 10, 12, 60, 5, '/images/exercises/arms.jpg'),
  ('33333333-0005-0005-0005-000000000006',
   '22222222-2222-2222-2222-000000000005',
   'Hammer Curl',
   'Hold dumbbells with a neutral grip (thumbs up). Curl both simultaneously or alternating. The neutral grip hits the brachialis — the muscle underneath the bicep — which adds thickness to your upper arm.',
   3, 12, 15, 60, 6, '/images/exercises/arms.jpg')
ON CONFLICT (id) DO NOTHING;

-- Legs Day
INSERT INTO public.exercises (id, workout_id, name, description, target_sets, target_reps_min, target_reps_max, rest_seconds, order_in_workout, image_url)
VALUES
  ('33333333-0006-0006-0006-000000000001',
   '22222222-2222-2222-2222-000000000006',
   'Back Squat',
   'Bar on your upper traps. Stand shoulder-width, toes slightly out. Break at the hips and knees simultaneously. Descend until thighs are at least parallel. Drive through mid-foot to stand, staying as upright as possible.',
   4, 8, 10, 180, 1, '/images/exercises/squat.jpg'),
  ('33333333-0006-0006-0006-000000000002',
   '22222222-2222-2222-2222-000000000006',
   'Leg Press',
   'Feet hip-width, high on the platform for more glute/hamstring involvement, low for more quad focus. Press until legs are almost straight. Lower until your glutes just begin to lift off the seat — no deeper.',
   4, 12, 15, 120, 2, '/images/exercises/squat.jpg'),
  ('33333333-0006-0006-0006-000000000003',
   '22222222-2222-2222-2222-000000000006',
   'Romanian Deadlift',
   'Hold bar at hips. Push hips back, letting the bar slide down your thighs until you feel a deep hamstring stretch. Keep your back flat. Drive hips forward to return. This is one of the best exercises for GLP-1 users to protect muscle.',
   3, 10, 12, 120, 3, '/images/exercises/deadlift.jpg'),
  ('33333333-0006-0006-0006-000000000004',
   '22222222-2222-2222-2222-000000000006',
   'Lying Leg Curl',
   'Lie face-down on the machine, pad just above your heels. Curl your heels toward your glutes, squeezing the hamstrings at the top. Lower slowly. Do not hyperextend your lower back or raise your hips off the pad.',
   3, 12, 15, 90, 4, '/images/exercises/legs.jpg'),
  ('33333333-0006-0006-0006-000000000005',
   '22222222-2222-2222-2222-000000000006',
   'Leg Extension',
   'Sit upright in the machine with the pad just above your ankles. Extend both legs until straight, squeezing the quads at the top. Pause 1 second. Lower slowly. Keep hips pressed into the seat.',
   3, 15, 15, 90, 5, '/images/exercises/legs.jpg'),
  ('33333333-0006-0006-0006-000000000006',
   '22222222-2222-2222-2222-000000000006',
   'Standing Calf Raise',
   'Stand on the edge of a step, balls of feet on the platform. Lower heels as far as possible (full stretch), then rise onto your toes as high as possible. Pause at the top. Calves respond well to high reps and full range of motion.',
   4, 15, 20, 60, 6, '/images/exercises/legs.jpg')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- PROGRAM 3: Upper / Lower Split — 4 Workouts
-- ============================================================
INSERT INTO public.workouts (id, program_id, name, description, order_in_program)
VALUES
  ('22222222-2222-2222-2222-000000000007',
   '11111111-1111-1111-1111-000000000003',
   'Upper A — Horizontal',
   'Heavy horizontal push and pull. Bench press and barbell row as primary movers.',
   1),
  ('22222222-2222-2222-2222-000000000008',
   '11111111-1111-1111-1111-000000000003',
   'Lower A — Quad Focus',
   'Squat-dominant lower body. Heavy squats and leg press supplemented by hamstring work.',
   2),
  ('22222222-2222-2222-2222-000000000009',
   '11111111-1111-1111-1111-000000000003',
   'Upper B — Vertical',
   'Vertical push and pull plus isolation work. OHP and weighted pull-ups.',
   3),
  ('22222222-2222-2222-2222-000000000010',
   '11111111-1111-1111-1111-000000000003',
   'Lower B — Hip Focus',
   'Deadlift-dominant lower body. Hip-hinge pattern with supplemental quad and hamstring work.',
   4)
ON CONFLICT (id) DO NOTHING;

-- Upper A
INSERT INTO public.exercises (id, workout_id, name, description, target_sets, target_reps_min, target_reps_max, rest_seconds, order_in_workout, image_url)
VALUES
  ('33333333-0007-0007-0007-000000000001',
   '22222222-2222-2222-2222-000000000007',
   'Barbell Bench Press',
   'Lie on a flat bench, grip slightly wider than shoulder-width. Lower the bar to your lower chest with elbows at 45°. Drive the bar up and slightly back. Use a weight where reps 5–6 feel genuinely hard.',
   4, 6, 8, 180, 1, '/images/exercises/bench.jpg'),
  ('33333333-0007-0007-0007-000000000002',
   '22222222-2222-2222-2222-000000000007',
   'Barbell Bent-Over Row',
   'Hinge ~45° at the hips. Row bar to lower ribcage, elbows past the hip line. Keep your lower back flat. Match the weight and rep scheme of your bench press over time for balanced pressing and pulling strength.',
   4, 6, 8, 180, 2, '/images/exercises/row.jpg'),
  ('33333333-0007-0007-0007-000000000003',
   '22222222-2222-2222-2222-000000000007',
   'Overhead Press',
   'Press the bar from collarbone height straight overhead. Bar should end directly over the middle of your foot at lockout. Brace your abs and glutes throughout. Lower with control — do not crash the bar back to your chest.',
   3, 8, 10, 120, 3, '/images/exercises/shoulders.jpg'),
  ('33333333-0007-0007-0007-000000000004',
   '22222222-2222-2222-2222-000000000007',
   'Weighted Pull-up',
   'Attach a weight belt or hold a dumbbell between your feet. Dead hang start, pull your chest to the bar. Full range of motion is more important than the extra weight — only add load when you can do 8 clean bodyweight pull-ups.',
   3, 6, 8, 120, 4, '/images/exercises/pullup.jpg'),
  ('33333333-0007-0007-0007-000000000005',
   '22222222-2222-2222-2222-000000000007',
   'EZ Bar Curl',
   'Strict form — no swing, elbows stay at your sides. Curl to the top, squeeze hard, lower in 3 seconds. The slow eccentric (lowering phase) is where most of the muscle-building stimulus comes from.',
   3, 10, 12, 60, 5, '/images/exercises/arms.jpg'),
  ('33333333-0007-0007-0007-000000000006',
   '22222222-2222-2222-2222-000000000007',
   'Tricep Rope Pushdown',
   'Elbows pinned at your sides, push the rope down and flare ends apart at full extension. Do not lean forward — stay upright and let the triceps do the work. Control the return.',
   3, 12, 15, 60, 6, '/images/exercises/arms.jpg')
ON CONFLICT (id) DO NOTHING;

-- Lower A
INSERT INTO public.exercises (id, workout_id, name, description, target_sets, target_reps_min, target_reps_max, rest_seconds, order_in_workout, image_url)
VALUES
  ('33333333-0008-0008-0008-000000000001',
   '22222222-2222-2222-2222-000000000008',
   'Back Squat',
   'The king of lower body exercises. Work up to a challenging top set then complete your work sets. Prioritise depth (at least parallel) over weight. For GLP-1 users, this exercise sends the strongest muscle-preservation signal.',
   5, 4, 6, 240, 1, '/images/exercises/squat.jpg'),
  ('33333333-0008-0008-0008-000000000002',
   '22222222-2222-2222-2222-000000000008',
   'Leg Press',
   'After heavy squats, leg press lets you accumulate volume with less fatigue. Feet slightly wider than hip-width. Full range of motion — lower until your glutes just lift, press until almost straight.',
   4, 10, 12, 120, 2, '/images/exercises/squat.jpg'),
  ('33333333-0008-0008-0008-000000000003',
   '22222222-2222-2222-2222-000000000008',
   'Romanian Deadlift',
   'Following squats, this targets the hamstrings which are undertrained on squat-dominant days. Focus on feeling the hamstring stretch at the bottom rather than just lowering the weight.',
   3, 8, 10, 120, 3, '/images/exercises/deadlift.jpg'),
  ('33333333-0008-0008-0008-000000000004',
   '22222222-2222-2222-2222-000000000008',
   'Leg Curl',
   'Hamstring isolation after compound work. You can do lying, seated, or standing — all are effective. Control the lowering phase (3 seconds) for maximum stimulus.',
   3, 12, 15, 90, 4, '/images/exercises/legs.jpg'),
  ('33333333-0008-0008-0008-000000000005',
   '22222222-2222-2222-2222-000000000008',
   'Standing Calf Raise',
   'Full range of motion is critical — do not do half-reps. Pause briefly at the bottom stretch and squeeze hard at the top. Calves are stubborn and need high volume.',
   4, 12, 15, 60, 5, '/images/exercises/legs.jpg')
ON CONFLICT (id) DO NOTHING;

-- Upper B
INSERT INTO public.exercises (id, workout_id, name, description, target_sets, target_reps_min, target_reps_max, rest_seconds, order_in_workout, image_url)
VALUES
  ('33333333-0009-0009-0009-000000000001',
   '22222222-2222-2222-2222-000000000009',
   'Incline Barbell Press',
   'Set bench to 30°. Bar to upper chest, elbows at 45°. The slight incline targets the upper chest without the shoulder impingement risk of a steep incline. Balance your pressing volume with your rowing volume.',
   4, 8, 10, 120, 1, '/images/exercises/bench.jpg'),
  ('33333333-0009-0009-0009-000000000002',
   '22222222-2222-2222-2222-000000000009',
   'Cable Seated Row',
   'Sit upright, chest tall. Pull the handle to your sternum, driving elbows behind your hips. Pause 1 second at full contraction. Extend arms fully between reps for a complete stretch. Cable keeps tension throughout the range of motion.',
   4, 10, 12, 120, 2, '/images/exercises/row.jpg'),
  ('33333333-0009-0009-0009-000000000003',
   '22222222-2222-2222-2222-000000000009',
   'Dumbbell Lateral Raise',
   'Raise dumbbells directly to your sides to shoulder height, leading with elbows. A slight forward lean (10°) and internal shoulder rotation (pour water with each dumbbell) maximises medial delt engagement.',
   4, 12, 15, 60, 3, '/images/exercises/shoulders.jpg'),
  ('33333333-0009-0009-0009-000000000004',
   '22222222-2222-2222-2222-000000000009',
   'Face Pull',
   'Rope at face height. Pull toward your forehead with elbows high and wide, externally rotating your arms. This exercise is essential for shoulder health and posture correction — do it every upper body session.',
   3, 15, 20, 60, 4, '/images/exercises/shoulders.jpg'),
  ('33333333-0009-0009-0009-000000000005',
   '22222222-2222-2222-2222-000000000009',
   'Preacher Curl',
   'Use the preacher bench to eliminate swinging. Lower all the way down for a full bicep stretch. Curl with a supinating motion (rotate palms toward the ceiling as you curl). This is great for building the peak of the bicep.',
   3, 10, 12, 60, 5, '/images/exercises/arms.jpg'),
  ('33333333-0009-0009-0009-000000000006',
   '22222222-2222-2222-2222-000000000009',
   'Weighted Dip',
   'Grip parallel bars, lean forward slightly for chest emphasis (upright for tricep focus). Lower until upper arms are parallel to the floor. Press back up, locking out at the top. Add weight with a belt once bodyweight becomes easy.',
   3, 8, 10, 90, 6, '/images/exercises/arms.jpg')
ON CONFLICT (id) DO NOTHING;

-- Lower B
INSERT INTO public.exercises (id, workout_id, name, description, target_sets, target_reps_min, target_reps_max, rest_seconds, order_in_workout, image_url)
VALUES
  ('33333333-0010-0010-0010-000000000001',
   '22222222-2222-2222-2222-000000000010',
   'Conventional Deadlift',
   'The most complete strength exercise. After squatting on Lower A, you now hinge-pattern on Lower B. Deadlifts recruit the entire posterior chain — hamstrings, glutes, spinal erectors, lats, traps, and grip. Essential for GLP-1 muscle preservation.',
   4, 4, 5, 240, 1, '/images/exercises/deadlift.jpg'),
  ('33333333-0010-0010-0010-000000000002',
   '22222222-2222-2222-2222-000000000010',
   'Hip Thrust',
   'Bar across your hips, back on a bench. Drive hips up until your body is flat from knees to shoulders. Squeeze glutes as hard as possible at the top for 1 second. This is one of the best exercises for glute hypertrophy.',
   4, 10, 12, 90, 2, '/images/exercises/deadlift.jpg'),
  ('33333333-0010-0010-0010-000000000003',
   '22222222-2222-2222-2222-000000000010',
   'Front Squat',
   'Bar rests on your front deltoids (or crossed arms). Forces a very upright torso — great for quad development and mobility. Start lighter than you think — the front rack position requires practice. Drop 30–40% from your back squat weight.',
   3, 6, 8, 180, 3, '/images/exercises/squat.jpg'),
  ('33333333-0010-0010-0010-000000000004',
   '22222222-2222-2222-2222-000000000010',
   'Leg Extension',
   'Quad isolation following heavy compound work. Full extension and a 1-second peak contraction. This exercise trains the rectus femoris in a shortened position — a weak point for many lifters.',
   3, 15, 15, 90, 4, '/images/exercises/legs.jpg'),
  ('33333333-0010-0010-0010-000000000005',
   '22222222-2222-2222-2222-000000000010',
   'Lying Leg Curl',
   'Following deadlifts and hip thrusts, this isolation exercise ensures the hamstrings get adequate volume. Use a deliberate, controlled tempo — 2 seconds up, 3 seconds down.',
   3, 12, 15, 90, 5, '/images/exercises/legs.jpg'),
  ('33333333-0010-0010-0010-000000000006',
   '22222222-2222-2222-2222-000000000010',
   'Seated Calf Raise',
   'Targets the soleus (deeper calf muscle) more than standing raises. Pad just above knees. Lower heels as far as possible, raise as high as possible. The soleus has more slow-twitch fibres and responds especially well to higher reps.',
   4, 15, 20, 60, 6, '/images/exercises/legs.jpg')
ON CONFLICT (id) DO NOTHING;


-- 016: profile email preferences
-- Email preference columns (used by /api/emails/unsubscribe and cron jobs)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS marketing_emails BOOLEAN DEFAULT true;

COMMENT ON COLUMN public.profiles.email_notifications IS 'Product/update emails (day-2 reminder, weekly summary)';
COMMENT ON COLUMN public.profiles.marketing_emails IS 'Optional marketing content';

-- 022: Expo push token (mobile app registers via API)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS expo_push_token text;

-- =============================================================================
-- 014_add_email_logs.sql (was missing from combined file)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'sent',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON public.email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_email_type ON public.email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON public.email_logs(sent_at);
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own email logs" ON public.email_logs;
DROP POLICY IF EXISTS "Service role can manage email logs" ON public.email_logs;
CREATE POLICY "Users can view own email logs"
  ON public.email_logs FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage email logs"
  ON public.email_logs FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- =============================================================================
-- 017_gdpr_consent.sql (required for signup — was missing)
-- =============================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS gdpr_consent boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS gdpr_consent_at timestamptz;
COMMENT ON COLUMN public.profiles.gdpr_consent IS 'User accepted Privacy Policy, Terms, and health data processing at signup';
COMMENT ON COLUMN public.profiles.gdpr_consent_at IS 'Timestamp when GDPR consent was recorded';

-- =============================================================================
-- 018_hydration_logs.sql
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.hydration_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_ml integer NOT NULL,
  logged_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hydration_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own hydration logs"
  ON public.hydration_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS hydration_logs_user_date_idx
  ON public.hydration_logs (user_id, logged_at DESC);
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS daily_water_goal_ml integer DEFAULT 2500;

-- =============================================================================
-- 019_body_measurements.sql
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.body_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  measured_at date NOT NULL DEFAULT CURRENT_DATE,
  waist_cm numeric(5,1),
  chest_cm numeric(5,1),
  hips_cm numeric(5,1),
  left_arm_cm numeric(5,1),
  right_arm_cm numeric(5,1),
  left_thigh_cm numeric(5,1),
  right_thigh_cm numeric(5,1),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own measurements"
  ON public.body_measurements FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS body_measurements_user_date_idx
  ON public.body_measurements (user_id, measured_at DESC);

-- =============================================================================
-- 020_protein_logs_notes.sql
-- =============================================================================
ALTER TABLE public.protein_logs ADD COLUMN IF NOT EXISTS notes TEXT;
COMMENT ON COLUMN public.protein_logs.notes IS 'Optional notes (e.g. AI estimation details)';

-- =============================================================================
-- 021_side_effect_logs.sql
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.side_effect_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  logged_date date NOT NULL DEFAULT CURRENT_DATE,
  nausea_level integer CHECK (nausea_level BETWEEN 0 AND 5),
  energy_level integer CHECK (energy_level BETWEEN 0 AND 5),
  appetite_level integer CHECK (appetite_level BETWEEN 0 AND 5),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, logged_date)
);
ALTER TABLE public.side_effect_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own side effect logs"
  ON public.side_effect_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS side_effect_logs_user_date_idx
  ON public.side_effect_logs (user_id, logged_date DESC);

-- =============================================================================
-- 023_expo_push_token_hardening.sql
-- =============================================================================
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
    WHERE expo_push_token = NEW.expo_push_token AND id <> NEW.id;
  ELSIF NEW.expo_push_token IS DISTINCT FROM OLD.expo_push_token THEN
    UPDATE public.profiles
    SET expo_push_token = NULL
    WHERE expo_push_token = NEW.expo_push_token AND id <> NEW.id;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS profiles_dedupe_expo_push_token ON public.profiles;
CREATE TRIGGER profiles_dedupe_expo_push_token
  BEFORE INSERT OR UPDATE OF expo_push_token ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_dedupe_expo_push_token();
COMMENT ON COLUMN public.profiles.expo_push_token IS 'Latest Expo push token. Cleared on other users when the same token is registered.';
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =============================================================================
-- 024_workout_timer_started_at.sql
-- =============================================================================
ALTER TABLE public.workout_sessions ADD COLUMN IF NOT EXISTS timer_started_at timestamptz;
COMMENT ON COLUMN public.workout_sessions.timer_started_at IS 'User pressed Start on active workout; elapsed timer uses this.';
