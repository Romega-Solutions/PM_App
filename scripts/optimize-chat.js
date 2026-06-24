const fs = require('fs');
const path = require('path');
const file = path.resolve('src/features/messaging/screens/ChatScreen.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Memoize renderItem dependencies
content = content.replace(
  '    }, [currentUserId, userName, params.userImage]);',
  '    }, [currentUserId, userName, params.userImage, handleSwipeToReply]);'
);

// 2. Memoize keyExtractor
content = content.replace(
  '  const renderItem = useCallback(({ item }: { item: MessageType }) => {',
  '  const keyExtractor = useCallback((item: MessageType) => item.id, []);\n\n  const renderItem = useCallback(({ item }: { item: MessageType }) => {'
);

// 3. Update FlatList to use the memoized keyExtractor
content = content.replace(
  'keyExtractor={(item) => item.id}',
  'keyExtractor={keyExtractor}'
);

fs.writeFileSync(file, content);
console.log('ChatScreen.tsx optimized successfully.');
