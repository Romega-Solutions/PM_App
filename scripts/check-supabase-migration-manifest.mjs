import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const manifestPath = join(rootDir, "supabase", "LAUNCH_MIGRATION_MANIFEST.md");
const migrationsDir = join(rootDir, "supabase", "migrations");

const expectedOrder = [
  "00_complete_database_setup.sql",
  "02_chat_schema_updates.sql",
  "03_add_conversations_table.sql",
  "04_production_core_hardening.sql",
  "20260610090000_restore_legacy_security_primitives.sql",
  "20260610094806_add_pinaymate_storage_buckets.sql",
  "20260610100323_add_ocr_rate_limit.sql",
  "20260610100523_add_basic_info_rpc.sql",
  "20260610112000_add_account_deletion_requests.sql",
  "20260610113000_add_privacy_settings.sql",
  "20260610114000_respect_read_receipts_privacy.sql",
  "20260610115000_respect_online_status_privacy.sql",
  "20260611040010_pass_profile_rpc.sql",
  "20260611120000_secure_send_message_rpc.sql",
  "20260611121000_harden_user_report_payload.sql",
  "20260611122000_fix_discovery_privacy_read_model.sql",
  "20260611123000_add_notification_preferences.sql",
  "20260611124000_repair_profile_creation_trigger.sql",
  "20260611125000_add_waitlist_interest_capture.sql",
  "20260611130000_add_report_review_workflow.sql",
  "20260611131000_add_verification_review_workflow.sql",
  "20260611132000_harden_report_abuse_and_discovery_read_model.sql",
  "20260611133000_require_report_reviewer_and_waitlist_burst_control.sql",
  "20260611134000_harden_moderation_audit_privileges.sql",
  "20260611135000_harden_verification_review_and_evidence_retention.sql",
  "20260611140000_add_waitlist_edge_abuse_control.sql",
  "20260611141000_restrict_conversation_creation_rpc.sql",
  "20260611142000_hide_empty_conversations_from_inbox.sql",
  "20260611143000_restrict_public_function_execute_defaults.sql",
  "999_restore_profile_visibility_filter.sql",
  "20260611144000_final_release_security_hardening.sql",
];

const tailMigrationOrderHazards = [
  {
    name: "20260611144000_final_release_security_hardening.sql",
    requiredMarkers: [
      "WITH (security_invoker = false)",
      "COALESCE(privacy_settings.profile_visible, TRUE) = TRUE",
      "GRANT SELECT ON public.messages TO authenticated",
      "REVOKE ALL ON public.messages FROM authenticated",
      "REVOKE ALL ON FUNCTION public.get_or_create_conversation(UUID, UUID)",
      "FROM PUBLIC, anon, authenticated, service_role",
      "WHERE c.last_message_id IS NOT NULL",
      "CREATE OR REPLACE FUNCTION public.pass_profile",
      "REVOKE ALL ON public.passes FROM authenticated",
      "GRANT SELECT, DELETE ON public.passes TO authenticated",
    ],
    forbiddenMarkers: [
      "GRANT SELECT, INSERT ON public.messages TO authenticated",
      "GRANT EXECUTE ON FUNCTION public.get_or_create_conversation(UUID, UUID) TO authenticated",
      "WITH (security_invoker = true)",
    ],
  },
  {
    name: "999_restore_profile_visibility_filter.sql",
    requiredMarkers: [
      "WITH (security_invoker = false)",
      "COALESCE(privacy_settings.profile_visible, TRUE) = TRUE",
      "FROM public.user_blocks b",
    ],
    forbiddenMarkers: ["WITH (security_invoker = true)"],
  },
];

const failures = [];

