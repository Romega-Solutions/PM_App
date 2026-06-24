const fs = require('fs');
let c = fs.readFileSync('src/features/messaging/screens/ChatScreen.tsx', 'utf-8');
c = c.replace('import {\n  Reply, LinearGradient } from "expo-linear-gradient";', 'import { LinearGradient } from "expo-linear-gradient";');
fs.writeFileSync('src/features/messaging/screens/ChatScreen.tsx', c);
