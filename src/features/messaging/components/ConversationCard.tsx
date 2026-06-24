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

// Brand Colors
const ACCENT_PURPLE = "#8D69F6";
const ACCENT_PINK = "#EF3E78";
const WHITE = "#FFFFFF";
const ONLINE_GREEN = "#10B981";
const SURFACE = "rgba(255,255,255,0.06)";
const SURFACE_BORDER = "rgba(141,105,246,0.18)";
const TEXT_SECONDARY = "rgba(255,255,255,0.75)";
const TEXT_MUTED = "rgba(255,255,255,0.5)";

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
  const formattedTime = formatTimestamp(lastMessageTime);
  const displayLastMessage = lastMessage?.trim() || "No messages yet";
  const displayUnreadCount = unreadCount > 99 ? "99+" : `${unreadCount}`;
  const unreadLabel =
    unreadCount > 0
      ? `${unreadCount} unread ${unreadCount === 1 ? "message" : "messages"}`
      : "No unread messages";
  const onlineLabel = isOnline ? "active now" : "offline";

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Open chat with ${userName}, ${onlineLabel}. ${unreadLabel}. Last message: ${displayLastMessage}. ${formattedTime}.`}
      accessibilityHint="Opens the conversation. Reply only when you are ready."
      accessibilityState={{ selected: unreadCount > 0 }}
      onPress={onPress}
    >
      {/* Profile Image */}
      <View style={styles.imageContainer}>
        <View style={styles.imageWrap}>
          {userPhoto ? (
            <Image
              source={{ uri: userPhoto }}
              style={styles.image}
              resizeMode="cover"
              accessibilityLabel={`${userName} profile photo`}
            />
          ) : (
            <View style={styles.placeholderAvatar}>
              <Text style={styles.placeholderText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        {isOnline && (
          <View
            style={styles.onlineDot}
            accessible
            accessibilityLabel={`${userName} is active now`}
          />
        )}
      </View>

      {/* Message Info */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{userName}</Text>
          <Text style={styles.time}>{formattedTime}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.lastMessageContainer}>
            <Text
              style={[
                styles.lastMessage,
                unreadCount > 0 && styles.lastMessageUnread,
              ]}
              numberOfLines={1}
            >
              {displayLastMessage}
            </Text>
          </View>

          {unreadCount > 0 && (
            <View
              style={styles.unreadBadge}
              accessible
              accessibilityLabel={unreadLabel}
            >
              <Text style={styles.unreadText}>{displayUnreadCount}</Text>
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
  if (!timestamp) return "No recent activity";

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "No recent activity";

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
    minHeight: 88,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: SURFACE_BORDER,
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
    backgroundColor: `${ACCENT_PURPLE}22`,
    borderWidth: 2,
    borderColor: `${ACCENT_PURPLE}30`,
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
    backgroundColor: `${ACCENT_PURPLE}33`,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 22,
    fontFamily: "DMSans-Bold",
    color: ACCENT_PURPLE,
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: ONLINE_GREEN,
    borderWidth: 2.5,
    borderColor: "#0F0814",
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
    color: WHITE,
    letterSpacing: 0.2,
    flex: 1,
  },
  time: {
    fontSize: 12,
    fontFamily: "DMSans-Regular",
    color: TEXT_MUTED,
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
    color: TEXT_MUTED,
    lineHeight: 20,
  },
  lastMessageUnread: {
    fontFamily: "DMSans-Medium",
    color: TEXT_SECONDARY,
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: ACCENT_PINK,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  unreadText: {
    fontSize: 11,
    fontFamily: "DMSans-Bold",
    color: WHITE,
    letterSpacing: 0.2,
  },
});
