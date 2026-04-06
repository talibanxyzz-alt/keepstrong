-- Add current_program_id to profiles table
ALTER TABLE public.profiles ADD COLUMN current_program_id UUID REFERENCES public.workout_programs(id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX idx_profiles_current_program ON public.profiles(current_program_id);

