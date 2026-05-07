-- production-patch-001.sql
-- Run this on your production database to fix survey/quiz saving errors

-- 1. Remove UNIQUE constraints from display_order columns
-- This prevents 500 errors when reordering or adding questions
ALTER TABLE pre_survey_questions DROP CONSTRAINT IF EXISTS pre_survey_questions_display_order_key;
ALTER TABLE post_survey_questions DROP CONSTRAINT IF EXISTS post_survey_questions_display_order_key;
ALTER TABLE quiz_questions DROP CONSTRAINT IF EXISTS quiz_questions_display_order_key;

-- 2. Add missing partners settings fields (optional but recommended)
-- These allow the About page to fully sync with the new settings UI
INSERT INTO event_settings (key, value, updated_at) VALUES 
  ('about_partners_en', '', NOW()),
  ('about_partners_th', '', NOW())
ON CONFLICT (key) DO NOTHING;
