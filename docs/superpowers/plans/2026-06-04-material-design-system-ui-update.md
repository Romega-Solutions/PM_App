# Material Design System UI Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Encode the approved PinayMate UI direction into the shared React Native design system, then migrate the app's shared UI primitives and high-impact screens to consistent Material-aligned spacing, touch targets, icons, and accessibility rules.

**Architecture:** Treat `src/theme` as the single source of truth for spacing, icon sizing, touch targets, component heights, and motion. Shared UI components consume those tokens first; feature screens then compose those components and only keep screen-specific layout.

**Tech Stack:** Expo SDK 54, React Native 0.81, TypeScript, expo-router, lucide-react-native, Jest static/theme tests.

---

## Approved Visual Direction

Use the user's selected visual companion choices:

- Welcome/User Type: `A` warm photo cover.
- Auth Forms: `A` warm stacked forms.
- Verification: `B` task checklist.
- Account Basics: `A` sticky wizard.
- Photos/Verification Upload: `C` studio builder.
- Location/Complete: `C` ready-to-discover transition.
- Discover: `C` editorial stack.
- Profile Details/Match Modal: `C` cinematic match.
- Likes: `A` filtered grid.
- Messages: `A` active strip.
- Chat: `A` warm bubble chat.
- Calls: `A` focused voice/video call.
- Profile/Edit: `B` editable cards.
- Settings/Filters/Help: `A` grouped settings.

## Google/Material Rules To Encode

- Touch targets: Android/Material floor is `48dp x 48dp`; iOS floor remains `44pt x 44pt`.
- Icon visual size: default UI/navigation icons use `24dp`; dense metadata can use `16-20dp` inside a compliant touch container.
- Touch spacing: neighboring touch targets should keep at least `8dp` separation where layout allows.
- Spacing rhythm: use an 8dp grid for layout and 4dp for fine adjustments.
- Accessibility: icon-only controls must expose accessible labels, role, and state where relevant.
- Motion: interaction animations stay in the `150-300ms` range and respect reduced motion where animated.

## Files

- Modify: `src/shared/utils/spacing.ts`
  - Add Material-style spacing aliases and layout tokens while preserving existing keys.
- Modify: `src/theme/iconSizes.ts`
  - Add semantic icon tokens for `metadata`, `control`, `navigation`, `feature`, `hero`.
- Create: `src/theme/interaction.ts`
  - Export touch target, component size, hit slop, stroke width, and motion tokens.
- Modify: `src/theme/index.ts`
  - Re-export `interaction`, `touchTargets`, `componentSizes`, `hitSlop`, `strokeWidths`, and `motion`.
- Modify: `src/theme/__tests__/theme.test.ts`
  - Add token tests that prove the Material floors are encoded.
- Modify: `src/components/ui/PrimaryButton.tsx`
  - Replace hardcoded `56`, icon size, and gap values with theme tokens.
- Modify: `src/components/ui/SecondaryButton.tsx`
  - Replace hardcoded `56`, shadows, and gap values with theme tokens.
- Modify: `src/components/ui/GhostButton.tsx`
  - Replace mixed platform heights and literal `10` gap with theme tokens.
- Modify: `src/components/ui/BackButton.tsx`
  - Use touch target and hit slop tokens.
- Modify: `src/components/navigation/MainTabIcon.tsx`
  - Use semantic navigation icon, navigation pill, stroke width, and radius tokens.
- Modify: `src/components/settings/SettingsRow.tsx`
  - Use `Pressable`, tokenized icon container, touch target, row spacing, and accessibility hints.
- Modify as second pass: selected high-impact screen components under `src/features/matching`, `src/features/messaging`, `src/features/profile`, `src/features/account`, and auth route wrappers.

---

### Task 1: Material Interaction Tokens

**Files:**
- Modify: `src/theme/__tests__/theme.test.ts`
- Create: `src/theme/interaction.ts`
- Modify: `src/theme/iconSizes.ts`
- Modify: `src/shared/utils/spacing.ts`
- Modify: `src/theme/index.ts`

- [x] **Step 1: Write failing token tests**

Append tests that import the new token exports:

