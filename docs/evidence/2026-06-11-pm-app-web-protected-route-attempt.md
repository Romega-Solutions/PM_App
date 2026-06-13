# PM_App Web Export Protected Route Attempt

Date: 2026-06-11
Owner: Codex local QA
Scope: local PM_App web export only. This does not prove native-device behavior, authenticated Supabase behavior, production auth, storage upload, messaging delivery, report/block actions, or release readiness.

## Commands

```powershell
npx serve dist -s -l 8086
npx playwright screenshot --browser=chromium --viewport-size=390,844 --wait-for-timeout=5000 --full-page http://127.0.0.1:8086/likes pm-app-web-protected-likes-2026-06-11.png
npx playwright screenshot --browser=chromium --viewport-size=390,844 --wait-for-timeout=5000 --full-page http://127.0.0.1:8086/messages pm-app-web-protected-messages-2026-06-11.png
npx playwright screenshot --browser=chromium --viewport-size=390,844 --wait-for-timeout=5000 --full-page http://127.0.0.1:8086/chat pm-app-web-protected-chat-2026-06-11.png
npx playwright screenshot --browser=chromium --viewport-size=390,844 --wait-for-timeout=5000 --full-page http://127.0.0.1:8086/profile-settings/privacy pm-app-web-protected-privacy-settings-2026-06-11.png
npx playwright screenshot --browser=chromium --viewport-size=390,844 --wait-for-timeout=5000 --full-page http://127.0.0.1:8086/profile-settings/notifications pm-app-web-protected-notifications-2026-06-11.png
npx playwright screenshot --browser=chromium --viewport-size=390,844 --wait-for-timeout=5000 --full-page http://127.0.0.1:8086/profile-settings/preferences pm-app-web-protected-preferences-2026-06-11.png
```

## Result

The protected discovery, messaging, chat, privacy, notification, and preference routes redirected to the signed-out welcome surface in the unauthenticated web export. This is acceptable as an auth boundary signal, but it does not prove the authenticated in-app UX for discovery, matching, messaging, report/block/unmatch, privacy, notification, or preference settings.

## Evidence files

- `pm-app-web-protected-likes-2026-06-11.png`
- `pm-app-web-protected-messages-2026-06-11.png`
- `pm-app-web-protected-chat-2026-06-11.png`
- `pm-app-web-protected-privacy-settings-2026-06-11.png`
- `pm-app-web-protected-notifications-2026-06-11.png`
- `pm-app-web-protected-preferences-2026-06-11.png`

## Release interpretation

This evidence supports that protected routes are not exposed to an unauthenticated web session. It does not clear the launch packet rows for discovery, messaging and safety, settings and privacy, or native app QA. Those rows still require authenticated device or emulator evidence.
