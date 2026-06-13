# Waitlist Edge Generic Public Errors

Date: 2026-06-11
Owner: Codex
Scope: PM_App Supabase `waitlist-signup` Edge Function.

## What changed

- Added a shared public fallback error message for operational failures in the waitlist Edge Function.
- Replaced detailed public responses for origin denial, missing server config, Turnstile provider failure, private RPC failure, incomplete private RPC response, and unexpected errors.
- Kept user-correctable validation specific where useful, such as invalid email or missing challenge token.
- Updated the Edge Function README, waitlist abuse decision doc, and Supabase static contract markers.

## Why

The public waitlist endpoint should not disclose origin allowlist, provider, secret, or private RPC failure details to browser callers. PM_Web already presents its own client-facing email fallback path, so the Edge Function can be conservative without worsening user experience.

## Verification

Not run in this step. Run:

```powershell
npm run check:supabase-static-contract
```

## Boundary

This is local Edge Function source and static-contract hardening only. It does not prove the function is deployed or that staging/production responses currently use the generic public error behavior.
