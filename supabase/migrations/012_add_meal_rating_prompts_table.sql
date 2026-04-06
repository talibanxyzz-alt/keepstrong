-- Table to track which meals have been prompted for rating
CREATE TABLE IF NOT EXISTS meal_rating_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  protein_log_id UUID NOT NULL REFERENCES protein_logs(id) ON DELETE CASCADE,
  prompted_at TIMESTAMPTZ DEFAULT NOW(),
  responded BOOLEAN DEFAULT false,
  response_vote BOOLEAN, -- true = tolerated, false = not tolerated
  
  -- Only prompt once per meal
  UNIQUE(user_id, protein_log_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_meal_prompts_user 
  ON meal_rating_prompts(user_id);

CREATE INDEX IF NOT EXISTS idx_meal_prompts_log 
  ON meal_rating_prompts(protein_log_id);

CREATE INDEX IF NOT EXISTS idx_meal_prompts_pending 
  ON meal_rating_prompts(user_id, responded) 
  WHERE responded = false;

-- Enable RLS
ALTER TABLE meal_rating_prompts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own prompts"
  ON meal_rating_prompts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create prompts"
  ON meal_rating_prompts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompts"
  ON meal_rating_prompts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE meal_rating_prompts IS 'Tracks which meals have been prompted for tolerance rating';
COMMENT ON COLUMN meal_rating_prompts.responded IS 'Whether user responded to the prompt';
COMMENT ON COLUMN meal_rating_prompts.response_vote IS 'User response: true = tolerated, false = not tolerated';

