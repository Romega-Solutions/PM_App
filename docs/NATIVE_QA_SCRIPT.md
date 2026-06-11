# PinayMate Native QA Script

Last updated: 2026-06-11

Purpose: execute the minimum native-device or emulator QA required before PinayMate can be called production-ready. This script covers the app flows most likely to affect conversion, retention, and user safety.

Status: required before launch sign-off. Local web export and TypeScript checks do not replace this script.

Product design acceptance criteria live in `docs/PRODUCT_DESIGN_QA_STANDARD.md`. Use that standard while taking screenshots for this native QA script.

## Test setup

| Field             | Value                |
| ----------------- | -------------------- |
| Tester            |                      |
| Date              |                      |
| Device/emulator   |                      |
| OS/version        |                      |
| Build command     |                      |
| Supabase project  | staging / production |
| OCR endpoint      |                      |
| App version/build |                      |
| Product design reviewer |          |

Recommended commands:

```powershell
npm install
npx expo install --check
npx expo start
```

Use the native path appropriate for the device:

```powershell
npx expo run:android
npx expo run:ios
```

If using Expo Go, record that limitation because native permission and build behavior may differ from a release build.

## Evidence rules

- Capture screenshots or short clips for each critical pass/fail.
- Capture design evidence against `docs/PRODUCT_DESIGN_QA_STANDARD.md` for first impression, onboarding, discovery, matching, messaging, settings, accessibility, and resilience.
- Redact real names, documents, locations, message text, emails, and tokens.
- Do not paste private document images into chat or public issue trackers.
- Record exact error messages when a step fails.
- Treat raw Supabase, storage, database, provider, RPC, SQL, bucket, token, or stack-trace text in user-facing errors as a fail-stop.
- Stop launch sign-off if any critical safety or auth gate fails.

## Test accounts

Create or identify two test members:

| Account   | Purpose                   | User type | Notes |
| --------- | ------------------------- | --------- | ----- |
| Account A | primary tester            |           |       |
| Account B | match/report/block target |           |       |

Do not use real customer accounts for release QA.

## 1. Auth and route protection

| Step                                                     | Expected result                                                  | Evidence       | Pass |
| -------------------------------------------------------- | ---------------------------------------------------------------- | -------------- | ---- |
| Open app signed out                                      | App routes to auth/onboarding, not main tabs                     | screenshot     |      |
| Try to access Discover/Messages/Profile while signed out | Protected route redirects to auth                                | screenshot/log |      |
| Sign up with Account A                                   | Account is created and app proceeds to setup                     | screenshot     |      |
| Fail signup on bad network/provider error                | App shows safe recovery copy without provider/backend details     | screenshot/log |      |
| Try weak signup password                                 | App requires uppercase, lowercase, number, and special character | screenshot     |      |
| Open email verification screen                           | No skip-to-setup bypass or internal Supabase instructions appear | screenshot     |      |
| Tap check-again before opening email link                | App asks user to open latest email link or return to sign-in     | screenshot     |      |
| Open email verification link                             | Link routes through the configured Supabase/Expo redirect to verification success | screenshot/log |      |
| Request forgot-password email                            | Recovery email request shows generic success                     | screenshot/log |      |
| Fail forgot-password request on bad network/provider error | App shows safe recovery copy without provider/backend details   | screenshot/log |      |
| Open password recovery link                              | Link opens reset-password, not onboarding                        | screenshot     |      |
| Update password from recovery link                       | Password updates and user returns to sign-in                     | screenshot/log |      |
| Fail password update on bad network/provider error       | App shows safe recovery copy without provider/backend details     | screenshot/log |      |
| Force close and reopen app                               | Session state is restored correctly                              | screenshot     |      |
| Sign out                                                 | Main tabs become inaccessible                                    | screenshot     |      |
| Fail sign out on bad network/provider error              | App shows safe recovery copy or remains in a safe authenticated state | screenshot/log |      |
| Sign back in                                             | User returns to correct authenticated flow                       | screenshot     |      |
| Toggle privacy settings                                  | Switches load and save without reverting or showing fake state   | screenshot/log |      |
| Force privacy settings load failure                      | Toggles stay locked behind retry and default values are not saved over the account | screenshot/log |      |
| Turn Online Status off from Account B                    | Account A no longer sees active badge or last-active copy for B  | screenshot/log |      |
| Hide profile visibility                                  | User is told the profile will be hidden from discovery           | screenshot     |      |
| Request account deletion from privacy settings           | App shows review/retention/status expectations, then submits a backend-backed request or asks user to sign in | screenshot/log |      |

