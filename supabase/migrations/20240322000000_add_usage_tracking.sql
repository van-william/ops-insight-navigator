-- Add daily usage tracking
CREATE TABLE daily_ai_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  questions_asked INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT questions_nonnegative CHECK (questions_asked >= 0),
  UNIQUE(user_id, date)
);

-- Add RLS policies
ALTER TABLE daily_ai_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage
CREATE POLICY "Users can view their own usage"
  ON daily_ai_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Function to check and increment daily usage
CREATE OR REPLACE FUNCTION check_daily_usage(
  p_user_id UUID
) RETURNS boolean AS $$
DECLARE
  daily_limit INTEGER := 10;
  current_usage INTEGER;
BEGIN
  -- Get or create today's usage record
  INSERT INTO daily_ai_usage (user_id, date, questions_asked)
  VALUES (p_user_id, CURRENT_DATE, 0)
  ON CONFLICT (user_id, date) DO NOTHING;

  -- Get current usage
  SELECT questions_asked INTO current_usage
  FROM daily_ai_usage
  WHERE user_id = p_user_id AND date = CURRENT_DATE;

  -- Check if under limit
  IF current_usage >= daily_limit THEN
    RETURN false;
  END IF;

  -- Increment usage
  UPDATE daily_ai_usage
  SET 
    questions_asked = questions_asked + 1,
    updated_at = NOW()
  WHERE user_id = p_user_id AND date = CURRENT_DATE;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 