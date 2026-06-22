const cp = require('child_process');
const fs = require('fs');

const files = cp.execSync('dir /s /b src\\*.ts src\\*.tsx', { encoding: 'utf-8' })
  .split('\n')
  .map(f => f.trim())
  .filter(f => f && !f.includes('theme\\colors.ts') && !f.includes('theme\\index.ts') && !f.includes('theme\\ThemeContext.tsx') && !f.includes('theme\\makeStyles.ts'));

let count = 0;
files.forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  if (c.includes('import { colors') || c.includes('import { semanticColors') || c.match(/import\s+\{[^}]*theme[^}]*\}\s+from\s+["'](?:@\/src\/theme|\.\.?\/\.\.?\/theme)["']/)) {
    console.log(f);
    count++;
  }
});
console.log('Total:', count);
