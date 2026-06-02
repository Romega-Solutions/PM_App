# PinayMate Design Flow Adoption Sweep — Spec (2026-06-03)

## Goal

Upgrade the app screen-by-screen so the existing design system becomes load-bearing: every screen should use scheme-aware tokens, shared UI primitives, accessible touch targets, real loading/error/empty states, and product-grade copy/flow. Keep the PinayMate brand hues (`amihan`, `dalisay`, `luna`) and the premium romantic direction. The work is an adoption and polish sweep, not a rebrand.

## Current Ground Truth

- `src/theme/colors.ts` already exposes `lightColors`, `darkColors`, and `getSemanticColors()`.
- `src/theme/useTheme.ts` already exposes `useTheme()`.
- `app.json` correctly remains `userInterfaceStyle: "light"` until screen adoption is complete.
- The major gap is adoption: many screens still use local `#hex`, `rgba(...)`, static `semanticColors`, fixed dark backgrounds, and duplicated button/card/list styles.
- Recent commits already moved profile-settings into `src/features/settings` and pulled much Supabase access out of screens; the remaining design work should build on that instead of redoing it.

## Design Principles

1. **Use semantic tokens at render time.** Components must prefer `const { colors } = useTheme()` over importing `semanticColors`. Existing `semanticColors` imports are only a compatibility bridge.
2. **Keep brand identity, improve treatment.** Preserve `primary` pink, `secondary` purple, and `accent` blue. Replace ad-hoc gradients, glows, and alpha strings with named roles.
3. **Shared primitives first.** Buttons, icon buttons, inputs, screen shells, settings rows, cards, chips, and badges must be upgraded before broad screen passes.
4. **No user-facing dev artifacts.** SQL instructions, bypass copy, placeholder call flows, fake OTPs, `console.log` actions, and broken countdowns must be removed or made honest.
5. **Accessibility is part of design.** Minimum interactive target is 44 pt/px on iOS/web and 48 dp on Android when feasible. Icon-only controls need labels, roles, states, and hints where useful.
6. **Motion is optional for users.** Splash, tabs, swipes, match modal, chat scroll, and call effects must respect reduce-motion settings.
7. **Routes stay thin.** New or refactored UI belongs in `src/features` or shared components, not route files.

## Approaches Considered

### Option A — Token Replacement Only
Replace hardcoded colors with `useTheme().colors` screen by screen.

**Trade-off:** Fastest visible progress, but it leaves duplicated layouts, undersized touch targets, fake states, and placeholder flows intact. This risks making unfinished UI look superficially themed.

### Option B — Shared Primitives Then Screen Passes
Upgrade foundational controls and app shells first, then migrate screens in groups.

**Trade-off:** Slightly slower first visual payoff, but safer and more consistent. Each later screen pass gets better buttons, inputs, icon buttons, rows, cards, and state components automatically.

### Option C — Full Redesign by Feature
Redesign each major feature end-to-end with new layouts and components.

**Trade-off:** Highest potential visual change, but too broad for the current state. It would mix product decisions, backend drift, component architecture, and styling into one risky sweep.

## Selected Approach

Use **Option B: Shared Primitives Then Screen Passes**.

This matches the audits and current architecture: the app already has a credible theme foundation and feature structure, but too many screens bypass them. The safest path is to make shared components app-store-grade first, then migrate screens by feature group with measurable acceptance criteria.

## Token And Component Contract

### Theme Additions

Add named semantic roles only where existing tokens are not expressive enough. Do not add one-off tokens for a single screen.

Required roles or helpers:

- `brandBackground` or equivalent dark app ground mapped from the current repeated `#0F0814` treatment.
- `brandGradient` or a small gradient helper for the repeated dark app shell gradient.
- translucent surface roles for cards, input fills, footers, overlays, chips, and pressed states.
- `danger`, `dangerBg`, and `dangerInk` usage for delete/account-risk actions.
- tab roles for active pill, inactive icon/text, active icon/text, and tab border.
- optional alpha helper such as `withAlpha(color, alpha)` if the team wants to avoid bloating semantic colors with many opacity variants.

### Shared Primitives

Update or create these before screen work:

