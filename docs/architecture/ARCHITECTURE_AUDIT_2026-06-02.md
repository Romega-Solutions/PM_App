<!-- Hallmark · audit · pre-emit critique: P5 H5 E5 S5 R4 V4 -->

# PinayMate — Architecture Audit (2026-06-02)

**Scope:** routing (`app/`), feature modules (`src/features/*`), state (`src/stores`), data access (`features/*/api`, Supabase), shared layers (`src/{components,config,hooks,services,shared,theme,utils}`), module size & coupling.
**Method:** static read + measurement of the actual tree vs the documented intent in [`APP_VS_SRC_ARCHITECTURE.md`](APP_VS_SRC_ARCHITECTURE.md) and `CLAUDE.md`. Read-only — no code changed.
**Companions:** [`../design/DESIGN_SYSTEM_AUDIT_2026-06-01.md`](../design/DESIGN_SYSTEM_AUDIT_2026-06-01.md) (design), [`../audits/PINAYMATE_BACKEND_AUDIT_2026-05-30.md`](../audits/PINAYMATE_BACKEND_AUDIT_2026-05-30.md) (DB), [`../audits/PINAYMATE_AUDIT_2026-05-29.md`](../audits/PINAYMATE_AUDIT_2026-05-29.md) (codebase).

> Same template as the design audit — **Tell · Where · Severity · Fix**, grouped by severity, closing with a count. `critical` = breaks a core architectural boundary / unmaintainable · `major` = significant debt that slows change · `minor` = consistency/hygiene.

## TL;DR

The **macro-architecture is sound** — feature-first under `src/`, Zustand for global state, expo-router file routing, a real theme layer, path aliases. But the **documented boundaries are only half-enforced**, and a few modules have grown into monoliths:

- The project's **#1 rule — "`app/` is routes only, <30 lines"** — is broken by ~11 route files that embed entire screens (incl. a 286-line screen and five 212–264-line settings screens).
- **`ChatScreen.tsx` is 1038 lines** — a god-component.
- **~9 screens/routes query Supabase directly**, bypassing the `features/*/api` layer — and they're coupled to a DB schema that's actively drifting (see backend audit).
- **No feature has a public API barrel**, and there are 27 cross-feature imports — features aren't actually self-contained.

**Score: 2 critical · 4 major · 3 minor = 9 findings.**

## Inventory (measured)

| Layer | State |
|-------|-------|
| `app/` routes | Mixed: core tabs are thin 3-line re-exports ✅; auth + all profile-settings embed full screens ❌ |
| `src/features/` | `matching`, `messaging` full (api/components/hooks/screens/types); `account`/`auth` missing `components/`; none use `services/` |
| `src/stores/` | 5 stores; `authStore` 216 · `chatStore` 186 · `matchingStore` 160 (over the ~150 soft cap) |
| Data access | `features/*/api/*Api.ts` exists ✅ but bypassed by ~9 screens/routes calling Supabase directly ❌ |
| Shared | `components/config/hooks/services/shared/theme/utils` present ✅; `services/` holds only the mock `ocrService` |
| Tests | only `matchingApi`, `theme`, `security` |

---

## 🔴 Critical

### A1 · Routing boundary broken — full screens live in `app/`
- **Tell:** The documented rule is "`app/` = routes only, thin wrappers < 30 lines." In reality ~11 route files embed entire screens + logic: `useState` in 7 app files, `useEffect` in 3, direct `supabase` in 2, `StyleSheet.create` in 10.
- **Where:** `app/(auth)/user-type-selection.tsx` (286), `app/(auth)/welcome.tsx` (184), `app/(auth)/forgot-password.tsx` (184), `app/(auth)/verify-phone.tsx` (177), `app/index.tsx` (130), and **all** of `app/(main)/profile-settings/` — `preferences.tsx` (264), `privacy.tsx` (230), `notifications.tsx` (229), `about.tsx` (223), `help.tsx` (212).
- **Fix:** Move each screen body into `src/features/*/screens/` (create a `settings` feature for profile-settings; route the auth screens through `features/auth`/`features/account`). Reduce each route to the 3-line re-export the tabs already use.

### A2 · `ChatScreen.tsx` god-component (1038 lines)
- **Tell:** One file holds the entire chat experience — 17 state/handler declarations, keyboard handling, send/image logic, rendering. 2× the project's own 500-line ceiling and the hardest file in the repo to change safely.
- **Where:** `src/features/messaging/screens/ChatScreen.tsx`.
- **Fix:** Extract hooks (`useChat`, `useChatKeyboard`) and components (`MessageList`, `MessageBubble`, `ChatInput`, `ChatHeader`) into `features/messaging/{hooks,components}`. Target a screen ≤ ~200 lines that composes them.

---

## 🟠 Major

### A3 · Data-access leakage — UI calls Supabase directly
- **Tell:** The convention is "data-access functions live in `features/<f>/api/`." But ~8 screens + 1 route import `@/src/config/supabase` and run queries inline, coupling UI to the DB — risky while the schema is mid-migration (backend audit) and untestable without a real client.
- **Where:** `DiscoverScreen`, `LikesScreen`, `VerifyEmailScreen`, `VerificationSuccessScreen`, `SignUpScreen`, `ProfileScreen`, `MessagesScreen`, `ChatScreen`, and `app/(main)/profile-settings/preferences.tsx`.
- **Fix:** Move every query into `features/<f>/api/*Api.ts` returning typed results; screens call hooks that call the api. No `supabase` import outside `api/`, `config/`, `stores/`, `hooks/`.

