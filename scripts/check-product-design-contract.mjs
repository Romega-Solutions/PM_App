import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));

const requiredFiles = [
  {
    path: "src/components/ui/LaunchStateNotice.tsx",
    markers: [
      "LaunchStateNotice",
      "does not prove production readiness",
      "accessibilityLabel",
      "accessibilityHint",
      "accessibilityRole",
      "accessibilityElementsHidden",
      "importantForAccessibility",
      "testID",
      "collapsable",
      "StyleProp",
      "noticeCard",
      "noticeIcon",
    ],
  },
  {
    path: "src/features/account/screens/PreferencesScreen.tsx",
    markers: [
      "LaunchStateNotice",
      "account-preferences-launch-state-notice",
      "Preference-based discovery",
      "Preferences guide discovery",
      "do not guarantee visibility, chat, or a match",
      "do not override privacy settings, profile review",
      "launch cohort availability",
    ],
  },
  {
    path: "src/features/account/screens/VerificationUploadScreen.tsx",
    markers: [
      "LaunchStateNotice",
      "verification-upload-launch-state-notice",
      "Private review, not instant approval",
      "approval is not automatic",
      "does not guarantee another member is safe",
      "Skipping does not block account setup",
      "verified-badge and review-based trust cues stay unavailable",
      "Submitting files does not automatically approve a verified badge",
      "Skipping verification does not block setup",
    ],
  },
  {
    path: "src/features/account/screens/WelcomeCompleteScreen.tsx",
    markers: [
      "Launch-stage profile ready",
      "guarantee profile",
      "feature access",
      "Enter the launch-stage app",
      "Review safety and settings",
    ],
  },
  {
    path: "src/features/auth/screens/SignUpScreen.tsx",
    markers: [
      "Create your early-access",
      "Public matching, phone verification, social login, calls, and checkout remain launch-gated",
      "does not publish your profile, enable live matching, start calls, or open payment",
      "Email signup is the active path",
    ],
  },
  {
    path: "src/features/auth/screens/VerifyEmailScreen.tsx",
    markers: [
      "Email verification confirms sign-in for launch preparation",
      "does not publish your profile",
      "enable matching",
      "open paid features",
    ],
  },
  {
    path: "app/(auth)/verify-phone.tsx",
    markers: [
      "Phone verification is off for launch",
      "No SMS is sent and no phone badge is created",
      "does not send an SMS code",
      "change launch access",
    ],
  },
  {
    path: "src/features/auth/screens/SignInScreen.tsx",
    markers: [
      "Welcome back",
      "verified profiles",
      "clear account recovery",
      "Show password",
      "/(auth)/user-type-selection",
    ],
  },
  {
    path: "src/components/auth/VerifyEmailHeader.tsx",
    markers: [
      "Check your email",
      "Email verification step",
      "Tap the newest link to protect your profile setup",
    ],
  },
  {
    path: "src/features/matching/screens/DiscoverScreen.tsx",
    markers: [
      "LaunchStateNotice",
      "discover-launch-state-notice",
      "Discovery depends on privacy settings",
      "Visibility respected",
      "Review details before liking",
      "Retry this card",
      "Adjust filters",
      "profiles currently available for this launch stage",
      "launch cohorts, privacy settings, profile review",
    ],
  },
  {
    path: "src/features/matching/components/EmptyMatchesState.tsx",
    markers: [
      "LaunchStateNotice",
      "empty-matches-launch-state-notice",
      "Mutual matches only",
      "after both people choose each other",
      "launch-stage availability allows chat",
      "Keep private details private",
      "report anything that feels off",
    ],
  },
  {
    path: "src/features/matching/components/ProfileCard.tsx",
    markers: [
      "Review details before deciding",
      "Never share codes",
      "Preference fit",
      "View details first",
    ],
  },
  {
    path: "src/features/matching/components/MatchCard.tsx",
    markers: [
      "Verification reviewed",
      "Report concerns anytime",
      "Unmatch",
      "Report",
      "Message",
      "minHeight: 48",
    ],
  },
  {
    path: "src/features/messaging/screens/ChatScreen.tsx",
    markers: [
      "Write the first message...",
      "Type a respectful message...",
      "Messaging paused while this finishes...",
      "Message was not sent. Check your connection, review the text, and try again.",
      "Photo sharing unlocks after your first text starts this matched conversation",
      "Private chat photo",
      "Photo sharing available after first message",
      "Only send photos you are comfortable sharing in this chat",
      "Never",
      "Report safety concern",
      "Block member",
      "Unmatch only",
    ],
  },
  {
    path: "app/(modals)/report-user.tsx",
    markers: [
      "What support receives",
      "does not",
      "ask for passwords, payment details, or ID documents",
      "does not promise an instant moderation action",
      "not an",
      "emergency channel",
      "Retry block",
      "Reports help moderation review patterns",
    ],
  },
  {
    path: "src/features/messaging/screens/VoiceCallScreen.tsx",
    markers: [
      "Voice calls are off for launch",
      "no microphone permission was requested",
      "Calling will appear only after launch approval",
      "Report or block",
    ],
  },
  {
    path: "src/features/messaging/screens/VideoCallScreen.tsx",
    markers: [
      "Video calls are off for launch",
      "no camera or microphone permission was",
      "Calling will appear only after launch approval",
      "Report or block",
    ],
  },
  {
    path: "app/(main)/profile-settings/privacy.tsx",
    markers: [
      "LaunchStateNotice",
      "privacy-settings-launch-state-notice",
      "Backend-backed privacy controls",
      "source-backed privacy preferences",
      "current backend proof and support sign-off",
      "They do not override launch readiness",
      "Toggles are locked until PinayMate loads your saved privacy",
      "Your profile is hidden",
      "Account deletion is reviewed",
      "support",
      "may contact you before closing the request",
      "Request Account Deletion",
    ],
  },
  {
    path: "app/(main)/profile-settings/notifications.tsx",
    markers: [
      "LaunchStateNotice",
      "notification-settings-launch-state-notice",
      "Launch-stage controls",
      "Production push and email delivery still require provider setup",
      "do not prove production push or email delivery",
    ],
  },
  {
    path: "app/(main)/profile-settings/help.tsx",
    markers: [
      "Launch support boundary",
      "email-first during launch",
      "not emergency service, live chat, or instant moderation",
      "Do not send passwords",
      "payment details, ID documents, or private message screenshots by",
    ],
  },
  {
    path: "app/(main)/profile-settings/about.tsx",
    markers: [
      "is being built as a dating platform",
      "Launch-stage app",
      "public matching, calls, paid plans, store availability",
      "Verification Review",
      "not a safety guarantee",
    ],
  },
  {
    path: "src/features/profile/screens/ProfileScreen.tsx",
    markers: [
      "Launch-stage profile",
      "loads from your account",
      "Public discovery",
      "matching, calling, and paid features",
      "review status, and launch readiness",
    ],
  },
  {
    path: "docs/PRODUCT_DESIGN_QA_STANDARD.md",
    markers: [
      "PinayMate Product Design QA Standard",
      "docs/PINAYMATE_LAUNCH_STATE_MATRIX.md",
      "PM_App design gates",
      "PM_Web design gates",
      "Launch-state accuracy",
      "Each design QA pass must include a launch-state note",
      "the UI must not make that feature look live",
      "Launch decision rule",
    ],
  },
  {
    path: "docs/PINAYMATE_LAUNCH_STATE_MATRIX.md",
    markers: [
      "Single launch-state source of truth",
      "PM_App is a launch-stage app experience",
      "No profile is created from PM_Web",
      "Matching is not promised today",
      "Payments are planned interest only",
      "Voice and video calls are off for launch",
      "Reports are not emergency service",
      "Feature availability and proof map",
      "User-facing state today",
      "Proof required before launch-ready",
      "Production-ready requires current local checks plus target-environment proof",
    ],
  },
];

