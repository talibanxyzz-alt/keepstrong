-- GLP-1 Medication Dose Scheduling
-- Migration: 009_dose_schedule
--
-- Adds fields to track when users take their GLP-1 medication dose
-- Enables dose-aware features (adjust goals on high side-effect days)

-- ============================================================================
-- ADD COLUMNS TO PROFILES TABLE
-- ============================================================================

-- Medication type (for specific guidance)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS medication_type TEXT CHECK (
  medication_type IN ('ozempic', 'wegovy', 'mounjaro', 'zepbound', 'other', NULL)
);

-- Day of week they inject (0=Sunday, 1=Monday, ..., 6=Saturday)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS dose_day_of_week INTEGER CHECK (
  dose_day_of_week IS NULL OR (dose_day_of_week >= 0 AND dose_day_of_week <= 6)
);

-- Time of day they inject (optional, for reminders)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS dose_time TIME;

-- Date they started medication (for dose week calculation)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS started_medication_at DATE;

-- Comments for documentation
COMMENT ON COLUMN profiles.medication_type IS 'Type of GLP-1 medication (ozempic, wegovy, mounjaro, zepbound, other)';
COMMENT ON COLUMN profiles.dose_day_of_week IS 'Day of week user injects (0=Sunday, 1=Monday, ..., 6=Saturday)';
COMMENT ON COLUMN profiles.dose_time IS 'Time of day user injects (optional, for reminders)';
COMMENT ON COLUMN profiles.started_medication_at IS 'Date user started medication (for calculating dose weeks)';

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if today is a dose day for a user
CREATE OR REPLACE FUNCTION is_dose_day(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_dose_day INTEGER;
  today_day_of_week INTEGER;
BEGIN
  -- Get user's dose day
  SELECT dose_day_of_week INTO user_dose_day
  FROM profiles
  WHERE id = p_user_id;

  -- If no dose day set, return false
  IF user_dose_day IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Get today's day of week (0=Sunday)
  today_day_of_week := EXTRACT(DOW FROM CURRENT_DATE);

  RETURN today_day_of_week = user_dose_day;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION is_dose_day(UUID) IS 'Check if today is a dose day for a user';

-- Function to get days since last dose
CREATE OR REPLACE FUNCTION days_since_dose(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  user_dose_day INTEGER;
  today_day_of_week INTEGER;
  days_diff INTEGER;
BEGIN
  -- Get user's dose day
  SELECT dose_day_of_week INTO user_dose_day
  FROM profiles
  WHERE id = p_user_id;

  -- If no dose day set, return NULL
  IF user_dose_day IS NULL THEN
    RETURN NULL;
  END IF;

  -- Get today's day of week (0=Sunday)
  today_day_of_week := EXTRACT(DOW FROM CURRENT_DATE);

  -- Calculate days since last dose
  days_diff := today_day_of_week - user_dose_day;
  
  -- Handle wrap-around (e.g., dose day is Saturday, today is Monday)
  IF days_diff < 0 THEN
    days_diff := days_diff + 7;
  END IF;

  RETURN days_diff;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION days_since_dose(UUID) IS 'Calculate days since last dose (0 = dose day, 1 = day after, etc.)';

-- Function to get side effect severity level
CREATE OR REPLACE FUNCTION get_side_effect_level(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  days_since INTEGER;
BEGIN
  days_since := days_since_dose(p_user_id);

  -- If no dose schedule, return 'normal'
  IF days_since IS NULL THEN
    RETURN 'normal';
  END IF;

  -- Side effects typically peak 1-2 days after dose
  CASE
    WHEN days_since = 0 THEN RETURN 'dose_day';        -- Day of injection
    WHEN days_since = 1 THEN RETURN 'high';            -- Day after (peak)
    WHEN days_since = 2 THEN RETURN 'moderate';        -- 2 days after
    WHEN days_since = 3 THEN RETURN 'low';             -- 3 days after
    ELSE RETURN 'normal';                              -- 4+ days after
  END CASE;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_side_effect_level(UUID) IS 'Get expected side effect level (dose_day, high, moderate, low, normal)';

-- ============================================================================
-- VIEW: User Dose Status (Denormalized for easy querying)
-- ============================================================================

CREATE OR REPLACE VIEW user_dose_status AS
SELECT 
  p.id as user_id,
  p.medication_type,
  p.dose_day_of_week,
  p.dose_time,
  p.started_medication_at,
  CASE 
    WHEN p.started_medication_at IS NOT NULL 
    THEN FLOOR((CURRENT_DATE - p.started_medication_at) / 7)::INTEGER
    ELSE NULL
  END as weeks_on_medication,
  is_dose_day(p.id) as is_today_dose_day,
  days_since_dose(p.id) as days_since_last_dose,
  get_side_effect_level(p.id) as side_effect_level,
  CASE get_side_effect_level(p.id)
    WHEN 'dose_day' THEN 'Dose day - expect normal to mild effects'
    WHEN 'high' THEN 'Peak side effect day (day after dose)'
    WHEN 'moderate' THEN 'Moderate side effects (2 days after dose)'
    WHEN 'low' THEN 'Low side effects (3 days after dose)'
    ELSE 'Normal day - minimal side effects'
  END as side_effect_message
FROM profiles p;

COMMENT ON VIEW user_dose_status IS 'Denormalized view of user dose schedule and current status';

-- ============================================================================
-- EXAMPLE QUERIES
-- ============================================================================

-- Get dose status for current user
-- SELECT * FROM user_dose_status WHERE user_id = auth.uid();

-- Get all users with high side effects today
-- SELECT user_id, medication_type, side_effect_level 
-- FROM user_dose_status 
-- WHERE side_effect_level IN ('high', 'moderate');

-- Get users who should be reminded to take their dose
-- SELECT user_id, medication_type
-- FROM user_dose_status
-- WHERE is_today_dose_day = true;

-- ============================================================================
-- SEED DATA (Optional - for testing)
-- ============================================================================

-- Example: Set a test user's dose schedule (replace with actual user ID)
-- UPDATE profiles 
-- SET 
--   medication_type = 'ozempic',
--   dose_day_of_week = 1,  -- Monday
--   dose_time = '09:00:00',
--   started_medication_at = CURRENT_DATE - INTERVAL '4 weeks'
-- WHERE id = 'YOUR_USER_ID_HERE';

-- ============================================================================
-- COMPLETE
-- ============================================================================

-- Summary:
-- - Added 4 columns to profiles table
-- - Created 3 helper functions (is_dose_day, days_since_dose, get_side_effect_level)
-- - Created user_dose_status view for easy querying
-- - Side effect levels: dose_day, high (day 1), moderate (day 2), low (day 3), normal (day 4+)

-- To verify:
-- SELECT * FROM user_dose_status LIMIT 5;

