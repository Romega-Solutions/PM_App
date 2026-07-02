import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));

const requiredFiles = [
  {
    path: "docs/architecture/COMMERCE_SCOPE_DECISION.md",
    markers: [
      "PinayMate does not ship paid checkout, subscriptions, card collection",
      "PM_Web may show planned membership direction and collect plan-interest email only",
      "Paid members get more matches",
      "Backend schema for products, prices, subscriptions, payment records, webhook events, and entitlement state",
      "Webhook signature verification proof",
      "Plan-interest capture is useful for conversion learning",
      "docs/release/PINAYMATE_LAUNCH_STATE_MATRIX.md",
      "PM_Web/docs/release/PINAYMATE_LAUNCH_STATE_MATRIX.md",
    ],
  },
  {
    path: "docs/architecture/WAITLIST_ABUSE_RATE_LIMIT_DECISION.md",
    markers: [
      "PM_Web remains email-capture only until the backend waitlist RPC has target-environment proof",
      "submit_waitlist_signup",
      "edge/server route that enforces IP or fingerprint rate limits",
      "Turnstile or reCAPTCHA",
      "provider-level WAF/rate-limit rules",
      "anon and authenticated cannot directly select, insert, or update waitlist_signups",
      "must not ask for passwords, payment details, ID documents, precise location, private profile details, or private messages",
      "does not create an app account, dating profile, match request, matching session, checkout, payment record, verified badge, or paid access",
    ],
  },
  {
    path: "src/features/account/screens/PreferencesScreen.tsx",
    markers: [
      "LaunchStateNotice",
      "account-preferences-launch-state-notice",
      "Preference-based discovery",
      "do not guarantee a match",
      "account availability",
    ],
  },
  {
    path: "src/features/account/screens/VerificationUploadScreen.tsx",
    markers: [
      "LaunchStateNotice",
      "verification-upload-launch-state-notice",
      "Review-based verification",
      "Skipping does not block account setup",
      "verified badge appears only after approval",
      "Submitting files does not automatically approve a verified badge",
    ],
  },
  {
    path: "src/features/account/screens/WelcomeCompleteScreen.tsx",
    markers: [
      "Profile setup complete",
      "Matching can still vary",
      "Enter PinayMate",
      "Review settings first",
    ],
  },
  {
    path: "src/features/auth/screens/SignUpScreen.tsx",
    markers: [
      "Start with email signup",
      "Email signup is the active path",
    ],
  },
  {
    path: "src/features/auth/screens/VerifyEmailScreen.tsx",
    markers: [
      "Email verification confirms sign-in and keeps your account protected",
      "does not publish your profile",
    ],
  },
  {
    path: "app/(auth)/verify-phone.tsx",
    markers: [
      "Continue with email verification",
      "No SMS code is needed for this step",
      "protected account flow",
    ],
  },
  {
    path: "src/features/messaging/screens/VoiceCallScreen.tsx",
    markers: [
      "Keep this chat in messages",
      "No call was started and no microphone permission was requested",
      "Safety first",
    ],
  },
  {
    path: "src/features/messaging/screens/VideoCallScreen.tsx",
    markers: [
      "Keep this chat in messages",
      "No call was started and no camera or microphone permission was requested",
      "Safety first",
    ],
  },
  {
    path: "src/features/messaging/hooks/useMessages.ts",
    markers: [
      "getMessagesByConversationId",
      "if (!userId || (!conversationId && !recipientId)) return",
      "await getMessagesByConversationId(conversationId, 100)",
      "markConversationAsRead",
    ],
  },
  {
    path: "src/features/messaging/screens/ChatScreen.tsx",
    markers: [
      "activeConversationId",
      "markAsRead",
      "void markAsRead()",
      "setCreatedConversationId(sentMessage.conversation_id)",
      "Photo sharing unlocks after your first text starts this matched conversation",
    ],
  },
  {
    path: "app/(modals)/_layout.tsx",
    markers: ["report-user"],
  },
  {
    path: "app/(modals)/report-user.tsx",
    markers: [
      "SubmitUserReportInput",
      "source",
      "reportSafetyConcern",
      "not an emergency channel",
      "does not promise an instant moderation action",
    ],
  },
  {
    path: "src/features/safety/api/safetyApi.ts",
    markers: [
      "normalizeSafetyId",
      "normalizeConversationId",
      "MAX_REPORT_DETAILS_LENGTH",
      "Choose a reason for the report.",
    ],
  },
  {
    path: "supabase/migrations/20260611121000_harden_user_report_payload.sql",
    markers: [
      "CREATE OR REPLACE FUNCTION public.submit_user_report",
      "LEFT(BTRIM(COALESCE(p_reason, '')), 120)",
      "LEFT(BTRIM(COALESCE(p_details, '')), 800)",
      "v_source NOT IN ('chat', 'profile', 'likes', 'discovery', 'app')",
    ],
  },
  {
    path: "scripts/check-secret-hygiene.mjs",
    markers: ["ls-files", ".env"],
  },
  {
    path: "package.json",
    markers: [
      "check:source-contracts",
      "npm run check:secret-hygiene && npm run check:privacy-logs",
      "check:dependency-audit",
      "npm run check:source-contracts && npm run check:dependency-audit",
      "check:production-ownership-contract",
      "check:safety-operations-contract",
      "check:launch-evidence-contract",
      "check:product-design-contract",
      "check:notification-delivery-contract",
      "check:release-local",
      "check:local-quality",
      "check:supabase-static-contract:report",
    ],
  },
  {
    path: ".github/workflows/pm-app-ci.yml",
    markers: [
      "name: PM_App CI",
      "npm run check:source-contracts",
      "name: Dependency audit",
      "npm run check:dependency-audit",
      "npx tsc --noEmit --pretty false",
      "npm test -- --runInBand --no-cache",
      "npm run build:web",
    ],
  },
  {
    path: "scripts/check-launch-file-contract.mjs",
    markers: ["requiredFiles", "isTracked"],
  },
  {
    path: "scripts/check-privacy-logs.mjs",
    markers: ["supabase/functions", "console.log"],
  },
  {
    path: "scripts/check-safety-operations-contract.mjs",
    markers: ["check:safety-operations-contract", "safety operations release gate"],
  },
  {
    path: "scripts/check-launch-evidence-contract.mjs",
    markers: [
      "launch evidence contract",
      "Product design QA evidence",
      "Supabase staging evidence",
      "Final launch decision",
    ],
  },
  {
    path: "scripts/check-product-design-contract.mjs",
    markers: [
      "PM_App product design contract",
      "Preference-based discovery",
      "Private chat photo",
      "PRODUCT_DESIGN_QA_STANDARD.md",
    ],
  },
  {
    path: "scripts/check-notification-delivery-contract.mjs",
    markers: [
      "notification delivery contract",
      "Preference saved for your account. Delivery depends on your device and contact settings.",
      "Push and email delivery depend on your device settings",
      "forbidden notification claim",
    ],
  },
  {
    path: "app/(main)/profile-settings/notifications.tsx",
    markers: [
      "LaunchStateNotice",
      "notification-settings-launch-state-notice",
      "Notification controls",
      "Push and email delivery depend on your device settings",
      "Delivery depends on your device and contact settings",
    ],
  },
  {
    path: "src/components/ui/LaunchStateNotice.tsx",
    markers: [
      "LaunchStateNotice",
      "what may come later",
      "accessibilityLabel",
      "accessibilityHint",
      "accessibilityRole",
      "accessibilityElementsHidden",
      "importantForAccessibility",
      "testID",
      "collapsable",
      "StyleProp",
      "noticeIcon",
    ],
  },
  {
    path: "docs/testing/PRODUCT_DESIGN_QA_STANDARD.md",
    markers: [
      "PinayMate Product Design QA Standard",
      "docs/release/PINAYMATE_LAUNCH_STATE_MATRIX.md",
      "PM_App design gates",
      "PM_Web design gates",
      "Launch-state accuracy",
      "Launch decision rule",
    ],
  },
  {
    path: "docs/testing/NATIVE_QA_SCRIPT.md",
    markers: [
      "Launch-state notice accessibility QA",
      "launch-state-notice",
      "notification-settings-launch-state-notice",
      "verification-upload-launch-state-notice",
      "privacy-settings-launch-state-notice",
      "account-preferences-launch-state-notice",
      "discover-launch-state-notice",
      "empty-matches-launch-state-notice",
      "screen-reader hint",
      "large-text readability",
    ],
  },
  {
    path: "docs/evidence/TEMPLATE-native-qa-proof.md",
    markers: [
      "Native QA proof template",
      "Runtime setup",
      "Onboarding and account setup",
      "Verification and OCR",
      "Discovery, matching, and profile safety",
      "Messaging and safety actions",
      "Review first-message guidance",
      "first text starts the conversation",
      "Launch-state notice accessibility",
      "notification-settings-launch-state-notice",
      "empty-matches-launch-state-notice",
      "Final native QA decision",
    ],
  },
  {
    path: "docs/evidence/TEMPLATE-supabase-live-proof.md",
    markers: [
      "Supabase live proof template",
      "Full launch migration manifest applied in order",
      "RLS, grants, and policy proof",
      "Safety smoke SQL",
      "OCR Edge Function proof",
      "Notification delivery boundary",
      "Direct message insert denied to authenticated clients",
      "Notification preferences allowed only through RPCs",
      "rate limit blocks excess attempts",
      "provider delivery remains blocked or separately proven",
    ],
  },
  {
    path: "docs/operations/SUPABASE_LIVE_PROOF_COMMANDS.md",
    markers: [
      "Supabase Live Proof Commands",
      "supabase/LAUNCH_MIGRATION_MANIFEST.md",
      "npx supabase migration list",
      "supabase/tests/05_release_preflight_audit.sql",
      "supabase/tests/04_safety_smoke_test.sql",
      "npx supabase functions deploy ocr",
      "npx supabase secrets list",
      "save_notification_preferences",
      "direct table writes remain denied",
      "Only move Supabase rows from blocked/source-only to pass",
    ],
  },
  {
    path: "docs/release/LAUNCH_SIGNOFF_CHECKLIST.md",
    markers: [
      "docs/release/PINAYMATE_LAUNCH_STATE_MATRIX.md",
      "Launch-state claims",
      "Launch-state claim alignment",
      "Launch-state claim approval",
      "Launch-state claim control",
      "copy implies live matching, payments, app-store availability, automatic verification, instant moderation, SMS/calls, provider delivery, or production backend proof before evidence",
    ],
  },
  {
    path: "docs/operations/SAFETY_MODERATION_RUNBOOK.md",
    markers: [
      "docs/release/PINAYMATE_LAUNCH_STATE_MATRIX.md",
      "instant moderation",
      "emergency response",
      "guaranteed identity",
      "guaranteed safe matches",
      "source-only backend controls",
    ],
  },
  {
    path: "docs/release/PINAYMATE_LAUNCH_STATE_MATRIX.md",
    markers: [
      "Single launch-state source of truth",
      "PM_Web is a launch-interest and support surface",
      "PM_App is a launch-stage app experience",
      "No profile is created from PM_Web",
      "Matching is not promised today",
      "Payments are planned interest only",
      "SMS phone verification is off for launch",
      "Voice and video calls are off for launch",
      "Reports are not emergency service",
      "Notification preferences are backend-backed source controls",
      "Supabase launch proof requires applied migrations",
      "Feature availability and proof map",
      "Source/backend artifact",
      "Proof required before launch-ready",
      "Messaging APIs, secure send-message RPC, conversation RPCs",
      "Notification settings screen, notification preferences API, notification migration/RPCs",
    ],
  },
  {
    path: "docs/evidence/README.md",
    markers: [
      "Evidence Retention",
      "Historical one-off source-proof notes",
      "should not be treated as launch proof",
      "New evidence should be added only when it proves",
    ],
  },
  {
    path: "docs/evidence/release-2026-06-11-manager-readiness-pmapp-pmweb.md",
    markers: [
      "PinayMate Readiness Report",
      "source from what still requires external proof",
      "Messaging path now creates conversation state on first successful send",
      "PM_Web has release-safe messaging patterns",
    ],
  },
  {
    path: "docs/operations/SUPABASE_RELEASE_OPERATOR_CHECKLIST.md",
    markers: [
      "docs/release/PINAYMATE_LAUNCH_STATE_MATRIX.md",
      "user_notification_preferences_push_children_check",
      "save_notification_preferences(FALSE, TRUE, TRUE, TRUE, TRUE)",
      "Backend feature proof map",
      "notification provider delivery is claimed from preference RPC proof only",
    ],
  },
  {
    path: "scripts/check-supabase-static-contract.mjs",
    markers: [
      "OCR rate limiting",
      "forbiddenMarkers",
      "PINAYMATE_WRITE_REPORT",
      "--write-report",
      "Evidence: not written",
    ],
  },
  {
    path: "scripts/check-supabase-migration-manifest.mjs",
    markers: [
      "expectedOrder",
      "LAUNCH_MIGRATION_MANIFEST.md",
      "05_release_preflight_audit.sql",
      "04_safety_smoke_test.sql",
    ],
  },
  {
    path: "scripts/check-user-facing-safe-errors.mjs",
    markers: [
      "user-facing safe error contract",
      "forbiddenPatterns",
      "high-risk auth/account/profile/messaging files",
    ],
  },
  {
    path: "scripts/check-production-ownership-contract.mjs",
    markers: [
      "production ownership contract",
      "Romega-controlled",
      "expo.owner",
    ],
  },
  {
    path: "scripts/check-auth-redirect-contract.mjs",
    markers: [
      "auth redirect contract",
      "Linking.createURL",
      "verification-success",
      "reset-password",
    ],
  },
  {
    path: "scripts/check-env-template-contract.mjs",
    markers: [
      "env template contract",
      "EXPO_PUBLIC_SUPABASE_URL",
      "EXPO_PUBLIC_OCR_ENDPOINT",
    ],
  },
  {
    path: "supabase/config.toml",
    markers: ["[functions.ocr]", "verify_jwt = true"],
  },
  {
    path: "supabase/functions/ocr/index.ts",
    markers: ["OCR_SPACE_API_KEY", "claim_ocr_attempt", "/auth/v1/user"],
  },
  {
    path: "src/services/ocrService.ts",
    markers: [
      "MAX_OCR_DOCUMENT_BYTES",
      "assertReadableOcrDocument",
      "getImageContentType",
      "getFriendlyOcrError",
    ],
  },
  {
    path: "supabase/migrations/999_restore_profile_visibility_filter.sql",
    markers: ["profile_visible", "discoverable_profiles"],
  },
  {
    path: "supabase/LAUNCH_MIGRATION_MANIFEST.md",
    markers: [
      "04_production_core_hardening.sql",
      "20260610090000_restore_legacy_security_primitives.sql",
      "20260611120000_secure_send_message_rpc.sql",
      "20260611141000_restrict_conversation_creation_rpc.sql",
      "20260611142000_hide_empty_conversations_from_inbox.sql",
      "20260611122000_fix_discovery_privacy_read_model.sql",
      "20260611123000_add_notification_preferences.sql",
      "05_release_preflight_audit.sql",
      "04_safety_smoke_test.sql",
    ],
  },
  {
    path: "supabase/migrations/20260611123000_add_notification_preferences.sql",
    markers: [
      "CREATE TABLE IF NOT EXISTS public.user_notification_preferences",
      "user_notification_preferences_push_children_check",
      "v_push_enabled BOOLEAN := COALESCE(p_push_enabled, FALSE)",
      "v_new_matches := COALESCE(p_new_matches, FALSE)",
      "CREATE OR REPLACE FUNCTION public.get_notification_preferences",
      "CREATE OR REPLACE FUNCTION public.save_notification_preferences",
      "REVOKE ALL ON public.user_notification_preferences FROM authenticated",
    ],
  },
  {
    path: "src/features/account/api/__tests__/notificationSettingsApi.test.ts",
    markers: [
      "notificationSettingsApi",
      "get_notification_preferences",
      "save_notification_preferences",
      "p_push_enabled",
      "p_new_matches",
      "p_email_updates",
    ],
  },
  {
    path: "src/features/account/api/notificationSettingsApi.ts",
    markers: [
      "DEFAULT_NOTIFICATION_PREFERENCES",
      "getNotificationPreferences",
      "saveNotificationPreferences",
      "save_notification_preferences",
    ],
  },
  {
    path: "docs/evidence/backend-2026-06-11-supabase-static-contract.md",
    markers: [
      "Supabase Static Contract",
      "Notification preferences",
      "src/features/account/api/notificationSettingsApi.ts",
      "supabase/tests/04_safety_smoke_test.sql",
    ],
  },
  {
    path: "docs/evidence/release-2026-06-11-manager-readiness-pmapp-pmweb.md",
    markers: [
      "PM_App",
      "PM_Web",
      "controlled release",
      "source-state estimate",
    ],
  },
  {
    path: "docs/operations/SUPABASE_RELEASE_OPERATOR_CHECKLIST.md",
    markers: [
      "PinayMate Supabase Release Operator Checklist",
      "migration list --linked",
      "20260611123000_add_notification_preferences.sql",
      "05_release_preflight_audit.sql",
      "04_safety_smoke_test.sql",
      "functions deploy ocr",
    ],
  },
  {
    path: "docs/release/LAUNCH_SIGNOFF_CHECKLIST.md",
    markers: [
      "20260611123000_add_notification_preferences.sql",
      "notification preferences RPC",
      "push-disabled child flag clearing",
    ],
  },
  {
    path: "docs/release/RELEASE_READINESS.md",
    markers: [
      "20260611123000_add_notification_preferences.sql",
      "notification preference RPC controls",
      "push-disabled child flag clearing",
    ],
  },
  {
    path: "supabase/migrations/20260611122000_fix_discovery_privacy_read_model.sql",
    markers: [
      "WITH (security_invoker = false)",
      "COALESCE(privacy_settings.profile_visible, TRUE) = TRUE",
      "user_blocks",
    ],
  },
  {
    path: "supabase/tests/05_release_preflight_audit.sql",
    markers: [
      "verification-docs bucket must not be public",
      "RLS enabled table: user_privacy_settings",
      "RPC: send_message",
      "get_or_create_conversation must not be directly executable by app clients or service role",
      "get_user_conversations must hide empty conversations",
      "constraint: user_notification_preferences_push_children_check",
      "discoverable_profiles must reference profile_visible",
      "discoverable_profiles must enforce privacy flags internally instead of using security_invoker=true",
    ],
  },
  {
    path: "supabase/tests/04_safety_smoke_test.sql",
    markers: [
      "public.send_message(uuid, text, text, text, uuid)",
      "get_or_create_conversation direct execution unexpectedly exposed",
      "get_user_conversations no-empty-inbox guard is missing",
      "has_table_privilege('authenticated', 'public.messages', 'INSERT')",
      "SELECT public.save_notification_preferences(FALSE, TRUE, TRUE, TRUE, TRUE)",
      "save_notification_preferences did not clear push-dependent flags when push was disabled",
      "Blocked message RPC unexpectedly succeeded",
      "Forged chat image URL unexpectedly succeeded",
      "Missing chat image object unexpectedly succeeded",
      "Smoke invalid source report",
      "Invalid report source was not normalized to app",
    ],
  },
  {
    path: "supabase/migrations/20260611120000_secure_send_message_rpc.sql",
    markers: [
      "CREATE OR REPLACE FUNCTION public.send_message",
      "v_current_user UUID := auth.uid()",
      "storage.objects",
      "bucket_id = 'chat-images'",
      "REVOKE INSERT ON public.messages FROM authenticated",
    ],
  },
  {
    path: "src/features/account/api/basicInfoApi.ts",
    markers: [
      "BASIC_INFO_SIGN_IN_ERROR",
      "BASIC_INFO_SAVE_ERROR",
    ],
  },
  {
    path: "src/features/account/api/photosApi.ts",
    markers: ["PHOTO_SIGN_IN_ERROR", "PHOTO_SAVE_ERROR", "PHOTO_REMOVE_ERROR"],
  },
  {
    path: "src/features/account/api/locationApi.ts",
    markers: ["LOCATION_SIGN_IN_ERROR", "LOCATION_SAVE_ERROR"],
  },
  {
    path: "src/features/account/api/verificationApi.ts",
    markers: [
      "VERIFICATION_SIGN_IN_ERROR",
      "VERIFICATION_UPLOAD_ERROR",
      "VERIFICATION_SUBMIT_ERROR",
      "MAX_VERIFICATION_IMAGE_BYTES",
      "First name needs manual review",
    ],
  },
  {
    path: "src/features/profile/hooks/useUploadPhoto.ts",
    markers: [
      "PHOTO_PERMISSION_ERROR",
      "PHOTO_UPLOAD_ERROR",
      "PHOTO_DELETE_ERROR",
    ],
  },
  {
    path: "src/features/profile/hooks/useUpdateProfile.ts",
    markers: ["PROFILE_UPDATE_ERROR"],
  },
  {
    path: "src/features/profile/hooks/userProfile.ts",
    markers: ["PROFILE_LOAD_ERROR"],
  },
  {
    path: "src/features/messaging/hooks/useConversations.ts",
    markers: ["CONVERSATIONS_LOAD_ERROR"],
  },
  {
    path: "src/features/messaging/api/conversations.api.ts",
    markers: [
      "CONVERSATIONS_FETCH_ERROR",
      "CONVERSATION_FETCH_ERROR",
      "CONVERSATION_SIGN_IN_ERROR",
    ],
  },
  {
    path: "src/features/messaging/api/messages.api.ts",
    markers: [
      "MESSAGE_SEND_ERROR",
      "MESSAGE_LOAD_ERROR",
      "CHAT_IMAGE_UPLOAD_ERROR",
      "CHAT_IMAGE_DELETE_ERROR",
      "getAuthenticatedUserId",
      "assertConversationImagePath",
      "send_message",
      "p_recipient_id",
      "clampMessageLimit",
      "assertUuid",
    ],
  },
  {
    path: "src/features/messaging/api/__tests__/messages.api.test.ts",
    markers: [
      "signs private chat image storage paths before rendering",
      "stores the durable chat image path through send_message and returns a signed display URL",
      "rejects image sends without a conversation-bound storage path",
      "expect(supabase.from).not.toHaveBeenCalled()",
      "removes chat image storage paths only after authenticating the user",
      "rejects unsafe chat image delete paths before storage removal",
    ],
  },

  {
    path: "src/features/messaging/api/realtime.api.ts",
    markers: [
      "Realtime message hydration failed",
      "Realtime typing broadcast failed",
      "Realtime presence tracking failed",
    ],
  },
  {
    path: "src/features/auth/api/authApi.ts",
    markers: [
      "AUTH_SIGNUP_ERROR",
      "AUTH_SIGNIN_ERROR",
      "AUTH_PASSWORD_RESET_ERROR",
      "AUTH_PASSWORD_UPDATE_ERROR",
    ],
  },
  {
    path: "app/(main)/profile-settings/privacy.tsx",
    markers: [
      "LaunchStateNotice",
      "privacy-settings-launch-state-notice",
      "settingsLoadError",
      "privacy preferences",
      "current app access, safety review, and support process",
      "Profile visibility, read receipts, and account deletion requests follow",
      "Toggles are locked until PinayMate loads your saved privacy",
      "savingSetting !== null",
      "Your profile is hidden",
      "support may contact you before closing the request",
    ],
  },
  {
    path: "app/(main)/profile-settings/help.tsx",
    markers: [
      "Support by email",
      "PinayMate support is email-first",
      "not emergency service, live chat, or instant moderation",
      "Do not send passwords, payment details, ID documents, or private message screenshots by email",
    ],
  },
  {
    path: "app/(main)/profile-settings/about.tsx",
    markers: [
      "Dating with more context",
      "relationship intent, profile clarity",
      "Verification review",
    ],
  },
  {
    path: "src/features/profile/screens/ProfileScreen.tsx",
    markers: [
      "Profile access",
      "Discovery and connection features",
      "review status, and available app access",
    ],
  },
  {
    path: "src/features/matching/screens/DiscoverScreen.tsx",
    markers: [
      "LaunchStateNotice",
      "discover-launch-state-notice",
      "Preference-based discovery",
      "Visibility settings are respected",
      "report anything that feels off",
      "who is currently available",
      "Privacy settings, profile review, distance filters",
    ],
  },
  {
    path: "src/features/matching/components/ProfileCard.tsx",
    markers: ["Preference fit", "Never share codes"],
  },
  {
    path: "src/features/matching/components/EmptyMatchesState.tsx",
    markers: [
      "LaunchStateNotice",
      "empty-matches-launch-state-notice",
      "Mutual matches only",
      "You control the pace",
      "report anything",
      "after both people choose each other",
      "Chats open after both people choose each other.",
    ],
  },
];

function readRepoFile(relativePath) {
  const absolutePath = join(rootDir, relativePath);
  if (!existsSync(absolutePath)) return null;
  return readFileSync(absolutePath, "utf8");
}

function isTracked(relativePath) {
  try {
    execFileSync("git", ["ls-files", "--error-unmatch", relativePath], {
      cwd: rootDir,
      stdio: "pipe",
    });
    return true;
  } catch {
    return false;
  }
}

const failures = [];

for (const requiredFile of requiredFiles) {
  const content = readRepoFile(requiredFile.path);

  if (content === null) {
    failures.push(`${requiredFile.path} is missing`);
    continue;
  }

  if (!isTracked(requiredFile.path)) {
    failures.push(`${requiredFile.path} exists but is not tracked by git`);
  }

  for (const marker of requiredFile.markers) {
    if (!content.includes(marker)) {
      failures.push(`${requiredFile.path} missing marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("FAIL launch file contract");
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log("PASS launch file contract");
console.log(`Checked ${requiredFiles.length} launch-critical files.`);
