# Messaging and Safety UX Pass

Date: 2026-06-11
Owner: Codex sub-agent
Result: Source patch only - not rerun

## Changed files

- `src/features/messaging/screens/ChatScreen.tsx`
- `src/features/messaging/screens/MessagesScreen.tsx`
- `src/features/messaging/components/ConversationCard.tsx`
- `src/features/safety/workflows/reportSafetyConcern.ts`

## What changed

- Clarified report, block, and unmatch hierarchy so users understand what each action does.
- Strengthened destructive-action confirmation and success copy for block and unmatch paths.
- Improved empty states and safety reminders in conversation list and empty chat states.
- Improved accessibility labels and hints for safety actions, upload retry, and conversation rows.
- Adjusted smaller controls toward mobile touch target guidance.
- Made conversation cards more robust for blank last messages and large unread counts.

## Verification status

Not run by instruction in this session. Required follow-up:

- Run PM_App typecheck/lint/tests.
- Run native messaging and safety QA with matched, unmatched, blocked, and reported users.
- Verify small-device wrapping for conversation rows and safety copy.
