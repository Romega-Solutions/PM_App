# Android Design Spec — Material 3

> One of three platform lenses on the **same** token system (`src/theme/`). See the visual reference: [`../design-tokens.html`](../design-tokens.html) (switch to **Android**). PinayMate ships Android via React Native / Expo (managed workflow).

## Token → Android mapping

| Token / concept | Android (Material 3) treatment | RN implementation |
|---|---|---|
| Colors | `lightColors` / `darkColors` via `useTheme()` | `useColorScheme()` → palette; honors system dark theme once `userInterfaceStyle:"automatic"` |
| Fonts | Lora + DM Sans (2-font system; brand mark = SVG) | `expo-font`; **Roboto** is the system fallback |
| Touch target | **48 × 48 dp minimum** (Material a11y) | `minHeight/minWidth: 48`; `hitSlop` / `android_ripple` for small targets |
| Depth | **Elevation** levels 1–3 (tonal/surface) | RN `elevation` style prop (Android reads `elevation`, ignores `shadow*`) |
| Primary CTA | Solid `primary` fill + elevation + **ripple** | flat fill; `Pressable` `android_ripple={{ color }}` |
| Feedback | Ripple on press | `Pressable` `android_ripple` / `TouchableNativeFeedback` |
| Motion | Material standard easing, 200–300 ms | Reanimated with emphasized/standard curves |
| Navigation | Stack + system back button/gesture | `expo-router` Stack (hardware back handled) |
| Edges | **Edge-to-edge**, themed status/nav bars | `expo-status-bar` + `expo-navigation-bar`; safe-area insets |
| Status/nav bar | Color follows theme surface | set bar style + background per scheme |
| Corner radius | Soft (`borderRadius` sm4–xl16), pill for primary | `borderRadius` tokens |

## Android specifics
- **Elevation vs shadow**: use the `elevation` prop on Android (the iOS `shadow*` props are no-ops there). The shared component should `Platform.select({ ios: {shadow…}, android: {elevation} })`.
- **Ripple**: prefer `Pressable` with `android_ripple` over a manual opacity fade — it's the expected Material feedback.
- **Adaptive icon**: already configured (`app.json` `android.adaptiveIcon` — foreground/background/monochrome). Keep the safe zone.
- **Dynamic color (Material You)**: optional; PinayMate keeps its brand palette rather than theming from wallpaper.
- **Font scaling**: respect the system font-size setting (don't disable `allowFontScaling`).

## Play Store readiness checklist (design-relevant)
- [ ] All tappable controls ≥ 48 dp
- [ ] Text contrast ≥ 4.5:1 (3:1 large/UI) — covered by `theme.test.ts`
- [ ] Dark theme supported (flip `userInterfaceStyle:"automatic"` after the adoption sweep)
- [ ] Edge-to-edge with correct status/nav bar colors per theme
- [ ] Ripple feedback on pressables (not just opacity)
- [ ] Reduce-motion / animation-scale respected
- [ ] Content labels (`accessibilityLabel`) on icon-only buttons
- [ ] Adaptive icon safe-zone correct (`adaptiveIcon` assets)
- [ ] No emoji used as UI icons (lucide only) — **open**: 10 files still use emoji
- [ ] Target SDK current; data-safety form accurate
