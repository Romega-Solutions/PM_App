-- Restore columns that later migrations depend on.
--
-- These columns were first added by the duplicate version-04 file that now
-- lives in supabase/archived_migrations/04_production_security_hardening.sql.
-- Production already has them because that file ran before it was archived,
-- but a database rebuilt only from supabase/migrations does not, so
-- 20260611131000_add_verification_review_workflow.sql fails with
-- `column "verification_mismatch_reasons" of relation "profiles" does not exist`.
--
-- Every statement uses ADD COLUMN IF NOT EXISTS, so this file is a no-op on
-- environments that already have the columns.

BEGIN;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_coordinates JSONB;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_timestamp TIMESTAMPTZ;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_selfie TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_document TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_extracted_first_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_extracted_last_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_extracted_age INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_mismatch_reasons TEXT[];

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interested_in TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age_min INTEGER DEFAULT 18;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age_max INTEGER DEFAULT 70;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS max_distance_km INTEGER DEFAULT 50;

ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS text TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'text'
  CHECK (type IN ('text', 'image', 'voice', 'video', 'file'));
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

COMMIT;