- `PrimaryButton`, `SecondaryButton`, `GhostButton`: use `useTheme()`, semantic `on*` colors, disabled state, loading state, and platform feedback.
- `BackButton` and a new shared icon button pattern: 44/48 target, `hitSlop` where needed, `accessibilityRole="button"`, required `accessibilityLabel`.
- `CustomTextInput`: tokenized background/border/placeholder/error/focus states, right-icon touch target, optional helper/error text.
- `AuthLayout` and setup screen scaffold: safe area, scroll behavior, status bar, background, footer, and keyboard handling.
- `AccountProgress`: one accessible progress indicator with a consistent setup step count.
- Settings primitives: `SettingsScreenScaffold`, `SettingsHeader`, `SettingsSection`, `SettingsRow`, `SettingsSwitchRow`, `SettingsActionRow`.
- Matching primitives: tokenized `ActionButtons`, `ProfileCard`, `MatchCard`, `LikesFilter`, modal close button.
- Messaging primitives: `ChatHeader`, `MessageList`, `MessageBubble`, `MessageComposer`, `ChatStateView`, `MediaUploadPreview`.

## Phase 0 — Remove Unshippable Flow Artifacts

This phase comes before visual polish because these issues make screens feel fake even if styled well.

### Verify Email

Files:
- `src/features/auth/screens/VerifyEmailScreen.tsx`
- `src/components/auth/VerifyEmailActions.tsx`
- `src/components/auth/VerifyEmailHeader.tsx`

Required changes:
- Remove user-facing Supabase SQL/manual setup copy.
- Remove or hide email verification bypass copy from the primary user path.
- Replace emoji UI markers with lucide icons or plain text.
- Add accessible labels/roles for manual check/resend/back actions.
- Keep error recovery visible: retry, resend, and change email should be clear and non-developer-facing.

### Verification Success

Files:
- `src/features/auth/screens/VerificationSuccessScreen.tsx`
- `src/components/auth/VerificationSuccessHeader.tsx`

Required changes:
- Fix the `0s` countdown state.
- Make the continue button perform the same route transition as the automatic redirect or remove the duplicate affordance.
- Use semantic success tokens.

### Verify Phone

File:
- `app/(auth)/verify-phone.tsx`

Required changes:
- Either move it into `src/features/auth/screens/VerifyPhoneScreen.tsx` and make the screen honest, or remove it from active navigation until real phone verification exists.
- No fake masked phone, fake OTP, or placeholder verification should appear as a shippable flow.
- If retained, OTP cells need labels, focus management, resend state, and safe-area handling.

## Phase 1 — Shared Primitives And Layouts

### Shared UI

Files:
- `src/components/ui/PrimaryButton.tsx`
- `src/components/ui/SecondaryButton.tsx`
- `src/components/ui/GhostButton.tsx`
- `src/components/ui/BackButton.tsx`
- `src/components/forms/CustomTextInput.tsx`
- `src/components/forms/FormDivider.tsx`

Required changes:
- Replace static token imports with `useTheme()`.
- Enforce touch targets and labels for icon-only controls.
- Make loading and disabled states visually distinct and accessible.
- Keep text sizing fixed from typography tokens, not viewport-scaled type.

### Auth And Account Shared Components

Files:
- `src/components/auth/AuthLayout.tsx`
- `src/components/auth/AuthHeader.tsx`
- `src/components/auth/SocialSignInButton.tsx`
- `src/components/auth/SignUpPrompt.tsx`
- `src/components/auth/VerifyEmailActions.tsx`
- `src/components/auth/VerifyEmailHeader.tsx`
- `src/components/auth/VerificationSuccessHeader.tsx`
- `src/components/account/AccountHeader.tsx`
- `src/components/account/AccountProgress.tsx`
- `src/components/account/GenderOption.tsx`
- `src/components/account/PhotoPicker.tsx`
- `src/components/account/VerificationStep.tsx`
- `src/components/account/VerificationProcessingCard.tsx`
- `src/components/account/UserPreferences.tsx`

Required changes:
- Remove emoji UI icons and text checkmarks from app controls.
- Create tokenized badges, radio cards, status cards, and photo tiles.
- Give photo remove/replace controls a real touch target and labels.
- Make `AccountProgress` consistently use the same setup step count across setup screens.

### Root And Main Layout

Files:
- `app/_layout.tsx`
- `app/index.tsx`
- `app/(main)/_layout.tsx`

Required changes:
- Replace hardcoded spinner/splash/tab colors with `useTheme()`.
- Add reduce-motion-aware navigation/splash/tab behavior.
- Move custom tab UI out of the route layout into shared navigation components so the route file is no longer a 271-line UI module.

## Phase 2 — Auth And Account Screen Sweep

### Welcome

File:
- `app/(auth)/welcome.tsx`

Required changes:
- Tokenize background, logo treatment, text, overlays, and CTA surfaces.
- Make Terms/Privacy references tappable and routed.
- Remove viewport-scaled font sizing and negative letter spacing.
- Keep first-screen brand signal strong but reduce heavy glow treatment.

### User Type Selection

File:
- `app/(auth)/user-type-selection.tsx`

Required changes:
- Move screen body into `src/features/auth/screens/UserTypeSelectionScreen.tsx`; keep route thin.
- Tokenize cards and selected state.
- Replace emoji lock and text checkmark with lucide icons.
- Add radio group context and selected state labels.

### Sign In And Sign Up

Files:
- `src/features/auth/screens/SignInScreen.tsx`
- `src/features/auth/screens/SignUpScreen.tsx`

Required changes:
- Rely on upgraded auth primitives.
- Make forgot-password link a real touch target.
- Make Google sign-in honest: either visually disabled with clear availability or wired to the real provider.
- Align password requirements between sign-in validation copy and sign-up requirements.
- Keep the user-type badge but route it through a shared tokenized badge.

### Terms And Privacy

Files:
- `app/(auth)/terms.tsx`
- `app/(auth)/privacy.tsx`

Required changes:
- Replace placeholder wrappers with readable scroll screens using auth/legal scaffold.
- Add back affordance, section headings, and accessible text hierarchy.
- Ensure the welcome screen links reach these routes.

### Account Setup

Files:
- `src/features/account/screens/AccountBasicInfoScreen.tsx`
- `src/features/account/screens/AccountProfilePhotosScreen.tsx`
- `src/features/account/screens/LocationScreen.tsx`
- `src/features/account/screens/PreferencesScreen.tsx`
- `src/features/account/screens/VerificationUploadScreen.tsx`
- `src/features/account/screens/WelcomeCompleteScreen.tsx`

Required changes:
- Normalize setup scaffold, footer, background, and progress count.
- Replace lock/helper emojis with lucide icons or accessible text.
- Make current-location behavior honest; do not show a fake location permission path.
- Make age/distance sliders responsive and accessible.
- Make verification optional behavior clear: primary unavailable plus ghost skip should not feel contradictory.
- Make completion copy user-type-aware instead of generic.

## Phase 3 — Main, Matching, Profile, And Settings Sweep

### Main Tabs

Files:
- `app/(main)/_layout.tsx`
- new shared navigation components under `src/components/navigation/`

Required changes:
- Move tab icon/pill UI into shared components.
- Tokenize active/inactive tab states.
- Use minimum touch target visuals and accessibility labels/states.
- Keep badges planned only when backed by unread data.

### Discover And Likes

Files:
- `src/features/matching/screens/DiscoverScreen.tsx`
- `src/features/matching/screens/LikesScreen.tsx`
- `src/features/matching/components/ActionButtons.tsx`
- `src/features/matching/components/ProfileCard.tsx`
- `src/features/matching/components/ProfileDetailsModal.tsx`
- `src/features/matching/components/MatchCard.tsx`
- `src/features/matching/components/MatchModal.tsx`
- `src/features/matching/components/LikesFilter.tsx`
- `src/features/matching/components/EmptyMatchesState.tsx`

Required changes:
- Tokenize shells, profile cards, badges, chips, overlays, and buttons.
- Add disabled visual/accessibility state to action buttons.
- Respect reduced motion for swipe and match modal effects.
- Make modal close buttons at least 44/48 target and expose expanded state for expandable sections.
- Enrich empty states with clear recovery actions.
- Raise `MatchCard` action buttons above 44 px and include accessible labels.
- Add selected state to likes filters.

### Profile And Edit Profile

Files:
- `src/features/profile/screens/ProfileScreen.tsx`
- `src/features/profile/screens/EditProfileScreen.tsx`
- `src/features/profile/components/ProfileHeader.tsx`
- `src/features/profile/components/ProfileMenuList.tsx`
- `src/features/profile/components/ProfileEditForm.tsx`
- `src/features/profile/components/ProfilePhotoSection.tsx`

Required changes:
- Fix the settings icon that looks interactive but has no action.
- Tokenize profile header, cards, menu rows, verification badges, forms, and photo actions.
- Add dirty-state/save-state feedback to edit profile.
- Give avatar/profile images meaningful accessibility metadata or mark decorative images as hidden.
- Replace repetitive card-heavy rows with cleaner grouped settings where appropriate.

### Settings

Files:
- `src/features/settings/screens/PreferencesScreen.tsx`
- `src/features/settings/screens/PrivacyScreen.tsx`
- `src/features/settings/screens/NotificationsScreen.tsx`
- `src/features/settings/screens/HelpScreen.tsx`
- `src/features/settings/screens/AboutScreen.tsx`
- `src/features/settings/hooks/useMatchPreferences.ts`
- `src/features/settings/api/settingsApi.ts`

