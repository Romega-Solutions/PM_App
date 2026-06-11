# Launch-State Notice Component

Date: 2026-06-11
Owner: Codex
Result: Source component added, checks not rerun

## What changed

- Added `src/components/ui/LaunchStateNotice.tsx` as a reusable launch-stage notice component.
- Updated `app/(main)/profile-settings/notifications.tsx` to use the reusable notice for notification preference delivery boundaries.
- Updated `src/features/account/screens/VerificationUploadScreen.tsx` to use the reusable notice for review-based verification boundaries.
- Updated `app/(main)/profile-settings/privacy.tsx` to use the reusable notice for backend-backed privacy and account deletion proof boundaries.
- Updated `src/features/account/screens/PreferencesScreen.tsx` to use the reusable notice for preference-based discovery and no-guaranteed-match boundaries.
- Updated `src/features/matching/screens/DiscoverScreen.tsx` to use the reusable notice for discovery visibility, report, and launch-cohort boundaries.
- Updated `src/features/matching/components/EmptyMatchesState.tsx` to use the reusable notice for mutual-match and chat-availability boundaries.
- Added a style prop to `LaunchStateNotice` so dense screens can adjust spacing without forking the launch-state copy pattern.
- Cleaned the `LaunchStateNotice` React Native import so `StyleProp` remains type-only.
- Added an optional `accessibilityHint` prop with a safe default so screen readers can explain that launch-state notes separate currently available features from proof-gated features.
- Updated PM_App source contracts so the reusable notice must keep `accessibilityHint` support.
- Added a default `testID` plus optional override so native QA and future automated checks can target reusable launch-state notices consistently.
- Added screen-specific launch-state notice IDs for notification settings, verification upload, privacy settings, account preferences, discovery, and empty matches.
- Added a non-interactive `accessibilityRole="text"` so screen readers treat the reusable notice as informational copy, not an action or alert.
- Hid the decorative shield icon from assistive tech with `accessibilityElementsHidden` and `importantForAccessibility="no-hide-descendants"` so the grouped notice copy is announced once.
- Set `collapsable={false}` on the notice root so native automation can reliably target the notice `testID`.
- Added a stable `noticeIcon` visual container and top-aligned notice layout so launch-state cards read more clearly on dense mobile screens.
- Updated PM_App product-design and launch-file contracts so the reusable notice remains guarded.

## Why it matters

PinayMate needs consistent launch-stage communication across PM_App. A reusable notice makes it easier to keep UI copy honest when a feature is source-backed but still not production-proven.

## Verification status

No validation commands were run after this source change.

Required reruns before launch approval:

- `npm run check:product-design-contract` from `PM_App`
- `npm run check:launch-file-contract` from `PM_App`
- PM_App native design QA for the notification settings, verification upload, privacy settings, preferences, discovery, and empty matches screens
