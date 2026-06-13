# Matching API Safe Recovery Errors

Date: 2026-06-11
Owner: Codex
Scope: PM_App matching API discovery, matches, and likes received errors.

## What changed

- Replaced raw discovery load errors with `Discovery could not load. Check your connection and try again.`
- Replaced raw matches load errors with `Matches could not load. Check your connection and try again.`
- Replaced raw likes load errors with `Likes could not load. Check your connection and try again.`
- Kept like/pass/undo action errors generic and recoverable.
- Updated the focused matching API test expectation for discovery load failure.

## Why

Matching screens should not surface database, policy, or backend object details to members. The app now returns user-safe recovery messages for discovery, matches, and likes loading failures.

## Verification

Not run in this step. Run:

```powershell
npx jest src/features/matching/api/__tests__/matchingApi.test.ts --runInBand --no-cache
npm run check:user-facing-safe-errors
```

## Boundary

This is local PM_App source-copy and API error-shaping work only. It does not prove live Supabase behavior, RLS policy behavior, or native-device rendering.
