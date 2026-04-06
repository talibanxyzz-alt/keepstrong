-- Fix Seed Data Orphan Records
-- Migration: 010_fix_seed_orphans
--
-- This migration cleans up orphan records from the original 008_food_ratings.sql
-- where gen_random_uuid() was used for user_id, creating records that
-- don't reference any real user in the profiles table.
--
-- Solution: Delete orphan records (cleanest for production)
-- ============================================================================

-- Delete any votes where user_id doesn't exist in profiles
-- This is safe because orphan records provide no value and can't be edited
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Count orphans first
  SELECT COUNT(*) INTO deleted_count
  FROM food_tolerance_votes ftv
  WHERE NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = ftv.user_id
  );
  
  -- Delete orphans
  DELETE FROM food_tolerance_votes
  WHERE NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = food_tolerance_votes.user_id
  );
  
  -- Log result
  IF deleted_count > 0 THEN
    RAISE NOTICE 'Cleaned up % orphan food tolerance votes', deleted_count;
  ELSE
    RAISE NOTICE 'No orphan records found - database is clean';
  END IF;
END $$;

-- ============================================================================
-- VERIFY: Check for any remaining orphans (should return 0)
-- ============================================================================

-- SELECT COUNT(*) as orphan_count 
-- FROM food_tolerance_votes ftv
-- WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = ftv.user_id);

-- ============================================================================
-- NOTE FOR DEVELOPERS
-- ============================================================================

-- If you want seed data for development/testing:
-- 1. Create a real user through the app (sign up)
-- 2. Run: /supabase/seed/food_tolerance_seed.sql
-- 
-- For production, rely on organic user votes instead of seed data.
-- ============================================================================
