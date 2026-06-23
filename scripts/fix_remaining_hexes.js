const fs = require("fs");
const path = require("path");

const components = [
  "src/features/account/screens/AccountBasicInfoScreen.tsx",
  "src/features/account/screens/AccountProfilePhotosScreen.tsx",
  "src/features/account/screens/LocationScreen.tsx",
  "src/features/account/screens/PreferencesScreen.tsx",
  "src/features/account/screens/VerificationUploadScreen.tsx",
  "src/features/account/screens/WelcomeCompleteScreen.tsx",
];

const basePath = path.join(__dirname, "..");

components.forEach((relPath) => {
  const fullPath = path.join(basePath, relPath);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, "utf8");

  content = content.replace(/theme\.colors\.dalisay\[950\] \?\? "#0F0814"/g, "theme.semanticColors.background");
  content = content.replace(/theme\.colors\.dalisay\[950\]/g, "theme.semanticColors.background");
  
  content = content.replace(/colors=\{\[theme\.semanticColors\.background, "#1A0F1F"\]\}/g, "colors={[theme.semanticColors.background, theme.colors.dalisay[900]]}");
  content = content.replace(/colors=\{\[theme\.semanticColors\.background, "#1A0F1F", "#2D1B35"\]\}/g, "colors={[theme.semanticColors.background, theme.colors.dalisay[900], theme.colors.dalisay[900]]}");
  
  content = content.replace(/tone: "#F59E0B"/g, "tone: theme.semanticColors.warning");
  content = content.replace(/tone: "#8D69F6"/g, "tone: theme.semanticColors.secondary");
  
  content = content.replace(/color="#F59E0B"/g, 'color={theme.semanticColors.warning}');
  content = content.replace(/color="#22C55E"/g, 'color={theme.semanticColors.success}');
  content = content.replace(/color="#EF3E78"/g, 'color={theme.semanticColors.primary}');
  content = content.replace(/color="#FCA5A5"/g, 'color={theme.semanticColors.error}');
  
  content = content.replace(/color: "#FFF"/g, 'color: theme.colors.neutral.white');
  content = content.replace(/color: "#FFFFFF"/g, 'color: theme.colors.neutral.white');
  
  content = content.replace(/borderColor: "#EF4444"/g, 'borderColor: theme.semanticColors.error');
  content = content.replace(/color: "#FCA5A5"/g, 'color: theme.semanticColors.error');
  content = content.replace(/backgroundColor: "#EF3E78"/g, 'backgroundColor: theme.semanticColors.primary');

  content = content.replace(/const SUCCESS_GREEN = "#10B981";\n/g, "");
  content = content.replace(/const GOLD = "#F59E0B";\n/g, "");
  content = content.replace(/const WARNING_YELLOW = "#F59E0B";\n/g, "");
  content = content.replace(/const WHITE = "#FFFFFF";\n/g, "");
  
  content = content.replace(/const ACCENT_PURPLE = theme\.colors\.dalisay\?\.\[500\] \?\? "#8D69F6";\n/g, "const ACCENT_PURPLE = theme.semanticColors.secondary;\n");
  content = content.replace(/const ACCENT_PINK = theme\.colors\.amihan\?\.\[500\] \?\? "#EF3E78";\n/g, "const ACCENT_PINK = theme.semanticColors.primary;\n");

  fs.writeFileSync(fullPath, content, "utf8");
  console.log(`Refactored ${relPath}`);
});
