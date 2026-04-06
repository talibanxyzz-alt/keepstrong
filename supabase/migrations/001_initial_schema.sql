-- Create profiles table
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

-- Create workout_programs table
CREATE TABLE public.workout_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    workouts_per_week INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workouts table
CREATE TABLE public.workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES public.workout_programs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    order_in_program INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exercises table
CREATE TABLE public.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    target_sets INTEGER,
    target_reps_min INTEGER,
    target_reps_max INTEGER,
    rest_seconds INTEGER,
    order_in_workout INTEGER,
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create protein_logs table
CREATE TABLE public.protein_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    food_name TEXT NOT NULL,
    protein_grams INTEGER NOT NULL,
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout_sessions table
CREATE TABLE public.workout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    workout_id UUID REFERENCES public.workouts(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exercise_sets table
CREATE TABLE public.exercise_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    weight_kg DECIMAL NOT NULL,
    reps_completed INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create progress_photos table
CREATE TABLE public.progress_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    angle TEXT CHECK (angle IN ('front', 'back', 'side_left', 'side_right')),
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create weight_logs table
CREATE TABLE public.weight_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    weight_kg DECIMAL NOT NULL,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_protein_logs_user_date ON public.protein_logs(user_id, date);
CREATE INDEX idx_workout_sessions_user_start ON public.workout_sessions(user_id, started_at);
CREATE INDEX idx_weight_logs_user_logged ON public.weight_logs(user_id, logged_at);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protein_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Public Read for Workout Content
CREATE POLICY "Allow public read access to workout programs" ON public.workout_programs FOR SELECT USING (true);
CREATE POLICY "Allow public read access to workouts" ON public.workouts FOR SELECT USING (true);
CREATE POLICY "Allow public read access to exercises" ON public.exercises FOR SELECT USING (true);

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Protein Logs: Users can manage their own logs
CREATE POLICY "Users can view own protein logs" ON public.protein_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own protein logs" ON public.protein_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own protein logs" ON public.protein_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own protein logs" ON public.protein_logs FOR DELETE USING (auth.uid() = user_id);

-- Workout Sessions: Users can manage their own sessions
CREATE POLICY "Users can view own workout sessions" ON public.workout_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout sessions" ON public.workout_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workout sessions" ON public.workout_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workout sessions" ON public.workout_sessions FOR DELETE USING (auth.uid() = user_id);

-- Exercise Sets: Users can manage sets belonging to their sessions
CREATE POLICY "Users can view own exercise sets" ON public.exercise_sets FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.workout_sessions WHERE id = public.exercise_sets.session_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert own exercise sets" ON public.exercise_sets FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.workout_sessions WHERE id = public.exercise_sets.session_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update own exercise sets" ON public.exercise_sets FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.workout_sessions WHERE id = public.exercise_sets.session_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete own exercise sets" ON public.exercise_sets FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.workout_sessions WHERE id = public.exercise_sets.session_id AND user_id = auth.uid())
);

-- Progress Photos: Users can manage their own photos
CREATE POLICY "Users can view own progress photos" ON public.progress_photos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress photos" ON public.progress_photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress photos" ON public.progress_photos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own progress photos" ON public.progress_photos FOR DELETE USING (auth.uid() = user_id);

-- Weight Logs: Users can manage their own weight logs
CREATE POLICY "Users can view own weight logs" ON public.weight_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weight logs" ON public.weight_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own weight logs" ON public.weight_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own weight logs" ON public.weight_logs FOR DELETE USING (auth.uid() = user_id);

-- Trigger for profiles updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profiles_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

