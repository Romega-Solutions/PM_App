# PinayMate — Documentation Index

All project documentation lives here. Only `README.md` and `CLAUDE.md` remain at the repo root.

> Maintenance note: keep new docs in the right folder and add a line here. Date-stamped reports use `NAME_YYYY-MM-DD.md`.

## 📁 Folders

### `setup/` — onboarding & configuration
- [`SUPABASE_SETUP_INSTRUCTIONS.md`](setup/SUPABASE_SETUP_INSTRUCTIONS.md) — database/project setup
- [`EMAIL_VERIFICATION_SETUP.md`](setup/EMAIL_VERIFICATION_SETUP.md) — email-verification config
- [`ENABLE_EMAIL_SIGNUP.md`](setup/ENABLE_EMAIL_SIGNUP.md) — enabling email signup
- [`FINAL_EMAIL_FLOW_SETUP.md`](setup/FINAL_EMAIL_FLOW_SETUP.md) — end-to-end email flow
- [`REDIRECT_URLS_QUICK.md`](setup/REDIRECT_URLS_QUICK.md) — deep-link redirect URLs
- [`SETUP_CHECKLIST.md`](setup/SETUP_CHECKLIST.md) — full setup checklist

### `architecture/` — how the app is structured
- [`APP_VS_SRC_ARCHITECTURE.md`](architecture/APP_VS_SRC_ARCHITECTURE.md) — `app/` (routes) vs `src/` (logic) split
- [`ZUSTAND_IMPLEMENTATION.md`](architecture/ZUSTAND_IMPLEMENTATION.md) — store architecture

### `design/` — design system
- [`DESIGN_SYSTEM_AUDIT_2026-06-01.md`](design/DESIGN_SYSTEM_AUDIT_2026-06-01.md) — theme tokens, light/dark mode, typography audit
- [`design-tokens.html`](design/design-tokens.html) — **interactive** token style guide (open in a browser): brand ramps, light/dark grounds, **platform switcher (iOS/Android/Web)**, live WCAG contrast, type/spacing/radii. One token source, three lenses.
- **`platform/`** — per-target design specs + store-readiness checklists: [`IOS_HIG.md`](design/platform/IOS_HIG.md) (App Store), [`ANDROID_MATERIAL3.md`](design/platform/ANDROID_MATERIAL3.md) (Play Store), [`WEB.md`](design/platform/WEB.md) (WCAG).

### `audits/` — codebase & backend audits
- [`PINAYMATE_AUDIT_2026-05-29.md`](audits/PINAYMATE_AUDIT_2026-05-29.md) — codebase audit + remediation log
- [`PINAYMATE_BACKEND_AUDIT_2026-05-30.md`](audits/PINAYMATE_BACKEND_AUDIT_2026-05-30.md) — Supabase / schema-drift audit
- [`SYSTEM_AUDIT_REPORT.md`](audits/SYSTEM_AUDIT_REPORT.md) — earlier system audit

### `product/` — business logic
- [`businessRules.md`](product/businessRules.md) — product/business rules
- [`SMART_MATCHING_ALGORITHM.md`](product/SMART_MATCHING_ALGORITHM.md) — match-scoring algorithm

### `chat/` — messaging
- [`SUPABASE_CHAT_INTEGRATION.md`](chat/SUPABASE_CHAT_INTEGRATION.md) — realtime chat integration
- [`chatUIFlow.md`](chat/chatUIFlow.md) — chat UI flow
- [`CHAT_UPDATE.md`](chat/CHAT_UPDATE.md) — chat changelog/notes

### `testing/` — QA & verification
- [`TESTING_GUIDE.md`](testing/TESTING_GUIDE.md) — testing strategy
- [`CHAT_TESTING_GUIDE.md`](testing/CHAT_TESTING_GUIDE.md) — chat-specific testing
- [`runVerification.md`](testing/runVerification.md) — verification runbook

### `refactoring/` — historical refactor notes
- [`REFACTORING_PLAN.md`](refactoring/REFACTORING_PLAN.md), [`REFACTORING_SESSION_SUMMARY.md`](refactoring/REFACTORING_SESSION_SUMMARY.md), [`REFACTORING_AUDIT_REPORT.md`](refactoring/REFACTORING_AUDIT_REPORT.md)
- [`MESSAGES_REFACTORING.md`](refactoring/MESSAGES_REFACTORING.md), [`PROFILE_REFACTORING.md`](refactoring/PROFILE_REFACTORING.md)
- [`INDEX_REFACTORING_SUMMARY.md`](refactoring/INDEX_REFACTORING_SUMMARY.md), [`INDEX_REFACTORING_VISUAL.md`](refactoring/INDEX_REFACTORING_VISUAL.md)

### `guides/` — how-tos & troubleshooting
- [`guideWithAI.md`](guides/guideWithAI.md) — working-with-AI guide
- [`QUICK_FIX.md`](guides/QUICK_FIX.md) — quick fixes
- [`FIX_DATABASE_ERRORS.md`](guides/FIX_DATABASE_ERRORS.md) — DB error troubleshooting
- [`newUpdatedRules.md`](guides/newUpdatedRules.md) — updated rules
