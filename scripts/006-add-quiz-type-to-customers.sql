-- 006-add-quiz-type-to-customers.sql
-- Add quiz_type column to customers table for personality quiz results

ALTER TABLE customers ADD COLUMN IF NOT EXISTS quiz_type VARCHAR(50);
