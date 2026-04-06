-- Add meal timing alert preferences to profiles table
-- Migration: 007_add_meal_timing_preferences

-- Add columns for meal timing preferences (if they don't exist)
DO $$
BEGIN
  -- Add meal_timing_alerts column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'meal_timing_alerts'
  ) THEN
    ALTER TABLE profiles ADD COLUMN meal_timing_alerts BOOLEAN DEFAULT true;
  END IF;

  -- Add meal_timing_threshold_hours column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'meal_timing_threshold_hours'
  ) THEN
    ALTER TABLE profiles ADD COLUMN meal_timing_threshold_hours INTEGER DEFAULT 6;
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN profiles.meal_timing_alerts IS 'Whether to show meal timing reminders';
COMMENT ON COLUMN profiles.meal_timing_threshold_hours IS 'Hours without eating before showing alert (5-8)';

-- Add constraint to ensure threshold is reasonable (5-8 hours)
-- Drop constraint first if it exists, then recreate
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS meal_timing_threshold_check;
ALTER TABLE profiles
ADD CONSTRAINT meal_timing_threshold_check 
CHECK (meal_timing_threshold_hours >= 5 AND meal_timing_threshold_hours <= 8);

