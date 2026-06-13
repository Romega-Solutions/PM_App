# 🌸 PinayMate - Dating App

> React Native dating app connecting Filipino women with foreign men

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm start

# Run on devices
npm run ios
npm run android
```

---

## 🔧 Environment Setup

Create `.env` from the checked-in template:

```bash
cp .env.example .env
```

Fill in the real Supabase values locally. `EXPO_PUBLIC_OCR_ENDPOINT` is optional when using the bundled Supabase OCR Edge Function because the app derives `https://<project-ref>.functions.supabase.co/ocr` from `EXPO_PUBLIC_SUPABASE_URL`. Leave it blank unless a custom OCR backend is intentionally used. If a custom OCR endpoint is configured, it must validate the `Authorization: Bearer <Supabase access token>` header before processing ID images.

`.env` is ignored for new local files. The local secret-hygiene gate passed on 2026-06-11, but any previously tracked values still need a rotation/recovery decision before production launch.

### Native Permissions

- Current location uses `expo-location` foreground permission, device coordinates, and reverse geocoding.
- The location permission copy is configured in `app.json`; rebuild the native app after changing it.
- The camera/photo permission copy for verification selfie and ID document selection is configured through the `expo-image-picker` plugin in `app.json`; rebuild the native app after changing it.
- ID OCR calls the bundled Supabase OCR Edge Function, deriving the URL from `EXPO_PUBLIC_SUPABASE_URL` unless `EXPO_PUBLIC_OCR_ENDPOINT` is explicitly set, and fails closed when the user is unauthenticated, the endpoint is unavailable, or the response is invalid.

### Production-hardening reality check

- Local release gate:
  - `npm run check:release-local` first checks secret hygiene, verifies launch-critical files are present and tracked, checks dependency advisories, then runs local quality checks.
  - The launch-file contract is intentionally strict so a partial merge cannot ship code that references an untracked report modal, security guard, OCR function, or final discovery-privacy migration.
  - Dependency audit failures should be fixed in a dedicated dependency branch. Do not run `npm audit fix --force` on the release branch if it downgrades or changes Expo runtime dependencies.
  - Current local blocker: `check:release-local` fails at the production ownership contract until the Expo/EAS owner is proven Romega-controlled or transferred.
- Apply the full ordered launch migration set before staging or production signoff. Use `supabase/LAUNCH_MIGRATION_MANIFEST.md` as the source of truth, including the base setup, chat schema, production hardening, storage buckets, OCR rate limit, basic-info RPC, account deletion requests, privacy settings, read-receipt privacy, online-status privacy, legacy tail hardening, secure send-message RPC, report payload hardening, discovery privacy repair, and notification preferences migration.
- `99_final_release_security_hardening.sql` locks down policy grants, safety functions, match-gated conversation access, RPC-owned message/report mutations, and constrained client-write surface to ship-safe defaults.
- Legacy `99_` and `999_` tail migrations must remain safe even if a filename-ordered runner applies them after timestamped launch migrations; the manifest defines the intended release order.
- Legacy repair/audit SQL is kept in `supabase/manual-repair-scripts` so deployable migrations stay ordered and production-safe.
- OCR is a Supabase Edge Function artifact at `supabase/functions/ocr`. End-to-end OCR behavior and provider errors must be validated against a deployed function, not only by local call-path review.
- `supabase/config.toml` explicitly keeps JWT verification enabled for the OCR function, and the function also validates the caller session before contacting the OCR provider.
- Deployment/secrets requirement:
  - `npx supabase functions deploy ocr`
  - `npx supabase secrets set OCR_SPACE_API_KEY=...`
- Local run limitations:
  - Repo does not include a committed Docker-compose/local Supabase emulation for the Edge Function runtime.
  - Local checks can verify wiring/smoke SQL, but OCR success/failure classification should be signed off from staging/production where function URLs and secrets are live.

---

## 🏗️ Tech Stack

- **Framework:** React Native + Expo SDK 54+
- **Router:** expo-router (file-based)
- **Styling:** NativeWind (Tailwind CSS)
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **State:** Zustand

---

## 📁 Project Structure

```
app/
  (auth)/           # Auth screens (signup, verify, signin)
  (main)/           # Main app (discover, likes, messages, profile)
  (modals)/         # Modal screens (filters)

src/
  components/       # Reusable UI components
  features/         # Feature logic (auth, account, profile, messaging)
  config/           # Supabase config, deep linking
  stores/           # Zustand stores

supabase/
  migrations/       # Database SQL setup
  manual-repair-scripts/ # Non-production repair/audit SQL kept out of deployable migration order
```

---

## 🔐 Auth Flow

1. **User Type Selection** → Filipina or Foreign Man
2. **Sign Up** → Email + Password
3. **Email Verification** → Verify via email link (or skip)
4. **Account Setup** → Complete profile (photos, location, preferences)
5. **Main App** → Discover, match, chat

**Features:**

- Email verification with deep linking
- Skip verification option
- Auto sign-out before signup to prevent conflicts
- Session persistence uses SecureStore on native builds with a web-compatible storage fallback

