// app/(main)/messages.tsx - REAL BACKEND INTEGRATION
import { supabase } from "@/src/config/supabase";
import { useConversations } from "@/src/features/messaging/hooks/useConversations";
import { useRouter } from "expo-router";
import {
  Filter,
  MessageCircle,
  MoreVertical,
  Search,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// Brand Colors
const BRAND_BG = "#0F0814";
const ACCENT_PURPLE = "#8D69F6";
const ACCENT_PINK = "#EF3E78";
const ONLINE_GREEN = "#10B981";
const WHITE = "#FFFFFF";
const SURFACE = "rgba(255,255,255,0.06)";
const SURFACE_BORDER = "rgba(141,105,246,0.18)";
const TEXT_SECONDARY = "rgba(255,255,255,0.75)";
const TEXT_MUTED = "rgba(255,255,255,0.5)";

// Component: Active User Item
interface ActiveUserProps {
  user: { id: string; name: string; image: any; isOnline: boolean };
  onPress: () => void;
}

const ActiveUser: React.FC<ActiveUserProps> = ({ user, onPress }) => (
  <TouchableOpacity
    style={styles.activeUser}
    accessibilityRole="button"
    accessibilityLabel={`Chat with ${user.name}`}
    onPress={onPress}
  >
    <View style={styles.activeUserImageContainer}>
      <View style={styles.activeUserImageWrap}>
        <Image
          source={
            typeof user.image === "string" ? { uri: user.image } : user.image
          }
          style={styles.activeUserImage}
          resizeMode="cover"
        />
      </View>
      {user.isOnline && <View style={styles.onlineBadge} />}
    </View>
    <Text style={styles.activeUserName} numberOfLines={1}>
      {user.name}
    </Text>
  </TouchableOpacity>
);

// Component: Conversation Item
interface ConversationItemProps {
  conversation: any;
  onPress: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  onPress,
}) => {
  const otherUser = conversation.other_user;
  const lastMessage = conversation.latest_message || "No messages yet";
  const isOnline = otherUser.is_active;
  const unreadCount = conversation.unread_count || 0;

  return (
    <TouchableOpacity
      style={styles.conversationItem}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Open chat with ${otherUser.first_name}`}
      onPress={onPress}
    >
      {/* Profile Image */}
      <View style={styles.conversationImageContainer}>
        <View style={styles.conversationImageWrap}>
          <Image
            source={
              otherUser.photos?.[0]
                ? { uri: otherUser.photos[0] }
                : require("../../assets/girls/ai1.jpg")
            }
            style={styles.conversationImage}
            resizeMode="cover"
          />
        </View>
        {isOnline && <View style={styles.conversationOnlineDot} />}
      </View>

      {/* Message Info */}
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationName}>{otherUser.first_name}</Text>
          <Text style={styles.conversationTime}>
            {conversation.updated_at
              ? formatTimestamp(conversation.updated_at)
              : ""}
          </Text>
        </View>

        <View style={styles.conversationFooter}>
          <View style={styles.lastMessageContainer}>
            <Text
              style={[
                styles.lastMessage,
                unreadCount > 0 && styles.lastMessageUnread,
              ]}
              numberOfLines={1}
            >
              {lastMessage}
            </Text>
          </View>

          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function Messages() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "unread" | "online">(
    "all",
  );

  // Get current user ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setCurrentUserId(data.user.id);
      }
    });
  }, []);

  // Fetch conversations from backend
  const { conversations, loading, error, refresh } = useConversations({
    userId: currentUserId,
    autoLoad: true,
  });

  // Debug logging
  useEffect(() => {
    console.log("📊 Messages Screen Debug:");
    console.log("  Current User ID:", currentUserId);
    console.log("  Loading:", loading);
    console.log("  Error:", error);
    console.log("  Conversations count:", conversations.length);
    console.log(
      "  Filtered conversations count:",
      filteredConversations.length,
    );
    if (conversations.length > 0) {
      console.log(
        "  First conversation:",
        JSON.stringify(conversations[0], null, 2),
      );
    }
  }, [currentUserId, loading, error, conversations, filteredConversations]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv) => {
    if (!conv.other_user) return false;
    if (!searchQuery) return true;
    const firstName = conv.other_user.first_name || "";
    return firstName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Helper to format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  // Navigate to chat
  const handleChatPress = (conv: any) => {
    router.push({
      pathname: "/chat",
      params: {
        userId: conv.other_user.id,
        userName: conv.other_user.first_name,
        userImage: conv.other_user.photos?.[0] || undefined,
        isOnline: conv.other_user.is_active ? "true" : "false",
        conversationId: conv.id,
      },
    });
  };

  // Active users from online conversations
  const activeUsers = conversations
    .filter((conv) => conv.other_user?.is_active)
    .slice(0, 15)
    .map((conv) => ({
      id: conv.other_user.id,
      name: conv.other_user.first_name,
      image: conv.other_user.photos?.[0]
        ? { uri: conv.other_user.photos[0] }
        : require("../../assets/girls/ai1.jpg"),
      isOnline: true,
    }));

  // Handler for active user chat
  const handleOpenActiveUserChat = (user: any) => {
    router.push({
      pathname: "/chat",
      params: {
        userId: user.id,
        userName: user.name,
        userImage: typeof user.image === "string" ? user.image : undefined,
        isOnline: "true",
      },
    });
  };

  // Filter button handler
  const handleFilterPress = () => {
    // Cycle through filter types
    const filterOptions: Array<"all" | "unread" | "online"> = [
      "all",
      "unread",
      "online",
    ];
    const currentIndex = filterOptions.indexOf(filterType);
    const nextIndex = (currentIndex + 1) % filterOptions.length;
    setFilterType(filterOptions[nextIndex]);

    // Show feedback to user
    const filterNames = {
      all: "All Messages",
      unread: "Unread Only",
      online: "Online Only",
    };
    console.log(`Filter changed to: ${filterNames[filterOptions[nextIndex]]}`);
  };

  // More options menu handler
  const handleMoreOptions = () => {
    // TODO: Show action sheet with options:
    // - Mark all as read
    // - Settings
    // - Archive conversations
    // - Block users
    console.log("More options pressed");

    // For now, just log available actions
    const actions = [
      "Mark All as Read",
      "Message Settings",
      "Archive All",
      "Blocked Users",
      "Clear Search History",
    ];
    console.log("Available actions:", actions);
  };

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={BRAND_BG}
        translucent={false}
      />
      {Platform.OS === "ios" && (
        <View style={{ height: insets.top, backgroundColor: BRAND_BG }} />
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Messages</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[
                styles.headerIconBtn,
                filterType !== "all" && styles.headerIconBtnActive,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Filter conversations"
              onPress={handleFilterPress}
            >
              <Filter
                size={22}
                color={filterType !== "all" ? ACCENT_PINK : ACCENT_PURPLE}
                strokeWidth={2}
                fill={filterType !== "all" ? ACCENT_PINK : "transparent"}
              />
              {filterType !== "all" && <View style={styles.filterActiveDot} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIconBtn}
              accessibilityRole="button"
              accessibilityLabel="More options"
              onPress={handleMoreOptions}
            >
              <MoreVertical size={22} color={ACCENT_PURPLE} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={18} color={TEXT_MUTED} strokeWidth={2} />
          <TextInput
            placeholder="Search messages..."
            placeholderTextColor={TEXT_MUTED}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            accessibilityLabel="Search messages"
          />
        </View>

        {/* Active Filter Indicator */}
        {filterType !== "all" && (
          <View style={styles.filterBanner}>
            <Text style={styles.filterBannerText}>
              {filterType === "unread" && "📬 Showing Unread Messages"}
              {filterType === "online" && "🟢 Showing Online Users"}
            </Text>
            <TouchableOpacity
              onPress={() => setFilterType("all")}
              style={styles.filterBannerClose}
            >
              <Text style={styles.filterBannerCloseText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Active Users */}
      <View style={styles.activeUsersSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ACTIVE NOW</Text>
          <Text style={styles.sectionCount}>{activeUsers.length}</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.activeUsersList}
        >
          {activeUsers.map((user) => (
            <ActiveUser
              key={user.id}
              user={user}
              onPress={() => handleOpenActiveUserChat(user)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Conversations */}
      <View style={styles.conversationsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CONVERSATIONS</Text>
          <Text style={styles.sectionCount}>
            {filteredConversations.length}
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={ACCENT_PURPLE} />
            <Text style={styles.loadingText}>Loading conversations...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <MessageCircle size={64} color={ACCENT_PURPLE} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>Error loading messages</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refresh}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            style={styles.conversationsList}
            contentContainerStyle={{
              paddingBottom: Math.max(insets.bottom + 24, 100),
            }}
            showsVerticalScrollIndicator={false}
          >
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                onPress={() => handleChatPress(conversation)}
              />
            ))}

            {/* Empty State */}
            {filteredConversations.length === 0 && (
              <View style={styles.emptyState}>
                <MessageCircle
                  size={64}
                  color={ACCENT_PURPLE}
                  strokeWidth={1.5}
                />
                <Text style={styles.emptyTitle}>No messages found</Text>
                <Text style={styles.emptyText}>
                  Try adjusting your search query
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND_BG,
  },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 12 : 16,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: Platform.OS === "ios" ? 32 : 30,
    fontFamily: "Lora-Bold",
    color: ACCENT_PINK,
    letterSpacing: 0.6,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(141, 105, 246, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(141, 105, 246, 0.25)",
    position: "relative",
  },
  headerIconBtnActive: {
    backgroundColor: "rgba(239, 62, 120, 0.2)",
    borderColor: ACCENT_PINK,
    ...Platform.select({
      ios: {
        shadowColor: ACCENT_PINK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  filterActiveDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ACCENT_PINK,
    borderWidth: 1.5,
    borderColor: BRAND_BG,
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SURFACE,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: SURFACE_BORDER,
  },
  searchInput: {
    flex: 1,
    color: WHITE,
    fontSize: 15,
    fontFamily: "DMSans-Regular",
    letterSpacing: 0.2,
    padding: 0,
  },

  // Filter Banner
  filterBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(239, 62, 120, 0.15)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 62, 120, 0.3)",
  },
  filterBannerText: {
    fontSize: 13,
    fontFamily: "DMSans-Medium",
    color: ACCENT_PINK,
    letterSpacing: 0.2,
  },
  filterBannerClose: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "rgba(239, 62, 120, 0.2)",
    borderRadius: 8,
  },
  filterBannerCloseText: {
    fontSize: 12,
    fontFamily: "DMSans-Bold",
    color: ACCENT_PINK,
    letterSpacing: 0.3,
  },

  // Active Users
  activeUsersSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "DMSans-Bold",
    color: TEXT_SECONDARY,
    letterSpacing: 1.2,
  },
  sectionCount: {
    fontSize: 11,
    fontFamily: "DMSans-SemiBold",
    color: ACCENT_PURPLE,
    backgroundColor: "rgba(141, 105, 246, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeUsersList: {
    paddingHorizontal: 24,
    gap: 16,
  },
  activeUser: {
    alignItems: "center",
    width: 72,
  },
  activeUserImageContainer: {
    position: "relative",
    marginBottom: 8,
  },
  activeUserImageWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 2.5,
    borderColor: ACCENT_PURPLE,
    ...Platform.select({
      ios: {
        shadowColor: ACCENT_PURPLE,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  activeUserImage: {
    width: "100%",
    height: "100%",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: ONLINE_GREEN,
    borderWidth: 2.5,
    borderColor: BRAND_BG,
    ...Platform.select({
      ios: {
        shadowColor: ONLINE_GREEN,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  activeUserName: {
    color: WHITE,
    fontSize: 12,
    fontFamily: "DMSans-Medium",
    letterSpacing: 0.2,
    textAlign: "center",
  },

  // Conversations
  conversationsSection: {
    flex: 1,
  },
  conversationsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: SURFACE,
    marginBottom: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: SURFACE_BORDER,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  conversationImageContainer: {
    position: "relative",
    marginRight: 14,
  },
  conversationImageWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(141, 105, 246, 0.25)",
  },
  conversationImage: {
    width: "100%",
    height: "100%",
  },
  conversationOnlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: ONLINE_GREEN,
    borderWidth: 2,
    borderColor: BRAND_BG,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  conversationName: {
    color: WHITE,
    fontSize: 16,
    fontFamily: "Lora-Bold",
    letterSpacing: 0.3,
  },
  conversationTime: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontFamily: "DMSans-Regular",
    letterSpacing: 0.2,
  },
  conversationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessageContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginRight: 6,
  },
  lastMessage: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    letterSpacing: 0.2,
    flex: 1,
  },
  lastMessageTyping: {
    color: ACCENT_PINK,
    fontFamily: "DMSans-Medium",
  },
  lastMessageUnread: {
    color: WHITE,
    fontFamily: "DMSans-SemiBold",
  },
  unreadBadge: {
    backgroundColor: ACCENT_PINK,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: ACCENT_PINK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  unreadText: {
    color: WHITE,
    fontSize: 11,
    fontFamily: "DMSans-Bold",
    letterSpacing: 0.2,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Lora-Bold",
    color: WHITE,
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: TEXT_MUTED,
    textAlign: "center",
    letterSpacing: 0.2,
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    color: TEXT_SECONDARY,
    marginTop: 16,
  },

  // Retry button
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: ACCENT_PURPLE,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: "DMSans-Bold",
    color: WHITE,
    letterSpacing: 0.3,
  },
});

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
