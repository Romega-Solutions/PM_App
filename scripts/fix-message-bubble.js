const fs = require('fs');

// MessageBubble.tsx
let bubble = fs.readFileSync('src/features/messaging/components/MessageBubble.tsx', 'utf-8');

// Replace imports
bubble = bubble.replace(
  'import { View, Text, Image, StyleSheet, Animated } from "react-native";',
  'import { View, Text, Image, StyleSheet, Animated, PanResponder } from "react-native";\nimport * as Haptics from "expo-haptics";\nimport { useAppTheme, makeStyles } from "@/src/theme";'
);

// Replace icons
bubble = bubble.replace(
  'import { Check, CheckCheck, AlertCircle, ShieldAlert } from "lucide-react-native";',
  'import { Check, CheckCheck, AlertCircle, ShieldAlert, Reply } from "lucide-react-native";'
);

// Remove static colors
bubble = bubble.replace(/const ACCENT_PURPLE = "#8D69F6";\r?\nconst TEXT_MUTED = "rgba\(255, 255, 255, 0\.45\)";\r?\nconst DANGER_RED = "#EF3E78";\r?\nconst WHITE = "#FFFFFF";\r?\n\r?\n/, '');

// Add onSwipeToReply prop
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
  const WHITE = "#FFFFFF";`
);

// Fix renderMessageStatus (need to inline it or pass colors since it's outside component)
// Better to move `renderMessageStatus` inside component.
bubble = bubble.replace(/const renderMessageStatus = \(status: MessageType\["status"\]\) => \{\r?\n[\s\S]*?\}\r?\n/, '');

bubble = bubble.replace(
  'const isMyMessage = message.sender_id === currentUserId;',
  `const renderMessageStatus = (status: MessageType["status"]) => {
    switch (status) {
      case "sending": return <Check size={14} color={TEXT_MUTED} strokeWidth={2.5} />;
      case "sent": return <CheckCheck size={14} color={TEXT_MUTED} strokeWidth={2.5} />;
      case "delivered": return <CheckCheck size={14} color={TEXT_MUTED} strokeWidth={2.5} />;
      case "read": return <CheckCheck size={14} color={ACCENT_PURPLE} strokeWidth={2.5} />;
      case "failed": return <AlertCircle size={14} color={DANGER_RED} strokeWidth={2.5} />;
      default: return null;
    }
  };
  
  const isMyMessage = message.sender_id === currentUserId;`
);

// Add PanResponder
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

// Apply panResponder to Animated.View
bubble = bubble.replace(
  '{ opacity: opacityAnim, transform: [{ translateY: slideAnim }] }',
  '{ opacity: opacityAnim, transform: [{ translateY: slideAnim }, { translateX: pan.x }] }'
);
bubble = bubble.replace(
  ']}',
  ']}\n      {...panResponder.panHandlers}'
);

// Add the Reply icon behind the bubble
bubble = bubble.replace(
  '<Animated.View',
  `<View style={styles.bubbleWrapper}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.replyIconContainer, isMyMessage ? styles.replyIconLeft : styles.replyIconRight, { opacity: replyIconOpacity, transform: [{ scale: replyIconScale }] }]}>
        <View style={styles.replyIconBg}>
          <Reply size={20} color={WHITE} />
        </View>
      </Animated.View>
    <Animated.View`
);

bubble = bubble.replace(
  '</Animated.View>',
  '</Animated.View>\n    </View>'
);

// Convert StyleSheet.create to makeStyles
bubble = bubble.replace('const styles = StyleSheet.create({', 'const useStyles = makeStyles((theme) => ({');
bubble = bubble.replace(/^}\);/gm, '}));');

// Add new styles
bubble = bubble.replace(
  'messageRow: {',
  `bubbleWrapper: { width: "100%", position: "relative" },
  replyIconContainer: {
    justifyContent: "center",
    zIndex: -1,
  },
  replyIconLeft: { alignItems: "flex-start", paddingLeft: theme.spacing.lg },
  replyIconRight: { alignItems: "flex-end", paddingRight: theme.spacing.lg },
  replyIconBg: {
    backgroundColor: "rgba(141, 105, 246, 0.5)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  messageRow: {`
);

fs.writeFileSync('src/features/messaging/components/MessageBubble.tsx', bubble, 'utf-8');
console.log("Fixed MessageBubble.");
