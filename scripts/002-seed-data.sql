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

-- Checkpoints (from booths)
INSERT INTO checkpoints (slug, name_en, name_th, description_en, description_th, type, display_order, is_active)
VALUES 
  ('aluminium_recycling', 'Aluminium Recycling', 'การรีไซเคิลอะลูมิเนียม', 'Learn about the closed-loop recycling process for aluminium cans.', 'เรียนรู้เกี่ยวกับกระบวนการรีไซเคิลแบบวงจรปิดสำหรับกระป๋องอะลูมิเนียม', 'booth', 1, true),
  ('plastic_upcycling', 'Plastic Upcycling', 'การยกระดับพลาสติก', 'Discover how plastic waste becomes trendy fashion accessories.', 'ค้นพบว่าขยะพลาสติกกลายเป็นแอกเซสซอรีแฟชั่นที่ทันสมัยได้อย่างไร', 'booth', 2, true),
  ('paper_art_workshop', 'Paper Art Workshop', 'เวิร์คช็อปงานศิลปะกระดาษ', 'Transform old paper into beautiful art pieces.', 'แปลงกระดาษเก่าเป็นงานศิลปะที่สวยงาม', 'booth', 3, true),
  ('glass_innovation', 'Glass Innovation', 'นวัตกรรมแก้ว', 'See how glass bottles are reborn as designer items.', 'ดูว่าขวดแก้วถูกตีความใหม่เป็นของตกแต่งได้อย่างไร', 'booth', 4, true),
  ('textile_revival', 'Textile Revival', 'การฟื้นฟูสิ่งทอ', 'Old clothes find new life through creative redesign.', 'เสื้อผ้าเก่ากลับมามีชีวิตใหม่ผ่านการออกแบบใหม่อย่างสร้างสรรค์', 'booth', 5, true)
ON CONFLICT (slug) DO NOTHING;
