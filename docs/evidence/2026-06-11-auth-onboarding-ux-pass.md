# Auth Onboarding UX Pass

Date: 2026-06-11
Owner: Codex sub-agent
Result: Source patch only - not rerun

## Changed files

- `app/(auth)/welcome.tsx`
- `app/(auth)/user-type-selection.tsx`
- `app/(auth)/forgot-password.tsx`
- `app/(auth)/reset-password.tsx`
- `app/(auth)/verify-phone.tsx`

## What changed

- Clarified first-run copy on welcome and profile-path selection.
- Improved mobile safe-area handling around the welcome CTA stack.
- Added stronger onboarding hierarchy with step labeling, intent framing, and trust/support copy.
- Improved password recovery and new-password flows with inline validation and recovery messages.
- Used existing loading-state button support instead of manually changing submit labels.
- Improved forgot-password back-button touch target.
- Removed negative/wide letter spacing from edited auth screens for better mobile readability.

## Verification status

Not run by instruction in this session. Required follow-up:

- Run PM_App typecheck/lint/tests.
- Run native auth/onboarding QA.
- Confirm small-phone and Dynamic Type rendering.
