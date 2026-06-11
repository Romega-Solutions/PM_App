import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));

const contracts = [
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
    path: "src/features/account/api/basicInfoApi.ts",
    markers: ["BASIC_INFO_SIGN_IN_ERROR", "BASIC_INFO_SAVE_ERROR"],
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
    ],
  },
  {
    path: "src/features/account/api/preferencesApi.ts",
    markers: ["PREFERENCES_SIGN_IN_ERROR", "PREFERENCES_SAVE_ERROR"],
  },
  {
    path: "src/features/account/api/privacyApi.ts",
    markers: ["DEFAULT_DELETION_ERROR"],
  },
  {
    path: "src/features/profile/api/profileApi.ts",
    markers: ["getSafeProfileError"],
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
    path: "src/features/matching/api/matchingApi.ts",
    markers: ["getSafeMatchingActionError"],
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
    ],
  },
  {
    path: "src/features/messaging/api/messagesApi.ts",
    markers: ["LEGACY_CONVERSATIONS_ERROR", "LEGACY_READ_STATUS_ERROR"],
  },
  {
    path: "src/features/messaging/hooks/useConversations.ts",
    markers: ["CONVERSATIONS_LOAD_ERROR"],
  },
];

const forbiddenPatterns = [
  {
    label: "raw throw of caught error",
    pattern: /catch\s*\([^)]*(error|err)[^)]*\)\s*\{[\s\S]{0,300}throw\s+\1\s*;/,
  },
  {
    label: "raw error object returned",
    pattern: /return\s*\{[\s\S]{0,180}\berror\s*:\s*(error|err)\b[\s\S]{0,80}\}/,
  },
  {
    label: "raw error.message returned",
    pattern:
      /return\s*\{[\s\S]{0,180}\berror\s*:\s*(error|err)\.message\b[\s\S]{0,80}\}/,
  },
  {
    label: "raw error.message passed to setError",
    pattern:
      /setError\(\s*(error|err)\s+instanceof\s+Error\s*\?\s*\1\.message\s*:/,
  },
  {
    label: "raw error.message thrown",
    pattern: /throw\s+new\s+Error\(\s*(error|err)\.message\b/,
  },
];

const failures = [];

function readRepoFile(relativePath) {
  const absolutePath = join(rootDir, relativePath);
  if (!existsSync(absolutePath)) return null;
  return readFileSync(absolutePath, "utf8");
}

for (const contract of contracts) {
  const content = readRepoFile(contract.path);

  if (content === null) {
    failures.push(`${contract.path} is missing`);
    continue;
  }

  for (const marker of contract.markers) {
    if (!content.includes(marker)) {
      failures.push(`${contract.path} missing safe-error marker: ${marker}`);
    }
  }

  for (const rule of forbiddenPatterns) {
    if (rule.pattern.test(content)) {
      failures.push(`${contract.path} contains forbidden pattern: ${rule.label}`);
    }
  }
}

if (failures.length > 0) {
  console.error("FAIL user-facing safe error contract");
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log("PASS user-facing safe error contract");
console.log(`Checked ${contracts.length} high-risk auth/account/profile/messaging files.`);
