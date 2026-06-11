# PM_App Web Export Browser Smoke

Date: 2026-06-10
Environment: local PM_App web export served at `http://127.0.0.1:8084/`
Scope: local Expo web export render smoke only. This does not prove native iOS/Android runtime behavior, signed builds, deep links, push notifications, device permissions, Supabase production state, or app-store readiness.

## Setup

- Build command: `npm run build:web`
- Static server: `python -m http.server 8084 --bind 127.0.0.1 --directory dist`
- HTTP readiness: `GET http://127.0.0.1:8084/` returned `200`.
- Browser title observed: `Pinaymate`.
- Unauthenticated app route redirected to `/welcome` for the smoke target.

## Browser evidence

| Viewport            | Evidence file                                           | Result       | Notes                                                  |
| ------------------- | ------------------------------------------------------- | ------------ | ------------------------------------------------------ |
| Desktop `1440x1000` | `docs/evidence/2026-06-10-pm-app-web-desktop-smoke.png` | Pass (local) | Full-page screenshot captured through browser tooling. |
| Mobile `390x844`    | `docs/evidence/2026-06-10-pm-app-web-mobile-smoke.png`  | Pass (local) | Full-page screenshot captured through browser tooling. |

Visual inspection: both screenshots show the rendered unauthenticated welcome screen instead of a blank page or browser error. The mobile hero headline now fits the viewport, and the mobile primary CTA renders as `Join Early Access` without left clipping or ellipsis.

## Not proven

- Native Android/iOS launch.
- Camera, photo picker, location, secure storage, haptics, or deep-link behavior on real devices.
- Supabase live migration state, RLS policies, storage policies, or RPC runtime behavior.
- OCR function deployment or live endpoint behavior.
