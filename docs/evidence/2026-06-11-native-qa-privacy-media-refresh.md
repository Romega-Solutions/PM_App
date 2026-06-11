# Native QA Privacy and Media Refresh

Date: 2026-06-11
Owner: Codex
Result: Checklist update only - not run

## What changed

- Added a native QA step for privacy settings load failure.
- The privacy failure step now requires toggles to stay locked behind retry so backend defaults cannot overwrite real account settings.
- Tightened chat image QA to require active-conversation upload/render behavior.
- Added restart/reopen coverage for signed chat image rendering without exposing raw storage paths.
- Added blocked/unmatched image-send coverage.
- Added fail-stop conditions for image sends without conversation-bound upload paths and raw storage/token/bucket details in UI.
- Added report-entry-point coverage for chat, profile details, Discovery, Likes, and unavailable-call safety entry points.

## Why it matters

Recent source hardening changed privacy settings behavior and chat image message requirements. Native QA must verify the actual user-facing app still behaves correctly against those backend contracts.

## Verification status

Not run by instruction in this session. Required follow-up:

- Execute `docs/NATIVE_QA_SCRIPT.md` on a native device or emulator.
- Attach redacted screenshots or signed QA notes in `docs/LAUNCH_EVIDENCE_PACKET.md`.
