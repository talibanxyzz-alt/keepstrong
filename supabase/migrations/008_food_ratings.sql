-- Food Tolerance Rating System
-- Migration: 008_food_ratings
--
-- Allows users to vote on foods they tolerate well (thumbs up) or poorly (thumbs down)
-- Critical for GLP-1 users who experience food sensitivity and nausea

-- ============================================================================
-- TABLE: food_tolerance_votes
-- ============================================================================

CREATE TABLE IF NOT EXISTS food_tolerance_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  tolerated BOOLEAN NOT NULL, -- true = thumbs up (well tolerated), false = thumbs down (poorly tolerated)
  notes TEXT, -- Optional: "Made me nauseous" or "Perfect!"
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate votes (user can only vote once per food)
  -- If user wants to change vote, they update their existing vote
  CONSTRAINT unique_user_food UNIQUE(user_id, food_name)
);

-- Add comments for documentation
COMMENT ON TABLE food_tolerance_votes IS 'User votes on food tolerance for GLP-1 medication users';
COMMENT ON COLUMN food_tolerance_votes.tolerated IS 'true = well tolerated (thumbs up), false = poorly tolerated (thumbs down)';
COMMENT ON COLUMN food_tolerance_votes.notes IS 'Optional user notes about their experience';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Index for fast lookups by food name
CREATE INDEX IF NOT EXISTS idx_food_tolerance_votes_food_name 
  ON food_tolerance_votes(food_name);

-- Index for user lookups (to show "your votes")
CREATE INDEX IF NOT EXISTS idx_food_tolerance_votes_user_id 
  ON food_tolerance_votes(user_id);

-- Index for recent votes
CREATE INDEX IF NOT EXISTS idx_food_tolerance_votes_voted_at 
  ON food_tolerance_votes(voted_at DESC);

-- ============================================================================
-- VIEW: food_tolerance_ratings (Aggregated Statistics)
-- ============================================================================

CREATE OR REPLACE VIEW food_tolerance_ratings AS
SELECT 
  food_name,
  COUNT(*) as total_votes,
  COUNT(*) FILTER (WHERE tolerated = true) as upvotes,
  COUNT(*) FILTER (WHERE tolerated = false) as downvotes,
  ROUND(
    (COUNT(*) FILTER (WHERE tolerated = true)::NUMERIC / COUNT(*)::NUMERIC) * 100
  ) as tolerance_percentage,
  -- Add timestamp of most recent vote for freshness
  MAX(voted_at) as last_voted_at
FROM food_tolerance_votes
GROUP BY food_name
HAVING COUNT(*) >= 3 -- Only show foods with 3+ votes (statistically meaningful)
ORDER BY total_votes DESC, tolerance_percentage DESC;

COMMENT ON VIEW food_tolerance_ratings IS 'Aggregated food tolerance ratings (min 3 votes required)';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE food_tolerance_votes ENABLE ROW LEVEL SECURITY;

-- Policy 1: All users can read all votes (public data for community benefit)
DROP POLICY IF EXISTS "Food votes are publicly readable" ON food_tolerance_votes;
CREATE POLICY "Food votes are publicly readable"
  ON food_tolerance_votes
  FOR SELECT
  USING (true);

-- Policy 2: Authenticated users can insert their own votes
DROP POLICY IF EXISTS "Users can vote on foods" ON food_tolerance_votes;
CREATE POLICY "Users can vote on foods"
  ON food_tolerance_votes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own votes (change mind)
DROP POLICY IF EXISTS "Users can change their votes" ON food_tolerance_votes;
CREATE POLICY "Users can change their votes"
  ON food_tolerance_votes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete their own votes
DROP POLICY IF EXISTS "Users can delete their votes" ON food_tolerance_votes;
CREATE POLICY "Users can delete their votes"
  ON food_tolerance_votes
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- SEED DATA (Based on Medical Guidance)
-- ============================================================================

-- NOTE: Seed data has been moved to a separate optional script.
-- 
-- For production: Let users generate all ratings organically (recommended)
-- For development/testing: Run the seed script manually after creating a test user
--
-- Original seed data was based on medical consensus from:
-- - UCHealth GLP-1 Nutrition Guide
-- - Cleveland Clinic Ozempic Food Guidelines
-- - Mayo Clinic GLP-1 Dietary Recommendations
--
-- See: /supabase/seed/food_tolerance_seed.sql for optional seed data
-- ============================================================================

-- FOOD TOLERANCE GUIDANCE (for reference, not inserted as data)
-- ============================================================================
-- 
-- WELL-TOLERATED (80-100%):
-- - Scrambled Eggs: Soft, high protein, low fat
-- - Greek Yogurt: High protein, probiotic, smooth
-- - Protein Shake: Liquid, high protein, customizable
-- - Chicken Breast (grilled): Lean protein (keep moist)
-- - Salmon: Soft, flaky, omega-3 rich
-- - Cottage Cheese: High protein, easy texture
--
-- MODERATELY TOLERATED (50%):
-- - Turkey Sandwich: Bread can be heavy
-- - Protein Bar: Dense, brand-dependent
--
-- POORLY TOLERATED (0-25%):
-- - Fried Chicken: High fat, greasy
-- - Fast Food Burger: High fat, processed
-- - Pizza: Greasy cheese, heavy carbs
-- - Steak (fatty cuts): Tough, high fat
-- - Ice Cream: High fat, dairy, sugar
--
-- ============================================================================

-- ============================================================================
-- FUNCTIONS (Optional Helper Functions)
-- ============================================================================

-- Function to get rating for a specific food
CREATE OR REPLACE FUNCTION get_food_rating(p_food_name TEXT)
RETURNS TABLE (
  food_name TEXT,
  total_votes BIGINT,
  upvotes BIGINT,
  downvotes BIGINT,
  tolerance_percentage NUMERIC,
  last_voted_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM food_tolerance_ratings
  WHERE food_tolerance_ratings.food_name = p_food_name;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has voted on a food
CREATE OR REPLACE FUNCTION user_has_voted(p_user_id UUID, p_food_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM food_tolerance_votes
    WHERE user_id = p_user_id AND food_name = p_food_name
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMPLETE
-- ============================================================================

-- Summary of seed data:
-- - Well-tolerated (80-100%): 6 foods (eggs, yogurt, shake, chicken, fish, cottage cheese)
-- - Moderately tolerated (50%): 2 foods (turkey sandwich, protein bar)
-- - Poorly tolerated (0-25%): 5 foods (fried chicken, burger, pizza, steak, ice cream)
-- Total: 13 foods with baseline ratings

-- To view all ratings:
-- SELECT * FROM food_tolerance_ratings ORDER BY tolerance_percentage DESC;

