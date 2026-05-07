-- production-migration.sql
-- Safe to run on production - uses IF NOT EXISTS and IF NOT EXISTS patterns
-- Run this ONCE on your production database

-- ============================================================
-- 1. BASE TABLES (if missing)
-- ============================================================

CREATE TABLE IF NOT EXISTS booths (
  id SERIAL PRIMARY KEY,
  name_en VARCHAR(200) NOT NULL,
  name_th VARCHAR(200) NOT NULL,
  description_en TEXT,
  description_th TEXT,
  image_url VARCHAR(500),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  qr_token VARCHAR(255) UNIQUE NOT NULL,
  registration_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stamps (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  booth_id INTEGER REFERENCES booths(id) ON DELETE CASCADE,
  scanned_by_staff_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
  stamped_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, booth_id)
);

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

CREATE TABLE IF NOT EXISTS pre_survey_questions (
  id SERIAL PRIMARY KEY,
  question_en TEXT NOT NULL,
  question_th TEXT NOT NULL,
  question_type VARCHAR(50) DEFAULT 'rating',
  options JSONB,
  is_required BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0, -- Removed UNIQUE to allow reordering
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS post_survey_questions (
  id SERIAL PRIMARY KEY,
  question_en TEXT NOT NULL,
  question_th TEXT NOT NULL,
  question_type VARCHAR(50) DEFAULT 'rating',
  options JSONB,
  is_required BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0, -- Removed UNIQUE to allow reordering
  is_active BOOLEAN DEFAULT true
);

-- ============================================================
-- 2. ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================================

-- Add booth_id to quiz_questions (if missing)
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS booth_id INTEGER REFERENCES booths(id) ON DELETE CASCADE;

-- Add quiz_category to quiz_questions (if missing)
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS quiz_category VARCHAR(50) DEFAULT 'booth';

-- Add question_type to quiz_questions (if missing)
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS question_type VARCHAR(20) DEFAULT 'multiple_choice';

-- Add correct_answer to quiz_questions (if missing)
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS correct_answer TEXT;

-- Add customer_id, booth_id, is_correct to quiz_responses (if missing)
ALTER TABLE quiz_responses ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE;
ALTER TABLE quiz_responses ADD COLUMN IF NOT EXISTS booth_id INTEGER REFERENCES booths(id) ON DELETE CASCADE;
ALTER TABLE quiz_responses ADD COLUMN IF NOT EXISTS is_correct BOOLEAN DEFAULT false;

-- Add customer_id, booth_id to scan_events (if missing)
-- Note: scan_events may already exist from 001-create-tables.sql with different columns
-- We add the missing columns rather than recreating the table
ALTER TABLE scan_events ADD COLUMN IF NOT EXISTS customer_id INTEGER;
ALTER TABLE scan_events ADD COLUMN IF NOT EXISTS booth_id INTEGER;

-- Add any missing columns to customers table (if they existed before)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS ice_bath_registered BOOLEAN DEFAULT false;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS ice_bath_time TIMESTAMPTZ;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS ice_bath_waved BOOLEAN DEFAULT false;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS pre_survey_completed BOOLEAN DEFAULT false;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS post_survey_completed BOOLEAN DEFAULT false;

-- ============================================================
-- 3. CREATE MISSING INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_quiz_questions_booth ON quiz_questions(booth_id);
CREATE INDEX IF NOT EXISTS idx_stamps_customer ON stamps(customer_id);
CREATE INDEX IF NOT EXISTS idx_stamps_booth ON stamps(booth_id);
CREATE INDEX IF NOT EXISTS idx_customers_qr_token ON customers(qr_token);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_scan_events_customer ON scan_events(customer_id);
CREATE INDEX IF NOT EXISTS idx_scan_events_booth ON scan_events(booth_id);

-- ============================================================
-- 4. SEED DEFAULT DATA (if not exists)
-- ============================================================

-- Insert default personality types
INSERT INTO personality_types (type_code, name_en, name_th, description_en, description_th, display_order) VALUES
  ('A', 'Creator', 'ผู้สร้างสรรค์', 'You see potential in everything and love to transform things into something new.', 'คุณเห็นศักยภาพในทุกสิ่งและชอบเปลี่ยนสิ่งต่างๆ ให้เป็นสิ่งใหม่', 1),
  ('B', 'Observer', 'ผู้สังเกต', 'You prefer to understand deeply before taking action.', 'คุณชอบทำความเข้าใจอย่างลึกซึ้งก่อนลงมือทำ', 2),
  ('C', 'Achiever', 'ผู้กล้ากระทำ', 'You are driven by action and achieving goals.', 'คุณถูกหล่อหล่อนด้วยการลงมือทำและการบรรลุเป้าหมาย', 3),
  ('D', 'Explorer', 'ผู้สำรวจ', 'You love discovering new things and unexpected connections.', 'คุณชอบค้นพบสิ่งใหม่และความเชื่อมโยงที่ไม่คาดคิด', 4),
  ('E', 'Restorer', 'ผู้ฟื้นฟู', 'You seek clarity and balance in chaos.', 'คุณแสวงหาความชัดเจนและความสมดุลในความวุ่นวาย', 5)
ON CONFLICT (type_code) DO NOTHING;

-- Insert default pre-survey questions
INSERT INTO pre_survey_questions (question_en, question_th, question_type, display_order) VALUES
  ('How interested are you in sustainability topics?', 'คุณสนใจเรื่องความยั่งยืนแค่ไหน?', 'rating', 1),
  ('How often do you recycle?', 'คุณรีไซเคิลบ่อยแค่ไหน?', 'rating', 2),
  ('How likely are you to attend eco-friendly events?', 'คุณมีแนวโน้มเข้าร่วมงานที่เป็นมิตรกับสิ่งแวดล้อมแค่ไหน?', 'rating', 3),
  ('How concerned are you about environmental issues?', 'คุณกังวลเรื่องปัญหาสิ่งแวดล้อมแค่ไหน?', 'rating', 4),
  ('How likely are you to change habits for the environment?', 'คุณมีแนวโน้มเปลี่ยนนิสัยเพื่อสิ่งแวดล้อมแค่ไหน?', 'rating', 5)
ON CONFLICT (display_order) DO NOTHING;

-- Insert default post-survey questions
INSERT INTO post_survey_questions (question_en, question_th, question_type, display_order) VALUES
  ('How much did you enjoy the event?', 'คุณ enjoy งานมากแค่ไหน?', 'rating', 1),
  ('How much did you learn about sustainability?', 'คุณเรียนรู้เรื่องความยั่งยืนมากแค่ไหน?', 'rating', 2),
  ('How likely are you to recommend this event?', 'คุณมีแนวโน้มแนะนำงานนี้แค่ไหน?', 'rating', 3),
  ('What did you like most about the event?', 'คุณชอบอะไรมากที่สุดในงาน?', 'text', 4),
  ('Any suggestions for improvement?', 'มีข้อเสนอแนะอะไรไหม?', 'text', 5)
ON CONFLICT (display_order) DO NOTHING;

-- Insert event settings for booth quiz
INSERT INTO event_settings (key, value) VALUES 
  ('start_journey_quiz_enabled', 'true'),
  ('booth_quiz_enabled', 'true')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- DONE
-- ============================================================
