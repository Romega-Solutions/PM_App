# Waitlist Edge Security Response Headers

Date: 2026-06-11
Owner: Codex
Scope: PM_App Supabase `waitlist-signup` Edge Function.

## What changed

- Added security response headers to preflight and JSON responses from the public waitlist Edge Function.
- Added `X-Content-Type-Options: nosniff`.
- Added `Referrer-Policy: no-referrer`.
- Added `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`.
- Updated the Edge Function README and waitlist abuse decision doc.
- Updated the Supabase static contract so these headers remain guarded.

## Why

The public waitlist endpoint only collects email/platform interest. It should not grant or imply access to camera, microphone, geolocation, payment, referrer sharing, or content-type sniffing behavior.

## Verification

Not run in this step. Run:

```powershell
npm run check:supabase-static-contract
```

## Boundary

This is local Edge Function source and static-contract hardening only. It does not prove the function is deployed or that staging/production responses currently include these headers.
