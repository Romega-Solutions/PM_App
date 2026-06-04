/**
 * MessagesScreen Component
 *
 * Main messages/conversations list screen.
 * Displays active users and all conversations with search and filtering.
 *
 * SOLID Principles:
 * - Single Responsibility: Manages messages list UI and user interactions
 * - Open/Closed: Extensible via props, uses composable components
 * - Liskov Substitution: Can be used in any screen context
 * - Interface Segregation: Uses focused hooks (useConversations, useChatStore)
 * - Dependency Inversion: Depends on abstractions (hooks), not implementations
 *
 * Data Flow:
 * 1. useConversations hook → Loads conversations from API
 * 2. useChatStore → Provides global unread count
 * 3. ActiveUserCard → Displays online users
 * 4. ConversationCard → Displays conversation items
 *
 * @module features/messaging/screens
 */

import { useRouter } from "expo-router";
import {
    MessageCircle,
    RefreshCw,
    Search
} from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Platform,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useConversations } from "@/src/features/messaging/hooks/useConversations";
import { useCurrentUserId } from "@/src/features/messaging/hooks/useCurrentUserId";
import { useChatStore } from "@/src/stores/chatStore";
import { useTheme, withAlpha } from "@/src/theme";
import { ActiveUserCard } from "../components/ActiveUserCard";
import { ConversationCard } from "../components/ConversationCard";

/**
 * MessagesScreen Component
 *
 * Displays conversations list with active users section.
 * Integrates with Zustand chatStore for global state.
 */
