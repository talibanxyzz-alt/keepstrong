-- Food Tolerance Seed Data (OPTIONAL)
-- 
-- This seed script is for DEVELOPMENT and TESTING only.
-- Do NOT run in production - let users generate organic ratings.
--
-- Prerequisites:
-- 1. Migration 008_food_ratings.sql must be applied
-- 2. You need at least one real user in the profiles table
--
-- Usage:
--   Replace 'YOUR_USER_ID_HERE' with an actual user UUID from your profiles table
--   Run: psql -f food_tolerance_seed.sql
--
-- Or use the Supabase SQL editor in the dashboard
-- ============================================================================

-- Set the user ID to use for seed data
-- IMPORTANT: Replace this with a real user ID from your profiles table!
DO $$
DECLARE
  seed_user_id UUID;
BEGIN
  -- Option 1: Use a specific user ID (recommended)
  -- seed_user_id := 'YOUR_USER_ID_HERE'::UUID;
  
  -- Option 2: Use the first user in the profiles table (for quick testing)
  SELECT id INTO seed_user_id FROM profiles LIMIT 1;
  
  IF seed_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found in profiles table. Create a user first!';
  END IF;

  RAISE NOTICE 'Using user ID: %', seed_user_id;

  -- ============================================================================
  -- WELL-TOLERATED FOODS (80-100%)
  -- ============================================================================

  -- Scrambled Eggs (100%)
  INSERT INTO food_tolerance_votes (user_id, food_name, tolerated, notes) VALUES
    (seed_user_id, 'Scrambled Eggs', true, 'Soft texture, easy to digest')
  ON CONFLICT (user_id, food_name) DO NOTHING;

  -- Greek Yogurt (80%)
  INSERT INTO food_tolerance_votes (user_id, food_name, tolerated, notes) VALUES
    (seed_user_id, 'Greek Yogurt', true, 'High protein, probiotics help digestion')
  ON CONFLICT (user_id, food_name) DO NOTHING;

  -- Protein Shake (100%)
  INSERT INTO food_tolerance_votes (user_id, food_name, tolerated, notes) VALUES
    (seed_user_id, 'Protein Shake', true, 'Liquid form easier to tolerate')
  ON CONFLICT (user_id, food_name) DO NOTHING;

  -- Chicken Breast (80%)
  INSERT INTO food_tolerance_votes (user_id, food_name, tolerated, notes) VALUES
    (seed_user_id, 'Chicken Breast (grilled)', true, 'Lean protein, keep it moist')
  ON CONFLICT (user_id, food_name) DO NOTHING;

  -- Salmon (100%)
  INSERT INTO food_tolerance_votes (user_id, food_name, tolerated, notes) VALUES
    (seed_user_id, 'Salmon', true, 'Soft, flaky, omega-3 rich')
  ON CONFLICT (user_id, food_name) DO NOTHING;

  -- Cottage Cheese (75%)
  INSERT INTO food_tolerance_votes (user_id, food_name, tolerated, notes) VALUES
    (seed_user_id, 'Cottage Cheese', true, 'High protein, easy texture')
  ON CONFLICT (user_id, food_name) DO NOTHING;

  -- ============================================================================
  -- MODERATELY TOLERATED FOODS (50%)
  -- ============================================================================

  -- Turkey Sandwich (50%)
  INSERT INTO food_tolerance_votes (user_id, food_name, tolerated, notes) VALUES
    (seed_user_id, 'Turkey Sandwich', true, 'Use thin bread, small portions')
  ON CONFLICT (user_id, food_name) DO NOTHING;

  -- Protein Bar (50%)
  INSERT INTO food_tolerance_votes (user_id, food_name, tolerated, notes) VALUES
    (seed_user_id, 'Protein Bar', false, 'Dense, can sit heavy')
  ON CONFLICT (user_id, food_name) DO NOTHING;

  -- ============================================================================
  -- POORLY TOLERATED FOODS (0-25%)
  -- ============================================================================

  -- Fried Chicken (20%)
  INSERT INTO food_tolerance_votes (user_id, food_name, tolerated, notes) VALUES
    (seed_user_id, 'Fried Chicken', false, 'High fat, greasy, causes nausea')
  ON CONFLICT (user_id, food_name) DO NOTHING;

  -- Fast Food Burger (0%)
  INSERT INTO food_tolerance_votes (user_id, food_name, tolerated, notes) VALUES
    (seed_user_id, 'Fast Food Burger', false, 'High fat, processed, heavy')
  ON CONFLICT (user_id, food_name) DO NOTHING;

  -- Pizza (25%)
  INSERT INTO food_tolerance_votes (user_id, food_name, tolerated, notes) VALUES
    (seed_user_id, 'Pizza', false, 'Greasy cheese, heavy carbs')
  ON CONFLICT (user_id, food_name) DO NOTHING;

  -- Steak (25%)
  INSERT INTO food_tolerance_votes (user_id, food_name, tolerated, notes) VALUES
    (seed_user_id, 'Steak', false, 'Fatty cuts problematic')
  ON CONFLICT (user_id, food_name) DO NOTHING;

  -- Ice Cream (0%)
  INSERT INTO food_tolerance_votes (user_id, food_name, tolerated, notes) VALUES
    (seed_user_id, 'Ice Cream', false, 'High fat, dairy, sugar')
  ON CONFLICT (user_id, food_name) DO NOTHING;

  RAISE NOTICE 'Seed data inserted successfully for user %', seed_user_id;
END $$;

-- ============================================================================
-- VERIFY SEED DATA
-- ============================================================================

-- Check the ratings view (requires at least 3 votes per food to appear)
-- Note: With only 1 user's votes, foods won't appear in the view yet
-- Add more users and votes to see aggregated ratings

SELECT 
  'Inserted votes for these foods:' as status,
  COUNT(*) as vote_count
FROM food_tolerance_votes
WHERE user_id IN (SELECT id FROM profiles LIMIT 1);

-- Show individual votes
SELECT food_name, tolerated, notes, voted_at
FROM food_tolerance_votes
WHERE user_id IN (SELECT id FROM profiles LIMIT 1)
ORDER BY food_name;

