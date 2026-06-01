# Platform Design System — Spec (2026-06-01)

## Goal
De-slop the PinayMate design reference and make the token system demonstrably credible for **three setups**: iOS (App Store / Apple HIG), Android (Play Store / Material 3), and Web. One token source of truth (`src/theme/colors.ts`), three platform lenses. Keep the `amihan/dalisay/luna` hues — evolve *treatment* only.

## Decisions (from brainstorming)
- **Approach:** one source, three lenses (no per-platform token forks; the same tokens adapt).
- **CTA:** flat solid `amihan` fill + platform-native depth (shadow on iOS, elevation on Android, hover on Web). No diagonal gradient/glow.
- **Brand:** hues unchanged; only treatment/consistency/standards evolve.
- **Scope guard:** reference doc + specs only. No app-screen edits, no `colors.ts` changes this phase. The 30-screen adoption sweep stays separate.

## Deliverables
1. **`docs/design/design-tokens.html` refinements**
   - Remove decorative gradients: `.bar-fill`, `.rule` → flat `--action`.
   - CTA → flat solid fill; depth driven by `html[data-platform=…]` CSS (iOS shadow / Android elevation / Web hover).
   - Add `@media (prefers-reduced-motion: reduce)`.
   - Add a **platform switcher** (iOS / Android / Web) in the top bar; drives an "active platform" panel + CTA depth.
   - Stamp: "mirrors colors.ts · 2026-06-01" (true single-source needs a build step — noted as follow-up).
2. **`docs/design/platform/IOS_HIG.md`** — HIG mapping + App Store readiness checklist.
3. **`docs/design/platform/ANDROID_MATERIAL3.md`** — Material 3 mapping + Play Store readiness checklist.
4. **`docs/design/platform/WEB.md`** — web mapping + WCAG/responsive checklist.

## Platform adaptation matrix
| Aspect | iOS (HIG) | Android (Material 3) | Web |
|---|---|---|---|
| Min touch | 44pt | 48dp | 44px (+ hover/focus) |
| Type fallback | SF Pro | Roboto | system stack |
| Depth | layered soft shadow | elevation 1–3 | box-shadow |
| Feedback | highlight / opacity | ripple | hover + `:focus-visible` |
| Motion | ease-out / spring | Material standard easing | CSS + reduced-motion |
| Edges | safe area, home indicator, large titles, swipe-back | edge-to-edge, status/nav bar color | responsive breakpoints |
| CTA | solid fill + soft shadow | solid fill + elevation + ripple | solid fill + hover |

## Verification
- HTML `<script>` passes `node --check`.
- No app-code/`colors.ts` changes → `tsc`/`jest`/`expo lint` remain green (42/42, 0/0).

## Follow-up (out of scope here)
- True single-source: generate the HTML's token constants from `colors.ts` at build time.
- The 30-screen / 385-literal adoption sweep onto `useTheme()`.