Fail-stop:

- unauthenticated user can access main tabs
- email verification can be skipped into account setup
- verification UI exposes internal Supabase SQL or implementation steps
- signed-in user gets stuck outside the app without recovery
- password reset shows success without sending a Supabase recovery email
- password recovery link routes into onboarding instead of reset-password
- privacy switches only change local UI without backend persistence
- privacy settings load failure allows default values to be saved over real account settings
- account deletion only shows manual instructions without creating a backend request
- auth errors expose tokens or internal details

## 2. Basic profile onboarding

| Step                             | Expected result                                           | Evidence       | Pass |
| -------------------------------- | --------------------------------------------------------- | -------------- | ---- |
| Complete required basic info     | Required fields validate clearly                          | screenshot     |      |
| Leave required field empty       | Inline or clear blocking error appears                    | screenshot     |      |
| Fail basic info save on bad network | App shows safe recovery copy without backend/RPC details | screenshot/log |      |
| Review profile photo checklist   | Safety, quality, and public-profile-photo privacy guidance is visible | screenshot     |      |
| Add profile photos               | Photos upload and persist after restart                   | screenshot     |      |
| Fail profile photo upload/remove | App shows safe recovery copy without storage paths or provider details | screenshot/log |      |
| Deny photo library permission    | App shows safe permission guidance without dead-ending setup | screenshot |      |
| Continue with uploaded photo     | App reminds user to use only safe, real personal photos and not upload ID documents in this step | screenshot     |      |
| Try setup on slow/failed network | User sees recoverable error                               | screenshot/log |      |

Fail-stop:

- profile can complete without required safety-critical fields
- upload failure silently looks successful
- private storage URL or secret appears in UI
- photo screen implies fake, explicit, document, or misleading photos are acceptable

## 3. Location setup

| Step                                        | Expected result                                                 | Evidence   | Pass |
| ------------------------------------------- | --------------------------------------------------------------- | ---------- | ---- |
| Select location from curated search         | City/location saves and displays correctly                      | screenshot |      |
| Type an unlisted city and choose manual use | Typed city saves without pretending coordinates are known       | screenshot |      |
| Use current location and accept permission  | App requests foreground permission and stores readable location | screenshot |      |
| Use current location and deny permission    | App explains denial and allows manual fallback                  | screenshot |      |
| Return after location permission failure    | Inline notice explains city-only manual entry can continue      | screenshot |      |
| Restart app after location save             | Location persists                                               | screenshot |      |
| Fail location save on bad network           | App shows safe recovery copy without backend details            | screenshot/log |      |

Fail-stop:

- permission denial blocks all onboarding with no fallback
- app saves wrong/blank location as successful
- app exposes raw coordinates where user-facing city is expected
- selected manual/current location does not explain whether city-level or coordinate-based location is being saved

## 4. Verification and OCR

Use test-only document images.

