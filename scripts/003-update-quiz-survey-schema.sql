-- 003-update-quiz-survey-schema.sql
-- Add booth_id to quiz_questions, create survey tables, add personality types

-- Add booth_id column to quiz_questions (NULL = start journey quiz)
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS booth_id INTEGER REFERENCES booths(id) ON DELETE CASCADE;

-- Add quiz_category to distinguish between journey start and regular booth quizzes
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS quiz_category VARCHAR(50) DEFAULT 'booth';

-- Add unique personality types table
CREATE TABLE IF NOT EXISTS personality_types (
  id SERIAL PRIMARY KEY,
  type_code VARCHAR(10) UNIQUE NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  name_th VARCHAR(100) NOT NULL,
  description_en TEXT,
  description_th TEXT,
  image_url VARCHAR(500),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Create pre_survey_questions table
CREATE TABLE IF NOT EXISTS pre_survey_questions (
  id SERIAL PRIMARY KEY,
  question_en TEXT NOT NULL,
  question_th TEXT NOT NULL,
  question_type VARCHAR(50) DEFAULT 'rating',
  options JSONB,
  is_required BOOLEAN DEFAULT true,
  display_order INT UNIQUE DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Create post_survey_questions table  
CREATE TABLE IF NOT EXISTS post_survey_questions (
  id SERIAL PRIMARY KEY,
  question_en TEXT NOT NULL,
  question_th TEXT NOT NULL,
  question_type VARCHAR(50) DEFAULT 'rating',
  options JSONB,
  is_required BOOLEAN DEFAULT true,
  display_order INT UNIQUE DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Insert default personality types if not exists
INSERT INTO personality_types (type_code, name_en, name_th, description_en, description_th, display_order) VALUES
  ('A', 'Creator', 'ผู้สร้างสรรค์', 'You see potential in everything and love to transform things into something new.', 'คุณเห็นศักยภาพในทุกสิ่งและชอบเปลี่ยนสิ่งต่างๆ ให้เป็นสิ่งใหม่', 1),
  ('B', 'Observer', 'ผู้สังเกต', 'You prefer to understand deeply before taking action.', 'คุณชอบทำความเข้าใจอย่างลึกซึ้งก่อนลงมือทำ', 2),
  ('C', ' Achiever', 'ผู้กล้ากระทำ', 'You are driven by action and achieving goals.', 'คุณถูกหล่อหล่อนด้วยการลงมือทำและการบรรลุเป้าหมาย', 3),
  ('D', 'Explorer', 'ผู้สำรวจ', 'You love discovering new things and unexpected connections.', 'คุณชอบค้นพบสิ่งใหม่และความเชื่อมโยงที่ไม่คาดคิด', 4),
  ('E', 'Restorer', 'ผู้ฟื้นฟู', 'You seek clarity and balance in chaos.', 'คุณแสวงหาความชัดเจนและความสมดุลในความวุ่นวาย', 5)
ON CONFLICT (type_code) DO NOTHING;

-- Insert default pre-survey questions if not exists
INSERT INTO pre_survey_questions (question_en, question_th, question_type, display_order) VALUES
  ('How interested are you in sustainability topics?', 'คุณสนใจเรื่องความยั่งยืนแค่ไหน?', 'rating', 1),
  ('How often do you recycle?', 'คุณรีไซเคิลบ่อยแค่ไหน?', 'rating', 2),
  ('How likely are you to attend eco-friendly events?', 'คุณมีแนวโน้มเข้าร่วมงานที่เป็นมิตรกับสิ่งแวดล้อมแค่ไหน?', 'rating', 3),
  ('How concerned are you about environmental issues?', 'คุณกังวลเ��ื่องปัญหาสิ่งแวดล้อมแค่ไหน?', 'rating', 4),
  ('How likely are you to change habits for the environment?', 'คุณมีแนวโน้มเปลี่ยนนิสัยเพื่อสิ่งแวดล้อมแค่ไหน?', 'rating', 5)
ON CONFLICT (display_order) DO NOTHING;

-- Insert default post-survey questions if not exists  
INSERT INTO post_survey_questions (question_en, question_th, question_type, display_order) VALUES
  ('How much did you enjoy the event?', 'คุณ enjoy งานมากแค่ไหน?', 'rating', 1),
  ('How much did you learn about sustainability?', 'คุณเรียนรู้เรื่องความยั่งยืนมากแค่ไหน?', 'rating', 2),
  ('How likely are you to recommend this event?', 'คุณมีแนวโน้มแนะนำงานนี้แค่ไหน?', 'rating', 3),
  ('What did you like most about the event?', 'คุณชอบอะไรมากที่สุดในงาน?', 'text', 4),
  ('Any suggestions for improvement?', 'มีข้อเสนอแนะอะไรไหม?', 'text', 5)
ON CONFLICT (display_order) DO NOTHING;

-- Update existing quiz_questions to have booth_id = 1 for first booth quiz (legacy)
UPDATE quiz_questions SET booth_id = 1, quiz_category = 'booth' WHERE booth_id IS NULL;

-- Add event setting for start journey quiz enabled
INSERT INTO event_settings (key, value) VALUES 
  ('start_journey_quiz_enabled', 'true'),
  ('start_journey_quiz_id', ''),
  ('booth_quiz_enabled', 'true')
ON CONFLICT (key) DO NOTHING;