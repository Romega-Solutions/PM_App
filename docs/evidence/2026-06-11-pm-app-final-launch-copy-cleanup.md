# PM App final launch-copy cleanup pass

Date: 2026-06-11

## Scope

- Match modal.
- Account profile photos screen.
- Terms overview.

## What changed

- Removed launch availability wording from match messaging accessibility copy.
- Removed launch availability wording from profile photo privacy guidance.
- Replaced launch-stage terms overview wording with client-facing product/legal language.
- Reworked the profile photo privacy guidance as a lightweight strip instead of a card-like block.

## Verification

- Targeted PM_App frontend copy scan, contract checks, TypeScript, lint, and diff checks were run after the change.
- Production proof still depends on external EAS, Supabase, live-service, Vercel, and owner-signoff access.
