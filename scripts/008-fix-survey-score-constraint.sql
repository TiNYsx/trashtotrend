-- 008-fix-survey-score-constraint.sql
-- Relax score CHECK constraint to allow 0 for text-type answers
-- Text questions store answer text only, with score=1 (not meaningful)

ALTER TABLE pre_survey_responses DROP CONSTRAINT IF EXISTS pre_survey_responses_score_check;
ALTER TABLE pre_survey_responses ADD CONSTRAINT pre_survey_responses_score_check CHECK (score >= 0 AND score <= 5);

ALTER TABLE post_survey_responses DROP CONSTRAINT IF EXISTS post_survey_responses_score_check;
ALTER TABLE post_survey_responses ADD CONSTRAINT post_survey_responses_score_check CHECK (score >= 0 AND score <= 5);
