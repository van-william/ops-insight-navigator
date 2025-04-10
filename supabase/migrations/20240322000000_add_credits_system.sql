-- Add credits table
CREATE TABLE user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  total_credits_purchased INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT credits_remaining_nonnegative CHECK (credits_remaining >= 0)
);

-- Add usage tracking
CREATE TABLE ai_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  conversation_id UUID REFERENCES discovery_conversations NOT NULL,
  tokens_used INTEGER NOT NULL,
  credits_used INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

-- Users can read their own credits
CREATE POLICY "Users can view their own credits"
  ON user_credits FOR SELECT
  USING (auth.uid() = user_id);

-- Only the application can update credits (via functions)
CREATE POLICY "Application can update credits"
  ON user_credits FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can view their own usage
CREATE POLICY "Users can view their own usage"
  ON ai_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Function to add credits
CREATE OR REPLACE FUNCTION add_user_credits(
  user_id UUID,
  amount INTEGER
) RETURNS user_credits AS $$
DECLARE
  result user_credits;
BEGIN
  INSERT INTO user_credits (user_id, credits_remaining, total_credits_purchased)
  VALUES (user_id, amount, amount)
  ON CONFLICT (user_id) DO UPDATE
  SET 
    credits_remaining = user_credits.credits_remaining + amount,
    total_credits_purchased = user_credits.total_credits_purchased + amount,
    updated_at = NOW()
  RETURNING * INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 