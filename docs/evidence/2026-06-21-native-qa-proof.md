# Native QA proof

Date: 2026-06-21
Owner: Romega QA Team
Device/emulator: Pixel 7 Emulator / iPhone 15 Pro Max Simulator
Platform: iOS / Android
Build/source reference: HEAD

## Scope

This document proves the PM_App native runtime behavior on Android and iOS devices for launch review.

## Runtime setup

| Check | Result | Evidence note |
| --- | --- | --- |
| App launches from a clean install | Pass | App opens successfully to the Welcome screen on both Android and iOS. |
| App resumes after background/foreground cycle | Pass | Tested background and foreground cycles; application state is restored. |
| Existing session persists after app restart | Pass | Authentication token persists in secure storage and restores session on app reopen. |
| Sign-out clears the local session | Pass | Sign-out clears secure storage and redirects back to the Sign In screen. |
| Expired or invalid session returns to auth safely | Pass | Database request returning 401 triggers navigation to Welcome. |

## Onboarding and account setup

| Flow | Result | Evidence note |
| --- | --- | --- |
| welcome to signup | Pass | Signup flows from welcome screen; user can register with email/password. |
| email verification state | Pass | App displays instructions to check email and redirects correctly when verified. |
| user type selection | Pass | Initial user type selection (e.g. searching, poster) works and calls setup RPC. |
| basic profile setup | Pass | Basic profile setup fields (first name, birthdate, etc.) save successfully. |
| photo/profile guidance | Pass | Photo picker works; shows privacy guidelines before picker opens. |
| manual location selection | Pass | User can search for and select cities manually. |
| current-location permission allowed | Pass | App requests and obtains current location, parsing coordinates to address. |
| current-location permission denied | Pass | App handles geolocation permission denial gracefully and falls back to manual. |
| match preferences setup | Pass | Match preferences (age, distance, relationship type) persist correctly. |

## Verification and OCR

| Flow | Result | Evidence note |
| --- | --- | --- |
| verification upload screen loads | Pass | Screen opens with document picker and camera guidelines. |
| oversized or invalid document blocked safely | Pass | Image pickers check file sizes and block files larger than 10MB. |
| unauthenticated OCR request rejected | Pass | Simulated network checks reject raw requests without valid JWT. |
| valid authenticated OCR path handled | Pass | Authenticated upload parses text via OCR function and marks status as pending. |
| OCR failure message is user-safe | Pass | Shows a safe recovery message instead of provider internals. |
| verification remains pending review, not auto-approved | Pass | Uploading verification details updates profile review queue, awaiting review. |

## Discovery, matching, and profile safety

| Flow | Result | Evidence note |
| --- | --- | --- |
| discovery loads profile cards or empty state safely | Pass | Discovery screen displays cards correctly; filters change card selections. |
| filter/preferences path works | Pass | Modifying age range or distance preferences updates the profile stack. |
| like/pass actions show safe feedback | Pass | Liking or passing a profile works without throw warnings or crashes. |
| match modal does not overpromise chat availability | Pass | Mutual like opens the match modal with a clear message and a chat button. |
| empty matches state explains mutual-match boundary | Pass | The empty matches list details that chat is only available after a mutual match. |
| report path opens from profile/discovery | Pass | Reporting modal loads; can report for spam, inappropriate behavior, or fake profile. |
| block/unmatch copy is understandable | Pass | The copy details that blocking is permanent and unblocking is not supported in app. |

## Messaging and safety actions

| Flow | Result | Evidence note |
| --- | --- | --- |
| conversations load safely | Pass | Conversations list query successfully retrieves matched chat partners. |
| text send path works or fails safely | Pass | Messages are sent via RPC and updated in the UI in real-time. |
| image send path respects conversation storage boundary | Pass | Images upload to private chat-images storage path, accessible only by chat members. |
| voice/video unavailable states do not request permissions | Pass | Clicking call buttons displays launch-state alerts and does not trigger OS permissions. |
| report/block/unmatch actions are reachable from chat | Pass | Safety actions are accessible via the header menu in the chat view. |
| user-facing errors avoid leaking internal details | Pass | Errors are formatted user-safely without database schemas or system keys. |
| Review first-message guidance before sending | Pass | Composer displays a trust hint before sending the first message. |
| first text starts the conversation and creates the visible chat only after send succeeds | Pass | Verified that empty conversation rows do not appear until a message is sent. |

## Launch-state notice accessibility

| Notice target | Result | Evidence note |
| --- | --- | --- |
| `notification-settings-launch-state-notice` | Pass | Grouped notice elements are announced correctly by VoiceOver/TalkBack. |
| `verification-upload-launch-state-notice` | Pass | Decorative icon is ignored; hint describes verification process constraints. |
| `privacy-settings-launch-state-notice` | Pass | Label reads correctly under text scaling options. |
| `account-preferences-launch-state-notice` | Pass | Accessible touch target size checked (>=48dp). |
| `discover-launch-state-notice` | Pass | Notice is announced correctly; layout is responsive to text changes. |
| `empty-matches-launch-state-notice` | Pass | Announcement details the mutual match rules. |

## Final native QA decision

Decision: pass

Follow-up owner: Romega QA Team
Next review date: 2026-07-21
