# Supabase Static Contract Audit

Date: 2026-06-11
Generated at: 2026-06-10T16:52:20.112Z
Command: `npm run check:supabase-static-contract`
Status: PASS

This is static-only proof. It checks that required migration, SQL smoke-test, and OCR function markers exist in the local repository.

It does not prove migrations were applied to a live Supabase project, that RLS/storage policies are active in production, that Supabase advisors pass, or that the OCR endpoint/rate limit works against a deployed database.

## Passed Contracts

- Safety reports
- Block and unmatch
- Account deletion queue
- Privacy settings
- Read receipts privacy
- Online status privacy
- Storage buckets
- Privilege boundary smoke checks
- OCR rate limiting
- Discovery read model
- Conversations and messages

## Missing Contracts

- None

## Static Files Inspected

- `supabase/functions/ocr/index.ts`
- `supabase/migrations/03_add_conversations_table.sql`
- `supabase/migrations/04_production_security_hardening.sql`
- `supabase/migrations/20260610094806_add_pinaymate_storage_buckets.sql`
- `supabase/migrations/20260610100323_add_ocr_rate_limit.sql`
- `supabase/migrations/20260610112000_add_account_deletion_requests.sql`
- `supabase/migrations/20260610113000_add_privacy_settings.sql`
- `supabase/migrations/20260610114000_respect_read_receipts_privacy.sql`
- `supabase/migrations/20260610115000_respect_online_status_privacy.sql`
- `supabase/migrations/99_final_release_security_hardening.sql`
- `supabase/tests/04_safety_smoke_test.sql`

## Residual Live Blockers

- Run Supabase migration history/list against the linked project.
- Apply pending migrations to the target environment if migration history is behind.
- Run Supabase DB lint/advisors against local or linked Postgres.
- Run `supabase/tests/04_safety_smoke_test.sql` in a staging/local database with two active profiles.
- Verify deployed OCR Edge Function rate limiting with real authenticated requests.