| Step                                      | Expected result                                                  | Evidence       | Pass |
| ----------------------------------------- | ---------------------------------------------------------------- | -------------- | ---- |
| Open verification screen without files    | CTA is disabled or clearly explains missing requirement          | screenshot     |      |
| Upload selfie only                        | App asks for document too                                        | screenshot     |      |
| Upload document only                      | App asks for selfie too                                          | screenshot     |      |
| Submit valid test document                | App calls OCR path and submits pending review, not auto-approved | screenshot/log |      |
| Fail verification upload/submit on bad network | App shows safe recovery copy without storage/RPC/provider details | screenshot/log |      |
| Submit invalid/blank document             | User sees recoverable OCR error                                  | screenshot     |      |
| Submit document with mismatched OCR data  | App submits for manual review instead of claiming verification   | screenshot/log |      |
| Repeat OCR attempts past configured quota | User sees recoverable rate-limit message, not a crash            | screenshot/log |      |
| Submit while signed out/expired session   | App requires sign-in again                                       | screenshot/log |      |

Expected safety behavior:

- verification status becomes pending/review state
- `is_verified` is not set by the client
- provider errors are client-safe
- no OCR provider details or secrets appear in UI
- camera/photo permission prompts use launch-approved copy

Fail-stop:

- document upload auto-approves verification
- OCR works without authenticated session
- repeated OCR calls can bypass quota controls
- raw provider error or secret appears

## 5. Discovery and matching

Prepare Account B as a discoverable test profile.

| Step                                  | Expected result                                                  | Evidence       | Pass |
| ------------------------------------- | ---------------------------------------------------------------- | -------------- | ---- |
| Open Discover as Account A            | Cards load or empty state is clear                               | screenshot     |      |
| Review discovery safety note          | Feed explains preference-based discovery, visibility settings, detail review, and reporting without guaranteeing safety or matches | screenshot     |      |
| Open Discovery filters                | Saved age, distance, and relationship goal load into the modal   | screenshot     |      |
| Review Discovery filter guidance      | Filters explain they guide discovery and do not guarantee matches | screenshot     |      |
| Save Discovery filters                | Updated filters save and Discover uses the new preference values | screenshot/log |      |
| Fail Discovery filter save on bad network | App shows safe recovery copy without backend/provider details | screenshot/log |      |
| Empty Discover feed                   | User sees refresh and adjust-filter recovery actions             | screenshot     |      |
| Empty Discover feed copy              | Empty copy does not pressure user to widen filters before they are comfortable | screenshot     |      |
| Candidate has missing optional fields | UI does not invent fake height, distance, education, or language | screenshot     |      |
| Candidate profile safety cue          | Card uses preference-fit language and reminds users not to share codes, ID photos, or payment info | screenshot     |      |
| Open profile details for no-photo user | Details modal shows a branded fallback and remains usable        | screenshot     |      |
| Open report from profile details      | Report/block form opens with the correct member context          | screenshot     |      |
| Like Account B                        | Like succeeds and no chat opens unless mutual match exists       | screenshot/log |      |
| Fail a swipe action on bad network    | Current card stays available and offers retry                    | screenshot/log |      |
| Pass a profile                        | Profile leaves stack and state persists                          | screenshot     |      |
| Undo last swipe                       | Last swipe is reverted through app flow                          | screenshot     |      |
| Create mutual match                   | Match state appears and chat entry becomes available             | screenshot     |      |

Fail-stop:

- unmatched users can open chat
- UI shows fake profile details as facts
- blocked user remains discoverable

## 6. Messaging and media

Use mutually matched Account A and Account B.

