import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
const shouldWriteReport =
  args.includes("--write-report") || process.env.PINAYMATE_WRITE_REPORT === "1";
const evidencePath = join(
  rootDir,
  "docs",
  "evidence",
  "backend-2026-06-11-supabase-static-contract.md",
);

const checks = [
  {
    name: "Launch migration manifest",
    markers: [
      ["supabase/LAUNCH_MIGRATION_MANIFEST.md", "00_complete_database_setup.sql"],
      ["supabase/LAUNCH_MIGRATION_MANIFEST.md", "04_production_security_hardening.sql"],
      ["supabase/LAUNCH_MIGRATION_MANIFEST.md", "20260611120000_secure_send_message_rpc.sql"],
      ["supabase/LAUNCH_MIGRATION_MANIFEST.md", "20260611121000_harden_user_report_payload.sql"],
      ["supabase/LAUNCH_MIGRATION_MANIFEST.md", "20260611122000_fix_discovery_privacy_read_model.sql"],
      ["supabase/LAUNCH_MIGRATION_MANIFEST.md", "20260611124000_repair_profile_creation_trigger.sql"],
      ["supabase/LAUNCH_MIGRATION_MANIFEST.md", "20260611125000_add_waitlist_interest_capture.sql"],
      ["supabase/LAUNCH_MIGRATION_MANIFEST.md", "20260611131000_add_verification_review_workflow.sql"],
      ["supabase/LAUNCH_MIGRATION_MANIFEST.md", "20260611132000_harden_report_abuse_and_discovery_read_model.sql"],
      ["supabase/LAUNCH_MIGRATION_MANIFEST.md", "20260611133000_require_report_reviewer_and_waitlist_burst_control.sql"],
      ["supabase/LAUNCH_MIGRATION_MANIFEST.md", "20260611134000_harden_moderation_audit_privileges.sql"],
      ["supabase/LAUNCH_MIGRATION_MANIFEST.md", "20260611135000_harden_verification_review_and_evidence_retention.sql"],
      ["supabase/LAUNCH_MIGRATION_MANIFEST.md", "20260611140000_add_waitlist_edge_abuse_control.sql"],
      ["supabase/LAUNCH_MIGRATION_MANIFEST.md", "20260611141000_restrict_conversation_creation_rpc.sql"],
      ["supabase/LAUNCH_MIGRATION_MANIFEST.md", "20260611142000_hide_empty_conversations_from_inbox.sql"],
      ["supabase/LAUNCH_MIGRATION_MANIFEST.md", "20260611040010_pass_profile_rpc.sql"],
      ["supabase/LAUNCH_MIGRATION_MANIFEST.md", "05_release_preflight_audit.sql"],
      ["supabase/LAUNCH_MIGRATION_MANIFEST.md", "04_safety_smoke_test.sql"],
    ],
  },
  {
    name: "Conversation creation RPC boundary",
    markers: [
      ["supabase/migrations/99_final_release_security_hardening.sql", "REVOKE ALL ON FUNCTION public.get_or_create_conversation(UUID, UUID)"],
      ["supabase/migrations/99_final_release_security_hardening.sql", "FROM PUBLIC, anon, authenticated, service_role"],
      ["supabase/migrations/20260611141000_restrict_conversation_creation_rpc.sql", "Private helper for send_message"],
      ["supabase/migrations/20260611141000_restrict_conversation_creation_rpc.sql", "empty conversation creation"],
      ["supabase/migrations/20260611120000_secure_send_message_rpc.sql", "public.get_or_create_conversation("],
      ["src/features/matching/screens/LikesScreen.tsx", "pathname: \"/chat\""],
      ["src/features/messaging/screens/ChatScreen.tsx", "setCreatedConversationId(sentMessage.conversation_id)"],
      ["supabase/tests/05_release_preflight_audit.sql", "get_or_create_conversation must not be directly executable by app clients or service role"],
      ["supabase/tests/04_safety_smoke_test.sql", "get_or_create_conversation direct execution unexpectedly exposed"],
    ],
    forbiddenMarkers: [
      ["src/features/matching/screens/LikesScreen.tsx", "get_or_create_conversation"],
    ],
  },
  {
    name: "No empty conversation inbox rows",
    markers: [
      ["supabase/migrations/99_final_release_security_hardening.sql", "WHERE c.last_message_id IS NOT NULL"],
      ["supabase/migrations/20260611142000_hide_empty_conversations_from_inbox.sql", "WHERE c.last_message_id IS NOT NULL"],
      ["supabase/migrations/20260611142000_hide_empty_conversations_from_inbox.sql", "real last message"],
      ["supabase/tests/05_release_preflight_audit.sql", "get_user_conversations must hide empty conversations"],
      ["supabase/tests/04_safety_smoke_test.sql", "get_user_conversations no-empty-inbox guard is missing"],
    ],
  },
  {
    name: "Pass profile RPC boundary",
    markers: [
      ["supabase/migrations/20260611040010_pass_profile_rpc.sql", "CREATE OR REPLACE FUNCTION public.pass_profile"],
      ["supabase/migrations/20260611040010_pass_profile_rpc.sql", "SECURITY DEFINER"],
      ["supabase/migrations/20260611040010_pass_profile_rpc.sql", "GRANT EXECUTE ON FUNCTION public.pass_profile(UUID) TO authenticated"],
      ["supabase/migrations/20260611040010_pass_profile_rpc.sql", "REVOKE INSERT ON public.passes FROM authenticated"],
      ["supabase/tests/05_release_preflight_audit.sql", "RPC: pass_profile"],
      ["supabase/tests/05_release_preflight_audit.sql", "pass_profile must be authenticated-only"],
      ["supabase/tests/05_release_preflight_audit.sql", "public.passes direct insert must stay denied"],
      ["supabase/tests/04_safety_smoke_test.sql", "public.pass_profile(uuid)"],
      ["supabase/tests/04_safety_smoke_test.sql", "public.passes direct insert unexpectedly exposed"],
    ],
  },
  {
    name: "Waitlist interest capture",
    markers: [
      ["supabase/migrations/20260611125000_add_waitlist_interest_capture.sql", "CREATE TABLE IF NOT EXISTS public.waitlist_signups"],
      ["supabase/migrations/20260611125000_add_waitlist_interest_capture.sql", "ALTER TABLE public.waitlist_signups"],
      ["supabase/migrations/20260611125000_add_waitlist_interest_capture.sql", "ALTER COLUMN email SET NOT NULL"],
      ["supabase/migrations/20260611125000_add_waitlist_interest_capture.sql", "submission_count INTEGER"],
      ["supabase/migrations/20260611125000_add_waitlist_interest_capture.sql", "last_submitted_at TIMESTAMPTZ"],
      ["supabase/migrations/20260611125000_add_waitlist_interest_capture.sql", "email_normalized TEXT GENERATED ALWAYS AS"],
      ["supabase/migrations/20260611125000_add_waitlist_interest_capture.sql", "pg_advisory_xact_lock(hashtext(v_email || ':' || v_platform))"],
      ["supabase/migrations/20260611125000_add_waitlist_interest_capture.sql", "INTERVAL '10 minutes'"],
      ["supabase/migrations/20260611125000_add_waitlist_interest_capture.sql", "v_existing.status IN ('unsubscribed', 'blocked')"],
      ["supabase/migrations/20260611125000_add_waitlist_interest_capture.sql", "WHEN submission_count >= 2147483647 THEN 2147483647"],
      ["supabase/migrations/20260611133000_require_report_reviewer_and_waitlist_burst_control.sql", "idx_waitlist_signups_recent_source_platform"],
      ["supabase/migrations/20260611133000_require_report_reviewer_and_waitlist_burst_control.sql", "v_recent_source_count >= 30"],
      ["supabase/migrations/20260611133000_require_report_reviewer_and_waitlist_burst_control.sql", "INTERVAL '1 minute'"],
      ["supabase/migrations/20260611133000_require_report_reviewer_and_waitlist_burst_control.sql", "pg_advisory_xact_lock("],
      ["supabase/migrations/20260611133000_require_report_reviewer_and_waitlist_burst_control.sql", "waitlist-source:"],
      ["supabase/migrations/20260611133000_require_report_reviewer_and_waitlist_burst_control.sql", "v_source NOT IN ('pm_web', 'pm_app')"],
      ["supabase/migrations/20260611133000_require_report_reviewer_and_waitlist_burst_control.sql", "status := 'accepted'"],
      ["supabase/migrations/20260611125000_add_waitlist_interest_capture.sql", "ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY"],
      ["supabase/migrations/20260611125000_add_waitlist_interest_capture.sql", "REVOKE ALL ON public.waitlist_signups FROM PUBLIC, anon, authenticated"],
      ["supabase/migrations/20260611125000_add_waitlist_interest_capture.sql", "CREATE OR REPLACE FUNCTION public.submit_waitlist_signup"],
      ["supabase/migrations/20260611125000_add_waitlist_interest_capture.sql", "SECURITY DEFINER"],
      ["supabase/migrations/20260611125000_add_waitlist_interest_capture.sql", "SET search_path = ''"],
      ["supabase/migrations/20260611125000_add_waitlist_interest_capture.sql", "GRANT EXECUTE ON FUNCTION public.submit_waitlist_signup(TEXT, TEXT, TEXT)"],
      ["supabase/tests/05_release_preflight_audit.sql", "RPC: submit_waitlist_signup"],
      ["supabase/tests/05_release_preflight_audit.sql", "RLS enabled table: waitlist_signups"],
      ["supabase/tests/05_release_preflight_audit.sql", "waitlist_signups direct access must stay denied"],
      ["supabase/tests/04_safety_smoke_test.sql", "public.submit_waitlist_signup(text, text, text)"],
      ["supabase/tests/04_safety_smoke_test.sql", "waitlist_signups direct table access unexpectedly exposed"],
      ["supabase/tests/04_safety_smoke_test.sql", "submit_waitlist_signup did not return the expected generic accepted response"],
      ["supabase/tests/04_safety_smoke_test.sql", "Duplicate waitlist signup leaked existing row metadata"],
      ["supabase/tests/04_safety_smoke_test.sql", "Duplicate waitlist cooldown did not suppress repeat write"],
      ["supabase/tests/04_safety_smoke_test.sql", "Blocked waitlist signup leaked existing row metadata"],
      ["supabase/tests/04_safety_smoke_test.sql", "Blocked waitlist signup was unexpectedly refreshed by duplicate submission"],
      ["supabase/tests/04_safety_smoke_test.sql", "Invalid waitlist signup unexpectedly succeeded"],
      ["supabase/migrations/20260611140000_add_waitlist_edge_abuse_control.sql", "CREATE TABLE IF NOT EXISTS public.waitlist_edge_attempts"],
      ["supabase/migrations/20260611140000_add_waitlist_edge_abuse_control.sql", "CREATE OR REPLACE FUNCTION public.claim_waitlist_edge_attempt"],
      ["supabase/migrations/20260611140000_add_waitlist_edge_abuse_control.sql", "waitlist-edge:"],
      ["supabase/migrations/20260611140000_add_waitlist_edge_abuse_control.sql", "REVOKE ALL ON FUNCTION public.submit_waitlist_signup(TEXT, TEXT, TEXT)"],
      ["supabase/migrations/20260611140000_add_waitlist_edge_abuse_control.sql", "TO service_role"],
      ["supabase/functions/waitlist-signup/index.ts", "WAITLIST_ALLOWED_ORIGINS"],
      ["supabase/functions/waitlist-signup/index.ts", "WAITLIST_ALLOW_NO_ORIGIN"],
      ["supabase/functions/waitlist-signup/index.ts", "WAITLIST_RATE_LIMIT_SALT"],
      ["supabase/functions/waitlist-signup/index.ts", "WAITLIST_REQUIRE_TURNSTILE"],
      ["supabase/functions/waitlist-signup/index.ts", "WAITLIST_TURNSTILE_SECRET_KEY"],
      ["supabase/functions/waitlist-signup/index.ts", "Access-Control-Allow-Origin"],
      ["supabase/functions/waitlist-signup/index.ts", "x-client-info, apikey, content-type, cf-turnstile-response, x-turnstile-token"],
      ["supabase/functions/waitlist-signup/index.ts", "\"X-Content-Type-Options\": \"nosniff\""],
      ["supabase/functions/waitlist-signup/index.ts", "\"Referrer-Policy\": \"no-referrer\""],
      ["supabase/functions/waitlist-signup/index.ts", "\"Permissions-Policy\": \"camera=(), microphone=(), geolocation=(), payment=()\""],
      ["supabase/functions/waitlist-signup/index.ts", "Vary: \"Origin\""],
      ["supabase/functions/waitlist-signup/index.ts", "\"Cache-Control\": \"no-store\""],
      ["supabase/functions/waitlist-signup/index.ts", "\"Retry-After\""],
      ["supabase/functions/waitlist-signup/index.ts", "hasHoneypotValue"],
      ["supabase/functions/waitlist-signup/index.ts", "body.website"],
      ["supabase/functions/waitlist-signup/index.ts", "body.company"],
      ["supabase/functions/waitlist-signup/index.ts", "body.nickname"],
      ["supabase/functions/waitlist-signup/index.ts", "getClientIp"],
      ["supabase/functions/waitlist-signup/index.ts", "anonymizeIp"],
      ["supabase/functions/waitlist-signup/index.ts", "hmacSha256Hex"],
      ["supabase/functions/waitlist-signup/index.ts", "value.length <= 254"],
      ["supabase/functions/waitlist-signup/index.ts", "Complete the waitlist challenge before submitting."],
      ["supabase/functions/waitlist-signup/index.ts", "claim_waitlist_edge_attempt"],
      ["supabase/functions/waitlist-signup/index.ts", "submit_waitlist_signup"],
      ["supabase/functions/waitlist-signup/index.ts", "WAITLIST_BACKEND_CONTRACT"],
      ["supabase/functions/waitlist-signup/index.ts", "PUBLIC_WAITLIST_FALLBACK_MESSAGE"],
      ["supabase/functions/waitlist-signup/index.ts", "Waitlist request could not be completed. Please use the email path."],
      ["supabase/functions/waitlist-signup/index.ts", "MAX_WAITLIST_REQUEST_BYTES = 4096"],
      ["supabase/functions/waitlist-signup/index.ts", "MAX_WAITLIST_CHALLENGE_TOKEN_BYTES = 2048"],
      ["supabase/functions/waitlist-signup/index.ts", "WAITLIST_CLIENT_SOURCE_BY_INFO"],
      ["supabase/functions/waitlist-signup/index.ts", "WAITLIST_ALLOWED_CLIENT_INFO"],
      ["supabase/functions/waitlist-signup/index.ts", "type WaitlistRpcStatus = \"accepted\""],
      ["supabase/functions/waitlist-signup/index.ts", "isAcceptedWaitlistRpcRow"],
      ["supabase/functions/waitlist-signup/index.ts", "row.email_normalized === email"],
      ["supabase/functions/waitlist-signup/index.ts", "row.platform === platform"],
      ["supabase/functions/waitlist-signup/index.ts", "row.status === \"accepted\""],
      ["supabase/functions/waitlist-signup/index.ts", "rows.length === 1 ? rows[0] : null"],
      ["supabase/functions/waitlist-signup/index.ts", "return jsonResponse(req, [firstRow])"],
      ["supabase/functions/waitlist-signup/index.ts", "\"pm-web-waitlist\""],
      ["supabase/functions/waitlist-signup/index.ts", "\"pm-app-waitlist\""],
      ["supabase/functions/waitlist-signup/index.ts", "hasExpectedClientInfo"],
      ["supabase/functions/waitlist-signup/index.ts", "getExpectedSourceForClientInfo"],
      ["supabase/functions/waitlist-signup/index.ts", "normalizeChallengeToken"],
      ["supabase/functions/waitlist-signup/index.ts", "getUtf8ByteLength(token) > MAX_WAITLIST_CHALLENGE_TOKEN_BYTES"],
      ["supabase/functions/waitlist-signup/index.ts", "req.headers.get(\"x-client-info\")"],
      ["supabase/functions/waitlist-signup/index.ts", "source !== expectedSource"],
      ["supabase/functions/waitlist-signup/index.ts", "getDeclaredContentLength"],
      ["supabase/functions/waitlist-signup/index.ts", "contentType.toLowerCase().includes(\"application/json\")"],
      ["supabase/functions/waitlist-signup/index.ts", "throw new HttpError(PUBLIC_WAITLIST_FALLBACK_MESSAGE, 415)"],
      ["supabase/functions/waitlist-signup/index.ts", "getUtf8ByteLength(rawBody) > MAX_WAITLIST_REQUEST_BYTES"],
      ["supabase/functions/waitlist-signup/index.ts", "backendContract"],
      ["supabase/functions/waitlist-signup/index.ts", "hasExpectedBackendContract"],
      ["supabase/functions/waitlist-signup/index.ts", "Waitlist request is not supported."],
      ["supabase/functions/waitlist-signup/index.ts", "SUPABASE_SERVICE_ROLE_KEY"],
      ["supabase/functions/waitlist-signup/README.md", "verify_jwt = false"],
      ["supabase/functions/waitlist-signup/README.md", "CORS preflight deliberately does not allow a browser `Authorization` header"],
      ["supabase/functions/waitlist-signup/README.md", "security response headers"],
      ["supabase/functions/waitlist-signup/README.md", "generic fallback message"],
      ["supabase/functions/waitlist-signup/README.md", "capped at 4096 UTF-8 bytes before JSON parsing"],
      ["supabase/functions/waitlist-signup/README.md", "POST requests must use `Content-Type: application/json`"],
      ["supabase/functions/waitlist-signup/README.md", "Non-JSON requests return the generic fallback message"],
      ["supabase/functions/waitlist-signup/README.md", "capped at 2048 UTF-8 bytes before provider verification"],
      ["supabase/functions/waitlist-signup/README.md", "POST requests must include an approved `x-client-info` marker"],
      ["supabase/functions/waitlist-signup/README.md", "marker must match the submitted `source` field"],
      ["supabase/functions/waitlist-signup/README.md", "\"backendContract\": \"submit_waitlist_signup\""],
      ["supabase/functions/waitlist-signup/README.md", "Successful public responses must contain exactly one generic accepted row"],
      ["supabase/functions/waitlist-signup/README.md", "\"status\": \"accepted\""],
      ["supabase/functions/waitlist-signup/README.md", "The returned `email_normalized` must match the submitted normalized email"],
      ["supabase/functions/waitlist-signup/README.md", "`platform` must match the submitted normalized platform"],
      ["supabase/functions/waitlist-signup/README.md", "fails closed with the generic fallback message"],
      ["supabase/config.toml", "[functions.waitlist-signup]"],
      ["supabase/tests/05_release_preflight_audit.sql", "submit_waitlist_signup must be service-role-only behind the waitlist Edge Function"],
      ["supabase/tests/05_release_preflight_audit.sql", "waitlist_edge_attempts direct access must stay denied"],
      ["supabase/tests/05_release_preflight_audit.sql", "claim_waitlist_edge_attempt must enforce hourly edge attempt limits"],
      ["supabase/tests/04_safety_smoke_test.sql", "submit_waitlist_signup direct execution unexpectedly exposed to app clients"],
      ["supabase/tests/04_safety_smoke_test.sql", "claim_waitlist_edge_attempt unexpectedly exposed to app clients"],
      ["supabase/tests/04_safety_smoke_test.sql", "waitlist_edge_attempts direct table access unexpectedly exposed"],
      ["supabase/tests/04_safety_smoke_test.sql", "Second waitlist edge attempt should be rate limited"],
    ],
  },
  {
    name: "Profile creation trigger",
    markers: [
      ["supabase/migrations/20260611124000_repair_profile_creation_trigger.sql", "CREATE OR REPLACE FUNCTION public.handle_new_user()"],
      ["supabase/migrations/20260611124000_repair_profile_creation_trigger.sql", "SECURITY DEFINER"],
      ["supabase/migrations/20260611124000_repair_profile_creation_trigger.sql", "SET search_path = ''"],
      ["supabase/migrations/20260611124000_repair_profile_creation_trigger.sql", "REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated"],
      ["supabase/migrations/20260611124000_repair_profile_creation_trigger.sql", "CREATE TRIGGER on_auth_user_created"],
      ["supabase/migrations/20260611124000_repair_profile_creation_trigger.sql", "CREATE TRIGGER on_auth_user_verified"],
      ["supabase/migrations/20260611124000_repair_profile_creation_trigger.sql", "COALESCE(public.profiles.basic_info_completed, FALSE)"],
      ["supabase/migrations/20260611124000_repair_profile_creation_trigger.sql", "NEW.raw_user_meta_data ->> 'user_type' IN ('filipina', 'foreigner')"],
      ["supabase/functions/create-profile-on-signup.sql", "CREATE OR REPLACE FUNCTION public.handle_new_user()"],
      ["supabase/tests/05_release_preflight_audit.sql", "trigger function: handle_new_user"],
      ["supabase/tests/05_release_preflight_audit.sql", "handle_new_user must not be directly executable by app clients"],
      ["supabase/tests/05_release_preflight_audit.sql", "auth trigger: on_auth_user_created"],
      ["supabase/tests/05_release_preflight_audit.sql", "auth trigger: on_auth_user_verified"],
    ],
  },
  {
    name: "Security-definer search path hardening",
    markers: [
      ["supabase/migrations/04_production_security_hardening.sql", "ALTER FUNCTION public.handle_new_user() SET search_path = ''"],
      ["supabase/migrations/04_production_security_hardening.sql", "REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated"],
      ["supabase/migrations/04_production_security_hardening.sql", "ALTER FUNCTION public.manual_verify_user(TEXT) SET search_path = ''"],
      ["supabase/migrations/04_production_security_hardening.sql", "REVOKE EXECUTE ON FUNCTION public.manual_verify_user(TEXT) FROM PUBLIC, anon, authenticated"],
      ["supabase/tests/04_safety_smoke_test.sql", "FROM unnest(COALESCE(p.proconfig, ARRAY[]::text[])) setting(value)"],
      ["supabase/tests/04_safety_smoke_test.sql", "SECURITY DEFINER functions must use an empty fixed search_path"],
    ],
  },
  {
    name: "Public function execute defaults",
    markers: [
      ["supabase/migrations/20260611143000_restrict_public_function_execute_defaults.sql", "ALTER DEFAULT PRIVILEGES IN SCHEMA public"],
      ["supabase/migrations/20260611143000_restrict_public_function_execute_defaults.sql", "REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC"],
      ["supabase/migrations/20260611143000_restrict_public_function_execute_defaults.sql", "REVOKE EXECUTE ON FUNCTIONS FROM anon"],
      ["supabase/migrations/20260611143000_restrict_public_function_execute_defaults.sql", "REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC"],
      ["supabase/migrations/20260611143000_restrict_public_function_execute_defaults.sql", "REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon"],
      ["supabase/tests/05_release_preflight_audit.sql", "public SECURITY DEFINER functions must not be executable by anon or PUBLIC defaults"],
      ["supabase/tests/05_release_preflight_audit.sql", "has_function_privilege('anon', p.oid, 'EXECUTE')"],
      ["supabase/tests/04_safety_smoke_test.sql", "public SECURITY DEFINER functions unexpectedly executable by anon or PUBLIC defaults"],
      ["supabase/LAUNCH_MIGRATION_MANIFEST.md", "20260611143000_restrict_public_function_execute_defaults.sql"],
      ["supabase/LAUNCH_MIGRATION_MANIFEST.md", "launch RPC access stays explicit through authenticated or service-role grants"],
    ],
  },
  {
    name: "Safety reports",
    markers: [
      ["supabase/migrations/04_production_security_hardening.sql", "CREATE TABLE IF NOT EXISTS public.user_reports"],
      ["supabase/migrations/99_final_release_security_hardening.sql", "CREATE OR REPLACE FUNCTION public.submit_user_report"],
      ["supabase/migrations/20260611121000_harden_user_report_payload.sql", "LEFT(BTRIM(COALESCE(p_reason, '')), 120)"],
      ["supabase/migrations/20260611121000_harden_user_report_payload.sql", "LEFT(BTRIM(COALESCE(p_details, '')), 800)"],
      ["supabase/migrations/20260611121000_harden_user_report_payload.sql", "v_source NOT IN ('chat', 'profile', 'likes', 'discovery', 'app')"],
      ["supabase/migrations/20260611132000_harden_report_abuse_and_discovery_read_model.sql", "idx_user_reports_open_report_dedupe"],
      ["supabase/migrations/20260611132000_harden_report_abuse_and_discovery_read_model.sql", "pg_advisory_xact_lock"],
      ["supabase/migrations/20260611132000_harden_report_abuse_and_discovery_read_model.sql", "INTERVAL '10 minutes'"],
      ["supabase/migrations/99_final_release_security_hardening.sql", "GRANT EXECUTE ON FUNCTION public.submit_user_report(UUID, TEXT, TEXT, UUID, TEXT) TO authenticated"],
      ["supabase/migrations/20260611130000_add_report_review_workflow.sql", "CREATE OR REPLACE FUNCTION public.review_user_report"],
      ["supabase/migrations/20260611130000_add_report_review_workflow.sql", "GRANT EXECUTE ON FUNCTION public.review_user_report(UUID, TEXT, TEXT, TEXT, TEXT, UUID)"],
      ["supabase/migrations/20260611130000_add_report_review_workflow.sql", "TO service_role"],
      ["supabase/migrations/20260611130000_add_report_review_workflow.sql", "reviewer_note TEXT DEFAULT ''"],
      ["supabase/migrations/20260611130000_add_report_review_workflow.sql", "user_reports_severity_check"],
      ["supabase/migrations/20260611133000_require_report_reviewer_and_waitlist_burst_control.sql", "CREATE TABLE IF NOT EXISTS public.moderation_reviewers"],
      ["supabase/migrations/20260611133000_require_report_reviewer_and_waitlist_burst_control.sql", "CREATE TABLE IF NOT EXISTS public.moderation_reviewer_audit_log"],
      ["supabase/migrations/20260611133000_require_report_reviewer_and_waitlist_burst_control.sql", "CREATE OR REPLACE FUNCTION public.log_moderation_reviewer_change()"],
      ["supabase/migrations/20260611133000_require_report_reviewer_and_waitlist_burst_control.sql", "CREATE TRIGGER trg_log_moderation_reviewer_change"],
      ["supabase/migrations/20260611133000_require_report_reviewer_and_waitlist_burst_control.sql", "REVOKE ALL ON public.moderation_reviewer_audit_log FROM PUBLIC, anon, authenticated, service_role"],
      ["supabase/migrations/20260611133000_require_report_reviewer_and_waitlist_burst_control.sql", "CREATE OR REPLACE FUNCTION public.upsert_moderation_reviewer"],
      ["supabase/migrations/20260611133000_require_report_reviewer_and_waitlist_burst_control.sql", "CREATE OR REPLACE FUNCTION public.deactivate_moderation_reviewer"],
      ["supabase/migrations/20260611133000_require_report_reviewer_and_waitlist_burst_control.sql", "Operator ID is required"],
      ["supabase/migrations/20260611133000_require_report_reviewer_and_waitlist_burst_control.sql", "Reviewer change reason is required"],
      ["supabase/migrations/20260611133000_require_report_reviewer_and_waitlist_burst_control.sql", "pinaymate.audit.actor_id"],
      ["supabase/migrations/20260611133000_require_report_reviewer_and_waitlist_burst_control.sql", "Reviewer ID is required"],
      ["supabase/migrations/20260611133000_require_report_reviewer_and_waitlist_burst_control.sql", "Reviewer is not authorized"],
      ["supabase/migrations/20260611133000_require_report_reviewer_and_waitlist_burst_control.sql", "AND mr.active"],
      ["supabase/migrations/20260611133000_require_report_reviewer_and_waitlist_burst_control.sql", "Report already has final review decision"],
      ["supabase/tests/05_release_preflight_audit.sql", "RPC: review_user_report"],
      ["supabase/tests/05_release_preflight_audit.sql", "review_user_report must not be executable by app clients"],
      ["supabase/tests/05_release_preflight_audit.sql", "review_user_report must require reviewer identity"],
      ["supabase/tests/05_release_preflight_audit.sql", "table: moderation_reviewers"],
      ["supabase/tests/05_release_preflight_audit.sql", "moderation_reviewers direct access must stay denied"],
      ["supabase/tests/05_release_preflight_audit.sql", "table: moderation_reviewer_audit_log"],
      ["supabase/tests/05_release_preflight_audit.sql", "moderation_reviewer_audit_log direct access must stay denied"],
      ["supabase/tests/05_release_preflight_audit.sql", "function: log_moderation_reviewer_change"],
      ["supabase/tests/05_release_preflight_audit.sql", "function: upsert_moderation_reviewer"],
      ["supabase/tests/05_release_preflight_audit.sql", "upsert_moderation_reviewer must not be executable by app clients"],
      ["supabase/tests/05_release_preflight_audit.sql", "function: deactivate_moderation_reviewer"],
      ["supabase/tests/05_release_preflight_audit.sql", "deactivate_moderation_reviewer must not be executable by app clients"],
      ["supabase/tests/05_release_preflight_audit.sql", "trigger: trg_log_moderation_reviewer_change insert/update/delete row coverage"],
      ["supabase/tests/05_release_preflight_audit.sql", "review_user_report must require authorized reviewer identity"],
      ["supabase/tests/05_release_preflight_audit.sql", "review_user_report must require active reviewer identity"],
      ["supabase/tests/05_release_preflight_audit.sql", "review_user_report must reject finalized report overwrites"],
      ["supabase/tests/05_release_preflight_audit.sql", "user_reports review metadata columns"],
      ["supabase/tests/04_safety_smoke_test.sql", "public.submit_user_report(uuid, text, text, uuid, text)"],
      ["supabase/tests/04_safety_smoke_test.sql", "public.review_user_report(uuid, text, text, text, text, uuid)"],
      ["supabase/tests/04_safety_smoke_test.sql", "Missing table: public.moderation_reviewers"],
      ["supabase/tests/04_safety_smoke_test.sql", "Missing table: public.moderation_reviewer_audit_log"],
      ["supabase/tests/04_safety_smoke_test.sql", "Missing function: public.log_moderation_reviewer_change()"],
      ["supabase/tests/04_safety_smoke_test.sql", "Missing function: public.upsert_moderation_reviewer(uuid, text, text, boolean, uuid, text)"],
      ["supabase/tests/04_safety_smoke_test.sql", "Missing function: public.deactivate_moderation_reviewer(uuid, uuid, text)"],
      ["supabase/tests/04_safety_smoke_test.sql", "moderation_reviewers direct table access unexpectedly exposed"],
      ["supabase/tests/04_safety_smoke_test.sql", "moderation_reviewer_audit_log direct table access unexpectedly exposed"],
      ["supabase/tests/04_safety_smoke_test.sql", "moderation reviewer audit trigger is missing insert/update/delete row-level coverage"],
      ["supabase/tests/04_safety_smoke_test.sql", "moderation reviewer management RPC unexpectedly exposed to app clients"],
      ["supabase/tests/04_safety_smoke_test.sql", "review_user_report reviewer registry or final-decision guard is missing"],
      ["supabase/tests/04_safety_smoke_test.sql", "Forged smoke test report"],
      ["supabase/tests/04_safety_smoke_test.sql", "Smoke invalid source report"],
      ["supabase/tests/04_safety_smoke_test.sql", "Duplicate same-pair report was not merged into one open queue row"],
      ["supabase/tests/04_safety_smoke_test.sql", "Invalid report source was not normalized to app"],
      ["supabase/tests/04_safety_smoke_test.sql", "Authenticated user unexpectedly reviewed a user report"],
      ["supabase/tests/04_safety_smoke_test.sql", "review_user_report did not reject a missing reviewer identity"],
      ["supabase/tests/04_safety_smoke_test.sql", "review_user_report did not reject an unauthorized reviewer identity"],
      ["supabase/tests/04_safety_smoke_test.sql", "review_user_report did not reject an inactive reviewer identity"],
      ["supabase/tests/04_safety_smoke_test.sql", "moderation reviewer registry change was not audited"],
      ["supabase/tests/04_safety_smoke_test.sql", "Smoke deactivate inactive reviewer"],
      ["supabase/tests/04_safety_smoke_test.sql", "moderation reviewer registry deactivation was not audited"],
      ["supabase/tests/04_safety_smoke_test.sql", "review_user_report did not persist expected review metadata"],
      ["supabase/tests/04_safety_smoke_test.sql", "review_user_report did not reject a finalized report overwrite"],
    ],
  },
  {
    name: "Block and unmatch",
    markers: [
      ["supabase/migrations/04_production_security_hardening.sql", "CREATE TABLE IF NOT EXISTS public.user_blocks"],
      ["supabase/migrations/04_production_security_hardening.sql", "CREATE OR REPLACE FUNCTION public.block_user"],
      ["supabase/migrations/04_production_security_hardening.sql", "CREATE OR REPLACE FUNCTION public.unmatch_user"],
      ["supabase/tests/04_safety_smoke_test.sql", "Blocked member is still visible in discoverable_profiles"],
      ["supabase/tests/04_safety_smoke_test.sql", "unmatch_user did not clear mutual match state"],
    ],
  },
  {
    name: "Account deletion queue",
    markers: [
      ["supabase/migrations/20260610112000_add_account_deletion_requests.sql", "CREATE TABLE IF NOT EXISTS public.account_deletion_requests"],
      ["supabase/migrations/20260610112000_add_account_deletion_requests.sql", "CREATE OR REPLACE FUNCTION public.request_account_deletion"],
      ["supabase/tests/04_safety_smoke_test.sql", "Direct account deletion request insert unexpectedly succeeded"],
      ["supabase/tests/04_safety_smoke_test.sql", "request_account_deletion did not create or update a pending request"],
    ],
  },
  {
    name: "Privacy settings",
    markers: [
      ["supabase/migrations/20260610113000_add_privacy_settings.sql", "CREATE TABLE IF NOT EXISTS public.user_privacy_settings"],
      ["supabase/migrations/20260610113000_add_privacy_settings.sql", "CREATE OR REPLACE FUNCTION public.get_privacy_settings"],
      ["supabase/migrations/20260610113000_add_privacy_settings.sql", "CREATE OR REPLACE FUNCTION public.save_privacy_settings"],
      ["supabase/tests/04_safety_smoke_test.sql", "Profile visibility privacy setting did not hide member from discoverable_profiles"],
    ],
  },
  {
    name: "Read receipts privacy",
    markers: [
      ["supabase/migrations/20260610114000_respect_read_receipts_privacy.sql", "CREATE OR REPLACE FUNCTION public.current_user_allows_read_receipts"],
      ["supabase/migrations/20260610114000_respect_read_receipts_privacy.sql", "CREATE OR REPLACE FUNCTION public.mark_conversation_read"],
      ["supabase/tests/04_safety_smoke_test.sql", "Read receipt privacy off should not expose message read status"],
      ["supabase/tests/04_safety_smoke_test.sql", "Conversation unread count was not cleared when read receipts were hidden"],
    ],
  },
  {
    name: "Online status privacy",
    markers: [
      ["supabase/migrations/20260610115000_respect_online_status_privacy.sql", "COALESCE(privacy_settings.show_online_status, FALSE)"],
      ["supabase/migrations/20260610115000_respect_online_status_privacy.sql", "ELSE NULL"],
      ["supabase/tests/04_safety_smoke_test.sql", "Online status privacy setting did not mask discoverable_profiles activity fields"],
      ["supabase/tests/04_safety_smoke_test.sql", "Online status privacy setting did not mask get_user_conversations activity fields"],
    ],
  },
  {
    name: "Storage buckets",
    markers: [
      ["supabase/migrations/20260610094806_add_pinaymate_storage_buckets.sql", "('profile-photos', 'profile-photos', TRUE)"],
      ["supabase/migrations/20260610094806_add_pinaymate_storage_buckets.sql", "('verification-docs', 'verification-docs', FALSE)"],
      ["supabase/migrations/04_production_security_hardening.sql", "WHERE id = 'chat-images'"],
      ["supabase/tests/04_safety_smoke_test.sql", "profile-photos bucket must exist as a public bucket"],
      ["supabase/tests/04_safety_smoke_test.sql", "verification-docs bucket must exist as a private bucket"],
      ["supabase/tests/04_safety_smoke_test.sql", "chat image policies must deny blocked conversations"],
      ["supabase/tests/04_safety_smoke_test.sql", "policyname IN ('Users can upload chat images', 'Users can view chat images')"],
      ["supabase/tests/04_safety_smoke_test.sql", "COALESCE(with_check, qual, '') LIKE '%user_blocks%'"],
      ["supabase/tests/04_safety_smoke_test.sql", ") < 2 THEN"],
    ],
  },
  {
    name: "Verification private review controls",
    markers: [
      ["supabase/migrations/20260610094806_add_pinaymate_storage_buckets.sql", "('verification-docs', 'verification-docs', FALSE)"],
      ["supabase/migrations/20260611131000_add_verification_review_workflow.sql", "CREATE OR REPLACE FUNCTION public.review_profile_verification"],
      ["supabase/migrations/20260611131000_add_verification_review_workflow.sql", "Reviewer ID is required"],
      ["supabase/migrations/20260611131000_add_verification_review_workflow.sql", "Profile verification is not pending review"],
      ["supabase/migrations/20260611131000_add_verification_review_workflow.sql", "Profile verification evidence objects are missing"],
      ["supabase/migrations/20260611131000_add_verification_review_workflow.sql", "GRANT EXECUTE ON FUNCTION public.review_profile_verification(UUID, TEXT, TEXT, UUID, TEXT[])"],
      ["supabase/migrations/20260611131000_add_verification_review_workflow.sql", "TO service_role"],
      ["supabase/tests/04_safety_smoke_test.sql", "verification-docs bucket must exist as a private bucket"],
      ["supabase/tests/04_safety_smoke_test.sql", "verification document storage policies must keep evidence private to the authenticated user folder"],
      ["supabase/tests/04_safety_smoke_test.sql", "public.submit_verification(text, text, text, text, integer, text[])"],
      ["supabase/tests/04_safety_smoke_test.sql", "public.review_profile_verification(uuid, text, text, uuid, text[])"],
      ["supabase/tests/04_safety_smoke_test.sql", "submit_verification did not set the expected pending review state"],
      ["supabase/tests/04_safety_smoke_test.sql", "Authenticated user unexpectedly reviewed profile verification"],
      ["supabase/tests/04_safety_smoke_test.sql", "review_profile_verification did not approve pending evidence"],
      ["supabase/tests/04_safety_smoke_test.sql", "review_profile_verification unexpectedly approved a profile without submitted evidence"],
      ["supabase/tests/05_release_preflight_audit.sql", "RPC: review_profile_verification"],
      ["supabase/tests/05_release_preflight_audit.sql", "review_profile_verification must not be executable by app clients"],
      ["supabase/tests/05_release_preflight_audit.sql", "profiles verification review metadata columns"],
      ["supabase/tests/04_safety_smoke_test.sql", "COALESCE(p.is_verified, FALSE) = FALSE"],
      ["supabase/tests/04_safety_smoke_test.sql", "p.verification_status = 'pending'"],
      ["supabase/tests/04_safety_smoke_test.sql", "Expected forged verification path rejection"],
      ["supabase/tests/04_safety_smoke_test.sql", "Expected direct verification update rejection"],
    ],
  },
  {
    name: "Privilege boundary smoke checks",
    markers: [
      ["supabase/tests/04_safety_smoke_test.sql", "SECURITY DEFINER functions must use an empty fixed search_path"],
      ["supabase/tests/04_safety_smoke_test.sql", "has_function_privilege('anon', 'public.block_user(uuid)', 'EXECUTE')"],
      ["supabase/tests/04_safety_smoke_test.sql", "has_function_privilege('authenticated', 'public.update_conversation_on_message()', 'EXECUTE')"],
      ["supabase/tests/04_safety_smoke_test.sql", "authenticated still has unsafe direct table privileges"],
      ["supabase/tests/04_safety_smoke_test.sql", "authenticated must not update profile gender/user_type directly; use save_basic_info"],
      ["supabase/tests/04_safety_smoke_test.sql", "authenticated can insert/update server-owned verification columns directly"],
      ["supabase/migrations/99_final_release_security_hardening.sql", "REVOKE ALL ON public.user_reports FROM authenticated"],
      ["supabase/migrations/99_final_release_security_hardening.sql", "REVOKE ALL ON public.likes FROM authenticated"],
      ["supabase/migrations/99_final_release_security_hardening.sql", "REVOKE ALL ON public.conversations FROM authenticated"],
      ["supabase/migrations/99_final_release_security_hardening.sql", "REVOKE ALL ON public.messages FROM authenticated"],
    ],
  },
  {
    name: "Account deletion request controls",
    markers: [
      ["supabase/migrations/20260610112000_add_account_deletion_requests.sql", "CREATE TABLE IF NOT EXISTS public.account_deletion_requests"],
      ["supabase/migrations/20260610112000_add_account_deletion_requests.sql", "idx_account_deletion_requests_one_pending"],
      ["supabase/migrations/20260610112000_add_account_deletion_requests.sql", "ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY"],
      ["supabase/migrations/20260610112000_add_account_deletion_requests.sql", "REVOKE ALL ON public.account_deletion_requests FROM authenticated"],
      ["supabase/migrations/20260610112000_add_account_deletion_requests.sql", "CREATE OR REPLACE FUNCTION public.request_account_deletion"],
      ["supabase/migrations/20260610112000_add_account_deletion_requests.sql", "SECURITY DEFINER"],
      ["supabase/migrations/20260610112000_add_account_deletion_requests.sql", "SET search_path = ''"],
      ["supabase/migrations/20260610112000_add_account_deletion_requests.sql", "GRANT EXECUTE ON FUNCTION public.request_account_deletion(TEXT, TEXT) TO authenticated"],
      ["supabase/tests/04_safety_smoke_test.sql", "Direct account deletion request insert unexpectedly succeeded"],
      ["supabase/tests/04_safety_smoke_test.sql", "request_account_deletion did not create or update a pending request"],
    ],
  },
  {
    name: "Read receipt privacy controls",
    markers: [
      ["supabase/migrations/20260610114000_respect_read_receipts_privacy.sql", "CREATE OR REPLACE FUNCTION public.current_user_allows_read_receipts"],
      ["supabase/migrations/20260610114000_respect_read_receipts_privacy.sql", "CREATE OR REPLACE FUNCTION public.mark_conversation_read"],
      ["supabase/migrations/20260610114000_respect_read_receipts_privacy.sql", "read_receipts"],
      ["supabase/tests/04_safety_smoke_test.sql", "public.current_user_allows_read_receipts()"],
      ["supabase/tests/04_safety_smoke_test.sql", "public.mark_conversation_read(uuid)"],
      ["supabase/tests/04_safety_smoke_test.sql", "Read receipt privacy off should not expose message read status"],
      ["supabase/tests/04_safety_smoke_test.sql", "Conversation unread count was not cleared when read receipts were hidden"],
    ],
  },
  {
    name: "Notification preferences",
    markers: [
      ["supabase/migrations/20260611123000_add_notification_preferences.sql", "CREATE TABLE IF NOT EXISTS public.user_notification_preferences"],
      ["supabase/migrations/20260611123000_add_notification_preferences.sql", "ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN"],
      ["supabase/migrations/20260611123000_add_notification_preferences.sql", "ADD COLUMN IF NOT EXISTS new_matches BOOLEAN"],
      ["supabase/migrations/20260611123000_add_notification_preferences.sql", "UPDATE public.user_notification_preferences"],
      ["supabase/migrations/20260611123000_add_notification_preferences.sql", "ALTER COLUMN push_enabled SET DEFAULT FALSE"],
      ["supabase/migrations/20260611123000_add_notification_preferences.sql", "ALTER COLUMN push_enabled SET NOT NULL"],
      ["supabase/migrations/20260611123000_add_notification_preferences.sql", "ALTER COLUMN new_matches SET NOT NULL"],
      ["supabase/migrations/20260611123000_add_notification_preferences.sql", "ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY"],
      ["supabase/migrations/20260611123000_add_notification_preferences.sql", "user_notification_preferences_push_children_check"],
      ["supabase/migrations/20260611123000_add_notification_preferences.sql", "CREATE OR REPLACE FUNCTION public.get_notification_preferences"],
      ["supabase/migrations/20260611123000_add_notification_preferences.sql", "CREATE OR REPLACE FUNCTION public.save_notification_preferences"],
      ["supabase/migrations/20260611123000_add_notification_preferences.sql", "v_push_enabled BOOLEAN := COALESCE(p_push_enabled, FALSE)"],
      ["supabase/migrations/20260611123000_add_notification_preferences.sql", "v_new_matches BOOLEAN := FALSE"],
      ["supabase/migrations/20260611123000_add_notification_preferences.sql", "IF v_push_enabled THEN"],
      ["supabase/migrations/20260611123000_add_notification_preferences.sql", "REVOKE ALL ON public.user_notification_preferences FROM authenticated"],
      ["supabase/migrations/20260611123000_add_notification_preferences.sql", "GRANT EXECUTE ON FUNCTION public.get_notification_preferences() TO authenticated"],
      ["src/features/account/api/notificationSettingsApi.ts", "getNotificationPreferences"],
      ["src/features/account/api/notificationSettingsApi.ts", "saveNotificationPreferences"],
      ["app/(main)/profile-settings/notifications.tsx", "These preferences are saved to your PinayMate account"],
      ["supabase/tests/05_release_preflight_audit.sql", "RPC: get_notification_preferences"],
      ["supabase/tests/05_release_preflight_audit.sql", "RLS enabled table: user_notification_preferences"],
      ["supabase/tests/05_release_preflight_audit.sql", "constraint: user_notification_preferences_push_children_check"],
      ["supabase/tests/04_safety_smoke_test.sql", "public.get_notification_preferences()"],
      ["supabase/tests/04_safety_smoke_test.sql", "Direct notification preference insert unexpectedly succeeded"],
      ["supabase/tests/04_safety_smoke_test.sql", "save_notification_preferences did not persist expected launch preferences"],
      ["supabase/tests/04_safety_smoke_test.sql", "SELECT public.save_notification_preferences(FALSE, TRUE, TRUE, TRUE, TRUE);"],
      ["supabase/tests/04_safety_smoke_test.sql", "save_notification_preferences did not clear push-dependent flags when push was disabled"],
    ],
  },
  {
    name: "Profile photo owner preflight",
    markers: [
      ["src/features/profile/api/profileApi.ts", "normalizeUserScopedProfilePhotoUrls"],
      ["src/features/profile/api/profileApi.ts", "filePath.startsWith(`${user.id}/`)"],
      ["src/features/profile/api/profileApi.ts", "filePath.startsWith(`${userId}/`)"],
      ["src/features/profile/api/profileApi.ts", "photos_completed: normalizedPhotoUrls.length > 0"],
      ["src/features/account/api/photosApi.ts", "getProfilePhotoOwnerPath"],
      ["src/features/account/api/photosApi.ts", "isUserScopedProfilePhoto(photo, user.id)"],
      ["src/features/account/api/photosApi.ts", "photo !== uploadResult.url && isUserScopedProfilePhoto(photo, user.id)"],
      ["src/features/profile/api/__tests__/profileApi.test.ts", "rejects profile photo delete paths outside the current user folder"],
      ["src/features/profile/api/__tests__/profileApi.test.ts", "rejects cross-user profile photo arrays before profile update"],
      ["src/features/account/api/__tests__/photosApi.test.ts", "other-user/leaked.jpg"],
      ["src/features/account/api/__tests__/photosApi.test.ts", "not.toContain"],
    ],
  },
  {
    name: "OCR rate limiting",
    markers: [
      ["supabase/config.toml", "[functions.ocr]"],
      ["supabase/config.toml", "verify_jwt = true"],
      ["supabase/migrations/20260610100323_add_ocr_rate_limit.sql", "CREATE TABLE IF NOT EXISTS public.ocr_usage_events"],
      ["supabase/migrations/20260610100323_add_ocr_rate_limit.sql", "CREATE OR REPLACE FUNCTION public.claim_ocr_attempt"],
      ["supabase/migrations/20260610100323_add_ocr_rate_limit.sql", "pg_advisory_xact_lock"],
      ["supabase/tests/04_safety_smoke_test.sql", "public.claim_ocr_attempt(integer, integer)"],
      ["supabase/functions/ocr/index.ts", "req.headers.get(\"authorization\")"],
      ["supabase/functions/ocr/index.ts", "authHeader.match(/^Bearer\\s+(.+)$/i)"],
      ["supabase/functions/ocr/index.ts", "/auth/v1/user"],
      ["supabase/functions/ocr/index.ts", "claim_ocr_attempt"],
      ["supabase/functions/ocr/index.ts", "/rest/v1/rpc/claim_ocr_attempt"],
      ["supabase/functions/ocr/index.ts", "OCR_SPACE_API_KEY"],
      ["supabase/functions/ocr/index.ts", "apikey: apiKey"],
      ["src/services/ocrService.ts", "MAX_OCR_DOCUMENT_BYTES"],
      ["src/services/ocrService.ts", "assertReadableOcrDocument"],
      ["src/services/ocrService.ts", "getFriendlyOcrError"],
      ["src/services/ocrService.ts", "supabase.auth.getSession()"],
      ["src/services/ocrService.ts", "headers.Authorization = `Bearer ${session.access_token}`"],
      ["src/services/ocrService.ts", "https://${projectRef}.functions.supabase.co/ocr"],
    ],
    forbiddenMarkers: [
      ["supabase/functions/ocr/index.ts", "bodyPreview"],
      ["supabase/functions/ocr/index.ts", "console.log("],
      ["supabase/functions/ocr/index.ts", "console.debug("],
      ["supabase/functions/ocr/index.ts", "console.info("],
    ],
  },
  {
    name: "Discovery read model",
    markers: [
      ["supabase/migrations/20260610115000_respect_online_status_privacy.sql", "CREATE VIEW public.discoverable_profiles"],
      ["supabase/migrations/20260610115000_respect_online_status_privacy.sql", "COALESCE(privacy_settings.profile_visible, TRUE) = TRUE"],
      ["supabase/migrations/20260610115000_respect_online_status_privacy.sql", "FROM public.user_blocks b"],
      ["supabase/migrations/99_final_release_security_hardening.sql", "WITH (security_invoker = false)"],
      ["supabase/migrations/99_final_release_security_hardening.sql", "COALESCE(privacy_settings.profile_visible, TRUE) = TRUE"],
      ["supabase/migrations/999_restore_profile_visibility_filter.sql", "CREATE VIEW public.discoverable_profiles"],
      ["supabase/migrations/999_restore_profile_visibility_filter.sql", "WITH (security_invoker = false)"],
      ["supabase/migrations/999_restore_profile_visibility_filter.sql", "COALESCE(privacy_settings.profile_visible, TRUE) = TRUE"],
      ["supabase/migrations/999_restore_profile_visibility_filter.sql", "FROM public.user_blocks b"],
      ["supabase/migrations/20260611122000_fix_discovery_privacy_read_model.sql", "WITH (security_invoker = false)"],
      ["supabase/migrations/20260611122000_fix_discovery_privacy_read_model.sql", "COALESCE(privacy_settings.profile_visible, TRUE) = TRUE"],
      ["supabase/migrations/20260611132000_harden_report_abuse_and_discovery_read_model.sql", "release gates forbid private verification evidence"],
      ["supabase/tests/04_safety_smoke_test.sql", "public.discoverable_profiles must not use security_invoker=true"],
      ["supabase/tests/04_safety_smoke_test.sql", "discoverable_profiles exposes sensitive or server-owned columns"],
      ["supabase/tests/04_safety_smoke_test.sql", "Profile visibility privacy setting did not hide member from discoverable_profiles"],
    ],
  },
  {
    name: "Conversations and messages",
    markers: [
      ["supabase/migrations/03_add_conversations_table.sql", "CREATE TABLE IF NOT EXISTS public.conversations"],
      ["supabase/migrations/04_production_security_hardening.sql", "CREATE OR REPLACE FUNCTION public.get_or_create_conversation"],
      ["supabase/migrations/04_production_security_hardening.sql", "CREATE OR REPLACE FUNCTION public.get_user_conversations"],
      ["supabase/migrations/04_production_security_hardening.sql", "CREATE POLICY \"Users can send messages\""],
      ["supabase/migrations/20260611120000_secure_send_message_rpc.sql", "CREATE OR REPLACE FUNCTION public.send_message"],
      ["supabase/migrations/20260611120000_secure_send_message_rpc.sql", "bucket_id = 'chat-images'"],
      ["supabase/migrations/20260611120000_secure_send_message_rpc.sql", "Image storage object was not found"],
      ["supabase/migrations/99_final_release_security_hardening.sql", "GRANT SELECT ON public.messages TO authenticated"],
      ["supabase/migrations/20260611120000_secure_send_message_rpc.sql", "REVOKE INSERT ON public.messages FROM authenticated"],
      ["src/features/messaging/api/messages.api.ts", "supabase.rpc(\"send_message\""],
      ["src/features/messaging/api/messages.api.ts", "assertConversationImagePath"],
      ["src/features/messaging/api/__tests__/messages.api.test.ts", "expect(supabase.from).not.toHaveBeenCalled()"],
      ["src/features/messaging/api/__tests__/messages.api.test.ts", "rejects image sends without a conversation-bound storage path"],
      ["supabase/tests/04_safety_smoke_test.sql", "public.send_message(uuid, text, text, text, uuid)"],
      ["supabase/tests/04_safety_smoke_test.sql", "has_table_privilege('authenticated', 'public.messages', 'INSERT')"],
      ["supabase/tests/04_safety_smoke_test.sql", "Blocked message RPC unexpectedly succeeded"],
      ["supabase/tests/04_safety_smoke_test.sql", "Forged chat image URL unexpectedly succeeded"],
      ["supabase/tests/04_safety_smoke_test.sql", "Missing chat image object unexpectedly succeeded"],
      ["supabase/tests/05_release_preflight_audit.sql", "RPC: send_message"],
      ["supabase/tests/04_safety_smoke_test.sql", "Unmatched conversation unexpectedly succeeded"],
      ["supabase/tests/04_safety_smoke_test.sql", "Blocked message RPC unexpectedly succeeded"],
    ],
    forbiddenMarkers: [
      ["supabase/migrations/99_final_release_security_hardening.sql", "GRANT SELECT, INSERT ON public.messages TO authenticated"],
      ["supabase/migrations/99_final_release_security_hardening.sql", "WITH (security_invoker = true)"],
      ["supabase/migrations/999_restore_profile_visibility_filter.sql", "WITH (security_invoker = true)"],
    ],
  },
];