### A4 · No feature public API + cross-feature coupling
- **Tell:** No feature exposes an `index.ts` barrel, so consumers import deep paths (`features/x/screens/...`, `features/x/api/...`). There are **27 cross-feature imports** (everything → `auth`), so features aren't self-contained.
- **Where:** `src/features/*` (no barrels); `grep @/src/features/*` shows auth(10) account(6) messaging(5) profile(3) matching(3).
- **Fix:** Add a per-feature `index.ts` exposing only the public surface (screens + the hooks/types others may use). Lift genuinely shared types (e.g. `UserType`) to `src/shared/types` so features stop importing each other for them.

### A5 · Oversized modules vs the documented limits
- **Tell:** Stores and screens exceed their stated soft limits, signalling mixed responsibilities. 3/5 stores over ~150 lines; 10 source files > 400 lines; `account`/`auth` screens are 365–502 lines **with no `components/` folder** (nothing extracted).
- **Where:** `authStore` (216), `chatStore` (186), `matchingStore` (160); `matchingApi` (538), `VerifyEmailScreen` (502), `WelcomeCompleteScreen` (475), `MessagesScreen` (464), `ProfileDetailsModal` (429), `DiscoverScreen` (426), `VideoCallScreen` (407).
- **Fix:** Split stores by concern (e.g. chat: connection vs messages vs unread); extract sub-components/hooks from the big screens; move the scoring half of `matchingApi` into `features/matching/services/`.

### A6 · Duplicated responsive helper in 11 files
- **Tell:** `const scale = …` / `moderateScale` is re-implemented in 11 components/screens — drift-prone and the kind of copy-paste that reads as "AI slop."
- **Where:** 11 files across `src/` + `app/` (e.g. `AuthHeader.tsx`, `PrimaryButton.tsx`, `MessagesScreen.tsx`, call screens).
- **Fix:** One `src/shared/utils/responsive.ts` (`scale`, `moderateScale`); import everywhere.

---

## 🟡 Minor

### A7 · Inconsistent feature internal layout
- **Tell:** `CLAUDE.md` says each feature has `api/hooks/screens/components/services/types`. Actual: `account`/`auth` have no `components/`; `account`/`auth`/`profile` have no `types/`; **no feature uses `services/`** (the matching scoring `services/` is inlined in `matchingApi.ts`).
- **Where:** `src/features/{account,auth,profile}`.
- **Fix:** Either normalize the skeleton (add the missing folders as screens get decomposed) or update the convention to match reality (drop `services/` if unused).

### A8 · `profile-settings` is a missing feature
- **Tell:** Six settings screens live entirely in `app/(main)/profile-settings/` with no `src/` home — a whole feature implemented in the routing layer (the worst instance of A1).
- **Where:** `app/(main)/profile-settings/*`.
- **Fix:** Create `src/features/settings/` (screens + a `settingsApi` for the direct Supabase calls in `preferences.tsx`).

### A9 · Test coverage gap
- **Tell:** Only `matchingApi`, `theme`, and `security` have tests. Auth/messaging/profile/account screens, all hooks, and all stores are untested — so the refactors above land without a safety net.
- **Where:** `src/**` (3 test files total).
- **Fix:** Add `api/` + hook tests as part of the A3 data-access extraction (api functions are pure-ish and easy to test); add store tests for `authStore`/`chatStore`.

---

## What's already good (don't regress)

- **Feature-first under `src/`** with a clean top-level (`components/config/features/hooks/services/shared/stores/theme/utils`).
- **Core tab routes are correct thin wrappers** (`index`/`messages`/`profile`/`chat` = 3–28 lines) — the pattern to copy everywhere.
- **Zustand** with `persist` + `partialize` (no raw creds persisted), non-React helpers (`getCurrentUserId`).
- **Path aliases** (`@/src`, `@/app`) used consistently.
- **Mock boundaries are honest** — `ocrService` exports `IS_MOCK_OCR` and warns loudly.
- **Theme layer** rebuilt (see design audit) — the model for how data-access should also be centralized.

## Remediation roadmap (ordered)

1. **Stand up `src/features/settings/`** and move the 6 profile-settings screens out of `app/` (A8 + biggest slice of A1). Establishes the pattern.
2. **Pull Supabase out of screens into `api/`** feature by feature (A3) — add api/hook tests as you go (A9). This also de-risks the schema migration.
3. **Decompose `ChatScreen`** (A2) and the other 400+ line screens (A5) into hooks + components.
4. **Add feature barrels + shared types** (A4); move `moderateScale` to one util (A6).
5. **Thin the remaining fat routes** (A1) and split the oversized stores (A5).

*Sequenced so each step adds tests before the risky refactors. Pairs naturally with the design-system adoption sweep — both are "centralize what's been copy-pasted across screens."*

---

*Read-only audit. Apply fixes smallest-blast-radius first; land tests before each refactor.*
