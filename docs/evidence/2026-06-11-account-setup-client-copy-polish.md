# Account setup client copy polish

Date: 2026-06-11

Scope: PM_App account setup and verification copy.

## Change

- Replaced the location error text `Location permission is disabled` with a more client-facing direction: `Location access is off`.
- Replaced the verification button accessibility label `Continue disabled until your selfie and ID are submitted` with action-focused copy: `Submit your selfie and ID before continuing`.
- Added a narrow client-copy guard for system-state wording such as `continue disabled until`, `permission is disabled`, and `button disabled until`.
- Added the location hook as an explicit scan target without broadening all hooks, to avoid noisy matches from non-UI implementation code.

## Why this matters

Account setup is a trust-building moment. The UI should explain what the user can do next, not expose internal control states or system wording.

## Verification status

Source updated only. The client-facing copy guard was not run in this pass.
