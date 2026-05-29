# 🔍 PinayMate — Top-to-Bottom Codebase Audit

**Date:** 2026-05-29
**Auditor:** Claude Code (skills: `frontend-design`, `ui-ux-pro-max`)
**Project:** PinayMate (PM_App) — Expo / React Native dating app
**Branch:** `main` · **Status:** Pre-production / development

---

## 📊 Executive Summary

PinayMate has a **well-organized, feature-based architecture** and a **cohesive design system** — the bones are good. The main problems are **scaffolding debt** (a large number of empty placeholder files), **a few dead/duplicate modules**, **inconsistent file-naming conventions**, a **shipped auth bypass**, and **hygiene gaps** (PII in logs, lint not green, near-zero test coverage). None are architectural dead-ends; they are cleanup and discipline items.

### Health Scorecard

| Area | Score | Notes |
|------|:-----:|-------|
| Architecture & structure | 🟢 8.5/10 | Clean `app/` ↔ `src/features/*` split; thin routes; clear layers |
| Design system | 🟢 8.5/10 | Tokenized colors/type/spacing; consistent brand |
| Type safety | 🟢 9/10 | `strict` TS, **0 type errors** (after this audit's fix) |
| Code hygiene | 🟡 5/10 | 27 empty stubs, dead dupes, 11 lint errors, mixed naming |
| Security & privacy | 🟡 5.5/10 | Good auth-store practices; but PII logging + mock OCR |
| Testing | 🔴 2/10 | 15 tests in **1** file; everything else untested |
| Production readiness | 🟡 5/10 | Auth gate bypassed; logs noisy; mock services |

### Tooling Baseline

| Check | Command | At audit (2026-05-29) | After remediation (2026-05-30) |
|-------|---------|-----------------------|-------------------------------|
| Typecheck | `npx tsc --noEmit` | 1 error | **0 errors** ✅ |
| Lint | `npm run lint` | 11 errors, 56 warnings | **0 errors, 31 warnings** ✅ |
| Tests | `npm test` | 15 passed / 1 suite | **36 passed / 2 suites** ✅ |
| Web build | `npm run build:web` | (not run) | **dist/ exported** ✅ |
| Install | `npm install` | clean (exit 0) | clean (exit 0) |

> The 31 remaining lint items are **warnings only** (23 unused locals, 8 intentional once-on-mount `react-hooks/exhaustive-deps`). They do not fail the lint gate and were left deliberately — the deps ones can cause render loops if "fixed" blindly.

---

## ✅ Strengths

- **Feature-first structure.** `src/features/{auth,account,matching,messaging,profile}/{api,hooks,screens,components,types}` is consistent and scalable.
- **Thin routing.** `app/**` files re-export `src/features/**/screens` — routing stays separate from logic.
- **Design tokens.** `src/theme/` centralizes colors, typography, spacing; `semanticColors` gives intent-based naming.
- **Auth store discipline.** `authStore` persists only `session` + `isAuthenticated` (via `partialize`), never raw credentials; rehydrates from Supabase.
- **Real matching logic with tests.** `calculateMatchScore()` is a genuine weighted scorer (intent, interests, language, distance, age, recency) and is the only well-tested unit (15 cases).
- **Typed routes + New Architecture + React Compiler** all enabled in `app.json`.

---

## 🔴 Critical Findings

### C1 — Auth gate is bypassed in the app entry point
`app/index.tsx` ends with:
```tsx
// TEMP TEST BYPASS: route testers straight into the app shell.
return <Redirect href="/(main)" />;
```
The intended entry is `/(auth)/welcome`. This (and commit *"Temporarily bypass auth gates for testing"*) means **anyone opening the app lands in the authed shell** without logging in. The `(main)` screens then run against a possibly-null user.
**Action:** Restore `<Redirect href="/(auth)/welcome" />` before any production/staging release. Gate it behind `__DEV__` or an env flag if testers still need it.

---

## 🟠 High Findings

### H1 — ~27 empty (0-byte) stub files
Scaffolded but never implemented, and **unreferenced**. They mislead readers about what exists. Full list:

```
src/config/constants.ts
src/shared/types/common.ts
src/shared/utils/validators.ts
src/shared/utils/formatters.ts
src/shared/utils/imageHelpers.ts
src/shared/hooks/useAsync.ts
src/shared/hooks/useImagePicker.ts
src/shared/hooks/useDebounce.ts
src/components/ui/Card.tsx
src/components/ui/Avatar.tsx
src/components/ui/LoadingSpinner.tsx
src/components/preferences/UserPreferences.tsx     (real one is components/account/UserPreferences.tsx)
src/features/messaging/types/index.ts
src/features/messaging/hooks/useSendMessage.ts
src/features/messaging/api/messagingApi.ts
src/features/matching/screens/SwipeScreen.tsx
src/features/matching/hooks/useLikes.ts
src/features/matching/hooks/useSwipe.ts
src/features/matching/hooks/useMatches.ts
src/features/matching/services/matchingAlgorithm.ts  (real logic is in api/matchingApi.ts)
src/features/auth/types/index.ts
src/features/auth/screens/ForgotPasswordScreen.tsx
src/features/auth/screens/WelcomeCompleteScreen.tsx  (real one is features/account/screens/WelcomeCompleteScreen.tsx)
src/features/auth/hooks/useForgotPassword.ts
src/features/profile/types/index.ts
src/features/profile/screens/ProfilePhotoScreen.tsx
src/features/profile/screens/EditProifleScreen.tsx   (typo + dead, see H2)
```
**Action:** Delete the ones with no near-term plan; implement the few that are actually needed (e.g. `shared/utils/validators.ts`, `config/constants.ts`). Don't leave empty modules — they read as "done."

### H2 — Dead & duplicate modules
- `src/features/profile/screens/EditProifleScreen.tsx` — **typo'd name, 0 bytes, 0 imports.** Pure dead file. (Working screen is `EditProfileScreen.tsx`.)
- `src/features/messaging/api/messagingApi.ts` — empty, dead.
- `src/features/messaging/api/messagesApi.ts` — **129 lines, 0 importers.** Superseded by `conversations.api.ts` + `messages.api.ts`. Confirm nothing in the chat refactor still expects it, then remove.
- Duplicate names across folders where one copy is an empty stub: `WelcomeCompleteScreen` (account = real, auth = empty), `UserPreferences` (account = real, preferences = empty). Confusing for imports and search.

### H3 — Two competing API file-naming conventions
Active modules use **dot** style (`conversations.api.ts`, `messages.api.ts`, `realtime.api.ts`); legacy/dead ones use **camel** style (`messagesApi.ts`, `messagingApi.ts`). Elsewhere feature APIs are camel (`authApi.ts`, `profileApi.ts`, `matchingApi.ts`, `accountApi.ts`).
**Action:** Pick **one** convention workspace-wide and rename. Recommend `<name>Api.ts` (matches the majority of features) **or** `<name>.api.ts` everywhere — but not both.

### H4 — Near-zero automated test coverage
Only `matchingApi.test.ts` exists. Auth flows, messaging, profile, account setup, deep-linking, and stores are untested. For a dating app handling auth + PII + payments-adjacent flows, this is a real risk.
**Action:** Add unit tests for `authStore`, `security.ts` (Zod schemas), `deepLinking` URL parsing, and the messaging API; add a couple of screen smoke tests with RTL.

---

## 🟡 Medium Findings

### M1 — PII written to console logs
`src/config/deepLinking.ts`, `src/config/supabase.ts`, and `src/stores/authStore.ts` log emails, user IDs, tokens-present flags, and `user_metadata`. These persist in device logs and web consoles.
**Action:** Remove or wrap in `if (__DEV__)`, and never log tokens/emails/metadata.

### M2 — Misnamed hook file
`src/features/profile/hooks/userProfile.ts` exports `useProfile` but the filename reads like a noun. Import site: `EditProfileScreen.tsx`.
**Action:** Rename file → `useProfile.ts` and update the one import.

### M3 — Mock services presented as real
`src/services/ocrService.ts` returns hard-coded mock OCR text (ID/selfie verification is not real). The README's "Current Status" lists features as ✅ complete that are partially mocked (chat history in prior audits, OCR here).
**Action:** Track mocks explicitly; gate verification UI so it doesn't imply a real check.

### M4 — Lint is not green (11 errors, 56 warnings)
- 11 errors: all `react/no-unescaped-entities` (literal `'`/`"` in JSX copy) across auth/onboarding screens. Trivial — escape (`&apos;`) or wrap in `{"'"}`.
- 56 warnings: mostly unused vars (`ACCENT_PINK`, `width`/`height`, `userId`, `data`, `profile`, `ImageManipulator`) + one `react-hooks/exhaustive-deps` in `useAuthPersistence.ts`.
**Action:** Run `npm run lint -- --fix`, then hand-fix the entity errors; make lint a CI gate.

### M5 — Empty `src/config/constants.ts`
Referenced conceptually (magic numbers like max-6-photos, age bounds, swipe limits live inline). Centralize them here.

---

## 🟢 Low Findings

- **L1 — Stale Tailwind content globs.** `tailwind.config.js` `content` lists `./App.tsx` and `./components/**` (neither exists) and omits `./src/**`. Low impact today (only 1 `app/` file uses `className`; `src/` uses none), but should be corrected to `./app/**` + `./src/**` and the dead paths removed.
- **L2 — Doc sprawl.** 8 setup `.md` files at the repo root + 24 in `docs/`, several overlapping (`EMAIL_VERIFICATION_SETUP`, `ENABLE_EMAIL_SIGNUP`, `FINAL_EMAIL_FLOW_SETUP`, `REDIRECT_URLS_QUICK`). Consolidate into `docs/` with one canonical setup guide.
- **L3 — Ad-hoc SQL.** `supabase/migrations/` mixes numbered migrations with `fix_*.sql` / `manual_verify_user.sql` / `cleanup_test_users.sql`. Fine for dev, but move one-off scripts out of the migration path.
- **L4 — `.env` hygiene (local only).** The local `.env` has Markdown text appended after the keys (not committed — `.gitignore` covers it). Harmless but worth cleaning so tooling doesn't choke.

---

## 🎨 Design / UX Review (`ui-ux-pro-max` + `frontend-design` lenses)

The visual direction is strong and intentional — a **dark, romantic, premium** aesthetic (deep `dalisay` purple base `#0F0814`, pink `amihan` accent `#EF3E78`), distinctive type pairing (HelloParis display + Lora serif headers + DM Sans body). This is **not** generic "AI slop" — good.

**What's working**
- Cohesive token system; serif/sans pairing with character; gradient + glow treatment on splash and tab bar; SVG icons (lucide), not emoji.
- Bottom-tab focus state (pill container + tint + stroke-weight change) is a nice micro-interaction.

**UX gaps to address**

| Priority | Guideline | Finding |
|----------|-----------|---------|
| CRITICAL | `touch-target-size` (≥44×44) | Android tab icon container is 52×34 — under 44px tall. Verify all icon-only buttons (`BackButton`, action buttons) meet 44×44. |
| CRITICAL | `accessibility` | `welcome.tsx` adds good `accessibilityLabel`s — extend this. Icon-only buttons elsewhere need `accessibilityLabel`/`accessibilityRole`. |
| HIGH | `loading-states` | Splash uses a fixed 1800ms timer (`app/index.tsx`) regardless of readiness — can flash or stall. Drive it off real readiness (fonts + auth) like `_layout.tsx` does. |
| HIGH | `reduced-motion` | Animations (gradient, tab shift, reanimated swipes) don't check `prefers-reduced-motion` / `AccessibilityInfo.isReduceMotionEnabled`. |
| MEDIUM | `error-feedback` | Deep-link/auth errors are `console.error`-only (silent to the user). Surface user-facing error states. |
| MEDIUM | `content-jumping` | Reserve space for async images (profile cards) to avoid layout shift. |
| MEDIUM | dark-mode contrast | Body text at `rgba(255,255,255,0.5)` (loading copy in `_layout.tsx`) is below 4.5:1 — bump opacity/lightness for legibility. |
| LOW | `onboarding` | 9-step setup flow (per `newUpdatedRules.md`) — keep the step counter accurate and persist progress so users can resume. |

---

## 🛠️ Prioritized Remediation Checklist

### ✅ Completed (2026-05-30 remediation pass)
- [x] **C1** — Auth gate restored. `app/index.tsx` now defaults to `/(auth)/welcome`; tester bypass is opt-in via `EXPO_PUBLIC_BYPASS_AUTH=true`.
- [x] **M1** — PII removed from logs. `deepLinking.ts` rewritten with a `__DEV__`-only logger (no URLs/tokens/emails/IDs/metadata); `authStore.ts` + `supabase.ts` logs guarded/de-PII'd.
- [x] **H1/M5** — All 27 empty (0-byte) stub files deleted (incl. `constants.ts`).
- [x] **H2** — Dead dupes removed: `EditProifleScreen.tsx`, `messagingApi.ts`, `messagesApi.ts` (129-line orphan).
- [x] **H3** — Messaging APIs standardized to camelCase (`conversationsApi.ts`, `messagesApi.ts`, `realtimeApi.ts`) + importers updated.
- [x] **M2** — `profile/hooks/userProfile.ts` → `useProfile.ts` (import updated).
- [x] **M4** — Lint: 11 errors → **0** (escaped all JSX entities; `--fix`; removed dead constants/imports). 31 warnings remain (non-blocking).
- [x] **L1** — `tailwind.config.js` `content` → `["./app/**", "./src/**"]` (dead `App.tsx`/`components` paths removed).
- [x] **H4 (partial)** — Added `src/utils/__tests__/security.test.ts` (21 tests). Suite total: **36 tests / 2 suites**.
- [x] **M3 (partial)** — `ocrService` now exports `IS_MOCK_OCR` + warns in `__DEV__`; gate verification UI on this flag.
- [x] **UX** — Fixed white-on-white loading text in `app/_layout.tsx` (now `semanticColors.textSecondary`).
- [x] Earlier: `welcome.tsx` `LinearGradient` tuple; created `CLAUDE.md` + this audit.

**Verified after changes:** `tsc` 0 errors · `expo lint` 0 errors · `jest` 36/36 · `build:web` exports `dist/`.

### ⏳ Remaining (deliberately deferred — need product input or are larger efforts)
- [ ] **H4 (full)** — Broader coverage: `authStore`, `deepLinking` URL parsing, messaging API, screen smoke tests.
- [ ] **M3 (full)** — Wire a real OCR provider (Google Vision / Textract / Tesseract) to replace the mock.
- [ ] **Lint warnings** — 23 unused locals + 8 `exhaustive-deps`. The deps ones are intentional; revisit case-by-case.
- [ ] **L2** — Consolidate the 8 root setup `.md` files into one `docs/SETUP.md` (content merge — needs author review).
- [ ] **L3** — Move one-off SQL (`fix_*.sql`, `manual_verify_user.sql`, `cleanup_test_users.sql`) out of `supabase/migrations/`.
- [ ] **L4** — Clean the local `.env` (Markdown appended after keys; local only, not committed — left untouched).
- [ ] **UX** — Touch-target sizing audit, `prefers-reduced-motion` handling, user-facing error surfaces for auth/deep-link failures.

---

## Appendix — How this was audited

- Static read of every layer: `app/` routes, `src/features/*`, stores, theme, config, `supabase/`.
- Reference tracing via `grep` to distinguish live vs dead modules (importer counts).
- Live tooling: `npm install` → `npx tsc --noEmit` (0 errors after fix), `npm run lint` (11/56), `npm test` (15/15).
- Design lens applied via the `ui-ux-pro-max` accessibility/interaction/animation guidelines and `frontend-design` aesthetic principles.
