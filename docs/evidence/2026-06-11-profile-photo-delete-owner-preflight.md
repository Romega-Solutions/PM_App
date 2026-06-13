# Profile Photo Owner Preflight

Date: 2026-06-11
Owner: Codex
Scope: PM_App profile photo storage deletion and profile photo-array update preflight.

## What changed

- `deleteProfilePhoto()` now checks the signed-in user before removing a profile photo object from Supabase Storage.
- The client rejects deletion when the normalized profile-photo storage path does not start with the current user's folder.
- `updateProfilePhotos()` now normalizes, caps, de-duplicates, and owner-checks profile photo URLs before updating the profile row.
- `saveProfilePhoto()` now carries forward only current-user profile-photo URLs when rebuilding the profile photo array.
- `removeProfilePhoto()` now ignores cross-user stored profile-photo URLs when calculating the remaining photo array.
- The focused profile API test suite now includes cross-user delete rejection and cross-user photo-array rejection cases.
- The focused account photos API test suite now includes cross-user stored URL filtering during save/remove flows.
- `scripts/check-supabase-static-contract.mjs` now includes a dedicated `Profile photo owner preflight` source contract.

## Why

Storage policy should remain the final authority, but the mobile client should not even attempt a delete or profile update for another member's profile-photo path. This keeps local behavior aligned with the user-protection model and reduces accidental cross-user storage operations.

## Verification

Not run in this step. Run:

```powershell
npx jest src/features/profile/api/__tests__/profileApi.test.ts --runInBand --no-cache
npx jest src/features/account/api/__tests__/photosApi.test.ts --runInBand --no-cache
npm run check:supabase-static-contract
```

## Boundary

This is local source/test coverage only. It does not prove live Supabase Storage policies, production bucket rules, or native-device photo upload/delete/reorder behavior.