```ts
import {
  touchTargets,
  componentSizes,
  hitSlop,
  strokeWidths,
  motion,
  spacing,
  iconSizes,
} from "@/src/theme";

describe("Material interaction tokens", () => {
  it("encodes Material and platform touch target floors", () => {
    expect(touchTargets.android).toBeGreaterThanOrEqual(48);
    expect(touchTargets.material).toBe(48);
    expect(touchTargets.ios).toBeGreaterThanOrEqual(44);
    expect(componentSizes.iconButton).toBeGreaterThanOrEqual(touchTargets.material);
    expect(componentSizes.compactControl).toBeGreaterThanOrEqual(touchTargets.ios);
  });

  it("keeps icons on semantic Material-friendly sizes", () => {
    expect(iconSizes.navigation).toBe(24);
    expect(iconSizes.control).toBe(24);
    expect(iconSizes.metadata).toBe(16);
    expect(iconSizes.hero).toBeGreaterThanOrEqual(32);
  });

  it("keeps spacing and hit slop on the 4/8dp rhythm", () => {
    expect(spacing.touchGap).toBe(8);
    expect(spacing.screen).toBe(24);
    expect(hitSlop.sm).toEqual({ top: 8, right: 8, bottom: 8, left: 8 });
    expect(hitSlop.md).toEqual({ top: 12, right: 12, bottom: 12, left: 12 });
  });

  it("keeps strokes and motion consistent", () => {
    expect(strokeWidths.default).toBe(2);
    expect(strokeWidths.emphasis).toBe(2.5);
    expect(motion.fast).toBeGreaterThanOrEqual(150);
    expect(motion.standard).toBeLessThanOrEqual(300);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npm test -- src/theme/__tests__/theme.test.ts --runInBand`

Expected: FAIL because `touchTargets`, `componentSizes`, `hitSlop`, `strokeWidths`, `motion`, and the new semantic icon/spacing keys are not exported yet.

- [x] **Step 3: Implement tokens**

Add `src/theme/interaction.ts`:

```ts
export const touchTargets = {
  ios: 44,
  android: 48,
  material: 48,
} as const;

export const hitSlop = {
  sm: { top: 8, right: 8, bottom: 8, left: 8 },
  md: { top: 12, right: 12, bottom: 12, left: 12 },
  lg: { top: 16, right: 16, bottom: 16, left: 16 },
} as const;

export const componentSizes = {
  compactControl: 44,
  iconButton: 48,
  button: 56,
  input: 56,
  tabIconPillWidth: 56,
  tabIconPillHeight: 40,
  settingsRowMinHeight: 64,
} as const;

export const strokeWidths = {
  subtle: 1.75,
  default: 2,
  emphasis: 2.5,
  selected: 3,
} as const;

export const motion = {
  fast: 150,
  standard: 220,
  expressive: 280,
} as const;

export const interaction = {
  touchTargets,
  hitSlop,
  componentSizes,
  strokeWidths,
  motion,
} as const;
```

Extend `src/shared/utils/spacing.ts` without removing existing keys:

```ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  fine: 4,
  touchGap: 8,
  related: 12,
  field: 16,
  card: 16,
  section: 24,
  screen: 24,
  hero: 48,
} as const;
```

Extend `src/theme/iconSizes.ts` without removing existing keys:

```ts
export const iconSizes = {
  xs: 16,
  sm: 18,
  md: 20,
  base: 24,
  lg: 28,
  xl: 32,
  metadata: 16,
  chip: 18,
  inline: 20,
  control: 24,
  navigation: 24,
  feature: 28,
  hero: 32,
} as const;
```

Re-export the new tokens from `src/theme/index.ts`.

- [x] **Step 4: Run test to verify it passes**

Run: `npm test -- src/theme/__tests__/theme.test.ts --runInBand`

Expected: PASS.

---

### Task 2: Shared Buttons and Navigation

**Files:**
- Modify: `src/components/ui/PrimaryButton.tsx`
- Modify: `src/components/ui/SecondaryButton.tsx`
- Modify: `src/components/ui/GhostButton.tsx`
- Modify: `src/components/ui/BackButton.tsx`
- Modify: `src/components/navigation/MainTabIcon.tsx`

- [x] **Step 1: Add static test for token usage**

Create or extend a static design-system test to assert these shared files no longer hardcode `minHeight: 56`, `width: 44`, `height: 44`, `size={22}`, or `hitSlop={8}` where a token exists.

- [x] **Step 2: Run test to verify it fails**

