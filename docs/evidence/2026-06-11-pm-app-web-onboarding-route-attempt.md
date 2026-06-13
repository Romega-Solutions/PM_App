# PM_App Web Export Onboarding Route Attempt

Date: 2026-06-11
Owner: Codex local QA
Scope: local PM_App web export only. This does not prove native-device onboarding, authenticated Supabase behavior, storage upload, OCR, camera/photo permissions, or production release readiness.

## Commands

```powershell
npm run check:product-design-contract
npm run build:web
npx serve dist -s -l 8085
npx playwright screenshot --browser=chromium --viewport-size=390,844 --wait-for-timeout=5000 --full-page http://127.0.0.1:8085/account-setup/basic-info pm-app-web-onboarding-basic-info-2026-06-11.png
npx playwright screenshot --browser=chromium --viewport-size=390,844 --wait-for-timeout=5000 --full-page http://127.0.0.1:8085/account-setup/profile-photos pm-app-web-onboarding-profile-photos-2026-06-11.png
npx playwright screenshot --browser=chromium --viewport-size=390,844 --wait-for-timeout=5000 --full-page http://127.0.0.1:8085/account-setup/location pm-app-web-onboarding-location-2026-06-11.png
npx playwright screenshot --browser=chromium --viewport-size=390,844 --wait-for-timeout=5000 --full-page http://127.0.0.1:8085/account-setup/preferences pm-app-web-onboarding-preferences-2026-06-11.png
npx playwright screenshot --browser=chromium --viewport-size=390,844 --wait-for-timeout=5000 --full-page http://127.0.0.1:8085/account-setup/verification-upload pm-app-web-onboarding-verification-upload-2026-06-11.png
```

## Result

- `npm run check:product-design-contract` passed.
- `npm run build:web` passed.
- `/account-setup/basic-info` rendered a setup-path screen, but this did not prove the full onboarding sequence.
- `/account-setup/profile-photos`, `/account-setup/location`, `/account-setup/preferences`, and `/account-setup/verification-upload` redirected to the sign-in screen in the unauthenticated web export.

## Evidence files

- `pm-app-web-onboarding-basic-info-2026-06-11.png`
- `pm-app-web-onboarding-profile-photos-2026-06-11.png`
- `pm-app-web-onboarding-location-2026-06-11.png`
- `pm-app-web-onboarding-preferences-2026-06-11.png`
- `pm-app-web-onboarding-verification-upload-2026-06-11.png`

## Release interpretation

This evidence supports the source-level design contract but does not clear the launch packet onboarding row. The launch packet still needs authenticated native-device or emulator QA showing basic info, profile photos, location, preferences, and verification upload with clear primary actions and recovery paths.