if (!existsSync(manifestPath)) {
  failures.push("supabase/LAUNCH_MIGRATION_MANIFEST.md is missing");
} else {
  const manifest = readFileSync(manifestPath, "utf8");
  const listedMigrations = [...manifest.matchAll(/^\d+\.\s+`([^`]+\.sql)`/gm)]
    .map((match) => match[1]);

  if (listedMigrations.length !== expectedOrder.length) {
    failures.push(
      `manifest lists ${listedMigrations.length} migrations; expected ${expectedOrder.length}`,
    );
  }

  for (const [index, expectedName] of expectedOrder.entries()) {
    const listedName = listedMigrations[index];

    if (listedName !== expectedName) {
      failures.push(
        `manifest item ${index + 1} should be ${expectedName}, found ${listedName ?? "missing"}`,
      );
    }

    const migrationPath = join(migrationsDir, expectedName);
    if (!existsSync(migrationPath)) {
      failures.push(`missing migration file: supabase/migrations/${expectedName}`);
    }
  }

  if (!manifest.includes("05_release_preflight_audit.sql")) {
    failures.push("manifest must require 05_release_preflight_audit.sql proof");
  }

  if (!manifest.includes("04_safety_smoke_test.sql")) {
    failures.push("manifest must require 04_safety_smoke_test.sql proof");
  }

  for (const notificationMarker of [
    "idempotent column/default/not-null hardening",
    "user_notification_preferences_push_children_check",
    "save_notification_preferences(FALSE, TRUE, TRUE, TRUE, TRUE)",
    "child flags are cleared when push is disabled",
  ]) {
    if (!manifest.includes(notificationMarker)) {
      failures.push(
        `manifest must document notification preference invariant marker: ${notificationMarker}`,
      );
    }
  }

  for (const profileCreationMarker of [
    "20260611124000_repair_profile_creation_trigger.sql",
    "public.handle_new_user()",
    "on_auth_user_created",
    "on_auth_user_verified",
  ]) {
    if (!manifest.includes(profileCreationMarker)) {
      failures.push(
        `manifest must document profile creation trigger marker: ${profileCreationMarker}`,
      );
    }
  }

  for (const waitlistMarker of [
    "20260611125000_add_waitlist_interest_capture.sql",
    "waitlist_signups",
    "submit_waitlist_signup",
    "direct table writes",
  ]) {
    if (!manifest.includes(waitlistMarker)) {
      failures.push(
        `manifest must document waitlist interest capture marker: ${waitlistMarker}`,
      );
    }
  }

  for (const reportReviewMarker of [
    "20260611130000_add_report_review_workflow.sql",
    "review_user_report",
    "reviewing",
    "resolved",
    "dismissed",
  ]) {
    if (!manifest.includes(reportReviewMarker)) {
      failures.push(
        `manifest must document report review workflow marker: ${reportReviewMarker}`,
      );
    }
  }

  for (const verificationReviewMarker of [
    "20260611131000_add_verification_review_workflow.sql",
    "review_profile_verification",
    "verification_reviewer_id",
    "approved",
    "rejected",
  ]) {
    if (!manifest.includes(verificationReviewMarker)) {
      failures.push(
        `manifest must document verification review workflow marker: ${verificationReviewMarker}`,
      );
    }
  }

  for (const reportAbuseMarker of [
    "20260611132000_harden_report_abuse_and_discovery_read_model.sql",
    "duplicate open reports",
    "sensitive columns",
    "discoverable_profiles",
  ]) {
    if (!manifest.includes(reportAbuseMarker)) {
      failures.push(
        `manifest must document report abuse and discovery read-model marker: ${reportAbuseMarker}`,
      );
    }
  }

  for (const reviewerWaitlistMarker of [
    "20260611133000_require_report_reviewer_and_waitlist_burst_control.sql",
    "reviewer identity",
    "active reviewer",
    "reviewer management RPC",
    "reviewer audit",
    "final review decision",
    "waitlist",
    "burst",
    "advisory bucket locking",
    "generic accepted responses",
  ]) {
    if (!manifest.includes(reviewerWaitlistMarker)) {
      failures.push(
        `manifest must document reviewer identity and waitlist burst-control marker: ${reviewerWaitlistMarker}`,
      );
    }
  }


  for (const waitlistEdgeMarker of [
    "20260611140000_add_waitlist_edge_abuse_control.sql",
    "waitlist-signup",
    "waitlist_edge_attempts",
    "claim_waitlist_edge_attempt",
    "service-role-only",
    "submit_waitlist_signup",
  ]) {
    if (!manifest.includes(waitlistEdgeMarker)) {
      failures.push(
        `manifest must document waitlist Edge Function marker: ${waitlistEdgeMarker}`,
      );
    }
  }

  for (const conversationCreationMarker of [
    "20260611141000_restrict_conversation_creation_rpc.sql",
    "get_or_create_conversation",
    "private helper",
    "send_message",
    "empty visible conversation rows",
  ]) {
    if (!manifest.includes(conversationCreationMarker)) {
      failures.push(
        `manifest must document private conversation creation marker: ${conversationCreationMarker}`,
      );
    }
  }

  for (const emptyConversationMarker of [
    "20260611142000_hide_empty_conversations_from_inbox.sql",
    "get_user_conversations",
    "last_message_id",
    "real last message",
  ]) {
    if (!manifest.includes(emptyConversationMarker)) {
      failures.push(
        `manifest must document empty conversation inbox marker: ${emptyConversationMarker}`,
      );
    }
  }
  for (const passProfileMarker of [
    "20260611040010_pass_profile_rpc.sql",
    "pass_profile",
    "REVOKE INSERT ON public.passes FROM authenticated",
  ]) {
    if (!manifest.includes(passProfileMarker)) {
      failures.push(
        `manifest must document pass profile RPC marker: ${passProfileMarker}`,
      );
    }
  }
  if (!manifest.includes("Tail migration ordering note")) {
    failures.push(
      "manifest must document the tail migration filename ordering hazard",
    );
  }

  const filenameOrder = [...expectedOrder].sort((left, right) =>
    left.localeCompare(right),
  );

  if (filenameOrder.join("\n") !== expectedOrder.join("\n")) {
    for (const migration of tailMigrationOrderHazards) {
      const migrationPath = join(migrationsDir, migration.name);

      if (!existsSync(migrationPath)) {
        failures.push(`missing tail migration file: supabase/migrations/${migration.name}`);
        continue;
      }

      const migrationSql = readFileSync(migrationPath, "utf8");

      for (const marker of migration.requiredMarkers) {
        if (!migrationSql.includes(marker)) {
          failures.push(`${migration.name} missing filename-order safety marker: ${marker}`);
        }
      }

      for (const marker of migration.forbiddenMarkers) {
        if (migrationSql.includes(marker)) {
          failures.push(`${migration.name} contains unsafe filename-order marker: ${marker}`);
        }
      }
    }
  }
}

if (failures.length > 0) {
  console.error("FAIL Supabase migration manifest contract");
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log("PASS Supabase migration manifest contract");
console.log(`Checked ${expectedOrder.length} ordered launch migrations.`);
