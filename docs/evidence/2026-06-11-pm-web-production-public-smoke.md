# PM_Web Production Public Smoke

Date: 2026-06-11
Owner: Codex local QA
Scope: public URL smoke only. This does not prove Vercel project ownership, rollback ability, mailbox delivery, app-store availability, checkout readiness, or live PM_App behavior.

## Commands

```powershell
Invoke-WebRequest -Uri "https://pinaymate.com" -UseBasicParsing -MaximumRedirection 5 -TimeoutSec 20
npx playwright screenshot --browser=chromium --viewport-size=1440,1200 --wait-for-timeout=5000 --full-page https://pinaymate.com pm-web-production-desktop-2026-06-11.png
npx playwright screenshot --browser=chromium --viewport-size=390,844 --wait-for-timeout=5000 --full-page https://pinaymate.com pm-web-production-mobile-390x844-2026-06-11.png
```

## Result

- `https://pinaymate.com` returned HTTP 200.
- Final request URL resolved to `https://www.pinaymate.com/`.
- Page title: `PinayMate | Filipino Dating Built Around Trust`.
- Server header: `Vercel`.
- Desktop screenshot captured: `PM_Web/pm-web-production-desktop-2026-06-11.png`.
- Mobile screenshot captured: `PM_Web/pm-web-production-mobile-390x844-2026-06-11.png`.

## Release interpretation

The public PM_Web production URL, desktop smoke, and mobile smoke are now proven at a basic rendering level. Production management access is still not proven because `PM_Web` is not linked to the correct Vercel project in this session and `pinaymate.com` is not visible under the current Vercel scope.

Support and legal mailbox delivery remain unproven.
