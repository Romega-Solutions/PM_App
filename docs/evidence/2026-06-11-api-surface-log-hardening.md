# PinayMate API Surface Log Hardening

Date: 2026-06-11
Scope: PM_App account APIs, profile APIs, matching APIs/screens, messaging APIs/hooks/screens, and account helper hooks.

## What changed

- Removed smart-matching success logs that exposed names and match scores.
- Removed profile, photo, location, and account success logs that exposed user activity.
- Replaced raw Supabase/API error-object logging with generic operational messages in account, profile, matching, and messaging surfaces.
- Kept thrown errors and returned error objects intact where callers depend on them for UI recovery.
- Kept user-facing recovery messages intact for chat send failures, media upload failures, discovery refresh failures, and likes/matches refresh failures.

## Files covered

- `src/features/account/api/basicInfoApi.ts`
- `src/features/account/api/locationApi.ts`
- `src/features/account/api/photosApi.ts`
- `src/features/account/api/preferencesApi.ts`
- `src/features/account/api/verificationApi.ts`
- `src/features/account/hooks/useAccountBasicInfo.ts`
- `src/features/account/hooks/useLocationSearch.ts`
- `src/features/account/hooks/useWelcomeData.ts`
- `src/features/profile/api/profileApi.ts`
- `src/features/profile/hooks/userProfile.ts`
- `src/features/matching/api/matchingApi.ts`
- `src/features/matching/screens/DiscoverScreen.tsx`
- `src/features/matching/screens/LikesScreen.tsx`
- `src/features/messaging/api/messages.api.ts`
- `src/features/messaging/api/messagesApi.ts`
- `src/features/messaging/hooks/useMessages.ts`
- `src/features/messaging/hooks/useMessageUpload.ts`
- `src/features/messaging/screens/ChatScreen.tsx`

## Not verified in this pass

- No lint, typecheck, tests, build, native QA, or live Supabase checks were run after this patch.
- Production readiness still depends on the existing external launch gates: live Supabase migrations/RLS/storage proof, deployed OCR proof, native app QA, DNS/mailbox proof, and app-store readiness.
