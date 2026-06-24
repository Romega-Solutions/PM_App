const fs = require('fs');
const path = require('path');

// Fix ActionButtons.tsx display name
const actionBtnsFile = path.resolve('src/features/matching/components/ActionButtons.tsx');
let actionBtnsContent = fs.readFileSync(actionBtnsFile, 'utf8');
if (!actionBtnsContent.includes('ActionButtons.displayName')) {
  actionBtnsContent += '\nActionButtons.displayName = \'ActionButtons\';\n';
  fs.writeFileSync(actionBtnsFile, actionBtnsContent);
  console.log('Fixed ActionButtons.tsx');
}

// Fix ChatScreen.tsx dependency array
const chatScreenFile = path.resolve('src/features/messaging/screens/ChatScreen.tsx');
let chatScreenContent = fs.readFileSync(chatScreenFile, 'utf8');
chatScreenContent = chatScreenContent.replace(
  /},\s*\[currentUserId,\s*userName,\s*params\.userImage\]\);/,
  '}, [currentUserId, userName, params.userImage, handleSwipeToReply]);'
);
fs.writeFileSync(chatScreenFile, chatScreenContent);
console.log('Fixed ChatScreen.tsx');
