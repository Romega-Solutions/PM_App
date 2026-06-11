# Chat Composer Media Safety Hint

Date: 2026-06-11

Status: Source and QA docs updated, checks not rerun in this note.

## What changed

- Added a chat composer safety hint.
- The hint reminds users to send only photos they are comfortable sharing in that chat.
- The hint warns users not to send passwords, codes, ID documents, or payment details.
- Updated native QA so messaging/media checks include this warning.

## Why this matters

- Chat media is a sensitive dating-app risk surface.
- Users should receive clear protection guidance before sending private documents or financial/security information in conversation.

## Required next proof

- Rerun PM_App local quality checks.
- Verify the chat composer and media flow on a native device or emulator before launch.
