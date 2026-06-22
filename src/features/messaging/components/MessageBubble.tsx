import React from "react";
import { View, Text, Image, StyleSheet, Animated } from "react-native";
import type { Message as MessageType } from "@/src/features/messaging/types/messaging.types";
import { Check, CheckCheck, AlertCircle, ShieldAlert } from "lucide-react-native";

// Brand Colors from ChatScreen
const ACCENT_PURPLE = "#8D69F6";
const TEXT_MUTED = "rgba(255, 255, 255, 0.45)";
const DANGER_RED = "#EF3E78";
const WHITE = "#FFFFFF";

export interface MessageBubbleProps {
  message: MessageType;
  currentUserId: string;
  userName: string;
  userImage?: string | null;
  onSwipeToReply?: (message: any) => void;
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

export const MessageBubble: React.FC<MessageBubbleProps> = React.memo(({ message, currentUserId, userName, userImage }) => {
  const isMyMessage = message.sender_id === currentUserId;
  const showAvatar = !isMyMessage;
  const messageAuthor = isMyMessage ? "You" : userName;
  const messageContent = message.type === "image" ? "Photo message" : message.text;
  const messageStatus = isMyMessage && message.status ? `, ${message.status}` : "";

  const slideAnim = React.useRef(new Animated.Value(20)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();
  }, [opacityAnim, slideAnim]);

  return (
    <Animated.View
      accessible
      accessibilityLabel={`${messageAuthor}: ${messageContent}, ${formatTime(message.created_at)}${messageStatus}`}
      style={[
        styles.messageRow,
        isMyMessage ? styles.myMessageRow : styles.theirMessageRow,
        { opacity: opacityAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      {showAvatar &&
        (userImage && userImage.startsWith("http") ? (
          <Image
            source={{ uri: userImage }}
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
  );
});

MessageBubble.displayName = "MessageBubble";

const styles = StyleSheet.create({
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 20,
    width: "100%",
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
