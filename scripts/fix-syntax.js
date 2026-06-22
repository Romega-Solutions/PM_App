const fs = require('fs');
let c = fs.readFileSync('src/features/messaging/components/MessageBubble.tsx', 'utf-8');
c = c.replace('}));\n\nMessageBubble.displayName', '});\n\nMessageBubble.displayName');
fs.writeFileSync('src/features/messaging/components/MessageBubble.tsx', c);