const forbiddenPatterns = [
  {
    label: "verification or safety guarantee",
    pattern:
      /(?<!not\s)\b(?:guaranteed|guarantee)\s+(?:safe|safety|identity|real identities|verified profiles|verified users|matches|love)\b/i,
  },
  {
    label: "live voice or video call claim before provider proof",
    pattern: /\b(?:start|join|place)\s+(?:a\s+)?(?:voice|video)\s+call\s+now\b/i,
  },
  {
    label: "live matching claim before launch proof",
    pattern: /\b(?:start|begin|open)\s+matching\s+(?:now|today|instantly)\b/i,
  },
  {
    label: "live payment or checkout claim before proof",
    pattern: /\b(?:pay now|subscribe now|checkout now|upgrade now|buy now)\b/i,
  },
  {
    label: "instant account deletion claim",
    pattern:
      /\b(?:instantly|immediately)\s+(?:delete|erase)\s+(?:your\s+)?account\b/i,
    allowIfPattern:
      /\b(?:does\s+not|do\s+not|not)\s+(?:instantly|immediately)\s+(?:delete|erase)\s+(?:your\s+)?account\b/i,
  },
  {
    label: "unqualified verification approval",
    pattern: /\b(?:auto-approved|automatically verified|verified instantly)\b/i,
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
      failures.push(`${requiredFile.path} missing design marker: ${marker}`);
    }
  }

  for (const forbiddenPattern of forbiddenPatterns) {
    if (
      forbiddenPattern.pattern.test(content) &&
      !forbiddenPattern.allowIfPattern?.test(content)
    ) {
      failures.push(
        `${requiredFile.path} contains forbidden design claim: ${forbiddenPattern.label}`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error("FAIL PM_App product design contract");
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log("PASS PM_App product design contract");
console.log(
  "Checked auth, verification, discovery, match cards, messaging, report, privacy, and design QA standard markers.",
);
