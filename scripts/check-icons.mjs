import fs from 'fs';
import path from 'path';

function findIconsInCode(dir, allIcons) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findIconsInCode(fullPath, allIcons);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const match = content.match(/import\s+{([^}]+)}\s+from\s+["']lucide-react-native["']/);
      if (match) {
        const imports = match[1].split(',').map(s => s.trim()).filter(Boolean);
        imports.forEach(i => allIcons.add(i));
      }
    }
  }
}

const allIcons = new Set();
findIconsInCode(path.join(process.cwd(), 'src'), allIcons);
findIconsInCode(path.join(process.cwd(), 'app'), allIcons);

console.log('All imported icons:', Array.from(allIcons).join(', '));

const missing = [];
for (const icon of allIcons) {
  const kebab = icon.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase().replace(/^-/, '');
  const p = path.join(process.cwd(), 'node_modules/lucide-react-native/dist/esm/icons', kebab + '.js');
  if (!fs.existsSync(p)) {
    missing.push({ icon, kebab });
  }
}

console.log('\nMissing icon files:', missing);
