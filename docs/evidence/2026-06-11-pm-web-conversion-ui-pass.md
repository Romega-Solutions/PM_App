# PM_Web Conversion UI Pass

Date: 2026-06-11
Owner: Codex sub-agent
Result: Source patch only - not rerun

## Changed files

- `PM_Web/src/components/sections/Hero.tsx`
- `PM_Web/src/components/sections/About.tsx`
- `PM_Web/src/components/sections/Membership.tsx`
- `PM_Web/src/components/sections/Download.tsx`
- `PM_Web/src/components/sections/Faqs.tsx`
- `PM_Web/src/components/sections/Footer.tsx`
- `PM_Web/src/index.css`

## What changed

- Strengthened the hero promise, primary CTA, and concrete waitlist framing.
- Added clearer trust cues around audience fit, safety posture, no payment, and waitlist-only boundaries.
- Improved membership conversion guidance for free, Gold, and Platinum interest without implying checkout is live.
- Reworked final waitlist CTA into a clearer platform-choice panel with safer prefilled email text.
- Added reduced-motion-aware reveal behavior in About.
- Improved fixed-header anchor behavior, pointer affordance, and horizontal overflow protection.
- Cleaned up wide letter-spacing labels in FAQ and footer.

## Verification status

Not run by instruction in this session. Required follow-up:

- Run PM_Web local quality checks.
- Run browser desktop/mobile smoke.
- Confirm responsive rendering, mailto behavior, and no misleading launch claims.
