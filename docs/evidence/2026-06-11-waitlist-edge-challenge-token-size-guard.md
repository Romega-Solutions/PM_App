# Waitlist Edge Challenge Token Size Guard

Date: 2026-06-11
Owner: Codex
Scope: PM_App Supabase `waitlist-signup` Edge Function.

## What changed

- Added a 2048-byte UTF-8 limit for waitlist challenge tokens.
- Applies to `turnstileToken` and `token` in the JSON body.
- Applies to `cf-turnstile-response` and `x-turnstile-token` request headers.
- Oversized challenge tokens use the generic public fallback error before provider verification.
- Updated the Edge Function README, waitlist abuse decision doc, and Supabase static contract markers.

## Why

The waitlist JSON body is already capped, but challenge tokens can also arrive through headers. Capping token size before provider verification reduces abuse surface and keeps the public endpoint input contract small.

## Verification

Not run in this step. Run:

```powershell
npm run check:supabase-static-contract
```

## Boundary

This is local Edge Function source and static-contract hardening only. It does not prove the function is deployed or that staging/production currently enforce the challenge-token guard.
