# Notification Settings Launch Honesty

## Status

Source update completed. No lint, typecheck, tests, native QA, notification-provider checks, email checks, or release gates were run in this turn by instruction.

## Changed

`app/(main)/profile-settings/notifications.tsx`

- Added launch-stage notice that notification switches do not prove production push or email delivery.
- Reworded push, match, message, like, and email descriptions as preferences for QA/launch planning.
- Converted rows into accessible switch controls with state and hints.
- Prevented nested switch accessibility duplication by making visual switches non-accessible inside row-level controls.
- Added disabled visual state and accessibility hints when push-dependent preferences are unavailable.
- Improved the back button touch target and accessibility label.

## Why it matters

Notification settings are retention-facing, but production delivery depends on provider setup, mailbox routing, and release sign-off. The screen now avoids pretending delivery is live while still letting QA/product capture intended preferences.

## Evidence still needed

- Run PM_App lint and TypeScript checks.
- Native-test switch behavior and screen-reader labels.
- Confirm notification provider, push permission flow, and email routing before treating this as production delivery.
