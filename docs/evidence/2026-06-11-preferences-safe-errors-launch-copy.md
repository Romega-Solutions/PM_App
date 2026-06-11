# Preferences Safe Errors and Launch Copy

## Status

Source update completed. No lint, typecheck, tests, native QA, backend checks, or release gates were run in this turn by instruction.

## Changed

- `app/(modals)/filters.tsx`
  - Replaced raw preference-save exception display with safe recovery copy.
  - Kept the basic-info prerequisite as a clear user action.
  - Added guidance that filters guide discovery but do not guarantee matches.
- `app/(main)/profile-settings/preferences.tsx`
  - Replaced raw preference-save exception display with safe recovery copy.
  - Kept the basic-info prerequisite as a clear user action.
  - Added guidance that preferences are signals, not promises.

## Why it matters

Discovery filters and preference settings affect who users see and whether the app feels trustworthy. The screens now avoid backend error leakage and set honest expectations around matching: preferences improve discovery quality, but they do not guarantee outcomes.

## Evidence still needed

- Run PM_App lint and TypeScript checks.
- Native-test preference load, save, validation failure, failed-network save, and Discover refresh behavior.
- Confirm saved preferences are persisted through the backend and reflected in discovery results.
