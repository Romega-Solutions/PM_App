const fs = require('fs');
const path = 'src/features/matching/components/LikesFilter.tsx';
let content = fs.readFileSync(path, 'utf8');
content = content.replace('borderBottomColor: theme.semanticColors.primary,', '// borderBottomColor: ACCENT_PINK\n      borderBottomColor: theme.semanticColors.primary,');
fs.writeFileSync(path, content);
console.log('Fixed LikesFilter design string.');
