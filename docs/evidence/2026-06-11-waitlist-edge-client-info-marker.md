# Waitlist Edge Client Info Marker

Date: 2026-06-11
Owner: Codex
Scope: PM_App Supabase `waitlist-signup` Edge Function and PM_Web waitlist handoff.

## What changed

- The public waitlist Edge Function now requires POST requests to include an approved `x-client-info` marker.
- Allowed markers are `pm-web-waitlist` and `pm-app-waitlist`.
- Requests without an approved marker return the generic public fallback error.
- The Edge Function README and waitlist abuse decision doc now document the marker contract.
- The Supabase static contract now guards the marker list and header check.

## Why

PM_Web already sends `x-client-info: pm-web-waitlist`. Enforcing the marker on the Edge Function makes the documented browser handoff contract real and gives operators a simple way to distinguish intended PinayMate waitlist clients from generic public POSTs.

## Verification

Not run in this step. Run:

```powershell
npm run check:supabase-static-contract
```

## Boundary

This is local Edge Function source and static-contract hardening only. It does not prove the function is deployed or that staging/production currently enforce the client-info marker.
