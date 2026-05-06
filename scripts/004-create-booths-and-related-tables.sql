-- 004-create-booths-and-related-tables.sql
-- Add booths, customers, and stamps tables

-- Booths table
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

-- Customers table (separate from users/participants)
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  qr_token VARCHAR(255) UNIQUE NOT NULL,
  registration_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stamps table (stamp collection per customer per booth)
CREATE TABLE IF NOT EXISTS stamps (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  booth_id INTEGER REFERENCES booths(id) ON DELETE CASCADE,
  scanned_by_staff_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
  stamped_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, booth_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stamps_customer ON stamps(customer_id);
CREATE INDEX IF NOT EXISTS idx_stamps_booth ON stamps(booth_id);
CREATE INDEX IF NOT EXISTS idx_customers_qr_token ON customers(qr_token);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
