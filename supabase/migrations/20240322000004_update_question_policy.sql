-- Drop the old policy
DROP POLICY IF EXISTS "Questions are readable by all users" ON assessment_questions;

-- Create a new policy that allows public access to questions
CREATE POLICY "Questions are publicly readable"
  ON assessment_questions FOR SELECT
  USING (true);

-- Note: Responses and sessions still require authentication 