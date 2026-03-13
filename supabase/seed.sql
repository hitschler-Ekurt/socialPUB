-- ============================================
-- hitschies Publisher -- Seed Data
-- ============================================

-- First admin user (Ersin)
-- The handle_new_user trigger will auto-create the profile
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, role, aud, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'ersin@hitschies.de',
  crypt('CHANGE_ME_ON_FIRST_LOGIN', gen_salt('bf')),
  NOW(),
  '{"full_name": "Ersin Kurt", "role": "admin"}'::jsonb,
  'authenticated',
  'authenticated',
  NOW(),
  NOW()
);

-- Demo campaigns
INSERT INTO public.campaigns (name, slug, color, description, start_date, end_date) VALUES
  ('Karneval 2026', 'karneval-2026', '#FF6B35', 'Karnevalskampagne', '2026-02-01', '2026-02-28'),
  ('Sommer 2026', 'sommer-2026', '#FFD600', 'Sommerkampagne', '2026-06-01', '2026-08-31');

-- Demo hashtag sets
INSERT INTO public.hashtag_sets (name, hashtags, category) VALUES
  ('hitschies Standard', ARRAY['#hitschies', '#hitschiescandy', '#suessigkeiten'], 'brand'),
  ('Karneval', ARRAY['#karneval', '#karneval2026', '#alaaf', '#helau', '#hitschies'], 'campaign');
