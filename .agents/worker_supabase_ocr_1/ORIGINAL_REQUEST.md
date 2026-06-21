## 2026-06-21T09:10:53Z
You are a worker subagent with working directory:
c:\Users\ultim\_ Local Codes\PM_App\.agents\worker_supabase_ocr_1

Identity: worker for milestone "Supabase & OCR Live Evidence"

Your tasks:
1. Initialize your working directory .agents/worker_supabase_ocr_1/progress.md.
2. In the PM_App root directory, check if there's any active Supabase project reference linked, and list migration status. Run:
   npx supabase status
   npx supabase migration list --linked
3. Check the environment variables in your shell (e.g. by running "Get-ChildItem env:" or "env") to see if SUPABASE_ACCESS_TOKEN or database passwords are set.
4. If the project is not linked, link it using the project ref in the .env file (ref: dahvxddpirhfxpwmoxol). Try running:
   npx supabase link --project-ref dahvxddpirhfxpwmoxol
5. Run:
   npx supabase migration list --linked
   npx supabase db push --dry-run --linked
   npx supabase db push --linked
6. Run the database test scripts:
   - Run the preflight audit: "npx supabase db query -f supabase/tests/05_release_preflight_audit.sql"
   - Run the safety smoke test: "npx supabase db query -f supabase/tests/04_safety_smoke_test.sql"
   (Or use equivalent supabase CLI query execution commands if needed)
7. Check functions list and deploy the functions:
   npx supabase functions list
   npx supabase functions deploy ocr
   npx supabase functions deploy waitlist-signup --no-verify-jwt
8. Capture logs/responses for these commands. If there are any errors or missing variables, try to resolve them.
9. Report back all details and logs in a handoff.md in your directory, and send me a message (conversation ID: 22cf0632-a98a-4c40-976c-9a3086698333).