Required changes:
- Use shared settings scaffold and rows.
- Tokenize switches, section titles, inputs, delete actions, and contact cards.
- Replace local-only privacy/notification state with persistent state or make unsaved/local state explicit.
- Add confirmation flow for delete account.
- Remove mock `console.log` help actions or make them visibly unavailable.
- Replace footer emoji in About and update stale copyright year.

## Phase 4 — Messaging And Calls Sweep

### Messages List

Files:
- `src/features/messaging/screens/MessagesScreen.tsx`
- `src/features/messaging/components/ConversationCard.tsx`
- `src/features/messaging/components/ActiveUserCard.tsx`

Required changes:
- Tokenize all local palettes and card surfaces.
- Wire filter type to actual filtered display or remove the segmented filter until it works.
- Add offline/reconnect banner, refresh affordance, and skeleton list.
- Improve search accessibility.
- Include unread count and time in conversation card accessibility labels.

### Chat

Files:
- `src/features/messaging/screens/ChatScreen.tsx`
- `src/features/messaging/hooks/useMessages.ts`
- `src/features/messaging/hooks/useMessageUpload.ts`
- `src/features/messaging/hooks/useChatRealtime.ts`
- new messaging components and hooks listed below

Required decomposition:
- `screens/ChatScreen.tsx`: orchestration only.
- `components/ChatHeader.tsx`: back, identity, presence, call actions, more menu trigger.
- `components/MessageList.tsx`: scroll behavior, empty state, date separators, typing indicator.
- `components/MessageBubble.tsx`: text/image/deleted/failed/read status rendering.
- `components/MessageComposer.tsx`: input, attach, emoji trigger, send, disabled/pending/upload states.
- `components/MediaUploadPreview.tsx`: selected media, progress, cancel, retry.
- `components/ChatStateView.tsx`: loading, error, offline, reconnecting, empty conversation.
- `hooks/useChatRouteParams.ts`: route param normalization.
- `hooks/useChatActions.ts`: send text/image, retry failed messages, restore failed draft.

Required behavior cleanup:
- Replace `window.location.reload()` with native-safe refresh behavior.
- Add failed-message retry UI.
- Add upload progress preview.
- Make all header/composer buttons 44/48 target with labels/states.
- Announce typing state for screen readers.
- Keep the dark, intimate chat look, but source colors from tokens instead of file-local constants.

### Voice And Video Calls

Files:
- `src/features/messaging/screens/VoiceCallScreen.tsx`
- `src/features/messaging/screens/VideoCallScreen.tsx`

Required changes:
- Tokenize call surfaces, gradients, overlays, and controls.
- Add labels, roles, states, and hints for mute, speaker, camera, fullscreen, and end-call controls.
- Stabilize small-screen safe-area layout, especially video picture-in-picture.
- Keep simulated call states visually honest until real call signaling exists.
- Add permission denied, reconnecting, failed, busy/no-answer, and ended states when the backend/session model exists.

## Documentation Updates

Update docs that currently encode old hardcoded design values:

- `docs/chat/chatUIFlow.md`: replace hardcoded chat palette references with theme-token language.
- `docs/design/DESIGN_SYSTEM_AUDIT_2026-06-01.md`: add a follow-up note once adoption begins.
- `docs/design/platform/*.md`: keep the checklists aligned with actual completed adoption.

## Verification Strategy

Each phase should run:

- `npx tsc --noEmit`
- `npm run lint`
- `npm test`

For UI-heavy phases, also run:

- `npm run web` or `npm start` and manually inspect at common mobile widths.
- iOS/Android simulator spot checks for safe area, status bar, touch targets, and reduced motion where available.

Acceptance checks:

- No new hardcoded `#hex` or raw `rgba(...)` outside `src/theme` or explicitly approved token helpers.
- No new `semanticColors` imports in migrated components.
- No emoji used as UI icons.
- Icon-only controls have labels and roles.
- Controls meet 44/48 touch target expectations or have documented `hitSlop`.
- Reduced-motion behavior exists for newly touched animation-heavy screens.
- Route files remain or become thin wrappers.

## Out Of Scope

- Rebranding or changing `amihan`, `dalisay`, or `luna` hues.
- Enabling `userInterfaceStyle: "automatic"` before the adoption sweep is complete.
- Solving Supabase schema drift, except where UI must avoid fake or impossible states.
- Building a real phone verification provider.
- Building real voice/video call signaling.
- Adding payments, premium plans, or new product modules.

## Multi-Agent Audit Inputs

This spec was informed by four read-only parallel sweeps:

1. Shared primitives and layout.
2. Auth, onboarding, and account setup.
3. Main app, matching, profile, and settings.
4. Messaging and calls.

The agents did not edit files. Their reports agreed on the same implementation order: shared primitives and unshippable flow cleanup first, feature screen passes second, dark-mode activation last.
