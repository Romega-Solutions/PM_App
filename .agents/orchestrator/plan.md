# Project: PinayMate Production Release & Web Feature Parity

## Architecture
- Expo React Native codebase targeting iOS, Android, and Web.
- Backend: Supabase (PostgreSQL, Storage, Edge Functions).
- State: Zustand.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Exploration & Audit | Audit web vs mobile feature parity; audit local release gates (`check:release-local` failures). | None | IN_PROGRESS |
| 2 | Web Parity & Polyfills | Resolve web-specific issues: sliders (distance, age), storage, gestures, image picker; make `npm run build:web` pass without warnings. | M1 | PLANNED |
| 3 | Supabase & OCR Live Evidence | Deploy migrations to staging; deploy OCR edge function; verify RLS, storage policies, RPCs, and edge throttling; run smoke tests/audits. | M1 | PLANNED |
| 4 | Native QA & Evidence | Conduct emulator E2E tests (auth, signup, swipe, messaging); capture screenshots/logs for `LAUNCH_EVIDENCE_PACKET.md`. | M3 | PLANNED |
| 5 | EAS Build & Final Release Prep | Build Android/iOS with EAS; resolve config/dependencies; assign owners in runbooks; clear `check:release-local` gates. | M2, M4 | PLANNED |

## Interface Contracts
- Web Polyfills: wrapper around AsyncStorage/SecureStore, customized Web Slider, web-safe image picker/location fallback.
- Database RPCs and Security: matching, messages, reporting, deletion, and privacy settings go through PostgreSQL RPCs.
