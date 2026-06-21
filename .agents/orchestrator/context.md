# Context

## Environment
- **Workspace Directory**: `c:\Users\ultim\_ Local Codes\PM_App`
- **Orchestrator Directory**: `c:\Users\ultim\_ Local Codes\PM_App\.agents\orchestrator`
- **OS**: Windows (PowerShell)
- **Integrity Mode**: demo

## Project Summary
PinayMate is a React Native / Expo application designed for mobile (iOS/Android) and web.
The goal is to build out missing web features to achieve 100% parity with the mobile app.

## Web Target Details
- Build Command: `npm run build:web`
- Local web dev server starts via: `npx expo start --web` (or `npm run web`)
- Key flows to verify on web:
  - Authentication flow
  - Swiping flow
  - Messaging flow
- Native modules needing polyfills or replacements:
  - Sliders (e.g., Distance, Age Range)
  - Image picker
  - Location search
  - Secure storage (implemented via `expo-secure-store` / `AsyncStorage` wrapper in `authStorage.ts`)

## References & Documentation
- `docs/release/RELEASE_READINESS.md`
- `docs/release/PINAYMATE_LAUNCH_STATE_MATRIX.md`
- `docs/refactoring/SYSTEM_AUDIT_REPORT.md`
- `ORIGINAL_REQUEST.md` (at project root and in agent folder)