export const MessagesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Get global unread count from Zustand store
  const totalUnreadCount = useChatStore((state) => state.totalUnreadCount);

  // Resolve current user ID via the api/ layer (rule A3)
  const { currentUserId } = useCurrentUserId();

  // Fetch conversations from backend (integrates with chatStore)
  const { conversations, loading, error, refresh } = useConversations({
    userId: currentUserId,
    autoLoad: true,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  // Filter conversations based on accessible search.
  const filteredConversations = conversations.filter((conv) => {
    if (!conv.other_user) return false;
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const firstName = conv.other_user.first_name || "";
    const lastMessage = conv.last_message_text || "";
    return (
      firstName.toLowerCase().includes(query) ||
      lastMessage.toLowerCase().includes(query)
    );
  });

  // Extract active users from online conversations
  const activeUsers = conversations
    .filter((conv) => conv.other_user?.is_active)
    .slice(0, 15)
    .map((conv) => ({
      id: conv.other_user.id,
      name: conv.other_user.first_name,
      image: conv.other_user.photos?.[0] || null,
      isOnline: true,
    }));

  // Navigate to chat screen
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

  // Handler for active user chat
  const handleActiveUserPress = (userId: string) => {
    const user = activeUsers.find((u) => u.id === userId);
    if (!user) return;

    router.push({
      pathname: "/chat",
      params: {
        userId: user.id,
        userName: user.name,
        userImage: user.image || undefined,
        isOnline: "true",
      },
    });
  };

  // Loading state
  if (loading && !conversations.length) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.brandBackground }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.brandBackground} />
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.onPrimary }]}>Messages</Text>
        </View>
        <View
          style={styles.loadingContainer}
          accessibilityRole="progressbar"
          accessibilityLabel="Loading conversations"
        >
          <ActivityIndicator size="large" color={colors.secondary} />
          <View style={[styles.skeletonLine, { backgroundColor: colors.brandSurfaceElevated }]} />
          <View style={[styles.skeletonLineShort, { backgroundColor: colors.brandSurface }]} />
          <Text style={[styles.loadingText, { color: withAlpha(colors.onPrimary, 0.72) }]}>Loading conversations...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.brandBackground }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.brandBackground} />
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.onPrimary }]}>Messages</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[styles.errorText, { color: colors.errorInk }]}>Failed to load conversations</Text>
          <Text style={[styles.errorSubtext, { color: withAlpha(colors.onPrimary, 0.62) }]}>{error.message}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.secondary }]}
            onPress={handleRefresh}
            accessibilityRole="button"
            accessibilityLabel="Retry loading conversations"
          >
            <Text style={[styles.retryButtonText, { color: colors.onSecondary }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.brandBackground }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brandBackground} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: colors.onPrimary }]}>Messages</Text>
          {totalUnreadCount > 0 && (
            <View style={[styles.headerBadge, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.headerBadgeText, { color: colors.onSecondary }]}>{totalUnreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.headerButton,
            { backgroundColor: colors.brandSurface, borderColor: colors.brandBorder },
          ]}
          onPress={handleRefresh}
          accessibilityRole="button"
          accessibilityLabel="Refresh conversations"
          accessibilityState={{ busy: refreshing || loading }}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={colors.onPrimary} />
          ) : (
            <RefreshCw size={20} color={colors.onPrimary} strokeWidth={2.5} />
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputWrapper, { backgroundColor: colors.brandSurface, borderColor: colors.brandBorder }]}>
          <Search
            size={20}
            color={withAlpha(colors.onPrimary, 0.55)}
            strokeWidth={2.5}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.onPrimary }]}
            placeholder="Search conversations..."
            placeholderTextColor={withAlpha(colors.onPrimary, 0.55)}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Search conversations"
            accessibilityHint="Search by contact name or last message"
            returnKeyType="search"
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.secondary}
            colors={[colors.secondary]}
            progressBackgroundColor={colors.brandSurfaceElevated}
          />
        }
      >
        {/* Active Users Section */}
        {activeUsers.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MessageCircle
                size={18}
                color={colors.secondary}
                strokeWidth={2.5}
              />
              <Text style={[styles.sectionTitle, { color: colors.onPrimary }]}>Active Now</Text>
              <Text style={[styles.sectionCount, { color: withAlpha(colors.onPrimary, 0.55) }]}>({activeUsers.length})</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activeUsersContainer}
            >
              {activeUsers.map((user) => (
                <ActiveUserCard
                  key={user.id}
                  id={user.id}
                  name={user.name}
                  image={user.image}
                  isOnline={user.isOnline}
                  onPress={handleActiveUserPress}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Conversations Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.onPrimary }]}>All Messages</Text>
            <Text style={[styles.sectionCount, { color: withAlpha(colors.onPrimary, 0.55) }]}>
              ({filteredConversations.length})
            </Text>
          </View>

          {filteredConversations.length === 0 ? (
            <View style={styles.emptyState}>
              <MessageCircle size={48} color={withAlpha(colors.onPrimary, 0.5)} strokeWidth={1.5} />
              <Text style={[styles.emptyStateText, { color: withAlpha(colors.onPrimary, 0.78) }]}>
                {searchQuery
                  ? "No conversations found"
                  : "No conversations yet"}
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: withAlpha(colors.onPrimary, 0.55) }]}>
                {searchQuery
                  ? "Try adjusting your search"
                  : "Start matching to begin chatting"}
              </Text>
            </View>
          ) : (
            <View style={styles.conversationsContainer}>
              {filteredConversations.map((conv) => (
                <ConversationCard
                  key={conv.id}
                  conversationId={conv.id}
                  userId={conv.other_user.id}
                  userName={conv.other_user.first_name}
                  userPhoto={conv.other_user.photos?.[0] || null}
                  isOnline={conv.other_user.is_active}
                  lastMessage={conv.last_message_text || "No messages yet"}
                  lastMessageTime={
                    conv.last_message_at || conv.updated_at || ""
                  }
                  unreadCount={conv.unread_count || 0}
                  onPress={() => handleChatPress(conv)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "DMSans-Bold",
  },
  headerBadge: {
    marginLeft: 12,
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  headerBadgeText: {
    fontSize: 13,
    fontFamily: "DMSans-Bold",
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "DMSans-Regular",
    paddingVertical: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === "ios" ? 100 : 80,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "DMSans-Bold",
    marginLeft: 8,
  },
  sectionCount: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    marginLeft: 6,
  },
  activeUsersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  conversationsContainer: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: "DMSans-Bold",
    marginTop: 20,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    marginTop: 16,
  },
  skeletonLine: {
    width: 220,
    height: 18,
    borderRadius: 9,
    marginTop: 18,
  },
  skeletonLineShort: {
    width: 150,
    height: 14,
    borderRadius: 7,
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    fontFamily: "DMSans-Bold",
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: "DMSans-Bold",
  },
});
