const fs = require('fs');
const path = require('path');

const filesToFix = [
    'src/features/matching/components/MatchModal.tsx',
    'src/features/matching/components/ProfileDetailsModal.tsx',
    'src/features/matching/screens/DiscoverScreen.tsx'
];

for (const relPath of filesToFix) {
    const fullPath = path.join(__dirname, '..', relPath);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Find import { ... } from "react-native"
    const rnImportRegex = /import\s+\{([^}]+)\}\s+from\s+["']react-native["']/;
    const match = content.match(rnImportRegex);
    if (match) {
        if (!match[1].includes('StyleSheet')) {
            const newImport = match[0].replace(/import\s+\{/, 'import { StyleSheet, ');
            content = content.replace(match[0], newImport);
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log('Added StyleSheet to ' + relPath);
        }
    }
}