Run: `npm test -- src/theme/__tests__/theme.test.ts src/components/ui/__tests__/design-system.static.test.ts --runInBand`

Expected: FAIL before component migration.

- [x] **Step 3: Migrate shared components**

Use:

- `theme.componentSizes.button` for filled/tonal button height.
- `theme.componentSizes.iconButton` for icon-only controls.
- `theme.hitSlop.sm` or `theme.hitSlop.md` for small visible controls.
- `theme.iconSizes.navigation` and `theme.iconSizes.control` for icons.
- `theme.strokeWidths.default` and `theme.strokeWidths.emphasis` for lucide icons.
- `theme.spacing.touchGap`, `theme.spacing.field`, `theme.spacing.card`, and `theme.spacing.screen` for internal layout.

- [x] **Step 4: Run static and type checks**

Run:

```bash
npm test -- src/theme/__tests__/theme.test.ts src/components/ui/__tests__/design-system.static.test.ts --runInBand
npx tsc --noEmit
```

Expected: PASS.

---

### Task 3: High-Impact Screen Migration

**Files:**
- Modify: `app/(auth)/welcome.tsx`
- Modify: `src/features/auth/screens/SignInScreen.tsx`
- Modify: `src/features/auth/screens/SignUpScreen.tsx`
- Modify: `src/features/auth/screens/UserTypeSelectionScreen.tsx`
- Modify: `src/features/account/screens/AccountBasicInfoScreen.tsx`
- Modify: `src/features/account/screens/AccountProfilePhotosScreen.tsx`
- Modify: `src/features/account/screens/LocationScreen.tsx`
- Modify: `src/features/account/screens/VerificationUploadScreen.tsx`
- Modify: `src/features/account/screens/WelcomeCompleteScreen.tsx`
- Modify: `src/features/matching/screens/DiscoverScreen.tsx`
- Modify: `src/features/matching/components/ProfileCard.tsx`
- Modify: `src/features/matching/components/ProfileDetailsModal.tsx`
- Modify: `src/features/matching/components/MatchModal.tsx`
- Modify: `src/features/matching/screens/LikesScreen.tsx`
- Modify: `src/features/messaging/screens/MessagesScreen.tsx`
- Modify: `src/features/messaging/screens/ChatScreen.tsx`
- Modify: `src/features/messaging/screens/VoiceCallScreen.tsx`
- Modify: `src/features/messaging/screens/VideoCallScreen.tsx`
- Modify: `src/features/profile/screens/ProfileScreen.tsx`
- Modify: `src/features/profile/screens/EditProfileScreen.tsx`
- Modify: `src/features/settings/screens/*.tsx`
- Modify: `app/(modals)/filters.tsx`

- [ ] **Step 1: Migrate one screen group at a time**

Foundation/high-impact controls completed in this pass: auth forgot-password link, settings scaffold header, chat header, message composer, discover action buttons, and profile details modal controls.

For each group, apply the approved selected layout direction and consume the shared tokens first. Keep custom visual choices local only when they represent screen identity, not baseline spacing or icon sizing.

- [ ] **Step 2: Preserve accessibility**

Every icon-only `Pressable`/`TouchableOpacity` must have:

```tsx
accessibilityRole="button"
accessibilityLabel="Specific action label"
hitSlop={theme.hitSlop.sm}
```

Controls with selected/disabled/loading state must also expose `accessibilityState`.

- [ ] **Step 3: Verify each screen group**

Run targeted tests for screens with static tests, then run full checks.

---

### Task 4: Final Verification

- [x] **Step 1: Run typecheck**

Run: `npx tsc --noEmit`

Expected: exit 0.

- [x] **Step 2: Run lint**

Run: `npm run lint`

Expected: exit 0.

- [x] **Step 3: Run tests**

Run: `npm test -- --runInBand`

Expected: exit 0.

- [x] **Step 4: Run web export**

Run: `npm run build:web`

Expected: exit 0.

- [ ] **Step 5: Manual UI pass**

Check the app at mobile widths for:

- No clipped text inside buttons or chips.
- No overlapping cards, text, icons, headers, or tab controls.
- All icon-only controls meet 44/48 target rules.
- Navigation icons use one visual family and consistent stroke.
- Screen rhythm matches the approved A/B/C choices.
