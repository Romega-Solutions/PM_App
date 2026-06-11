import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));

const requiredFiles = [
  {
    path: "app/(main)/profile-settings/notifications.tsx",
    markers: [
      "Launch-stage controls",
      "do not prove production push or email delivery",
      "Production push and email delivery still require",
      "notification provider",
      "mailbox routing",
      "release sign-off",
      "Preference for mutual-match alerts after delivery is wired",
      "Preference for matched-message alerts after delivery is wired",
      "Preference for like alerts after delivery is wired",
      "Production email delivery requires mailbox and provider sign-off",
    ],
  },
  {
    path: "docs/NATIVE_QA_SCRIPT.md",
    markers: [
      "Open Notification settings",
      "launch-stage preferences, not proven production delivery",
    ],
  },
  {
    path: "docs/PRODUCT_DESIGN_QA_STANDARD.md",
    markers: [
      "notifications",
      "launch-stage preferences from proven delivery",
    ],
  },
  {
    path: "docs/LAUNCH_EVIDENCE_PACKET.md",
    markers: [
      "PM_App notification settings launch honesty",
      "PM_Web email and notification boundary",
    ],
  },
];

const forbiddenPatterns = [
  {
    label: "push delivery guarantee",
    pattern:
      /\b(?:push notifications|notification alerts?)\s+(?:are|is|will be)\s+(?:live|delivered|guaranteed|enabled in production)\b/i,
  },
  {
    label: "email delivery guarantee",
    pattern:
      /\b(?:email updates|email notifications|transactional emails?)\s+(?:are|is|will be)\s+(?:live|delivered|guaranteed|enabled in production)\b/i,
  },
  {
    label: "provider proof claim without evidence",
    pattern:
      /\b(?:Expo push|FCM|APNs|Resend|SendGrid|Mailgun)\s+(?:is|are)\s+(?:configured|verified|live|production-ready)\b/i,
  },
];

function readRepoFile(relativePath) {
  const absolutePath = join(rootDir, relativePath);

  if (!existsSync(absolutePath)) {
    return null;
  }

  return readFileSync(absolutePath, "utf8");
}

const failures = [];

for (const requiredFile of requiredFiles) {
  const content = readRepoFile(requiredFile.path);

  if (content === null) {
    failures.push(`${requiredFile.path} is missing`);
    continue;
  }

  for (const marker of requiredFile.markers) {
    if (!content.includes(marker)) {
      failures.push(`${requiredFile.path} missing notification boundary marker: ${marker}`);
    }
  }

  for (const forbiddenPattern of forbiddenPatterns) {
    if (forbiddenPattern.pattern.test(content)) {
      failures.push(
        `${requiredFile.path} contains forbidden notification claim: ${forbiddenPattern.label}`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error("FAIL notification delivery contract");
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log("PASS notification delivery contract");
console.log(
  "Checked launch-stage push/email preference wording, native QA coverage, design standard linkage, and forbidden delivery claims.",
);
