const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('dir /s /b src\\*.ts src\\*.tsx', { encoding: 'utf-8' })
  .split('\n')
  .map(f => f.trim())
  .filter(f => f && !f.includes('src\\theme\\colors.ts') && !f.includes('src\\theme\\index.ts') && !f.includes('src\\theme\\ThemeContext.tsx') && !f.includes('src\\theme\\makeStyles.ts'));

let modifiedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  let originalContent = content;

  if (!content.includes('const styles = StyleSheet.create({')) {
    continue;
  }

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
      // 1. Replace import
      const newImportSpecifiers = importSpecifiers.filter(s => s !== 'colors' && s !== 'semanticColors' && s !== 'theme');
      newImportSpecifiers.push('useAppTheme', 'makeStyles');
      const newImport = `import { ${Array.from(new Set(newImportSpecifiers)).join(', ')} } from "@/src/theme";`;
      content = content.replace(importStatementStr, newImport);

      // 2. Change style creation
      content = content.replace('const styles = StyleSheet.create({', 'const useStyles = makeStyles((theme) => ({');
      // Fix closing of styles
      content = content.replace(/^}\);/gm, '}));');
      
      // 3. Inject `const theme = useAppTheme();` and `const styles = useStyles();`
      const componentRegexes = [
        /(export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{)/g,
        /(export\s+function\s+\w+\s*\([^)]*\)\s*\{)/g,
        /(const\s+\w+\s*=\s*(?:<[^>]+>\s*)?\([^)]*\)\s*(?::\s*[^=]+)?\s*=>\s*\{)/g,
        /(const\s+\w+\s*:\s*React\.FC(?:<[^>]+>)?\s*=\s*\([^)]*\)\s*=>\s*\{)/g,
        /(const\s+\w+\s*=\s*React\.memo\([^=]*=>\s*\{)/g,
        /(function\s+[A-Z]\w+\s*\([^)]*\)\s*\{)/g
      ];

      let injected = false;
      for (const regex of componentRegexes) {
        if (regex.test(content)) {
          content = content.replace(regex, `$1\n  const theme = useAppTheme();\n  const styles = useStyles();\n`);
          injected = true;
          break;
        }
      }

      // 4. Replace usages
      content = content.replace(/(?<!theme\.)colors\./g, 'theme.colors.');
      content = content.replace(/(?<!theme\.)semanticColors\./g, 'theme.semanticColors.');

      if (injected && content !== originalContent) {
        fs.writeFileSync(file, content, 'utf-8');
        modifiedCount++;
      }
    }
  }
}

console.log(`Successfully refactored ${modifiedCount} files.`);
