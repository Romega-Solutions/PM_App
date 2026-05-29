-- =============================================================================
-- SEED — reference/lookup data. Runs automatically after migrations on
-- `supabase db reset`. Safe to re-run (idempotent via ON CONFLICT).
-- =============================================================================

insert into public.interests (name, category) values
  ('Travel', 'lifestyle'),     ('Music', 'entertainment'), ('Movies', 'entertainment'),
  ('Cooking', 'lifestyle'),    ('Fitness', 'health'),      ('Reading', 'hobby'),
  ('Photography', 'hobby'),    ('Gaming', 'entertainment'),('Dancing', 'hobby'),
  ('Foodie', 'lifestyle'),     ('Nature', 'lifestyle'),    ('Art', 'hobby'),
  ('Coffee', 'lifestyle'),     ('Pets', 'lifestyle'),      ('Faith', 'values'),
  ('Sports', 'health'),        ('Fashion', 'lifestyle'),   ('Beach', 'lifestyle')
on conflict (name) do nothing;

insert into public.languages (code, name) values
  ('en', 'English'),  ('tl', 'Tagalog'),  ('ceb', 'Cebuano'), ('hil', 'Hiligaynon'),
  ('ilo', 'Ilocano'), ('es', 'Spanish'),  ('zh', 'Chinese'),  ('ja', 'Japanese'),
  ('ko', 'Korean'),   ('de', 'German'),   ('fr', 'French'),   ('ar', 'Arabic')
on conflict (code) do nothing;
