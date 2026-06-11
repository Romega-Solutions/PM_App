# PM_App Local Release Guard

Date: 2026-06-11
Scope: PM_App local release guard command.

## What changed

- Added `npm run check:release-local` in `PM_App`.
- Updated PM_App README, release readiness docs, and launch evidence packet to point at the combined local release guard.

## What the command covers

- `npm run check:privacy-logs`: blocks runtime success/debug logs and raw object logging patterns that can leak profile, auth, location, matching, messaging, or verification data.
- `npm run check:supabase-static-contract`: checks the static Supabase release contract for safety reports, block/unmatch, account deletion, privacy settings, read receipts, online status, storage, OCR rate limiting, discovery, and conversations.

## Not verified in this pass

- `npm run check:release-local` was not executed.
- Full lint, typecheck, tests, and web export were not rerun.
- Live Supabase applied state, OCR deployment, native-device QA, DNS/mailbox, app-store, and checkout readiness remain separate launch gates.
