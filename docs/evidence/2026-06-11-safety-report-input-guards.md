# Safety Report Input Guards

## Status

Source hardening completed. Safety tests and launch contracts were not run in this turn by instruction.

## Changed

`src/features/safety/api/safetyApi.ts`

- Added UUID-format validation before report, block, and unmatch RPC calls.
- Added conversation ID validation before conversation-scoped reports.
- Added report reason normalization with a 120-character cap.
- Added report details normalization with an 800-character cap.
- Added runtime source normalization with fallback to `app`.
- Kept generic user-safe error messages for policy/RLS failures.

`src/features/safety/api/__tests__/safetyApi.test.ts`

- Updated fixtures to use UUID-shaped IDs.
- Added malformed member ID, malformed conversation ID, empty reason, and truncation coverage.
- Updated expectations for privacy-safe RPC errors.

`src/features/safety/workflows/__tests__/reportSafetyConcern.test.ts`

- Updated workflow fixtures to UUID-shaped IDs.

`scripts/check-launch-file-contract.mjs`

- Added safety API static markers for ID normalization, conversation validation, details caps, and required reason handling.
- Added migration markers for database-level report reason, detail, and source normalization.

`supabase/migrations/20260611121000_harden_user_report_payload.sql`

- Added database-side reason and details caps for `submit_user_report`.
- Added database-side report source normalization to known values.
- Preserved authenticated-only execute grants and anon revoke behavior.

`scripts/check-supabase-static-contract.mjs`

- Added static Supabase contract markers for the report payload hygiene migration.

## Tooling note

Tried to create the migration with `supabase migration new harden_user_report_payload`, but the Supabase CLI is not installed in this environment. The migration was added using the repo's existing timestamped migration naming convention.

## Why it matters

Safety reports, blocks, and unmatches are launch-critical user-protection flows. The API now rejects malformed identifiers before calling Supabase, keeps report payloads bounded, and avoids exposing raw policy or database details to users.

## Evidence still needed

- Run safety API tests.
- Run `npm run check:launch-file-contract`.
- Run `npm run check:source-contracts`.
- Apply `20260611121000_harden_user_report_payload.sql` in staging and production.
- Prove live Supabase safety report/block/unmatch paths in staging and production.
