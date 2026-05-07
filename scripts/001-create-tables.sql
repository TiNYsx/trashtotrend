-- 001-create-tables.sql
-- "From Trash to Trend" / HOOP Event Platform

-- Staff accounts
CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(200),
  role VARCHAR(20) DEFAULT 'staff',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checkpoints (7 total)
CREATE TABLE IF NOT EXISTS checkpoints (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  name_en VARCHAR(200) NOT NULL,
  name_th VARCHAR(200) NOT NULL,
  description_en TEXT,
  description_th TEXT,
  type VARCHAR(50) NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dynamic registration fields (staff-configurable)
CREATE TABLE IF NOT EXISTS registration_fields (
  id SERIAL PRIMARY KEY,
  field_key VARCHAR(100) UNIQUE NOT NULL,
  label_en VARCHAR(200) NOT NULL,
  label_th VARCHAR(200) NOT NULL,
  field_type VARCHAR(50) NOT NULL,
  options JSONB,
  is_required BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Users (event participants)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(200),
  age VARCHAR(10),
  gender VARCHAR(20),
  contact VARCHAR(100),
  qr_token VARCHAR(255) UNIQUE NOT NULL,
  quiz_type VARCHAR(50),
  quiz_scores JSONB DEFAULT '{}',
  registration_data JSONB DEFAULT '{}',
  has_brought_can BOOLEAN DEFAULT false,
  ice_bath_registered BOOLEAN DEFAULT false,
  pre_survey_completed BOOLEAN DEFAULT false,
  post_survey_completed BOOLEAN DEFAULT false,
  reward_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checkpoint completions
CREATE TABLE IF NOT EXISTS checkpoint_completions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  checkpoint_id INT REFERENCES checkpoints(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, checkpoint_id)
);

-- Quiz questions (personality quiz)
CREATE TABLE IF NOT EXISTS quiz_questions (
  id SERIAL PRIMARY KEY,
  question_en TEXT NOT NULL,
  question_th TEXT NOT NULL,
  options JSONB NOT NULL,
  display_order INT UNIQUE DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Quiz responses (for personality type calculation)
CREATE TABLE IF NOT EXISTS quiz_responses (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  question_id INT REFERENCES quiz_questions(id) ON DELETE CASCADE,
  answer VARCHAR(10) NOT NULL,
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ice Bath registrations
CREATE TABLE IF NOT EXISTS ice_bath_registrations (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  contact VARCHAR(100) NOT NULL,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Pre-survey responses
CREATE TABLE IF NOT EXISTS pre_survey_responses (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  question_num INT NOT NULL,
  score INT NOT NULL CHECK (score >= 1 AND score <= 5),
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_num)
);

-- Post-survey responses
CREATE TABLE IF NOT EXISTS post_survey_responses (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  question_num INT NOT NULL,
  score INT NOT NULL CHECK (score >= 1 AND score <= 5),
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_num)
);

-- Scan events (for analytics)
CREATE TABLE IF NOT EXISTS scan_events (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  staff_id INT REFERENCES staff(id) ON DELETE SET NULL,
  checkpoint_slug VARCHAR(50),
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event settings
CREATE TABLE IF NOT EXISTS event_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default checkpoints
INSERT INTO checkpoints (slug, name_en, name_th, description_en, description_th, type, display_order) VALUES
  ('entry', 'Entry', 'จุดเช็คอิน', 'Submit your aluminium can to start the journey', 'ส่งกระป๋องอะลูมิเนียมของคุณเพื่อเริ่มต้นการเดินทาง', 'physical', 1),
  ('social', 'Social Post', 'โพสต์สังคม', 'Share your experience on social media', 'แชร์ประสบการณ์ของคุณบนโซเชียลมีเดีย', 'social', 2),
  ('hidden-can', 'Hidden Can Puzzle', 'ปริศนากระป๋องซ่อน', 'Find the hidden can puzzle', 'ค้นหาปริศนากระป๋องที่ซ่อนอยู่', 'game', 3),
  ('hoop-the-can', 'Hoop the Can', 'ขว้างแหวน', 'Play the hoop the can game', 'เล่นเกมขว้างแหวน', 'game', 4),
  ('art-showcase', 'Art Showcase', 'นิทรรศการศิลปะ', 'Visit the art showcase', 'เยี่ยมชมนิทรรศการศิลปะ', 'experience', 5),
  ('note-loop', 'Note Loop', 'ข้อความแห่งความหวัง', 'Leave a message of hope', 'ทิ้งข้อความแห่งความหวัง', 'experience', 6),
  ('workshop', 'Workshop', 'เวิร์คช็อป', 'Participate in a workshop activity', 'เข้าร่วมกิจกรรมเวิร์คช็อป', 'activity', 7)
ON CONFLICT (slug) DO NOTHING;

-- Insert default event settings
INSERT INTO event_settings (key, value) VALUES
  ('ice_bath_capacity', '50'),
  ('ice_bath_open_date', '2026-04-20'),
  ('event_date', '2026-04-25'),
  ('quiz_enabled', 'true'),
  ('home_title_en', 'HOOP Creative Exhibition'),
  ('home_title_th', 'นิทรรศการ HOOP'),
  ('home_tagline_en', 'From Trash to Trend'),
  ('home_tagline_th', 'จากขยะสู่แฟชั่น'),
  ('home_description_en', 'Experience the transformation of aluminium from waste to worth. Join our circular economy journey and discover how trash becomes treasure.'),
  ('home_description_th', 'สัมผัสการเปลี่ยนแปลงของอะลูมิเนียมจากขยะสู่คุณค่า ร่วมเดินทางสู่เศรษฐกิจหมุนเวียนและค้นพบว่าขยะกลายเป็นสมบัติได้อย่างไร'),
  ('about_mission_en', 'HOOP is a creative exhibition exploring the transformation of aluminium from waste to worth. We believe that what society discards can become something valuable through innovation, creativity, and conscious consumption.'),
  ('about_mission_th', 'HOOP คือนิทรรศการสร้างสรรค์ที่สำรวจการเปลี่ยนแปลงของอะลูมิเนียมจากขยะสู่คุณค่า เราเชื่อว่าสิ่งที่สังคมทิ้งสามารถกลายเป็นสิ่งมีคุณค่าได้ผ่านนวัตกรรม ความสร้างสรรค์ และการบริโภคอย่างมีสติ'),
  ('about_circular_en', 'The aluminium loop represents one of the most efficient recycling systems on Earth. Did you know that aluminium can be recycled infinitely without losing quality? Every can you bring becomes part of this endless cycle of renewal.'),
  ('about_circular_th', 'วงจรอะลูมิเนียมเป็นหนึ่งในระบบรีไซเคิลที่มีประสิทธิภาพมากที่สุดในโลก คุณทราบหรือไม่ว่าอะลูมิเนียมสามารถรีไซเคิลได้ไม่จำกัดโดยไม่สูญเสียคุณภาพ? ทุกกระป๋องที่คุณนำมาจะกลายเป็นส่วนหนึ่งของวงจรการฟื้นฟูที่ไม่มีที่สิ้นสุด')
ON CONFLICT (key) DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_checkpoint_completions_user ON checkpoint_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_checkpoint_completions_checkpoint ON checkpoint_completions(checkpoint_id);
CREATE INDEX IF NOT EXISTS idx_users_qr_token ON users(qr_token);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_user ON quiz_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_ice_bath_user ON ice_bath_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_events_user ON scan_events(user_id);
