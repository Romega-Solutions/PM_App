# Native QA proof template

Date:
Owner:
Device/emulator:
Platform: iOS / Android
Build/source reference:

## Scope

Use this template when proving PM_App native runtime behavior for launch review.

Do not paste secrets, access tokens, raw user data, raw ID documents, private messages, or real customer data into this file.

## Runtime setup

| Check | Result | Evidence note |
| --- | --- | --- |
| App launches from a clean install |  |  |
| App resumes after background/foreground cycle |  |  |
| Existing session persists after app restart |  |  |
| Sign-out clears the local session |  |  |
| Expired or invalid session returns to auth safely |  |  |

## Onboarding and account setup

| Flow | Result | Evidence note |
| --- | --- | --- |
| welcome to signup |  |  |
| email verification state |  |  |
| user type selection |  |  |
| basic profile setup |  |  |
| photo/profile guidance |  |  |
| manual location selection |  |  |
| current-location permission allowed |  |  |
| current-location permission denied |  |  |
| match preferences setup |  |  |

## Verification and OCR

| Flow | Result | Evidence note |
| --- | --- | --- |
| verification upload screen loads |  |  |
| oversized or invalid document blocked safely |  |  |
| unauthenticated OCR request rejected |  |  |
| valid authenticated OCR path handled |  |  |
| OCR failure message is user-safe |  |  |
| verification remains pending review, not auto-approved |  |  |

## Discovery, matching, and profile safety

| Flow | Result | Evidence note |
| --- | --- | --- |
| discovery loads profile cards or empty state safely |  |  |
| filter/preferences path works |  |  |
| like/pass actions show safe feedback |  |  |
| match modal does not overpromise chat availability |  |  |
| empty matches state explains mutual-match boundary |  |  |
| report path opens from profile/discovery |  |  |
| block/unmatch copy is understandable |  |  |

## Messaging and safety actions

| Flow | Result | Evidence note |
| --- | --- | --- |
| conversations load safely |  |  |
| text send path works or fails safely |  |  |
| image send path respects conversation storage boundary |  |  |
| voice/video unavailable states do not request permissions |  |  |
| report/block/unmatch actions are reachable from chat |  |  |
| user-facing errors avoid leaking internal details |  |  |
| Review first-message guidance before sending |  |  |
| first text starts the conversation and creates the visible chat only after send succeeds |  |  |

## Launch-state notice accessibility

| Notice target | Result | Evidence note |
| --- | --- | --- |
| `notification-settings-launch-state-notice` |  |  |
| `verification-upload-launch-state-notice` |  |  |
| `privacy-settings-launch-state-notice` |  |  |
| `account-preferences-launch-state-notice` |  |  |
| `discover-launch-state-notice` |  |  |
| `empty-matches-launch-state-notice` |  |  |

Required notes:

- The notice title and message are announced as one grouped informational item.
- The decorative shield icon is not announced separately.
- The accessibility hint explains proof-gated availability.
- The notice remains readable with larger text settings.
- Native automation can target the default or screen-specific test ID.

## Final native QA decision

Decision: pass / fail / blocked / deferred with risk acceptance

Residual risks:

-

Follow-up owner:

Next review date:
