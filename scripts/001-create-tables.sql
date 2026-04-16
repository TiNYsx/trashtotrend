-- 001-create-tables.sql
-- "From Trash to Trend" Event Stamp Collection App

-- Staff accounts
CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(200),
  role VARCHAR(20) DEFAULT 'staff',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booths
CREATE TABLE IF NOT EXISTS booths (
  id SERIAL PRIMARY KEY,
  name_en VARCHAR(200) NOT NULL,
  name_th VARCHAR(200) NOT NULL,
  description_en TEXT,
  description_th TEXT,
  image_url TEXT,
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

-- Customers (registered users)
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  qr_token VARCHAR(255) UNIQUE NOT NULL,
  registration_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stamps (which customer visited which booth)
CREATE TABLE IF NOT EXISTS stamps (
  id SERIAL PRIMARY KEY,
  customer_id INT REFERENCES customers(id) ON DELETE CASCADE,
  booth_id INT REFERENCES booths(id) ON DELETE CASCADE,
  scanned_by_staff_id INT REFERENCES staff(id) ON DELETE SET NULL,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, booth_id)
);

-- Quiz questions (per booth, staff-configurable)
CREATE TABLE IF NOT EXISTS quiz_questions (
  id SERIAL PRIMARY KEY,
  booth_id INT REFERENCES booths(id) ON DELETE CASCADE,
  question_en TEXT NOT NULL,
  question_th TEXT NOT NULL,
  question_type VARCHAR(20) NOT NULL,
  options JSONB,
  correct_answer TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Quiz responses (for research data)
CREATE TABLE IF NOT EXISTS quiz_responses (
  id SERIAL PRIMARY KEY,
  customer_id INT REFERENCES customers(id) ON DELETE CASCADE,
  question_id INT REFERENCES quiz_questions(id) ON DELETE CASCADE,
  booth_id INT REFERENCES booths(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  is_correct BOOLEAN,
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stamps_customer ON stamps(customer_id);
CREATE INDEX IF NOT EXISTS idx_stamps_booth ON stamps(booth_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_customer ON quiz_responses(customer_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_booth ON quiz_responses(booth_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_booth ON quiz_questions(booth_id);
CREATE INDEX IF NOT EXISTS idx_customers_qr_token ON customers(qr_token);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
