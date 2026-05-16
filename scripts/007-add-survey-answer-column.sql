-- Add answer column to store actual answer text
ALTER TABLE pre_survey_responses ADD COLUMN IF NOT EXISTS answer TEXT;
ALTER TABLE post_survey_responses ADD COLUMN IF NOT EXISTS answer TEXT;

-- Ensure quiz_responses has the required columns for the journey quiz
-- (These may already exist from production-migration.sql, but adding for safety)
ALTER TABLE quiz_responses ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE;
ALTER TABLE quiz_responses ADD COLUMN IF NOT EXISTS booth_id INTEGER REFERENCES booths(id) ON DELETE CASCADE;
ALTER TABLE quiz_responses ADD COLUMN IF NOT EXISTS is_correct BOOLEAN DEFAULT false;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_quiz_responses_customer ON quiz_responses(customer_id);