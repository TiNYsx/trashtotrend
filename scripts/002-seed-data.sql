-- 002-seed-data.sql
-- Seed data for "From Trash to Trend" event

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

-- Sample booths
INSERT INTO booths (name_en, name_th, description_en, description_th, display_order) VALUES
  ('Aluminium Recycling', 'รีไซเคิลอะลูมิเนียม', 'Learn about the closed-loop recycling process for aluminium cans.', 'เรียนรู้เกี่ยวกับกระบวนการรีไซเคิลกระป๋องอะลูมิเนียมแบบวงจรปิด', 1),
  ('Plastic Upcycling', 'อัพไซเคิลพลาสติก', 'Discover how plastic waste becomes trendy fashion accessories.', 'ค้นพบว่าขยะพลาสติกกลายเป็นเครื่องประดับแฟชั่นสุดเทรนด์ได้อย่างไร', 2),
  ('Paper Art Workshop', 'เวิร์กช็อปศิลปะกระดาษ', 'Transform old paper into beautiful art pieces.', 'เปลี่ยนกระดาษเก่าเป็นงานศิลปะที่สวยงาม', 3),
  ('Glass Innovation', 'นวัตกรรมแก้ว', 'See how glass bottles are reborn as designer items.', 'ดูว่าขวดแก้วกลายเป็นของดีไซน์ได้อย่างไร', 4),
  ('Textile Revival', 'ฟื้นฟูสิ่งทอ', 'Old clothes find new life through creative redesign.', 'เสื้อผ้าเก่าได้ชีวิตใหม่ผ่านการออกแบบเชิงสร้างสรรค์', 5)
ON CONFLICT DO NOTHING;

-- Sample quiz questions for Booth 1 (Aluminium)
INSERT INTO quiz_questions (booth_id, question_en, question_th, question_type, options, correct_answer, display_order) VALUES
  (1, 'How many times can aluminium be recycled?', 'อะลูมิเนียมสามารถรีไซเคิลได้กี่ครั้ง?', 'multiple_choice',
   '[{"text_en": "Only once", "text_th": "ครั้งเดียว", "is_correct": false}, {"text_en": "Up to 10 times", "text_th": "สูงสุด 10 ครั้ง", "is_correct": false}, {"text_en": "Infinitely", "text_th": "ไม่จำกัดจำนวนครั้ง", "is_correct": true}, {"text_en": "Up to 50 times", "text_th": "สูงสุด 50 ครั้ง", "is_correct": false}]',
   'Infinitely', 1),
  (1, 'What do you think about aluminium recycling?', 'คุณคิดอย่างไรเกี่ยวกับการรีไซเคิลอะลูมิเนียม?', 'short_text',
   NULL, NULL, 2);
