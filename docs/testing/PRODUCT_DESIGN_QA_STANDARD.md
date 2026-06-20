# PinayMate Product Design QA Standard

Last updated: 2026-06-11

Purpose: define the product-design evidence required before PinayMate can be called beautiful, trustworthy, usable, and launch-ready across PM_App and PM_Web.

Status: required for launch review. This standard does not replace native QA, browser QA, accessibility checks, or live backend proof.

Claim source of truth: all design review decisions must use `docs\release\PINAYMATE_LAUNCH_STATE_MATRIX.md`. If the matrix says a feature is waitlist-only, gated, source-only, or blocked pending proof, the UI must not make that feature look live.

## Design intent

PinayMate should feel like a serious, warm, Filipino-first dating product, not a generic swipe app. The design should help people understand:

- what step they are on
- what information is private or public
- what safety controls exist
- what is launch-stage versus live
- what action to take next
- how to recover from errors without panic

## Surface and card discipline

PinayMate should not look like a dashboard made from stacked cards. Cards are allowed only when they group one clear topic or one clear object, such as a profile preview, membership option, trust proof item, or focused action summary.

Do not use nested cards as the default way to create hierarchy. If a section already has a visible surface, the content inside should usually use typography, spacing, rows, dividers, icons, inline proof strips, segmented lists, or a bottom sheet/modal instead of another boxed panel.

Required design direction:

- PM_Web should feel more editorial and conversion-led: section bands, split layouts, visual rhythm, trust strips, phone/app compositions, and clear CTA blocks before card grids.
- PM_App should feel native and flow-led: grouped rows, simple lists, focused sheets, clear primary actions, and profile/match cards only where they help decision-making.
- Card density must stay intentional. A screen or section should not use cards for every paragraph, setting row, statistic, legal note, and CTA.
- Elevation must be consistent. Do not mix random borders, shadows, glass panels, gradients, and nested rounded containers just to make content feel designed.

Fail-stop card examples:

- card inside card inside card without a strong interaction reason
- every setting row wrapped in an individual card
- every marketing claim shown as a separate boxed tile when a list, strip, or editorial block would scan better
- nested glass/blur panels that blur hierarchy or reduce contrast
- multiple equal-weight cards competing with the single primary action

## Required evidence package

Each design QA pass must include:

| Evidence item | Required proof |
| ------------- | -------------- |
| Device or viewport | device model, OS/browser, viewport size, and build/source date |
| Screenshots or clips | at least one screenshot per critical flow and state |
| Result | Pass, Fail, or Deferred with risk acceptance |
| Owner | named product/design reviewer |
| Date | date reviewed |
| Notes | what changed, what still feels weak, and what must not be claimed as live |

Do not store real user photos, ID documents, private messages, raw location, email addresses, access tokens, or database IDs in design evidence.

Each design QA pass must include a launch-state note confirming that PM_App and PM_Web screens match `docs\release\PINAYMATE_LAUNCH_STATE_MATRIX.md`.

## PM_App design gates

| Area | Pass condition | Evidence |
| ---- | -------------- | -------- |
| First impression | signed-out and sign-in screens explain the value, safety posture, and recovery path without overwhelming users | screenshots |
| Onboarding | basic info, photos, location, preferences, and verification each show one clear primary action and one clear recovery path | screenshots/notes |
| Trust and safety | report, block, unmatch, privacy, verification, and account deletion copy is calm, specific, and does not guarantee safety | screenshots/notes |
| Discovery | empty, loading, error, no-photo, and member-card states feel intentional and do not invent profile facts | screenshots |
| Matching | likes, mutual match, message entry, report, and unmatch actions are visible and touch-friendly | screenshots |
| Messaging | first-send chat setup, text, image gating, upload, failed send, private-photo, empty chat, read-state feedback, and safety actions are readable and reachable without implying empty conversations are live inbox items | screenshots/clips |
| Settings | privacy, notifications, preferences, and account deletion states distinguish launch-stage preferences from proven delivery | screenshots |
| Launch-state accuracy | unavailable or gated features clearly say what is off for launch, what is review-based, and what still needs operational proof | screenshots/notes |
| Accessibility | primary touch targets are at least 44px/44pt, icon-only controls have labels, error states are near the problem, and focus/reading order is logical | reviewer notes |
| Resilience | slow network, failed save, failed upload, expired session, and unavailable feature states explain what to do next | screenshots/notes |
| Surface discipline | screens avoid card spam and nested-card hierarchy; rows, dividers, sheets, whitespace, and typography carry secondary structure | screenshots/notes |

