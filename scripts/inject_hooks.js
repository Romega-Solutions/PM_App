const fs = require('fs');
const path = require('path');

function injectHooks(filepath, searchStr) {
    let fullPath = path.join(__dirname, '..', filepath);
    let content = fs.readFileSync(fullPath, 'utf8');
    if (!content.includes('const theme = useAppTheme();')) {
        content = content.replace(searchStr, searchStr + '\n  const theme = useAppTheme();\n  const styles = useStyles();');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Injected hooks in ' + filepath);
    }
}

injectHooks('src/features/matching/screens/DiscoverScreen.tsx', 'export const DiscoverScreen: React.FC = () => {');
injectHooks('src/features/matching/screens/LikesScreen.tsx', 'export default function LikesScreen() {');
