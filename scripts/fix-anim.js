const fs = require('fs');

// MessageBubble.tsx
let bubble = fs.readFileSync('src/features/messaging/components/MessageBubble.tsx', 'utf-8');

bubble = bubble.replace(
  'import { View, Text, Image, StyleSheet, Animated } from "react-native";',
  'import { View, Text, Image, StyleSheet, Animated, PanResponder } from "react-native";\nimport * as Haptics from "expo-haptics";\nimport { useAppTheme, makeStyles } from "@/src/theme";'
);
bubble = bubble.replace(
  'import { Check, CheckCheck, AlertCircle, ShieldAlert } from "lucide-react-native";',
  'import { Check, CheckCheck, AlertCircle, ShieldAlert, Reply } from "lucide-react-native";'
);
bubble = bubble.replace(/const ACCENT_PURPLE = "#8D69F6";\r?\nconst TEXT_MUTED = "rgba\(255, 255, 255, 0\.45\)";\r?\nconst DANGER_RED = "#EF3E78";\r?\nconst WHITE = "#FFFFFF";\r?\n\r?\n/, '');

bubble = bubble.replace(
  'userImage?: string | null;',
  'userImage?: string | null;\n  onSwipeToReply?: (message: MessageType) => void;'
);

bubble = bubble.replace(
  'export const MessageBubble: React.FC<MessageBubbleProps> = React.memo(({ message, currentUserId, userName, userImage }) => {',
  `export const MessageBubble: React.FC<MessageBubbleProps> = React.memo(({ message, currentUserId, userName, userImage, onSwipeToReply }) => {
  const theme = useAppTheme();
  const styles = useStyles();
  const ACCENT_PURPLE = theme.colors.dalisay?.[500] ?? "#8D69F6";
  const TEXT_MUTED = "rgba(255, 255, 255, 0.45)";
  const DANGER_RED = theme.colors.amihan?.[500] ?? "#EF3E78";
  const WHITE = "#FFFFFF";
  
  const renderMessageStatus = (status: MessageType["status"]) => {
    switch (status) {
      case "sending": return <Check size={14} color={TEXT_MUTED} strokeWidth={2.5} />;
      case "sent": return <CheckCheck size={14} color={TEXT_MUTED} strokeWidth={2.5} />;
      case "delivered": return <CheckCheck size={14} color={TEXT_MUTED} strokeWidth={2.5} />;
      case "read": return <CheckCheck size={14} color={ACCENT_PURPLE} strokeWidth={2.5} />;
      case "failed": return <AlertCircle size={14} color={DANGER_RED} strokeWidth={2.5} />;
      default: return null;
    }
  };`
);

bubble = bubble.replace(/const renderMessageStatus = \(status: MessageType\["status"\]\) => \{\r?\n(?:.*\r?\n)*?  \}\r?\n\};\r?\n/, '');

bubble = bubble.replace(
  'const opacityAnim = React.useRef(new Animated.Value(0)).current;',
  `const opacityAnim = React.useRef(new Animated.Value(0)).current;
  const pan = React.useRef(new Animated.ValueXY()).current;

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 10,
      onPanResponderMove: Animated.event([null, { dx: pan.x }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 60 || gestureState.dx < -60) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onSwipeToReply?.(message);
        }
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          bounciness: 10,
        }).start();
      },
    })
  ).current;

  const replyIconOpacity = pan.x.interpolate({
    inputRange: [-100, -50, 0, 50, 100],
    outputRange: [1, 0, 0, 0, 1],
    extrapolate: "clamp",
  });
  
  const replyIconScale = pan.x.interpolate({
    inputRange: [-100, -50, 0, 50, 100],
    outputRange: [1.2, 0.5, 0.5, 0.5, 1.2],
    extrapolate: "clamp",
  });`
);

bubble = bubble.replace(
  '{ opacity: opacityAnim, transform: [{ translateY: slideAnim }] }',
  '{ opacity: opacityAnim, transform: [{ translateY: slideAnim }, { translateX: pan.x }] }'
);
bubble = bubble.replace(
  ']}',
  ']}\n      {...panResponder.panHandlers}'
);

bubble = bubble.replace(
  '<Animated.View\n      accessible',
  `<View style={styles.bubbleWrapper}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.replyIconContainer, isMyMessage ? styles.replyIconLeft : styles.replyIconRight, { opacity: replyIconOpacity, transform: [{ scale: replyIconScale }] }]}>
        <View style={styles.replyIconBg}>
          <Reply size={20} color={WHITE} />
        </View>
      </Animated.View>
    <Animated.View\n      accessible`
);

bubble = bubble.replace(
  '</Animated.View>\n  );\n});',
  '</Animated.View>\n    </View>\n  );\n});'
);

bubble = bubble.replace('const styles = StyleSheet.create({', 'const useStyles = makeStyles((theme) => ({\n  bubbleWrapper: { width: "100%", position: "relative" },\n  replyIconContainer: {\n    justifyContent: "center",\n    zIndex: -1,\n  },\n  replyIconLeft: { alignItems: "flex-start", paddingLeft: theme.spacing.lg },\n  replyIconRight: { alignItems: "flex-end", paddingRight: theme.spacing.lg },\n  replyIconBg: {\n    backgroundColor: "rgba(141, 105, 246, 0.5)",\n    width: 40,\n    height: 40,\n    borderRadius: 20,\n    justifyContent: "center",\n    alignItems: "center",\n  },');
bubble = bubble.replace(/^}\);/gm, '}));');
fs.writeFileSync('src/features/messaging/components/MessageBubble.tsx', bubble, 'utf-8');

// ChatScreen.tsx
let chat = fs.readFileSync('src/features/messaging/screens/ChatScreen.tsx', 'utf-8');
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

chat = chat.replace(
  'const inputRef = useRef<TextInput>(null);',
  `const inputRef = useRef<TextInput>(null);
  const [replyingTo, setReplyingTo] = useState<MessageType | null>(null);

  const handleSwipeToReply = useCallback((message: MessageType) => {
    setReplyingTo(message);
    inputRef.current?.focus();
  }, []);`
);

chat = chat.replace(
  'userName={userName}',
  'userName={userName}\n          onSwipeToReply={handleSwipeToReply}'
);

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
console.log('Fixed Bubble and Chat');
