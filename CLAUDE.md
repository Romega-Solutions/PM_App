# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Part of the **Romega Solutions** workspace. The workspace-level `CLAUDE.md` (one directory up, `RS_Workspace/CLAUDE.md`) governs cross-project conventions; this file governs **PinayMate (PM_App)** specifically and takes precedence for anything inside this directory.

## Project Overview

**PinayMate** is a React Native (Expo) dating application connecting Filipino women (`filipina`) with foreign men (`foreigner`). It is a single self-contained Expo app — there is no monorepo orchestrator inside this folder. The app targets **iOS, Android, and Web** (Expo web export deployed to Vercel).

| Aspect | Choice |
|--------|--------|
| Framework | React Native `0.81` + **Expo SDK 54** (New Architecture enabled) |
| Language | TypeScript (`strict`) + React 19 |
| Router | **expo-router v6** — file-based, typed routes enabled |
| Styling | RN `StyleSheet` + centralized theme tokens (primary); **NativeWind v4** configured but minimally used |
| Backend | **Supabase** (Postgres + Auth + Storage + Realtime) |
| State | **Zustand v5** (with `persist` + AsyncStorage) |
| Validation | **Zod v4** |
| Icons | `lucide-react-native` |
| Package manager | **npm** |
| Dev port | 8081 (Metro) / 8081 web |

## Build & Dev Commands

All commands run from this project directory.

```bash
npm install              # install dependencies
npm start                # Expo dev server (Metro) — choose platform interactively
npm run ios              # open iOS simulator
npm run android          # open Android emulator
npm run web              # Expo web (browser)
npm run build:web        # production web export → dist/ (runs scripts/patch-web-export.js)
npm run lint             # expo lint (ESLint, eslint-config-expo)
npm test                 # Jest (jest-expo preset)
npm run test:watch       # Jest watch mode
npm run test:coverage    # Jest with coverage
npx tsc --noEmit         # TypeScript typecheck (not wired to a script — run manually)
```

**Native builds (EAS):** configured in `eas.json` (`expo` owner: `canthought`, EAS projectId in `app.json`). Native `ios/` and `android/` folders are git-ignored (managed workflow / prebuild on demand).

**Web deployment:** Vercel. `vercel.json` runs `npm run build:web`, outputs `dist/`, `framework: null`, with a SPA rewrite (`/:path* → /`). `app.json` sets `web.output: "single"` (SPA).

## Architecture

### Routing — `app/` (expo-router, file-based)

Route files are **thin** — they import and re-export a screen from `src/features/*/screens/`. Keep routing concerns in `app/` and logic/UI in `src/`.

```
app/
  _layout.tsx              # Root: font loading, auth persistence, deep-link init, splash, Stack
  index.tsx                # Animated splash → redirect (see "Known Issues": auth bypass)
  (auth)/                  # Onboarding & auth (welcome, signup, signin, verify-*, account-setup/*)
  (main)/                  # Authed app — bottom Tabs: index(Discover), likes, messages, profile
                           #   + hidden routes: chat, voice-call, video-call, profile-settings/*
  (modals)/                # Modal stack (filters)
  global.css               # NativeWind entry (imported in _layout.tsx)
```

### Feature modules — `src/features/<feature>/`

Each feature is self-contained with a consistent internal layout:

```
src/features/<feature>/
  api/         # Supabase data access (functions returning typed results)
  hooks/       # React hooks wiring api + stores to screens
  screens/     # Screen components (rendered by app/ routes)
  components/   # Feature-scoped components
  services/    # Pure logic (e.g., scoring)
  types/       # Feature types
```

Features: `auth`, `account` (onboarding/setup), `matching` (discover/likes/swipe), `messaging` (conversations/chat/calls), `profile`.

### Shared layers — `src/`

```
src/
  components/   # Cross-feature UI, grouped by domain (ui/, forms/, auth/, account/, ...)
  config/       # supabase.ts (client), deepLinking.ts
  hooks/        # App-wide hooks (useAuthPersistence)
  services/     # App-wide services (ocrService — currently MOCK)
  shared/       # hooks/, utils/, types/ shared primitives
  stores/       # Zustand stores (auth, chat, matching, profile, signup)
  theme/        # colors, typography, + spacing (re-exported via theme/index.ts)
  utils/        # security.ts (Zod schemas, sanitization)
```

