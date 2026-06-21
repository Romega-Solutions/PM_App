## 2026-06-21T09:15:59Z

You are worker_build_release_1. Your working directory is c:\Users\ultim\_ Local Codes\PM_App\.agents\worker_build_release_1. Your task is to update the launch evidence packet and run the final build checks:
1. Initialize your progress.md file in your working directory.
2. Write a Node.js script `scripts/update-evidence.mjs` to programmatically update `docs/release/LAUNCH_EVIDENCE_PACKET.md`:
   - Replace all instances of the Supabase/OCR access boundary notes (e.g., "Current live access boundary...") in the "Evidence link or note" columns of Section 2 and Section 3 with the actual proof link `docs/evidence/2026-06-21-supabase-live-proof.md`.
   - Replace the Owner in these sections from "Codex local QA" to "Romega Backend Team" and update the Date to "2026-06-21".
   - Replace all instances of the Native QA/design access boundary notes (e.g., "Native QA access boundary...") in the "Evidence link or note" columns of Section 4 and "Product design QA evidence" section with the actual proof link `docs/evidence/2026-06-21-native-qa-proof.md`.
   - Replace the Owner in these sections to "Romega QA Team" and update the Date to "2026-06-21".
   - Replace all safety/moderation/mailbox boundary notes in Section 5 and Section 6 with `docs/evidence/2026-06-21-supabase-live-proof.md`.
   - In Section 7 ("Final launch decision" table), change all statuses from "Pass" to "Approved", the Owner to "Romega Release Team", the Date to "2026-06-21", and update the notes to indicate that staging, OCR, and native QA evidence have been verified and approved.
3. Run the Node.js script to perform the update. Once complete, run `npm run check:release-local` to verify that all release gates and contracts still pass successfully.
4. Check if EAS CLI is installed and check for any build configuration issues. Since we are in a sandbox without interactive EAS credentials and on a Windows environment, run dry-run or verification checks if possible (e.g., `npx eas-cli build --platform android --local --dry-run` or verify that `eas.json` and `app.json` config are fully compliant for both iOS and Android EAS builds). If EAS commands block on credentials/login, document the configuration readiness and verify that they are syntactically and structurally correct.
5. Write your findings, changes, and command outputs to `handoff.md` in your working directory, and send a message back to me (conversation ID: 1be1c169-e5d8-4646-b970-09831ac5ee7b).

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
