const fs = require('fs');

let chat = fs.readFileSync('src/features/messaging/screens/ChatScreen.tsx', 'utf-8');

// Replace constants
chat = chat.replace(/const BRAND_BG = "#0F0814";\r?\nconst ACCENT_PURPLE = "#8D69F6";\r?\nconst DANGER_RED = "#FF6B6B";\r?\nconst ONLINE_GREEN = "#10B981";\r?\nconst WHITE = "#FFFFFF";\r?\nconst SURFACE = "rgba\(255,255,255,0\.06\)";\r?\nconst MY_MESSAGE_BG = "rgba\(141, 105, 246, 0\.25\)";\r?\nconst THEIR_MESSAGE_BG = "rgba\(255, 255, 255, 0\.08\)";\r?\nconst TEXT_SECONDARY = "rgba\(255,255,255,0\.75\)";\r?\nconst TEXT_MUTED = "rgba\(255,255,255,0\.5\)";\r?\n/, '');

chat = chat.replace('import { MessageBubble } from "../components/MessageBubble";', 'import { MessageBubble } from "../components/MessageBubble";\nimport { useAppTheme, makeStyles } from "@/src/theme";');

chat = chat.replace('export default function ChatScreen() {',
`export default function ChatScreen() {
  const theme = useAppTheme();
  const styles = useStyles();
  const BRAND_BG = theme.colors.dalisay[950];
  const ACCENT_PURPLE = theme.colors.dalisay[500];
  const DANGER_RED = theme.colors.amihan[500];
  const ONLINE_GREEN = "#10B981";
  const WHITE = "#FFFFFF";
  const SURFACE = "rgba(255,255,255,0.06)";
  const TEXT_SECONDARY = "rgba(255,255,255,0.75)";
  const TEXT_MUTED = "rgba(255,255,255,0.5)";`);

chat = chat.replace('const styles = StyleSheet.create({',
`const useStyles = makeStyles((theme) => {
  const BRAND_BG = theme.colors.dalisay[950];
  const ACCENT_PURPLE = theme.colors.dalisay[500];
  const DANGER_RED = theme.colors.amihan[500];
  const ONLINE_GREEN = "#10B981";
  const WHITE = "#FFFFFF";
  const SURFACE = "rgba(255,255,255,0.06)";
  const TEXT_SECONDARY = "rgba(255,255,255,0.75)";
  const TEXT_MUTED = "rgba(255,255,255,0.5)";
  return {`);

chat = chat.replace(/^}\);/gm, '  };\n});');

// Add swipe-to-reply handling
chat = chat.replace(
  'const inputRef = useRef<TextInput>(null);',
  `const inputRef = useRef<TextInput>(null);
  const [replyingTo, setReplyingTo] = useState<MessageType | null>(null);

  const handleSwipeToReply = useCallback((message: MessageType) => {
    setReplyingTo(message);
    inputRef.current?.focus();
  }, []);`
);

// Pass onSwipeToReply
chat = chat.replace(
  'userName={userName}',
  'userName={userName}\n          onSwipeToReply={handleSwipeToReply}'
);

// Add reply UI above the TextInput
const replyUI = `{replyingTo && (
              <View style={styles.replyingToContainer}>
                <View style={styles.replyingToHeader}>
                  <Reply size={16} color={ACCENT_PURPLE} />
                  <Text style={styles.replyingToText}>Replying to {replyingTo.sender_id === currentUserId ? "yourself" : userName}</Text>
                  <TouchableOpacity onPress={() => setReplyingTo(null)} hitSlop={{top:10,right:10,bottom:10,left:10}}>
                    <X size={16} color={TEXT_MUTED} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.replyingToContent} numberOfLines={1}>
                  {replyingTo.type === "image" ? "Photo message" : replyingTo.text}
                </Text>
              </View>
            )}
            <View style={styles.inputField}>`;

chat = chat.replace('<View style={styles.inputField}>', replyUI);

chat = chat.replace('import {', 'import {\n  Reply,');

// Styles
chat = chat.replace('inputArea: {',
  `replyingToContainer: {
      backgroundColor: SURFACE,
      padding: 10,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      marginHorizontal: 16,
      marginBottom: -10, // overlap with input area slightly
      paddingBottom: 20,
    },
    replyingToHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 4,
    },
    replyingToText: {
      flex: 1,
      fontSize: 13,
      fontFamily: theme.fontFamilies.body.semiBold,
      color: ACCENT_PURPLE,
    },
    replyingToContent: {
      fontSize: 14,
      fontFamily: theme.fontFamilies.body.regular,
      color: TEXT_SECONDARY,
    },
    inputArea: {`
);

fs.writeFileSync('src/features/messaging/screens/ChatScreen.tsx', chat, 'utf-8');
console.log('Fixed ChatScreen');
