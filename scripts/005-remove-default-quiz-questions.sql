-- 005-remove-default-quiz-questions.sql
-- Remove the 5 default personality quiz questions that were seeded in 001-create-tables.sql
-- These are now managed entirely by staff through the quiz settings page

-- Delete the default personality quiz questions
DELETE FROM quiz_questions 
WHERE question_en IN (
  'How do you approach creative projects?',
  'What draws you to sustainability?',
  'At an exhibition, you typically...',
  'How do you prefer to learn?',
  'What motivates you most?'
)
AND (booth_id IS NULL OR booth_id = 1)
AND (quiz_category = 'booth' OR quiz_category IS NULL);

-- Also clean up any quiz questions that have quiz_category='booth' but booth_id IS NULL
-- (this fixes the data inconsistency caused by 003-update-quiz-survey-schema.sql 
--  running before the booths table existed)
UPDATE quiz_questions 
SET quiz_category = 'journey', 
    booth_id = NULL 
WHERE quiz_category = 'booth' 
AND booth_id IS NULL;
