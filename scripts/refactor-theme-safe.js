const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all ts/tsx files in src
const files = execSync('dir /s /b src\\*.ts src\\*.tsx', { encoding: 'utf-8' })
  .split('\n')
  .map(f => f.trim())
  .filter(f => f && !f.includes('src\\theme\\colors.ts') && !f.includes('src\\theme\\index.ts') && !f.includes('src\\theme\\ThemeContext.tsx'));

let modifiedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  let originalContent = content;

  // Check if file imports colors or semanticColors or theme from @/src/theme or ../theme
  const themeImportRegex = /import\s+\{([^}]*)\}\s+from\s+["'](?:@\/src\/theme|\.\.?\/\.\.?\/theme)["'];?/g;
  let match;
  let hasThemeImport = false;
  let importSpecifiers = [];
  let importStatementStr = '';

  while ((match = themeImportRegex.exec(content)) !== null) {
    hasThemeImport = true;
    importSpecifiers = match[1].split(',').map(s => s.trim()).filter(Boolean);
    importStatementStr = match[0];
  }

  if (hasThemeImport) {
    const usesColors = importSpecifiers.includes('colors');
    const usesSemanticColors = importSpecifiers.includes('semanticColors');
    const usesTheme = importSpecifiers.includes('theme');

    if (usesColors || usesSemanticColors || usesTheme) {
      // 1. Replace static import with useAppTheme
      const newImportSpecifiers = importSpecifiers.filter(s => s !== 'colors' && s !== 'semanticColors' && s !== 'theme');
      newImportSpecifiers.push('useAppTheme');
      const newImport = `import { ${Array.from(new Set(newImportSpecifiers)).join(', ')} } from "@/src/theme";`;
      content = content.replace(importStatementStr, newImport);

      // 2. Replace usages
      // Replace colors. -> theme.colors. (only if not already theme.colors.)
      content = content.replace(/(?<!theme\.)colors\./g, 'theme.colors.');
      // Replace semanticColors. -> theme.semanticColors. (only if not already theme.semanticColors.)
      content = content.replace(/(?<!theme\.)semanticColors\./g, 'theme.semanticColors.');

      // 3. Inject `const theme = useAppTheme();` into functional components
      // We look for typical component declarations
      const componentRegexes = [
        // export default function Name(...) {
        /(export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{)/g,
        // export function Name(...) {
        /(export\s+function\s+\w+\s*\([^)]*\)\s*\{)/g,
        // const Name = (...) => {
        /(const\s+\w+\s*=\s*(?:<[^>]+>\s*)?\([^)]*\)\s*(?::\s*[^=]+)?\s*=>\s*\{)/g,
        // const Name: React.FC<Props> = (...) => {
        /(const\s+\w+\s*:\s*React\.FC(?:<[^>]+>)?\s*=\s*\([^)]*\)\s*=>\s*\{)/g,
        // const Name = React.memo((...) => {
        /(const\s+\w+\s*=\s*React\.memo\([^=]*=>\s*\{)/g,
        // function Name(...) { (non-export)
        /(function\s+[A-Z]\w+\s*\([^)]*\)\s*\{)/g
      ];

      let injected = false;
      for (const regex of componentRegexes) {
        if (regex.test(content)) {
          // If the file actually defines a component, inject the hook inside the first match
          content = content.replace(regex, `$1\n  const theme = useAppTheme();\n`);
          injected = true;
          break; // Only inject in the first component found (assuming one main component per file)
        }
      }

      if (injected || content.includes('useAppTheme')) {
        if (content !== originalContent) {
          fs.writeFileSync(file, content, 'utf-8');
          modifiedCount++;
        }
      }
    }
  }
}

console.log(`Successfully refactored ${modifiedCount} files.`);