const readCache = new Map();
const missing = [];
const passed = [];

function readRepoFile(relativePath) {
  if (!readCache.has(relativePath)) {
    const absolutePath = join(rootDir, relativePath);
    if (!existsSync(absolutePath)) {
      readCache.set(relativePath, null);
    } else {
      readCache.set(relativePath, readFileSync(absolutePath, "utf8"));
    }
  }

  return readCache.get(relativePath);
}

for (const check of checks) {
  const checkMissing = [];

  for (const [relativePath, marker] of check.markers) {
    const content = readRepoFile(relativePath);

    if (content === null) {
      checkMissing.push(`${relativePath} is missing`);
    } else if (!content.includes(marker)) {
      checkMissing.push(`${relativePath} missing marker: ${marker}`);
    }
  }

  for (const [relativePath, marker] of check.forbiddenMarkers ?? []) {
    const content = readRepoFile(relativePath);

    if (content !== null && content.includes(marker)) {
      checkMissing.push(`${relativePath} must not contain forbidden marker: ${marker}`);
    }
  }

  if (checkMissing.length > 0) {
    missing.push({ name: check.name, failures: checkMissing });
  } else {
    passed.push(check.name);
  }
}

const status = missing.length === 0 ? "PASS" : "FAIL";
const nowIso = new Date().toISOString();
const auditDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Manila",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());
const uniqueFiles = [...readCache.keys()].sort();
const report = [
  "# Supabase Static Contract Audit",
  "",
  `Date: ${auditDate}`,
  `Generated at: ${nowIso}`,
  `Command: \`npm run check:supabase-static-contract\``,
  `Status: ${status}`,
  "",
  "This is static-only proof. It checks that required migration, SQL smoke-test, OCR function, client-call, and forbidden privacy-risk markers match the local repository contract.",
  "",
  "It does not prove migrations were applied to a live Supabase project, that RLS/storage policies are active in production, that Supabase advisors pass, or that the OCR endpoint/rate limit works against a deployed database.",
  "",
  "## Passed Contracts",
  "",
  ...passed.map((name) => `- ${name}`),
  "",
  "## Missing Contracts",
  "",
  ...(missing.length === 0
    ? ["- None"]
    : missing.flatMap((check) => [
        `- ${check.name}`,
        ...check.failures.map((failure) => `  - ${failure}`),
      ])),
  "",
  "## Static Files Inspected",
  "",
  ...uniqueFiles.map((file) => `- \`${file}\``),
  "",
  "## Residual Live Blockers",
  "",
  "- Run Supabase migration history/list against the linked project.",
  "- Apply pending migrations to the target environment if migration history is behind.",
  "- Run Supabase DB lint/advisors against local or linked Postgres.",
  "- Run `supabase/tests/04_safety_smoke_test.sql` in a staging/local database with two active profiles.",
  "- Verify deployed OCR Edge Function rate limiting with real authenticated requests.",
  "",
].join("\n");

if (shouldWriteReport) {
  mkdirSync(dirname(evidencePath), { recursive: true });
  writeFileSync(evidencePath, report, "utf8");
}

for (const name of passed) {
  console.log(`PASS ${name}`);
}

for (const check of missing) {
  console.error(`FAIL ${check.name}`);
  for (const failure of check.failures) {
    console.error(`  - ${failure}`);
  }
}

console.log(`\nSupabase static contract audit: ${status}`);
console.log(`Passed: ${passed.length}`);
console.log(`Failed: ${missing.length}`);
if (shouldWriteReport) {
  console.log(`Evidence: ${evidencePath}`);
} else {
  console.log(
    "Evidence: not written. Pass --write-report or set PINAYMATE_WRITE_REPORT=1 to create the static audit evidence file.",
  );
}
console.log("Live DB applied state: NOT PROVEN by this static audit.");

if (missing.length > 0) {
  process.exitCode = 1;
}