### State management (Zustand)

Stores live in `src/stores/`. `authStore` uses `persist` with `partialize` (only `session` + `isAuthenticated` are persisted to AsyncStorage — never raw credentials) and re-initializes from Supabase on rehydrate. Use the exported helpers `getCurrentUserId()` / `isUserAuthenticated()` for non-React reads.

### Supabase

- Client: `src/config/supabase.ts` — PKCE flow, `detectSessionInUrl: true`, AsyncStorage persistence, auto-refresh.
- Deep linking: `src/config/deepLinking.ts` handles email-verification callbacks (token exchange → session → profile upsert → navigate). Registered in root `_layout.tsx`.
- Schema & SQL: `supabase/migrations/` holds **manual, ad-hoc SQL scripts** (no CLI migration tooling). ⚠️ **The migration files do not match the live DB or each other** — see `docs/PINAYMATE_BACKEND_AUDIT_2026-05-30.md`. Treat `migrations/sql_existing_setup.md` (a real schema dump) as the source of truth. Live tables: `profiles`, `likes`, `passes`, `messages`, `typing_events` — **no `conversations` table** despite the app expecting one; `matches` are a flag on `likes` (`is_match`), not a table. Live `messages` uses `text`/`type`/`recipient_id` (not `content`/`message_type`/`receiver_id`).

### Matching algorithm

The scoring logic is `calculateMatchScore()` in `src/features/matching/api/matchingApi.ts` (0–100 score from intent, interests, language, distance, age, activity). See `docs/SMART_MATCHING_ALGORITHM.md`.

## Branding & Design System

Theme tokens are the **source of truth** (`src/theme/`). Prefer importing from `@/src/theme` over hardcoding hex values.

**Colors** (`src/theme/colors.ts`):

| Token | Role | Main hex |
|-------|------|----------|
| `amihan` | Primary (pink/red) → `semanticColors.primary` | `#EF3E78` |
| `dalisay` | Secondary (purple) → `semanticColors.secondary` | `#8D69F6` |
| `luna` | Accent (blue) → `semanticColors.accent` | `#5C83E9` |
| `neutral` | Grays / surfaces / text | — |
| `success` / `warning` / `error` | Status | `#22A574` / `#F59E0B` / `#D52C4D` |

Use `semanticColors` (`primary`, `secondary`, `accent`, `background`, `surface`, `text`, `textSecondary`, …) in components rather than raw scale steps.

**Typography** (`src/theme/typography.ts`, fonts loaded in `app/_layout.tsx`):

- **HelloParis** — logo / brand display (`fontFamilies.logo`)
- **Lora** (serif) — headers (`fontFamilies.header`)
- **DM Sans** — body / UI (`fontFamilies.body`)

Use `textStyles` (`h1`–`h3`, `body`, `caption`, `logo`) and `fontSizes` rather than ad-hoc numbers. `spacing` and `borderRadius` come from `src/shared/utils/spacing.ts`.

> NativeWind/Tailwind theme mirrors these tokens in `tailwind.config.js` (`amihan`/`dalisay`/`luna` + font families), but the codebase styles almost entirely with `StyleSheet` + theme tokens. Reach for `className` only if extending the small existing NativeWind usage.

## Coding Conventions

- **Path aliases:** `@/*` → repo root, `@/src/*`, `@/app/*` (see `tsconfig.json`). Import via aliases, not long relative paths.
- **Thin routes:** `app/**` files re-export `src/features/**/screens`; put logic in `src/`.
- **File-size discipline:** existing files document soft limits in their headers (stores ≈150 lines, utils ≈250). Keep modules focused (Single Responsibility).
- **Typed everything:** `strict` TS. Validate external/user input with Zod (`src/utils/security.ts`).
- **API style:** data-access functions live in `features/<f>/api/` as `<name>Api.ts` (camelCase, standardized); hooks consume them.
- **Icons:** `lucide-react-native` SVG icons — never emoji as UI icons.
- **Logging:** guard diagnostics behind `if (__DEV__)` and never log PII (emails, IDs, tokens, URLs, metadata). `src/config/deepLinking.ts` has a `log()` helper that models this.