| Step                         | Expected result                                                      | Evidence   | Pass |
| ---------------------------- | -------------------------------------------------------------------- | ---------- | ---- |
| Open conversation from match before first message | Chat composer opens for matched pair without requiring a pre-created empty conversation | screenshot/log |      |
| Review first-message guidance | Empty chat explains that the first text starts the conversation and does not imply a pre-created inbox thread | screenshot |      |
| Send first text message from match-opened chat | Message sends, backend creates/returns the conversation, and the message appears for both accounts | screenshot/log |      |
| Reopen conversation from Messages | Conversation appears after the first real message and reopens with the same message history | screenshot |      |
| Fail text message send on bad network | App shows safe recovery copy without backend/RPC details        | screenshot/log |      |
| Mark conversation read       | Unread count clears for recipient only                               | screenshot |      |
| Fail conversation load/read update | App shows safe recovery copy without backend/RPC details         | screenshot/log |      |
| Turn read receipts off       | Recipient can read without exposing sender-visible read status       | screenshot |      |
| Send image message           | Image uploads inside the active conversation and renders through signed access | screenshot |      |
| Restart and reopen image message | Image still renders through signed access without exposing a raw storage path | screenshot/log |      |
| Try image send after block/unmatch | App blocks the send with safe recovery copy                         | screenshot/log |      |
| Fail image message upload/delete | App shows safe recovery copy without storage path or provider details | screenshot/log |      |
| Review chat media warning    | Composer warns not to send passwords, codes, ID documents, or payment details | screenshot |      |
| Delete message for me        | Message hides only for current user if supported                     | screenshot |      |
| Delete message for everyone  | Sender-only action removes/marks message for both users if supported | screenshot |      |
| Try voice/video controls     | App shows honest unavailable-state UI, not simulated calls           | screenshot |      |
| Use call-screen safety action | Report/block form opens from unavailable voice/video screen          | screenshot |      |
| Open header safety options   | Shield action exposes report, block, and unmatch choices             | screenshot |      |
| Open empty-chat safety CTA   | Empty conversation exposes report-or-leave-chat action               | screenshot |      |

Fail-stop:

- message sends before mutual match
- empty conversation appears in Messages before a real message is sent
- message state changes for the wrong user
- chat image is public or available to blocked/unmatched users
- image message sends without an active conversation-bound upload path
- raw `chat-images` storage path, signed token, or bucket policy detail appears in user-facing UI
- voice/video appears live when no provider is configured
- report/block/unmatch actions are hidden behind unclear navigation

## 7. Report, block, and unmatch

Use Account A reporting Account B.

| Step                                | Expected result                                           | Evidence       | Pass |
| ----------------------------------- | --------------------------------------------------------- | -------------- | ---- |
| Open report modal from chat/profile | Modal shows safety reasons, private-report expectation, and what support receives without asking for passwords/payment/ID documents | screenshot     |      |
| Open report modal from Discovery details | Modal opens with discovery member context                    | screenshot     |      |
| Open report modal from Likes card   | Modal opens with likes/match member context                  | screenshot     |      |
| Open report modal from unavailable call screen | Modal opens from voice/video safety CTA             | screenshot     |      |
| Submit report with block enabled    | Report succeeds and member is blocked                     | screenshot/log |      |
| Submit report with block disabled   | Report succeeds without blocking                          | screenshot/log |      |
| Report with missing/invalid target  | App shows recoverable error                               | screenshot     |      |
| Submit report from each entry point | Chat, profile details, Discovery, Likes, and unavailable-call entry points pass the correct member context without exposing reporter identity | screenshot/log |      |
| Block Account B                     | Account B disappears from discovery and chat access       | screenshot     |      |
| Try to message after block          | Message is prevented                                      | screenshot/log |      |
| Unmatch Account B                   | Match state clears and chat access is removed             | screenshot     |      |

Fail-stop:

- reporter identity is exposed
- block does not remove chat/discovery access
- report claims guaranteed removal
- report succeeds with arbitrary conversation/member mismatch

## 8. Settings and launch-stage controls

