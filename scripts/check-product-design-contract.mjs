import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));

const requiredFiles = [
  {
    path: "app/_layout.tsx",
    markers: [
      "setupDeepLinking",
      "useAuthPersistence",
      "semanticColors.background",
      "Restoring session...",
      "Loading...",
      "StatusBar",
      "animation: \"slide_from_right\"",
      "Stack.Screen name=\"(auth)\"",
      "Stack.Screen name=\"(main)\"",
      "Stack.Screen name=\"(modals)\"",
    ],
  },
  {
    path: "app/index.tsx",
    markers: [
      "PinayMate logo",
      "PinayMate",
      "Profile-first Filipino dating",
      "Preparing PinayMate",
      "maxFontSizeMultiplier",
      "semanticColors.primary",
      "colors.dalisay[950]",
      "Redirect",
      "\"/(auth)/welcome\"",
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
      "account availability",
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
      "verified badge appears only after approval",
      "Submitting files does not automatically approve a verified badge",
      "Skipping verification does not block setup",
    ],
  },
  {
    path: "src/features/account/screens/WelcomeCompleteScreen.tsx",
    markers: [
      "Profile setup complete",
      "clearer discovery",
      "Matching can still vary",
      "Enter PinayMate",
      "Review safety and settings",
    ],
  },
  {
    path: "src/features/auth/screens/SignUpScreen.tsx",
    markers: [
      "Create your",
      "Start with email signup",
      "adjust privacy, verification, and discovery settings",
      "Email signup is the active path",
    ],
  },
  {
    path: "src/features/auth/screens/VerifyEmailScreen.tsx",
    markers: [
      "Email verification confirms sign-in and keeps your account protected",
      "does not publish your profile",
      "enable matching",
      "open paid features",
    ],
  },
  {
    path: "app/(auth)/verify-phone.tsx",
    markers: [
      "Continue with email verification",
      "No SMS code is needed for this step",
      "does not send an SMS code",
      "protected account flow",
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
      "Privacy settings, profile review, distance filters",
    ],
  },
  {
    path: "src/features/matching/components/EmptyMatchesState.tsx",
    markers: [
      "Mutual matches only",
      "You control the pace",
      "Chats open after both people choose each other",
      "report anything that feels off",
      "LaunchStateNotice",
      "empty-matches-launch-state-notice",
    ],
    forbiddenMarkers: ["guidancePill", "guidancePillQuiet"],
  },
  {
    path: "src/features/matching/screens/LikesScreen.tsx",
    markers: [
      "Before you message",
      "matchSafetyRule",
      "matchSafetyHeading",
      "Refresh matches",
      "rgba(255,255,255,0.72)",
    ],
    forbiddenMarkers: [
      "padding: 22",
      "borderColor: \"rgba(239, 62, 120, 0.28)\"",
      "backgroundColor: \"rgba(239, 62, 120, 0.12)\"",
    ],
  },
  {
    path: "src/features/matching/components/LikesFilter.tsx",
    markers: [
      "accessibilityRole=\"tablist\"",
      "borderBottomColor: ACCENT_PINK",
      "color: \"rgba(255,255,255,0.68)\"",
      "Show mutual matches only",
    ],
    forbiddenMarkers: [
      "SURFACE_BORDER",
      "countTextActive",
      "shadowColor: ACCENT_PINK",
      "backgroundColor: SURFACE",
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
      "matchStateText",
      "inlineActionBtn",
      "matchSeparator",
      "Unmatch",
      "Report",
      "Message",
      "minHeight: 48",
    ],
    forbiddenMarkers: [
      "statusPill",
      "statusPillMutual",
      "secondaryActionBtn",
      "unmatchBtn",
      "reportBtn",
      "aria-hidden",
    ],
  },
  {
    path: "src/features/matching/components/ProfileDetailsModal.tsx",
    markers: [
      "modalInterestDot",
      "modalDetailsList",
      "modalDetailRow",
      "safetyRule",
      "Report or block",
    ],
    forbiddenMarkers: [
      "modalInterestTag",
      "modalPill",
      "modalPillsContainer",
      "backgroundColor: \"rgba(239, 62, 120, 0.12)\"",
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
      "Keep this chat in messages",
      "no microphone permission was requested",
      "Safety first",
      "Report or block",
    ],
  },
  {
    path: "src/features/messaging/screens/VideoCallScreen.tsx",
    markers: [
      "Keep this chat in messages",
      "no camera or microphone permission was",
      "Safety first",
      "Report or block",
    ],
  },
  {
    path: "app/(main)/profile-settings/privacy.tsx",
    markers: [
      "LaunchStateNotice",
      "privacy-settings-launch-state-notice",
      "Privacy controls",
      "privacy preferences",
      "current app access, safety review, and support process",
      "Profile visibility, read receipts, and account deletion requests follow",
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
      "Notification controls",
      "Push and email delivery depend on your device settings",
      "Delivery depends on your device and contact settings",
    ],
  },
  {
    path: "app/(main)/profile-settings/help.tsx",
    markers: [
      "Support by email",
      "PinayMate support is email-first",
      "not emergency service, live chat, or instant moderation",
      "Do not send passwords",
      "payment details, ID documents, or private message screenshots by",
    ],
  },
  {
    path: "app/(main)/profile-settings/about.tsx",
    markers: [
      "helps Filipina women and foreign men build intentional",
      "Dating with more context",
      "relationship intent, profile clarity",
      "Privacy and safety controls",
      "Verification review",
      "Meaningful connections",
    ],
  },
  {
    path: "src/features/profile/screens/ProfileScreen.tsx",
    markers: [
      "Profile access",
      "loads from your account",
      "Discovery and connection features",
      "privacy settings, review status",
      "review status, and available app access",
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
      "Surface and card discipline",
      "Cards are allowed only when they group one clear topic or one clear object",
      "Do not use nested cards as the default way to create hierarchy",
      "PM_Web should feel more editorial and conversion-led",
      "PM_App should feel native and flow-led",
      "card spam",
      "nested-card hierarchy",
      "surface discipline is reviewed",
      "Each design QA pass must include a launch-state note",
      "the UI must not make that feature look live",
      "Launch decision rule",
    ],
  },
  {
    path: "docs/release/PINAYMATE_LAUNCH_STATE_MATRIX.md",
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

  for (const forbiddenMarker of requiredFile.forbiddenMarkers ?? []) {
    if (content.includes(forbiddenMarker)) {
      failures.push(
        `${requiredFile.path} contains forbidden design marker: ${forbiddenMarker}`,
      );
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
  "Checked auth, verification, discovery, match cards, messaging, report, privacy, launch-state accuracy, and anti-card-spam design standard markers.",
);
