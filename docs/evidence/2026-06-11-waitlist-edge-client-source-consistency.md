# Waitlist Edge Client Source Consistency

Date: 2026-06-11
Owner: Codex
Scope: PM_App Supabase `waitlist-signup` Edge Function and PM_Web waitlist handoff.

## What changed

- The public waitlist Edge Function now maps approved `x-client-info` markers to the expected submitted `source`.
- `pm-web-waitlist` must submit `source: "pm_web"`.
- `pm-app-waitlist` must submit `source: "pm_app"`.
- Mismatched marker/source requests return the generic public fallback error.
- The Edge Function README, waitlist abuse decision doc, and Supabase static contract now guard this consistency rule.

## Why

The client marker is more useful when it constrains the request body. This prevents a generic or web request from claiming app-source attribution, and it keeps waitlist abuse buckets and source analytics aligned with the intended PinayMate client path.

## Verification

Not run in this step. Run:

```powershell
npm run check:supabase-static-contract
```

## Boundary

This is local Edge Function source and static-contract hardening only. It does not prove the function is deployed or that staging/production currently enforce marker/source consistency.