---

## 🗄️ Database Tables

```sql
profiles          # User profiles (extends auth.users)
photos            # Profile photos
swipes            # Like/pass actions
matches           # Mutual likes
conversations     # Chat threads
messages          # Chat messages
```

**Auto-match trigger:** Creates match when both users like each other

---

## 💬 Real-Time Features

- Live messaging with typing indicators
- Online presence tracking
- Match notifications
- Read receipts

---

## 📸 File Uploads

- **Profile Photos:** Max 6 photos, auto-resize to 1080px, generate thumbnails
- **Chat Media:** Images, GIFs
- **Storage:** Supabase Storage

---

## ✅ Current Status

### ✅ Done

- Auth system routes authenticated users to `(main)` and unauthenticated users to `(auth)` flows.
- Email verification flow is implemented with deep links and a safe verification path.
- Account setup flow includes basic profile, photos, location, and preferences steps.
- Swipe/match, messaging, and match notification foundations are implemented.
- Matches can open backend-created conversations directly from the likes screen.
- File upload/storage paths, profile schema, and messaging hooks are in place.
- Full ordered Supabase launch migrations through `20260611123000_add_notification_preferences.sql` are present in `supabase/migrations`; use `supabase/LAUNCH_MIGRATION_MANIFEST.md` for the intended release order.
- Chat media now stores durable Supabase Storage paths and signs image URLs at read/render time.
- Conversation list reads now use a safe RPC shape for the other member's display card instead of joining full profile rows.
- Report, block, unmatch, verification submission, least-privilege grants, and final match-safety persistence are defined across `04_production_security_hardening.sql` and `99_final_release_security_hardening.sql`.
- OCR flow calls the bundled Supabase Edge Function via `src/services/ocrService.ts` and uses extracted data in verification upload.
- OCR backend artifact is present at `supabase/functions/ocr`; deploy it with a server-side `OCR_SPACE_API_KEY` secret before release.
- Verification upload now stores selfie/document evidence in the private `verification-docs` Supabase Storage bucket before submitting durable storage paths for review.
- Basic info setup now uses the `save_basic_info` RPC instead of direct client updates to `user_type` and `gender`.

### ✅ Verified

- Repo-grounded implementation is visible in code and docs:
  - auth routing and route guards
  - OCR entry points
  - location capture and reverse geocode path
- Supabase migration contract through `supabase/migrations/20260611123000_add_notification_preferences.sql`
- **No live production deployment/QA has been completed in this documentation set.**

### 📦 Release Ownership Status

- **Owner:** PM_App release docs thread (`README`, `docs/RELEASE_READINESS.md`)
- **Last reviewed:** 2026-06-11
- **Decision rule:** Do not mark launch-ready until all blockers in `docs/RELEASE_READINESS.md` are cleared with evidence.

### 🚫 Blocked

- Native permission and current-location flows are implemented but not yet validated on physical devices or emulators.
- OCR backend deployment, security hardening, and response-handling behavior are not yet production-verified.
- Full ordered launch migrations through `20260611123000_add_notification_preferences.sql` have not yet been run and validated on the target Supabase environment.
- Backend-backed safety tables/RPCs are not yet applied or validated on the target Supabase environment.
- OCR runtime is blocked from launch-clearance until the deployed function endpoint and `OCR_SPACE_API_KEY` secret are both verified.
- Expo/EAS production ownership is blocked until `expo.owner` is proven Romega-controlled or transferred to a Romega-owned account/team.
- Safety/support/legal/release owner assignment and final launch evidence are still blocked.

### 🔜 Next

- Execute the migration on staging/local first, then on production Supabase.
- Run `supabase/tests/04_safety_smoke_test.sql` after applying the full ordered migration set in staging/local to validate report, block, unmatch, storage, notification preferences, privacy settings, read receipts, discovery filtering, and blocked-chat behavior.
- Complete physical-device QA for location permission + reverse-geocode + coordinate persistence.
- Stand up and smoke-test OCR endpoint with valid/invalid documents in a deployed environment (local DB checks alone are insufficient for function-level hardening).
- Run end-to-end mobile QA: onboarding, auth gate, matching, chat media, and verification flows.
- Validate report, block, unmatch, and blocked-chat behavior after the Supabase policy migration is applied.

### ✅ Proof Commands (repo-safe)

```bash
# implementation evidence checks (run in PM_App)
rg -n "app/index.tsx|app/\\(main\\)/_layout.tsx|EXPO_PUBLIC_OCR_ENDPOINT|extractTextFromImage|04_production_security_hardening|Use Current Location" PM_App
rg -n "useLocationSearch|safetyApi|messages.api|conversations.api|supabase/tests/04_safety_smoke_test.sql" PM_App

# release-clearing checks (run when env is ready)
supabase db diff
supabase db push
```

### ⚠️ What is still unverified

- Native runtime permission, denial handling, and coordinate persistence behavior
- OCR backend deployment security + failure-path handling in a deployed function context with secrets
- Supabase migration execution and post-migration safety behavior
- End-to-end launch QA and cold-start/auth expiry behavior

