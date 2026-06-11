# PM_App Launch-Safe UX Hardening

Date: 2026-06-11
Status: Source evidence only - native QA and validation commands were not run for this note

## Scope

This pass tightened PM_App user-facing language so launch-stage features do not look like fully live production capability before backend, support, provider, and release evidence exists.

## Source Evidence

- `src/features/auth/screens/SignUpScreen.tsx` now frames signup as early-access account creation and states that public matching, phone verification, social login, calls, and checkout remain launch-gated.
- `src/features/auth/screens/VerifyEmailScreen.tsx` now states that email verification confirms sign-in for launch preparation only. It does not publish a profile, enable matching, approve identity verification, or open paid features.
- `app/(auth)/verify-phone.tsx` now states that phone verification is off for launch, no SMS is sent, no phone badge is created, and launch access is not changed.
- `src/features/matching/screens/DiscoverScreen.tsx` now explains that empty results can be normal during launch-stage cohort setup, privacy settings, or profile review.
- `src/features/matching/components/EmptyMatchesState.tsx` now explains that mutual matches appear after both people choose each other and launch-stage availability allows chat.
- `src/features/account/screens/PreferencesScreen.tsx` now explains that preferences guide discovery, do not guarantee matches, and do not override privacy settings, profile review, safety controls, or launch cohort availability.
- `src/features/account/screens/VerificationUploadScreen.tsx` now explains that skipping verification does not block setup, while the verified badge and review-based trust cues stay unavailable until approval.
- `src/features/account/screens/WelcomeCompleteScreen.tsx` now states that the completed profile does not guarantee visibility, a match, a verified badge, or paid feature access.
- `src/features/messaging/screens/VoiceCallScreen.tsx` and `src/features/messaging/screens/VideoCallScreen.tsx` now state that calls are off for launch, no call was started, no mic/camera permission was requested, and calling appears only after launch approval.
- `app/(modals)/report-user.tsx` now states that reporting is private moderation input, not emergency service or instant moderation.
- `app/(main)/profile-settings/privacy.tsx` now states that privacy controls do not override launch readiness, safety review, legal review, or deletion decisions.
- `app/(main)/profile-settings/help.tsx` now frames support as email-first during launch and warns users not to send passwords, payment details, ID documents, or private message screenshots by email.
- `app/(main)/profile-settings/about.tsx` now frames the app as launch-stage and avoids treating verification as a safety guarantee.
- `src/features/profile/screens/ProfileScreen.tsx` now shows a launch-stage profile notice for public discovery, matching, calling, paid features, review status, and launch readiness.
- `scripts/check-product-design-contract.mjs` and `scripts/check-launch-file-contract.mjs` now guard the new launch-safe UX copy.

## Product Risk Reduced

- Reduced false expectation that signup immediately creates a public dating profile.
- Reduced false expectation that email or phone verification proves identity or unlocks matching.
- Reduced false expectation that voice/video calling is live.
- Reduced false expectation that report submission guarantees instant moderation.
- Reduced false expectation that privacy/deletion controls bypass legal, safety, or support review.

## Not Proven By This Evidence

- Native device or emulator behavior.
- Visual quality on iOS or Android.
- Accessibility behavior with screen readers or text scaling.
- Backend-applied state in staging or production.
- Support mailbox delivery, escalation coverage, or moderation SLA.
- Store/account ownership or final public launch approval.
