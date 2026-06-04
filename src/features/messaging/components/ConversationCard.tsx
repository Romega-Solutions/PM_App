/**
 * ConversationCard Component
 *
 * Displays a single conversation in the messages list.
 * Shows user avatar, name, last message, timestamp, and unread count.
 *
 * SOLID Principles:
 * - Single Responsibility: Only renders conversation card UI
 * - Open/Closed: Extensible via props, closed for modification
 * - Liskov Substitution: Can be used in any list context
 * - Interface Segregation: Only requires conversation data
 * - Dependency Inversion: Depends on props interface, not implementations
 *
 * @module features/messaging/components
 */

import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme, withAlpha } from "@/src/theme";

/**
 * Props for ConversationCard component
 */
export interface ConversationCardProps {
  /** Conversation ID */
  conversationId: string;
  /** Other user's ID */
  userId: string;
  /** Other user's name */
  userName: string;
  /** Other user's profile photo URL */
  userPhoto: string | null;
  /** Whether other user is online */
  isOnline: boolean;
  /** Last message text */
  lastMessage: string;
  /** Last message timestamp */
  lastMessageTime: string;
  /** Number of unread messages */
  unreadCount: number;
  /** Callback when card is pressed */
  onPress: () => void;
}

/**
 * ConversationCard Component
 *
 * Renders a conversation item in the messages list.
 * Displays all conversation metadata with visual feedback.
 */
export const ConversationCard: React.FC<ConversationCardProps> = ({
  userName,
  userPhoto,
  isOnline,
  lastMessage,
  lastMessageTime,
  unreadCount,
  onPress,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.brandSurface,
          borderColor: colors.brandBorder,
        },
      ]}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Open chat with ${userName}. ${unreadCount > 0 ? `${unreadCount} unread messages.` : "No unread messages."} ${isOnline ? "Active now." : "Offline."}`}
      onPress={onPress}
    >
      {/* Profile Image */}
      <View style={styles.imageContainer}>
        <View
          style={[
            styles.imageWrap,
            {
              backgroundColor: withAlpha(colors.secondary, 0.14),
              borderColor: withAlpha(colors.secondary, 0.22),
            },
          ]}
        >
          {userPhoto ? (
            <Image
              source={{ uri: userPhoto }}
              style={styles.image}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
          ) : (
            <View
              style={[
                styles.placeholderAvatar,
                { backgroundColor: withAlpha(colors.secondary, 0.2) },
              ]}
            >
              <Text style={[styles.placeholderText, { color: colors.secondary }]}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        {isOnline && (
          <View
            style={[
              styles.onlineDot,
              {
                backgroundColor: colors.success,
                borderColor: colors.brandBackground,
              },
            ]}
          />
        )}
      </View>

      {/* Message Info */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: colors.onPrimary }]}>{userName}</Text>
          <Text style={[styles.time, { color: withAlpha(colors.onPrimary, 0.55) }]}>
            {formatTimestamp(lastMessageTime)}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.lastMessageContainer}>
            <Text
              style={[
                styles.lastMessage,
                {
                  color:
                    unreadCount > 0
                      ? withAlpha(colors.onPrimary, 0.78)
                      : withAlpha(colors.onPrimary, 0.55),
                },
                unreadCount > 0 && styles.lastMessageUnread,
              ]}
              numberOfLines={1}
            >
              {lastMessage}
            </Text>
          </View>

          {unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.unreadText, { color: colors.onPrimary }]}>
                {unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  imageContainer: {
    position: "relative",
    marginRight: 14,
  },
  imageWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    padding: 2,
    borderWidth: 2,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 26,
  },
  placeholderAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 22,
    fontFamily: "DMSans-Bold",
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontFamily: "DMSans-Bold",
    flex: 1,
  },
  time: {
    fontSize: 12,
    fontFamily: "DMSans-Regular",
    marginLeft: 8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lastMessageContainer: {
    flex: 1,
    marginRight: 8,
  },
  lastMessage: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    lineHeight: 20,
  },
  lastMessageUnread: {
    fontFamily: "DMSans-Medium",
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  unreadText: {
    fontSize: 11,
    fontFamily: "DMSans-Bold",
  },
});
