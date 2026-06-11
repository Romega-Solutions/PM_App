# PM_App lint warning cleanup

Date: 2026-06-11
Owner: Codex

## What changed

- Removed unused caught error variables from app API and hook files where the error object was intentionally not logged.
- Replaced one `Array<T>` type with `T[]` syntax in the messages screen filter options.

## Why it matters

- The previous lint run exited successfully but reported 13 warnings.
- These patches reduce release noise without changing app behavior or adding raw error logging.

## Verification status

- Source files were patched locally.
- `npm run lint` was not rerun after this cleanup in this pass.
- The previous verified state before this cleanup was lint exit code 0 with 13 warnings.