| Step                       | Expected result                                                                   | Evidence       | Pass |
| -------------------------- | --------------------------------------------------------------------------------- | -------------- | ---- |
| Open Privacy settings      | Privacy controls load from backend defaults or saved settings                     | screenshot/log |      |
| Toggle each privacy switch | App saves through backend and restores/reports failure clearly                    | screenshot/log |      |
| Hide Profile Visibility    | Profile is hidden from discovery after backend smoke/native verification          | screenshot/log |      |
| Turn Read Receipts off     | Reading a message clears local unread state without showing sender a read receipt | screenshot/log |      |
| Tap Delete Account         | App explains review/retention/status expectations and submits a backend-backed request instead of silently deleting | screenshot/log |      |
| Open Preferences settings  | Saved match preferences load and save with clear success/error feedback           | screenshot/log |      |
| Review Preferences guidance | Preferences explain they guide discovery and do not guarantee matches or outcomes | screenshot |      |
| Open Notification settings | Switches are usable and clearly marked as launch-stage preferences, not proven production delivery | screenshot |      |

Fail-stop:

- privacy switches appear to save but do not persist
- read receipts still show to another member after the setting is off
- destructive account action has no confirmation or support path
- settings bypass backend privacy RPCs

## 9. PM_Web to PM_App consistency

| Step                                             | Expected result                                   | Evidence       | Pass |
| ------------------------------------------------ | ------------------------------------------------- | -------------- | ---- |
| Compare PM_Web waitlist copy to app availability | No fake app-store/live billing claims             | screenshot     |      |
| Check PM_Web waitlist/membership email bodies    | Links do not prefill name, location, or profile data | screenshot/log |      |
| Open Privacy/Terms modals                        | Launch-stage and safety-limit language is visible | screenshot     |      |
| Tap support/waitlist links                       | Links route to approved mailbox or destination    | screenshot/log |      |

Fail-stop:

- website claims production app availability before app launch
- website guarantees verification/safety
- links point to unowned destinations

## Final QA decision

| Gate                      | Decision    | Notes |
| ------------------------- | ----------- | ----- |
| Auth and route protection | pass / fail |       |
| Profile onboarding        | pass / fail |       |
| Location setup            | pass / fail |       |
| Verification and OCR      | pass / fail |       |
| Discovery and matching    | pass / fail |       |
| Messaging and media       | pass / fail |       |
| Report/block/unmatch      | pass / fail |       |
| Settings/privacy controls | pass / fail |       |
| PM_Web consistency        | pass / fail |       |

Launch recommendation:

```text
Recommended decision: hold / staging-only / launch-ready
Tester:
Date:
Critical blockers:
Follow-up owner:
```

## Launch-state notice accessibility QA

Use this section when checking screens that include the reusable `LaunchStateNotice` component.

Covered source surfaces:

- notification settings
- verification upload
- privacy settings
- match preferences
- discovery
- empty matches

Required checks:

- Confirm the visible notice clearly separates launch-stage availability from production-ready proof.
- Confirm the notice does not imply matching, chat, verification, notification delivery, payments, app-store access, or safety operations are live before evidence exists.
- Confirm screen-reader focus announces the notice title and message as one grouped item.
- Confirm the decorative shield icon is not announced separately from the grouped notice copy.
- Confirm the screen-reader hint explains that the note separates currently available features from proof-gated features.
- Confirm native QA or automation can target the default `launch-state-notice` test ID, or a screen-specific override if one is added later.
- Confirm Android/native automation can target the notice root consistently; the reusable notice root is intentionally non-collapsible.
- Confirm the notice remains readable with larger text settings and does not block the primary action on the screen.

Evidence to capture:

- screenshot or short recording of each checked screen
- screen-reader note for at least one representative launch-state notice
- pass/fail note for large-text readability
- any screen where the notice creates crowding, clipping, or unclear hierarchy

Use `docs/evidence/TEMPLATE-native-qa-proof.md` to capture dated emulator/device proof before marking native QA rows as pass in the launch evidence packet.

Screen-specific launch-state notice test IDs:

- `notification-settings-launch-state-notice`
- `verification-upload-launch-state-notice`
- `privacy-settings-launch-state-notice`
- `account-preferences-launch-state-notice`
- `discover-launch-state-notice`
- `empty-matches-launch-state-notice`
