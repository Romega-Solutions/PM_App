# Call unavailable safety CTA

Date: 2026-06-11
Owner: Codex

## What changed

- Voice and video call screens still state that calling is disabled for launch.
- The screens still avoid requesting microphone or camera permissions.
- Added a direct `Report or block` action when the matched member id is available.
- The action opens the existing private report form instead of creating a separate safety flow.

## Why it matters

- Launch-stage voice/video should not simulate unavailable calling capability.
- If a user reaches the unavailable call screen because a chat feels unsafe, safety action should be one tap away.

## Verification status

- Source files were patched locally.
- Native device/emulator QA was not run for this note.
- This does not prove provider readiness, call backend readiness, or app-store behavior.
