const fs = require('fs');

let b = fs.readFileSync('src/features/messaging/components/MessageBubble.tsx', 'utf-8');
b = b.replace('userImage?: string | null;', 'userImage?: string | null;\n  onSwipeToReply?: (message: any) => void;');
fs.writeFileSync('src/features/messaging/components/MessageBubble.tsx', b);

let c = fs.readFileSync('src/features/messaging/screens/ChatScreen.tsx', 'utf-8');
c = c.replace('import {\n  Reply,\n  LinearGradient } from "expo-linear-gradient";', 'import { LinearGradient } from "expo-linear-gradient";');
c = c.replace('import {\n  AlertCircle,', 'import {\n  Reply,\n  AlertCircle,');
c = c.replace(/MY_MESSAGE_BG/g, '"rgba(141, 105, 246, 0.25)"');
c = c.replace(/THEIR_MESSAGE_BG/g, '"rgba(255, 255, 255, 0.08)"');
fs.writeFileSync('src/features/messaging/screens/ChatScreen.tsx', c);
