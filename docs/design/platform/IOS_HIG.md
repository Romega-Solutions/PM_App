# iOS Design Spec — Apple Human Interface Guidelines

> One of three platform lenses on the **same** token system (`src/theme/`). See the visual reference: [`../design-tokens.html`](../design-tokens.html) (switch to **iOS**). PinayMate ships iOS via React Native / Expo (managed workflow).

## Token → iOS mapping

| Token / concept | iOS treatment | RN implementation |
|---|---|---|
| Colors | `lightColors` / `darkColors` via `useTheme()` | `useColorScheme()` → palette; honors iOS Appearance once `userInterfaceStyle:"automatic"` |
| Fonts | Lora + DM Sans (2-font system; brand mark = SVG) | `expo-font`; **SF Pro** is the system fallback if a face fails to load |
| Touch target | **44 × 44 pt minimum** (HIG) | `minHeight/minWidth: 44`; add `hitSlop` for small icon buttons |
| Depth | Soft layered **shadow** (not heavy) | `shadowColor/shadowOffset/shadowOpacity/shadowRadius` (iOS reads `shadow*`, ignores `elevation`) |
| Primary CTA | Solid `primary` fill + soft shadow, white `onPrimary` | flat fill; depth via `shadow*` |
| Motion | ease-out / spring, 200–300 ms | Reanimated springs; respect Reduce Motion |
| Navigation | Stack push + **swipe-back**, optional large titles | `expo-router` Stack, `gestureEnabled: true` |
| Edges | Safe area, notch / Dynamic Island, home indicator | `react-native-safe-area-context` (`useSafeAreaInsets`) |
| Status bar | Adapts to theme | `expo-status-bar` `style={isDark ? 'light' : 'dark'}` |
| Corner radius | Soft (`borderRadius` sm4–xl16), pill for primary | `borderRadius` tokens |

## iOS specifics
- **Reduce Motion**: gate spatial animation behind the iOS setting (RN `AccessibilityInfo.isReduceMotionEnabled`).
- **Dynamic Type**: RN `<Text>` scales with the OS text-size setting by default (`allowFontScaling` is on) — keep it on; don't pin `allowFontScaling={false}`.
- **Materials/blur**: use sparingly (`expo-blur`) for sheets/nav; never as the only contrast layer.
- **Haptics**: `expo-haptics` light impact on primary actions (optional, on-brand for a premium feel).

## App Store readiness checklist (design-relevant)
- [ ] All tappable controls ≥ 44 pt (audit small icon buttons → `hitSlop`)
- [ ] Text contrast ≥ 4.5:1 (3:1 large/UI) — covered by `theme.test.ts` for both schemes
- [ ] Dark Mode supported (flip `userInterfaceStyle:"automatic"` after the screen adoption sweep)
- [ ] Dynamic Type respected (no disabled font scaling)
- [ ] Reduce Motion respected
- [ ] Safe-area insets on every screen (no content under notch / home indicator)
- [ ] App icon 1024×1024, no alpha (`assets/images/icon.png`)
- [ ] Launch/splash matches first screen (`expo-splash-screen`)
- [ ] No emoji used as UI icons (lucide only) — **open**: 10 files still use emoji
- [ ] Privacy: App Tracking Transparency prompt only if tracking; privacy nutrition labels accurate
