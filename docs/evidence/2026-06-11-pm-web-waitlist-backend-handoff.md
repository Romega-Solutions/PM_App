# PM_Web waitlist backend handoff

Date: 2026-06-11
Owner: Codex

## Scope

This source-only update adds a disabled-by-default PM_Web helper and visible waitlist form for future Supabase waitlist RPC capture.

## What changed

- Added `PM_Web/src/lib/waitlistBackendHandoff.ts`.
- Added `PM_Web/src/components/waitlist/WaitlistCaptureForm.tsx`.
- Wired the form into the PM_Web waitlist section with email fallback.
- Added `PM_Web/docs/WAITLIST_BACKEND_HANDOFF.md`.
- Updated PM_Web README and release checklist.
- Updated PM_Web product-design and launch-claims source guards.

## Launch boundary

PM_Web public CTAs remain email-safe. The form will not call Supabase unless all release gates are explicitly enabled:

- `VITE_PINAYMATE_WAITLIST_BACKEND_ENABLED=true`
- `VITE_PINAYMATE_WAITLIST_BACKEND_PROOF_ACCEPTED=true`
- `VITE_PINAYMATE_WAITLIST_ABUSE_CONTROL_APPROVED=true`

Supabase URL and anon key env vars are also required. Missing gates return email fallback and do not call the RPC.

## Validation status

Not run. This is source evidence only.
