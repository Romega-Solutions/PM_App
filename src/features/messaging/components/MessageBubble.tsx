import { AlertCircle, Check, CheckCheck, RefreshCw } from "lucide-react-native";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useTheme, withAlpha } from "@/src/theme";
import type { Message as MessageType, MessageStatus } from "@/src/features/messaging/types/messaging.types";

interface MessageBubbleProps {
  message: MessageType;
  isMine: boolean;
  userName: string;
  userImage?: string;
  onRetry?: (message: MessageType) => void;
}

export function MessageBubble({
  message,
  isMine,
  userName,
  userImage,
  onRetry,
}: MessageBubbleProps) {
  const { colors } = useTheme();
  const showImage = Boolean(userImage?.startsWith("http"));
  const canRetry = isMine && message.status === "failed" && message.type === "text";

  return (
    <View
      style={[
        styles.messageRow,
        isMine ? styles.myMessageRow : styles.theirMessageRow,
      ]}
    >
      {!isMine && (
        showImage ? (
          <Image
            source={{ uri: userImage }}
            style={[
              styles.messageAvatar,
              { borderColor: withAlpha(colors.secondary, 0.3) },
            ]}
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View
            style={[
              styles.messageAvatarPlaceholder,
              {
                backgroundColor: colors.secondary,
                borderColor: withAlpha(colors.secondary, 0.3),
              },
            ]}
          >
            <Text style={[styles.messageAvatarPlaceholderText, { color: colors.onSecondary }]}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )
      )}

      <View
        style={[
          styles.messageBubble,
          isMine
            ? {
                backgroundColor: withAlpha(colors.secondary, 0.25),
                borderColor: withAlpha(colors.secondary, 0.3),
                borderBottomRightRadius: 4,
              }
            : {
                backgroundColor: colors.brandSurface,
                borderColor: colors.brandBorder,
                borderBottomLeftRadius: 4,
              },
        ]}
        accessibilityLabel={`${isMine ? "You" : userName}: ${
          message.type === "image" ? "image message" : message.text
        }. ${formatStatus(message.status)} at ${formatTime(message.created_at)}`}
      >
        {message.type === "image" && message.image_url ? (
          <Image
            source={{ uri: message.image_url }}
            style={styles.messageImage}
            resizeMode="cover"
            accessibilityLabel="Sent image"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <Text
            style={[
              styles.messageText,
              { color: isMine ? colors.onPrimary : withAlpha(colors.onPrimary, 0.78) },
            ]}
          >
            {message.text}
          </Text>
        )}

        <View style={styles.messageFooter}>
          <Text style={[styles.messageTime, { color: withAlpha(colors.onPrimary, 0.5) }]}>
            {formatTime(message.created_at)}
          </Text>
          {isMine && (
            <View style={styles.messageStatusContainer}>
              {renderMessageStatus(message.status, colors.secondary, colors.errorInk, withAlpha(colors.onPrimary, 0.5))}
            </View>
          )}
        </View>

        {canRetry ? (
          <TouchableOpacity
            style={[styles.retryButton, { borderColor: colors.errorInk }]}
            onPress={() => onRetry?.(message)}
            accessibilityRole="button"
            accessibilityLabel="Retry failed message"
          >
            <RefreshCw size={13} color={colors.errorInk} strokeWidth={2.5} />
            <Text style={[styles.retryText, { color: colors.errorInk }]}>Retry</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

function renderMessageStatus(
  status: MessageStatus,
  accentColor: string,
  errorColor: string,
  mutedColor: string,
) {
  switch (status) {
    case "sending":
      return <Check size={14} color={mutedColor} strokeWidth={2.5} />;
    case "sent":
    case "delivered":
      return <CheckCheck size={14} color={mutedColor} strokeWidth={2.5} />;
    case "read":
      return <CheckCheck size={14} color={accentColor} strokeWidth={2.5} />;
    case "failed":
      return <AlertCircle size={14} color={errorColor} strokeWidth={2.5} />;
    default:
      return null;
  }
}

function formatStatus(status: MessageStatus) {
  switch (status) {
    case "sending":
      return "Sending";
    case "sent":
      return "Sent";
    case "delivered":
      return "Delivered";
    case "read":
      return "Read";
    case "failed":
      return "Failed to send";
    default:
      return "";
  }
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

const styles = StyleSheet.create({
  messageRow: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "flex-end",
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
    marginRight: 8,
    borderWidth: 1.5,
  },
  messageAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
  },
  messageAvatarPlaceholderText: {
    fontSize: 14,
    fontFamily: "Lora-Bold",
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: "DMSans-Regular",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
    fontFamily: "DMSans-Regular",
  },
  messageStatusContainer: {
    alignSelf: "flex-end",
  },
  messageImage: {
    width: 240,
    height: 240,
    borderRadius: 12,
  },
  retryButton: {
    minHeight: 32,
    marginTop: 8,
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
  },
  retryText: {
    fontSize: 12,
    fontFamily: "DMSans-Bold",
  },
});
