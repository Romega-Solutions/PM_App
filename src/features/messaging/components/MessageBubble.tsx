import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  type ImageSourcePropType,
} from "react-native";
import type {
  ConversationPhotoSource,
  Message as MessageType,
} from "@/src/features/messaging/types/messaging.types";
import { Check, CheckCheck, AlertCircle, ShieldAlert, Reply } from "lucide-react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  runOnJS, 
  interpolate, 
  Extrapolation 
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

// Brand Colors from ChatScreen
const ACCENT_PURPLE = "#8D69F6";
const TEXT_MUTED = "rgba(255, 255, 255, 0.45)";
const DANGER_RED = "#EF3E78";
const WHITE = "#FFFFFF";

const SWIPE_THRESHOLD = 50;

export interface MessageBubbleProps {
  message: MessageType;
  currentUserId: string;
  userName: string;
  userImage?: ConversationPhotoSource | null;
  onSwipeToReply?: (message: MessageType) => void;
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

const renderMessageStatus = (status: MessageType["status"]) => {
  switch (status) {
    case "sending":
      return <Check size={14} color={TEXT_MUTED} strokeWidth={2.5} />;
    case "sent":
      return <CheckCheck size={14} color={TEXT_MUTED} strokeWidth={2.5} />;
    case "delivered":
      return <CheckCheck size={14} color={TEXT_MUTED} strokeWidth={2.5} />;
    case "read":
      return <CheckCheck size={14} color={ACCENT_PURPLE} strokeWidth={2.5} />;
    case "failed":
      return <AlertCircle size={14} color={DANGER_RED} strokeWidth={2.5} />;
    default:
      return null;
  }
};

export const MessageBubble: React.FC<MessageBubbleProps> = React.memo(({ message, currentUserId, userName, userImage, onSwipeToReply }) => {
  const isMyMessage = message.sender_id === currentUserId;
  const showAvatar = !isMyMessage;
  const userImageSource = normalizeImageSource(userImage);
  const messageAuthor = isMyMessage ? "You" : userName;
  const messageContent = message.type === "image" ? "Photo message" : message.text;
  const messageStatus = isMyMessage && message.status ? `, ${message.status}` : "";

  // Entry animations
  const opacityAnim = useSharedValue(0);
  const slideAnim = useSharedValue(20);

  React.useEffect(() => {
    opacityAnim.value = withTiming(1, { duration: 200 });
    slideAnim.value = withSpring(0, { damping: 15, stiffness: 150 });
  }, [opacityAnim, slideAnim]);

  // Gesture state
  const translateX = useSharedValue(0);
  const hapticTriggered = useSharedValue(false);

  const handleReply = React.useCallback(() => {
    if (onSwipeToReply) {
      onSwipeToReply(message);
    }
  }, [message, onSwipeToReply]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      // Allow swiping left-to-right to reply
      // Limit the max translation visually to give resistance
      const clampedTranslation = Math.max(0, event.translationX);
      translateX.value = clampedTranslation * 0.5; // add resistance

      if (translateX.value > SWIPE_THRESHOLD && !hapticTriggered.value) {
        hapticTriggered.value = true;
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      } else if (translateX.value <= SWIPE_THRESHOLD && hapticTriggered.value) {
        hapticTriggered.value = false;
      }
    })
    .onEnd(() => {
      if (translateX.value > SWIPE_THRESHOLD) {
        runOnJS(handleReply)();
      }
      translateX.value = withSpring(0, { damping: 15, stiffness: 200 });
      hapticTriggered.value = false;
    });

  const animatedRowStyle = useAnimatedStyle(() => {
    return {
      opacity: opacityAnim.value,
      transform: [
        { translateY: slideAnim.value },
        { translateX: translateX.value }
      ],
    };
  });

  const animatedReplyIconStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <View style={styles.container}>
      {/* Hidden Reply Icon behind the message row */}
      <Animated.View style={[styles.replyIconContainer, animatedReplyIconStyle]}>
        <View style={styles.replyIconWrap}>
          <Reply size={20} color={WHITE} strokeWidth={2.5} />
        </View>
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          accessible
          accessibilityLabel={`${messageAuthor}: ${messageContent}, ${formatTime(message.created_at)}${messageStatus}`}
          style={[
            styles.messageRow,
            isMyMessage ? styles.myMessageRow : styles.theirMessageRow,
            animatedRowStyle
          ]}
        >
          {showAvatar &&
            (userImageSource ? (
              <Image
                source={userImageSource}
                style={styles.messageAvatar}
                accessibilityLabel={`${userName} profile photo`}
              />
            ) : (
              <View style={styles.messageAvatarPlaceholder}>
                <Text style={styles.messageAvatarPlaceholderText}>
                  {userName.charAt(0).toUpperCase()}
                </Text>
              </View>
            ))}

          <View
            style={[
              styles.messageBubble,
              isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble,
              message.type === "image" && styles.imageBubble,
            ]}
          >
            {message.type === "image" && message.image_url ? (
              <View style={styles.imageMessageContainer}>
                <Image
                  source={{ uri: message.image_url }}
                  style={styles.messageImage}
                  resizeMode="cover"
                  accessibilityLabel={`${messageAuthor} sent a photo`}
                />
                <View
                  style={styles.imageSafetyStrip}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                >
                  <ShieldAlert size={13} color={WHITE} strokeWidth={2.2} />
                  <Text style={styles.imageSafetyText}>Private chat photo</Text>
                </View>
              </View>
            ) : (
              <Text
                style={[
                  styles.messageText,
                  isMyMessage ? styles.myMessageText : styles.theirMessageText,
                ]}
              >
                {message.text}
              </Text>
            )}

            <View style={styles.messageFooter}>
              <Text style={styles.messageTime}>
                {formatTime(message.created_at)}
              </Text>
              {isMyMessage && (
                <View style={styles.messageStatusContainer}>
                  {renderMessageStatus(message.status)}
                </View>
              )}
            </View>
            {message.status === "failed" && (
              <Text style={styles.messageFailedText}>Not sent</Text>
            )}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

function normalizeImageSource(
  source?: ConversationPhotoSource | null,
): ImageSourcePropType | null {
  if (!source) return null;
  if (typeof source === "string") {
    const uri = source.trim();
    return uri ? { uri } : null;
  }
  return source;
}

MessageBubble.displayName = "MessageBubble";

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    marginBottom: 20,
  },
  replyIconContainer: {
    position: 'absolute',
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-start',
    zIndex: 0,
  },
  replyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(141, 105, 246, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(141, 105, 246, 0.4)',
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    width: "100%",
    zIndex: 1,
  },
  myMessageRow: {
    justifyContent: "flex-end",
  },
  theirMessageRow: {
    justifyContent: "flex-start",
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  messageAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  messageAvatarPlaceholderText: {
    fontSize: 14,
    fontFamily: "DMSans-Bold",
    color: WHITE,
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    position: "relative",
  },
  myMessageBubble: {
    backgroundColor: "rgba(141, 105, 246, 0.9)",
    borderBottomRightRadius: 6,
  },
  theirMessageBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderBottomLeftRadius: 6,
  },
  imageBubble: {
    paddingHorizontal: 6,
    paddingVertical: 6,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  messageText: {
    fontSize: 16,
    fontFamily: "DMSans-Regular",
    lineHeight: 22,
  },
  myMessageText: {
    color: WHITE,
  },
  theirMessageText: {
    color: "rgba(255, 255, 255, 0.95)",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 6,
  },
  messageTime: {
    fontSize: 11,
    fontFamily: "DMSans-Medium",
    color: "rgba(255, 255, 255, 0.6)",
  },
  messageStatusContainer: {
    marginLeft: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  messageFailedText: {
    fontSize: 11,
    fontFamily: "DMSans-Bold",
    color: DANGER_RED,
    marginTop: 4,
    textAlign: "right",
  },
  imageMessageContainer: {
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
  },
  messageImage: {
    width: 220,
    height: 280,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  imageSafetyStrip: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  imageSafetyText: {
    fontSize: 12,
    fontFamily: "DMSans-Medium",
    color: WHITE,
    letterSpacing: 0.3,
  },
});
