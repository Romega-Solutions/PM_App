const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../src/features/messaging/screens/MessagesScreen.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Imports
content = content.replace(
  'import type { ConversationWithUser } from "../types/messaging.types";',
  'import type { ConversationWithUser } from "../types/messaging.types";\nimport { makeStyles, useAppTheme } from "@/src/theme";'
);

// 2. Remove Brand Colors globals
content = content.replace(
  /\/\/ Brand Colors\nconst BRAND_BG = "#0F0814";\nconst ACCENT_PURPLE = "#8D69F6";\nconst WHITE = "#FFFFFF";\nconst SURFACE = "rgba\(255,255,255,0\.06\)";\nconst SURFACE_BORDER = "rgba\(141,105,246,0\.18\)";\nconst TEXT_SECONDARY = "rgba\(255,255,255,0\.75\)";\nconst TEXT_MUTED = "rgba\(255,255,255,0\.5\)";/g,
  ''
);

// 3. Inject hooks
content = content.replace(
  'export const MessagesScreen: React.FC = () => {\n  const insets = useSafeAreaInsets();',
  'export const MessagesScreen: React.FC = () => {\n  const { theme } = useAppTheme();\n  const styles = useStyles();\n  const insets = useSafeAreaInsets();'
);

// 4. Replace JSX constants
content = content.replace(/backgroundColor={BRAND_BG}/g, 'backgroundColor={theme.semanticColors.background}');
content = content.replace(/color={ACCENT_PURPLE}/g, 'color={theme.semanticColors.secondary}');
content = content.replace(/color={TEXT_MUTED}/g, 'color="rgba(255,255,255,0.5)"');
content = content.replace(/placeholderTextColor={TEXT_MUTED}/g, 'placeholderTextColor="rgba(255,255,255,0.5)"');
content = content.replace(/color={TEXT_SECONDARY}/g, 'color="rgba(255,255,255,0.75)"');
content = content.replace(/color={WHITE}/g, 'color={theme.colors.neutral.white}');

// 5. Replace StyleSheet.create
content = content.replace(
  /const styles = StyleSheet\.create\({/g,
  'const useStyles = makeStyles((theme) => ({'
);

// 6. Replace style constants
content = content.replace(/backgroundColor: BRAND_BG/g, 'backgroundColor: theme.semanticColors.background');
content = content.replace(/backgroundColor: SURFACE/g, 'backgroundColor: theme.semanticColors.surface');
content = content.replace(/backgroundColor: ACCENT_PURPLE/g, 'backgroundColor: theme.semanticColors.secondary');
content = content.replace(/color: WHITE/g, 'color: theme.colors.neutral.white');
content = content.replace(/color: TEXT_MUTED/g, 'color: "rgba(255,255,255,0.5)"');
content = content.replace(/color: TEXT_SECONDARY/g, 'color: "rgba(255,255,255,0.75)"');
content = content.replace(/borderColor: SURFACE_BORDER/g, 'borderColor: "rgba(141,105,246,0.18)"');

// We also need to fix `});` at the end of the file to `}));`
content = content.replace(
  /\n\}\);\n$/g,
  '\n}));\n'
);

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Fixed MessagesScreen.tsx');
