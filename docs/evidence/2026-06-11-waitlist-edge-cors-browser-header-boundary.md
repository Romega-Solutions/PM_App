# Waitlist Edge CORS Browser Header Boundary

Date: 2026-06-11
Owner: Codex
Scope: PM_App Supabase `waitlist-signup` Edge Function and PM_Web browser waitlist handoff.

## What changed

- The `waitlist-signup` Edge Function no longer advertises browser `Authorization` as an allowed CORS request header.
- The public browser header contract remains limited to `apikey`, `Content-Type`, `x-client-info`, and optional challenge-provider headers.
- The Edge Function README now documents that service-role authorization is server-side only.
- The waitlist abuse decision doc now includes the no-browser-Authorization CORS boundary.
- The Supabase static contract now checks the CORS header list and README marker.

## Why

PM_Web anonymous waitlist capture should not depend on a browser `Authorization` header or encourage an anon-token Bearer pattern. The public page can call the Edge Function with the public anon key as `apikey`; the Edge Function keeps service-role authorization inside the runtime when it calls private Supabase RPCs.

## Verification

Not run in this step. Run:

```powershell
npm run check:supabase-static-contract
```

## Boundary

This is local source and documentation hardening only. It does not prove the Edge Function is deployed, that CORS behavior is active in staging or production, or that direct RPC execution is denied in a live Supabase project.