Fail-stop examples:

- a primary flow dead-ends without a clear next action
- a sensitive action is hidden behind unclear navigation
- an unavailable feature looks live
- verification or safety language guarantees member safety
- a launch-stage screen asks for payment, ID, location, or private profile data in the wrong place
- mobile text is clipped, controls overlap the safe area, or touch targets are too small
- the UI uses nested cards or repeated equal-weight panels where simpler native rows, spacing, or a single surface would be clearer

## PM_Web design gates

| Area | Pass condition | Evidence |
| ---- | -------------- | -------- |
| Hero | value proposition, waitlist CTA, and launch limitation are visible above the fold on desktop and mobile | screenshots |
| Conversion path | iOS, Android, support, legal, and membership-interest paths are clear and waitlist-safe | screenshots/link notes |
| Trust/safety | safety copy explains review paths and limitations without guarantees or fear-based marketing | screenshots/notes |
| Membership | planned pricing and plan interest are framed as interest capture, not live checkout | screenshots/notes |
| Legal/privacy | privacy and terms modals are readable on desktop and mobile and do not hide launch limitations | screenshots |
| Mobile layout | no horizontal overflow, clipped cards, unreachable CTA, or modal trap on common mobile widths | screenshots |
| Accessibility | keyboard focus is visible, CTAs have descriptive labels, headings are ordered, and contrast is readable | reviewer notes |
| Visual polish | spacing, typography, cards, backgrounds, and section transitions feel cohesive instead of patched together | screenshots/notes |
| Surface discipline | page sections avoid card spam; editorial layout, whitespace, trust strips, lists, and CTA blocks are preferred over nested panels | screenshots/notes |
| Launch-state accuracy | waitlist, membership, store-link, legal, support, and safety copy match `docs\release\PINAYMATE_LAUNCH_STATE_MATRIX.md` | screenshots/notes |

Fail-stop examples:

- website implies app-store availability before store proof
- website implies paid checkout before billing proof
- website guarantees verified users, safe matches, or background checks
- mobile page has horizontal overflow or unusable CTAs
- legal/support paths are unclear or route to unowned destinations
- landing sections become a wall of similar cards instead of a clear conversion story
- nested cards reduce readability, contrast, or mobile scanning

## Review method

Use this order:

1. Review PM_Web desktop at production-like width.
2. Review PM_Web mobile at a narrow viewport.
3. Review PM_App signed-out, onboarding, discovery, messaging, report/block/unmatch, and settings flows on a real device or emulator.
4. Capture screenshots only after private data is redacted.
5. Mark each gate Pass, Fail, or Deferred with risk acceptance.
6. Record evidence in `docs\release\LAUNCH_EVIDENCE_PACKET.md`.

## Launch decision rule

PinayMate cannot be called UI/UX launch-ready until:

- PM_App and PM_Web screens match `docs\release\PINAYMATE_LAUNCH_STATE_MATRIX.md`
- PM_App native design QA passes or has explicit risk acceptance
- PM_Web desktop/mobile design QA passes or has explicit risk acceptance
- no fail-stop design issue remains open
- final launch evidence records owner, date, result, and proof path
- surface discipline is reviewed so PM_Web and PM_App do not regress into card spam or nested-card-heavy layouts
