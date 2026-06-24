const fs = require("fs");
const path = require("path");

const components = [
  "src/features/profile/components/EditProfileHeader.tsx",
  "src/features/profile/components/ProfileEditForm.tsx",
  "src/features/profile/components/ProfileHeader.tsx",
  "src/features/profile/components/ProfileMenuList.tsx",
  "src/features/profile/components/ProfilePhotoSection.tsx",
  "src/features/profile/screens/EditProfileScreen.tsx",
];

const basePath = path.join(__dirname, "..");

components.forEach((relPath) => {
  const fullPath = path.join(basePath, relPath);
  let content = fs.readFileSync(fullPath, "utf8");

  if (content.includes("makeStyles")) {
    console.log(`Skipping ${relPath}, already refactored.`);
    return;
  }

  // 1. Add imports
  let importsAdded = false;
  content = content.replace(
    /import \{[^}]+\} from "react-native";/g,
    (match) => {
      if (importsAdded) return match;
      importsAdded = true;
      return `${match.replace("StyleSheet, ", "").replace("  StyleSheet,\\n", "").replace("StyleSheet,\\n", "")}\nimport { makeStyles } from "../../../theme/makeStyles";\nimport { useAppTheme, AppTheme } from "../../../theme/ThemeContext";`;
    }
  );

  // Fallback for EditProfileScreen which has different imports
  if (!importsAdded && content.includes('import {\\n  ActivityIndicator,')) {
    content = content.replace(
      /import \{\n  ActivityIndicator,[\s\S]*?\} from "react-native";/,
      (match) => {
        return `${match.replace("  StyleSheet,\n", "")}\nimport { makeStyles } from "../../../theme/makeStyles";\nimport { useAppTheme } from "../../../theme/ThemeContext";`;
      }
    );
  }

  // 2. Remove Brand Colors
  content = content.replace(/const BRAND_BG = "#0F0814";\n/g, "");
  content = content.replace(/const ACCENT_PURPLE = "#8D69F6";\n/g, "");
  content = content.replace(/const ACCENT_PINK = "#EF3E78";\n/g, "");
  content = content.replace(/const WHITE = "#FFFFFF";\n/g, "");
  content = content.replace(/const VERIFIED_GREEN = "#10B981";\n/g, "");
  content = content.replace(/const WARNING_YELLOW = "#F59E0B";\n/g, "");
  content = content.replace(/const SURFACE_STRONG = "rgba\(255, 255, 255, 0.08\)";\n/g, "");
  content = content.replace(/const TILE_BORDER = "rgba\(168, 85, 247, 0.13\)";\n/g, "");
  content = content.replace(/const DANGER_BG = "rgba\(239, 62, 120, 0.12\)";\n/g, "");

  // 3. Update StyleSheet.create to makeStyles
  content = content.replace(
    /const styles = StyleSheet.create\(\{/g,
    "const useStyles = makeStyles((theme) => ({"
  );
  content = content.replace(/\}\);(\s*)$/g, "}));$1");

  // 4. Inject hooks inside components
  content = content.replace(
    /export const ([a-zA-Z0-9_]+): React.FC<[^>]+> = \(([^)]+)\) => \{/g,
    (match) => `${match}\n  const styles = useStyles();\n  const theme = useAppTheme();`
  );
  content = content.replace(
    /export default function ([a-zA-Z0-9_]+)\(\) \{/g,
    (match) => `${match}\n  const styles = useStyles();\n  const theme = useAppTheme();`
  );

  // 5. Replace colors inside styles and components
  // EditProfileHeader
  content = content.replace(/backgroundColor: BRAND_BG/g, "backgroundColor: theme.semanticColors.background");
  content = content.replace(/color={WHITE}/g, "color={theme.semanticColors.text}");
  content = content.replace(/color={ACCENT_PINK}/g, "color={theme.semanticColors.primary}");
  content = content.replace(/color: WHITE/g, "color: theme.semanticColors.text");

  // ProfileEditForm
  content = content.replace(/backgroundColor: SURFACE_STRONG/g, 'backgroundColor: "rgba(255, 255, 255, 0.08)"');
  content = content.replace(/borderColor: TILE_BORDER/g, 'borderColor: "rgba(168, 85, 247, 0.13)"');

  // ProfileHeader
  content = content.replace(/borderColor: ACCENT_PURPLE/g, "borderColor: theme.semanticColors.secondary");
  content = content.replace(/backgroundColor: \`\$\{ACCENT_PURPLE\}22\`/g, 'backgroundColor: "rgba(141, 105, 246, 0.13)"');
  content = content.replace(/backgroundColor: ACCENT_PURPLE/g, "backgroundColor: theme.semanticColors.secondary");
  content = content.replace(/backgroundColor: VERIFIED_GREEN/g, "backgroundColor: theme.semanticColors.success");
  content = content.replace(/borderColor: WHITE/g, "borderColor: theme.colors.neutral.white");
  content = content.replace(/color: WHITE,/g, "color: theme.colors.neutral.white,");
  content = content.replace(/borderColor: WARNING_YELLOW/g, "borderColor: theme.semanticColors.warning");
  content = content.replace(/color: WARNING_YELLOW/g, "color: theme.semanticColors.warning");
  content = content.replace(/color={WHITE} strokeWidth=\{2.5\}/g, "color={theme.colors.neutral.white} strokeWidth={2.5}");

  // ProfileMenuList
  content = content.replace(/export const getDefaultMenuItems = \(\): MenuItem\[\] => \[/g, "export const getDefaultMenuItems = (theme: AppTheme): MenuItem[] => [");
  content = content.replace(/color=\{ACCENT_PURPLE\}/g, "color={theme.semanticColors.secondary}");
  content = content.replace(/color=\{ACCENT_PINK\}/g, "color={theme.semanticColors.primary}");
  content = content.replace(/backgroundColor: DANGER_BG/g, 'backgroundColor: "rgba(239, 62, 120, 0.12)"');
  content = content.replace(/borderColor: ACCENT_PINK/g, "borderColor: theme.semanticColors.primary");
  content = content.replace(/color: ACCENT_PINK/g, "color: theme.semanticColors.primary");

  // ProfilePhotoSection
  content = content.replace(/borderColor: ACCENT_PINK/g, "borderColor: theme.semanticColors.primary");
  content = content.replace(/color: ACCENT_PURPLE/g, "color: theme.semanticColors.secondary");
  content = content.replace(/\.\.\.StyleSheet\.absoluteFillObject,/g, 'position: "absolute",\n    left: 0,\n    top: 0,\n    right: 0,\n    bottom: 0,');

  // EditProfileScreen
  content = content.replace(/colors=\{\[BRAND_BG, "#1A0F1F", "#2D1B35", BRAND_BG\]\}/g, "colors={[\n          theme.semanticColors.background,\n          theme.colors.dalisay[900],\n          theme.colors.dalisay[900],\n          theme.semanticColors.background,\n        ]}");
  content = content.replace(/style=\{StyleSheet\.absoluteFill\}/g, "style={styles.absoluteFill}");
  if (relPath.includes("EditProfileScreen.tsx")) {
    content = content.replace(/const useStyles = makeStyles\(\(theme\) => \(\{\n  root: \{/g, "const useStyles = makeStyles((theme) => ({\n  absoluteFill: {\n    position: \"absolute\",\n    left: 0,\n    right: 0,\n    top: 0,\n    bottom: 0,\n  },\n  root: {");
  }

  fs.writeFileSync(fullPath, content, "utf8");
  console.log(`Refactored ${relPath}`);
});
