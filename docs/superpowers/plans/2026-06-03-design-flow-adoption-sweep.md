# Design Flow Adoption Sweep Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Apply the design-flow adoption sweep from the approved spec so the app uses scheme-aware tokens, shared primitives, accessible controls, and honest product states.

**Architecture:** Work starts with shared tokens and primitives, then screen families migrate to those primitives. Keep route files thin, keep `app.json` light-only until adoption is complete, and split large components only when a touched screen already exceeds safe complexity.

**Tech Stack:** Expo SDK 54, React Native 0.81, TypeScript, expo-router, Zustand/TanStack Query, `expo-linear-gradient`, `lucide-react-native`, Jest.

---

## File Responsibility Map

- `src/theme/colors.ts`: semantic color roles and cross-screen token helpers.
- `src/theme/colorUtils.ts`: reusable alpha helper for tokenized translucent colors.
- `src/components/ui/*`: shared button and icon-button behavior.
- `src/components/forms/*`: shared input/divider behavior.
- `src/components/auth/*`: auth layout/header/action primitives.
- `src/components/account/*`: setup progress/cards/photo/status primitives.
- `src/components/navigation/*`: extracted main-tab UI.
- `src/components/settings/*`: shared settings shell/row primitives.
- `src/features/auth/*` and `app/(auth)/*`: auth/onboarding flow cleanup.
- `src/features/account/*`: account setup token/accessibility cleanup.
- `src/features/settings/*`: settings shell, rows, persistence honesty.
- `src/features/matching/*`: matching cards/actions/modals token/accessibility cleanup.
- `src/features/profile/*`: profile/edit profile token/accessibility cleanup.
- `src/features/messaging/*`: messages, chat, and call screen cleanup.
- `docs/chat/chatUIFlow.md`: update old hardcoded-token guidance.

## Task 1: Theme Helpers And Shared UI Primitives

**Files:**
- Create: `src/theme/colorUtils.ts`
- Modify: `src/theme/colors.ts`
- Modify: `src/theme/index.ts`
- Modify: `src/components/ui/PrimaryButton.tsx`
- Modify: `src/components/ui/SecondaryButton.tsx`
- Modify: `src/components/ui/GhostButton.tsx`
- Modify: `src/components/ui/BackButton.tsx`
- Modify: `src/components/forms/CustomTextInput.tsx`
- Modify: `src/components/forms/FormDivider.tsx`
- Test: `src/theme/__tests__/theme.test.ts`

- [x] Add `withAlpha(hex, alpha)` tests to `src/theme/__tests__/theme.test.ts`.
- [x] Run `npm test -- src/theme/__tests__/theme.test.ts` and confirm the new tests fail before adding the helper.
- [x] Implement `src/theme/colorUtils.ts` with clamped alpha conversion for 3-digit and 6-digit hex colors.
- [x] Export `withAlpha` from `src/theme/index.ts`.
- [x] Add app-shell semantic roles to both light and dark palettes: `brandBackground`, `brandSurface`, `brandSurfaceElevated`, `brandBorder`, `brandOverlay`, `brandScrim`, `tabBar`, `tabBarBorder`, `tabActive`, `tabInactive`, `chip`, `chipBorder`, `danger`, `dangerBg`, `dangerInk`.
- [x] Update theme contract tests so `lightColors` and `darkColors` still expose the same keys.
- [x] Convert shared buttons and form controls to `useTheme()` and `withAlpha()`.
- [x] Make `BackButton` and right-side input controls meet 44/48 touch target expectations or use `hitSlop`.
- [x] Run `npm test -- src/theme/__tests__/theme.test.ts`.
- [x] Run `npx tsc --noEmit`.

## Task 2: Auth And Account Flow Cleanup

**Files:**
- Modify: `src/components/auth/AuthLayout.tsx`
- Modify: `src/components/auth/AuthHeader.tsx`
- Modify: `src/components/auth/SocialSignInButton.tsx`
- Modify: `src/components/auth/SignUpPrompt.tsx`
- Modify: `src/components/auth/VerifyEmailActions.tsx`
- Modify: `src/components/auth/VerifyEmailHeader.tsx`
- Modify: `src/components/auth/VerificationSuccessHeader.tsx`
- Modify: `src/components/account/AccountHeader.tsx`
- Modify: `src/components/account/AccountProgress.tsx`
- Modify: `src/components/account/GenderOption.tsx`
- Modify: `src/components/account/PhotoPicker.tsx`
- Modify: `src/components/account/VerificationStep.tsx`
- Modify: `src/components/account/VerificationProcessingCard.tsx`
- Modify: `src/components/account/UserPreferences.tsx`
- Modify: `app/(auth)/welcome.tsx`
- Modify: `app/(auth)/user-type-selection.tsx`
- Modify: `app/(auth)/terms.tsx`
- Modify: `app/(auth)/privacy.tsx`
- Modify: `app/(auth)/verify-phone.tsx`
- Modify: `src/features/auth/screens/SignInScreen.tsx`
- Modify: `src/features/auth/screens/SignUpScreen.tsx`
- Modify: `src/features/auth/screens/VerifyEmailScreen.tsx`
- Modify: `src/features/auth/screens/VerificationSuccessScreen.tsx`
- Modify: `src/features/account/screens/*.tsx`

