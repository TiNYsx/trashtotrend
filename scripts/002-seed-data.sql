-- 002-seed-data.sql
-- Seed data for "From Trash to Trend" / HOOP Event Platform

-- Default admin account (password: admin123 — change after first login!)
-- bcrypt hash of 'admin123'
INSERT INTO staff (username, password_hash, display_name, role)
VALUES ('admin', '$2a$10$gYz9QU0YmJxwu0GYhdcZbeZE6odfn2SgLT65H.TrIf8MmHCIc1PWG', 'Administrator', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Default registration fields
INSERT INTO registration_fields (field_key, label_en, label_th, field_type, is_required, display_order) VALUES
  ('full_name', 'Full Name', 'ชื่อ-นามสกุล', 'text', true, 1),
  ('phone', 'Phone Number', 'เบอร์โทรศัพท์', 'tel', false, 2),
  ('age', 'Age', 'อายุ', 'number', false, 3),
  ('occupation', 'Occupation', 'อาชีพ', 'text', false, 4)
ON CONFLICT (field_key) DO NOTHING;

-- Event settings (already inserted in schema, but update for demo)
UPDATE event_settings SET value = '50' WHERE key = 'ice_bath_capacity';
UPDATE event_settings SET value = '2026-04-20' WHERE key = 'ice_bath_open_date';
UPDATE event_settings SET value = '2026-04-25' WHERE key = 'event_date';
UPDATE event_settings SET value = 'true' WHERE key = 'quiz_enabled';
