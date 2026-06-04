import type { RefObject } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

import { useTheme, withAlpha } from "@/src/theme";
import type { Message as MessageType } from "@/src/features/messaging/types/messaging.types";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  scrollViewRef: RefObject<ScrollView | null>;
  messages: MessageType[];
  currentUserId: string;
  userName: string;
  userImage?: string;
  isTyping: boolean;
  bottomPadding: number;
  onRetryMessage: (message: MessageType) => void;
}

export function MessageList({
  scrollViewRef,
  messages,
  currentUserId,
  userName,
  userImage,
  isTyping,
  bottomPadding,
  onRetryMessage,
}: MessageListProps) {
  const { colors } = useTheme();
  const showImage = Boolean(userImage?.startsWith("http"));

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.messagesContainer}
      contentContainerStyle={[styles.messagesContent, { paddingBottom: bottomPadding }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isMine={message.sender_id === currentUserId}
          userName={userName}
          userImage={userImage}
          onRetry={onRetryMessage}
        />
      ))}

      {isTyping ? (
        <View
          style={[styles.messageRow, styles.theirMessageRow]}
          accessibilityLiveRegion="polite"
          accessibilityLabel={`${userName} is typing`}
        >
          {showImage ? (
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
          )}
          <View
            style={[
              styles.typingBubble,
              {
                backgroundColor: colors.brandSurface,
                borderColor: colors.brandBorder,
              },
            ]}
          >
            <View style={styles.typingIndicator}>
              <View style={[styles.typingDot, { backgroundColor: withAlpha(colors.onPrimary, 0.5) }]} />
              <View style={[styles.typingDot, { backgroundColor: withAlpha(colors.onPrimary, 0.5) }]} />
              <View style={[styles.typingDot, { backgroundColor: withAlpha(colors.onPrimary, 0.5) }]} />
            </View>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "flex-end",
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
  typingBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
