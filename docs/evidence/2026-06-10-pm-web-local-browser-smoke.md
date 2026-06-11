# PM_Web Local Browser Smoke

Date: 2026-06-10
Environment: local PM_Web preview at `http://127.0.0.1:4173/`
Scope: local browser smoke only. This does not prove production domain, DNS, mailbox routing, or deployed production readiness.

## Setup

- Preview server: `npm run preview -- --host 127.0.0.1 --port 4173 --strictPort`
- HTTP readiness: `GET http://127.0.0.1:4173/` returned `200`.
- Browser title observed: `PinayMate | Filipino Dating Built Around Trust`.

## Browser evidence

| Viewport            | Evidence file                                       | Result       | Notes                                                  |
| ------------------- | --------------------------------------------------- | ------------ | ------------------------------------------------------ |
| Desktop `1440x1000` | `docs/evidence/2026-06-10-pm-web-desktop-smoke.png` | Pass (local) | Full-page screenshot captured through browser tooling. |
| Mobile `390x844`    | `docs/evidence/2026-06-10-pm-web-mobile-smoke.png`  | Pass (local) | Full-page screenshot captured through browser tooling. |

Visual inspection: both screenshots show the rendered PinayMate landing page content rather than a blank page, crash screen, or browser error.

## Not proven

- Final production URL and DNS.
- Production support/legal mailbox routing.
- Real app-store, checkout, or live matching availability.
- Production analytics, monitoring, or incident response.