- [x] Remove user-facing Supabase SQL/manual setup copy from verify-email screens.
- [x] Remove verification-bypass copy from the primary user path.
- [x] Fix verification success countdown and continue action.
- [x] Make verify-phone honest: either a non-production placeholder with clear unavailable state or a route that redirects away from the fake OTP flow.
- [x] Tokenize auth/account shared components with `useTheme()` and `withAlpha()`.
- [x] Replace emoji UI markers with lucide icons or accessible text.
- [x] Link welcome Terms/Privacy references to real routes.
- [x] Normalize account setup progress counts and scaffold styles.
- [x] Add/fix accessibility labels for photo remove/replace, verification cards, radios, sliders, and OTP actions.
- [x] Run `npx tsc --noEmit`.
- [x] Run `npm run lint`.

## Task 3: Main Navigation, Settings, Matching, And Profile

**Files:**
- Create: `src/components/navigation/MainTabIcon.tsx`
- Create: `src/components/settings/SettingsScreenScaffold.tsx`
- Create: `src/components/settings/SettingsRow.tsx`
- Modify: `app/(main)/_layout.tsx`
- Modify: `src/features/settings/screens/PreferencesScreen.tsx`
- Modify: `src/features/settings/screens/PrivacyScreen.tsx`
- Modify: `src/features/settings/screens/NotificationsScreen.tsx`
- Modify: `src/features/settings/screens/HelpScreen.tsx`
- Modify: `src/features/settings/screens/AboutScreen.tsx`
- Modify: `src/features/matching/screens/DiscoverScreen.tsx`
- Modify: `src/features/matching/screens/LikesScreen.tsx`
- Modify: `src/features/matching/components/*.tsx`
- Modify: `src/features/profile/screens/ProfileScreen.tsx`
- Modify: `src/features/profile/screens/EditProfileScreen.tsx`
- Modify: `src/features/profile/components/*.tsx`

- [x] Move custom tab icon/pill UI out of `app/(main)/_layout.tsx`.
- [x] Tokenize main tab states and add accessible selected/label states.
- [x] Build shared settings scaffold and rows.
- [x] Migrate settings screens to shared settings components.
- [x] Make privacy/notification state honest: persist where supported or communicate local-only pending state.
- [x] Add delete-account confirmation UI.
- [x] Remove mock help `console.log` actions or mark them unavailable.
- [x] Tokenize matching cards/actions/modals and fix undersized close/action buttons.
- [x] Add reduced-motion-friendly paths for swipe/match modal effects.
- [x] Fix Profile settings icon behavior and edit-profile dirty/save feedback.
- [x] Run `npx tsc --noEmit`.
- [x] Run `npm run lint`.

## Task 4: Messaging, Chat Decomposition, Calls, And Docs

**Files:**
- Modify: `src/features/messaging/screens/MessagesScreen.tsx`
- Modify: `src/features/messaging/components/ConversationCard.tsx`
- Modify: `src/features/messaging/components/ActiveUserCard.tsx`
- Modify: `src/features/messaging/screens/ChatScreen.tsx`
- Create: `src/features/messaging/components/ChatHeader.tsx`
- Create: `src/features/messaging/components/MessageList.tsx`
- Create: `src/features/messaging/components/MessageBubble.tsx`
- Create: `src/features/messaging/components/MessageComposer.tsx`
- Create: `src/features/messaging/components/ChatStateView.tsx`
- Modify: `src/features/messaging/screens/VoiceCallScreen.tsx`
- Modify: `src/features/messaging/screens/VideoCallScreen.tsx`
- Modify: `docs/chat/chatUIFlow.md`

- [x] Tokenize messages list, active users, and conversation cards.
- [x] Make messages filter either functionally filter results or visibly remove the nonfunctional filter behavior.
- [x] Add offline/reconnect, refresh, skeleton, and accessible search affordances where data already supports them.
- [x] Split `ChatScreen.tsx` into orchestration plus header/list/bubble/composer/state components.
- [x] Replace `window.location.reload()` with native-safe refresh behavior.
- [x] Add failed-message retry, upload preview/progress, and accessible typing announcements where current hooks support them.
- [x] Tokenize voice/video call screens and add control labels/roles/states.
- [x] Keep call screens honest about simulated state until real signaling exists.
- [x] Update chat docs to reference theme tokens, not hardcoded colors.
- [x] Run `npx tsc --noEmit`.
- [x] Run `npm run lint`.

## Final Verification

- [x] Run `npx tsc --noEmit`.
- [x] Run `npm run lint`.
- [x] Run `npm test`.
- [x] Run `npm run build:web` if TypeScript, lint, and Jest pass.
- [x] Run hardcoded-token scan:

```bash
rg -n "#[0-9A-Fa-f]{3,8}|rgba\\(" app src --glob '!src/theme/**' --glob '!**/__tests__/**'
```

- [x] Review remaining hits and document any intentional exceptions.
- [x] Run `git status --short`.

## Completion Notes

- 2026-06-03: Completed the active implementation sweep in `feat/design-system-overhaul`.
- Added focused regression checks for the user-type route boundary, sign-in/sign-up auth availability details, and the filters modal unavailable state.
- Final verification passed: `npx tsc --noEmit`, `npm run lint`, `npm test -- --runInBand`, `npm run build:web`.
- Hardcoded token scan returned no `#hex` or `rgba(...)` hits in `app` or `src` outside `src/theme/**` and tests.
