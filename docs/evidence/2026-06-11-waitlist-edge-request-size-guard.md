# Waitlist Edge Request Size Guard

Date: 2026-06-11
Owner: Codex
Scope: PM_App Supabase `waitlist-signup` Edge Function.

## What changed

- Added a 4096-byte limit for public waitlist JSON request bodies.
- Checks declared `Content-Length` before reading when present.
- Checks actual UTF-8 body size after reading and before JSON parsing.
- Keeps oversized request responses generic through the existing public fallback message.
- Updated the Edge Function README, waitlist abuse decision doc, and Supabase static contract markers.

## Why

The public waitlist endpoint needs only small email/platform payloads. A body-size guard reduces abuse surface and avoids parsing unexpectedly large JSON submissions on a public route.

## Verification

Not run in this step. Run:

```powershell
npm run check:supabase-static-contract
```

## Boundary

This is local Edge Function source and static-contract hardening only. It does not prove the function is deployed or that staging/production currently enforce the request-size guard.