### Final verification expectations before launch

- Migration proof: `04_production_security_hardening.sql`, `99_final_release_security_hardening.sql`, `20260610094806_add_pinaymate_storage_buckets.sql`, `20260610100323_add_ocr_rate_limit.sql`, and `20260610100523_add_basic_info_rpc.sql`, then `supabase/tests/04_safety_smoke_test.sql` logs in staging and production.
- OCR proof: `npx supabase functions deploy ocr`, secret-check evidence for `OCR_SPACE_API_KEY`, and valid/invalid document extraction assertions.
- Local quality proof: `npm run check:local-quality` from `PM_App` after any auth, profile, location, matching, messaging, verification, or UI change.
- Local release guard proof: `npm run check:release-local` from `PM_App` after ownership, safety, and launch-evidence blockers are resolved. This runs secret hygiene, dependency audit, ownership, safety, launch evidence, and local quality gates.
- Static Supabase evidence proof: `npm run check:supabase-static-contract:report` only when intentionally refreshing the static evidence file. The normal `npm run check:supabase-static-contract` command is read-only.
- Runtime proof: full native QA for permissions, location denial, auth expiry, and sign-up→onboarding→matching→chat flow.

---

## 🧪 Production Readiness Snapshot (2026-06-10)

**Scope reviewed:** Mobile onboarding, backend readiness, permissions, OCR path, and launch blockers

### Done / Verified / Blocked / Next

#### Done

- App-level auth gate and tab protection were completed in `app/index.tsx` and `app/(main)/_layout.tsx`.
- `src/features/account/hooks/useVerificationUpload.ts` routes ID verification through `extractTextFromImage`.
- Location flow supports manual city selection and current-location path in `app/(auth)/account-setup/location.tsx`.
- Supabase hardening migration exists and documents profile, chat, and storage policy protections.

#### Verified

- Current doc state confirms: auth gate, OCR service wiring, and current-location capture logic are implemented.
- Existing migration file and feature wiring are traceable in this repository.

#### Blocked

- Native runtime validation of location permission prompt, permission denial behavior, and coordinate persistence.
- OCR endpoint deployment, production security, and real-image verification behavior.
- Supabase migration execution and advisor checks for:
  - RLS and storage policy enforcement
  - `discoverable_profiles`, chat RPC access, and profile-column constraints
  - Migration SQL application status in target projects

#### Next

- **Mobile App**
  - Run build and install QA on Android/iOS (emulator + physical if possible).
  - Validate onboarding, account setup, `Use Current Location`, verification, matching, and messaging.
- **Web**
  - Confirm PM_Web release page matches mobile deep-link and feature availability links.
  - Validate production build output and static delivery for landing routes.
- **Backend / Supabase**
  - Apply the full ordered migration set to a fresh/local database first, including storage, OCR quota, and basic-info RPC migrations.
  - Re-run migration on production project and capture advisor logs/outputs.
- **OCR**
  - Deploy/connect backend OCR endpoint; `EXPO_PUBLIC_OCR_ENDPOINT` is optional when the Supabase URL-derived function URL is used. Any custom endpoint must validate the Supabase bearer token before processing the uploaded document.
  - Exercise success, invalid-image, and timeout/failure paths.
- **QA**
  - Execute end-to-end production-like QA once all blockers above are cleared.
- **Dependencies**
  - Verify environment keys exist: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`; `EXPO_PUBLIC_OCR_ENDPOINT` is optional if Supabase URL derivation is used for the OCR function.
  - Confirm Expo/native dependencies align with runtime needs (location, deep linking, image capture).

---

### Launch blockers still open

1. **Native permission/device QA**
   - `src/features/account/hooks/useLocationSearch.ts` requests foreground permission and reverse geocodes coordinates, but release QA on devices is pending.

2. **OCR production readiness**
   - The backend endpoint is configured in code and docs but still requires deployment/security review and real-image verification.

3. **Supabase migration execution**
   - Migration logic is implemented; execution in staging/production and advisory verification remain outstanding.

4. **End-to-end launch QA**
   - Post-migration/mid-rollback scenarios for signup, onboarding, verification, discovery, matching, and messaging are still pending.

---

## 🔗 Deep Linking

- **Development:** `exp://192.168.1.2:8081/--/(auth)/verification-success`
- **Production:** `pinaymate://(auth)/verification-success`

---

## 📚 Documentation

- `SUPABASE_SETUP_INSTRUCTIONS.md` - Database setup guide
- `EMAIL_VERIFICATION_SETUP.md` - Email verification config
- `REDIRECT_URLS_QUICK.md` - Deep linking setup
- `SETUP_CHECKLIST.md` - Complete setup steps
- `docs/RELEASE_READINESS.md` - Current launch blocker tracker
- `docs/SUPABASE_CHAT_INTEGRATION.md` - Supabase chat/media implementation notes

---

**Built with ❤️ for connecting hearts across borders**
