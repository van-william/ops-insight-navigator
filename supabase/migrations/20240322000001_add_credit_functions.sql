-- Function to use AI credits
CREATE OR REPLACE FUNCTION use_ai_credits(
  p_user_id UUID,
  p_conversation_id UUID,
  p_tokens_used INTEGER,
  p_credits_used INTEGER
) RETURNS void AS $$
BEGIN
  -- Check if user has enough credits
  IF NOT EXISTS (
    SELECT 1 FROM user_credits 
    WHERE user_id = p_user_id 
    AND credits_remaining >= p_credits_used
  ) THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  -- Update credits and track usage in a transaction
  BEGIN
    -- Deduct credits
    UPDATE user_credits 
    SET 
      credits_remaining = credits_remaining - p_credits_used,
      updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Record usage
    INSERT INTO ai_usage (
      user_id,
      conversation_id,
      tokens_used,
      credits_used
    ) VALUES (
      p_user_id,
      p_conversation_id,
      p_tokens_used,
      p_credits_used
    );
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Failed to update credits: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 