## Environment Variables

Client env vars **must** be prefixed `EXPO_PUBLIC_` to be available in the app. Stored in `.env` (git-ignored via `.gitignore` and `.vercelignore`).

```bash
EXPO_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
# Optional, testers only: skip the auth gate and land in /(main). Leave UNSET in production.
EXPO_PUBLIC_BYPASS_AUTH=true
```

**Never commit `.env`.** On Vercel, set these in project env settings. ⚠️ Anything `EXPO_PUBLIC_*` ships to the client bundle — keep only the anon (public) key here, never service-role secrets.

## Integration Points

- **Supabase** — Auth (email + PKCE deep links), Postgres, Storage (profile/chat images), Realtime (chat).
- **Vercel** — web hosting of the Expo web export (`dist/`).
- **EAS (Expo Application Services)** — native builds / OTA updates (`expo-updates`).
- **OCR** — `src/services/ocrService.ts` is a **mock**; ID/selfie verification is not wired to a real OCR provider yet.

## Testing

- Runner: **Jest** with `jest-expo` preset (`jest.config.js`, `jest.setup.js`); RTL via `@testing-library/react-native`.
- Coverage is currently minimal — the only suite is `src/features/matching/api/__tests__/matchingApi.test.ts` (15 tests, passing). New features should add tests alongside their `api/`/`hooks/`.

## Known Issues & Tech Debt

See `docs/PINAYMATE_AUDIT_2026-05-29.md` for the full audit and remediation log. As of the 2026-05-30 pass the gates are green: `tsc` 0 errors · `expo lint` 0 errors (31 warnings) · `jest` 36/36 · `build:web` exports `dist/`. Remaining items to be aware of:

0. **Backend schema drift (highest priority for end-to-end).** Migration files ≠ live DB ≠ app code. Chat/conversations and parts of profiles target columns/tables that don't exist in the live DB. See `docs/PINAYMATE_BACKEND_AUDIT_2026-05-30.md` for the full breakdown + phased roadmap (start with `supabase db pull` + `supabase gen types`).
1. **Auth gate** — defaults to `/(auth)/welcome`; testers opt into the app shell with `EXPO_PUBLIC_BYPASS_AUTH=true`. Keep that env var **unset in production**.
2. **Mock OCR** — `src/services/ocrService.ts` is still a mock (`IS_MOCK_OCR === true`); wire a real provider before shipping ID verification, and gate verification UI on that flag.
3. **Test coverage** — only `matchingApi` + `security` are covered; auth/messaging/profile/screens still need tests.
4. **Lint warnings** — 31 non-blocking (unused locals + intentional once-on-mount `react-hooks/exhaustive-deps`); fix case-by-case.
5. **Docs sprawl** — 8 setup `.md` files at root + many in `docs/`; consolidation into one `docs/SETUP.md` still pending.

## Documentation Map

Root setup guides: `README.md`, `SUPABASE_SETUP_INSTRUCTIONS.md`, `EMAIL_VERIFICATION_SETUP.md`, `ENABLE_EMAIL_SIGNUP.md`, `FINAL_EMAIL_FLOW_SETUP.md`, `REDIRECT_URLS_QUICK.md`, `SETUP_CHECKLIST.md`.

Deep docs in `docs/`: architecture (`APP_VS_SRC_ARCHITECTURE.md`), business logic (`businessRules.md`, `SMART_MATCHING_ALGORITHM.md`), chat (`SUPABASE_CHAT_INTEGRATION.md`, `chatUIFlow.md`), refactors (`*_REFACTORING*.md`), testing (`TESTING_GUIDE.md`, `CHAT_TESTING_GUIDE.md`), the codebase audit (`PINAYMATE_AUDIT_2026-05-29.md`), and the backend/Supabase audit (`PINAYMATE_BACKEND_AUDIT_2026-05-30.md`).
