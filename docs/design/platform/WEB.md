# Web Design Spec

> One of three platform lenses on the **same** token system (`src/theme/`). See the visual reference: [`../design-tokens.html`](../design-tokens.html) (switch to **Web**). PinayMate's web build is the Expo web export (`build:web` → `dist/`, SPA) deployed to Vercel.

## Token → Web mapping

| Token / concept | Web treatment | Implementation |
|---|---|---|
| Colors | `lightColors` / `darkColors` via `useTheme()` | `useColorScheme()` maps to `prefers-color-scheme` on web |
| Fonts | Lora + DM Sans (2-font system; brand mark = SVG) | embedded via `expo-font` (RN-web) / `@font-face`; system stack fallback |
| Touch / pointer | **44 px** min, plus real hover + focus states | larger hit areas; `:hover` and `:focus-visible` |
| Depth | `box-shadow` | RN `shadow*` is translated to `box-shadow` by RN-web |
| Primary CTA | Solid `primary` fill + hover (`primaryInk`) | hover/active states; visible focus ring |
| Feedback | Hover + keyboard `:focus-visible` | never hover-only for critical info |
| Motion | CSS transitions, **`prefers-reduced-motion`** | gate spatial motion; 150–300 ms |
| Layout | Responsive **375 / 768 / 1024 / 1440** | fluid layout; no horizontal scroll |
| Corner radius | Soft (`borderRadius` sm4–xl16), pill for primary | `borderRadius` tokens |

## Web specifics
- **Keyboard navigation**: every interactive element reachable by Tab, in visual order, with a visible focus ring (≥ 3:1).
- **Reduced motion**: the reference page now ships `@media (prefers-reduced-motion: reduce)`; app web build should do the same.
- **No native gestures**: don't rely on swipe-back; provide visible back/nav controls.
- **Images**: `alt` text on meaningful images; lazy-load; responsive sizes.
- **SPA routing**: `vercel.json` rewrites `/:path* → /`; ensure deep links resolve client-side.

## Web / WCAG readiness checklist
- [ ] Contrast ≥ 4.5:1 text · 3:1 large/UI & borders — covered by `theme.test.ts`
- [ ] Visible `:focus-visible` ring on all interactive elements
- [ ] Full keyboard operability (tab order matches visual order)
- [ ] `prefers-reduced-motion` respected
- [ ] `prefers-color-scheme` (dark) honored once adoption sweep lands
- [ ] Responsive at 375 / 768 / 1024 / 1440; no horizontal scroll
- [ ] `alt` text on images; form inputs have associated labels
- [ ] Color is never the only signal (pair with icon/text)
- [ ] No emoji used as UI icons (lucide only) — **open**: 10 files still use emoji
- [ ] `viewport` meta `width=device-width, initial-scale=1`
