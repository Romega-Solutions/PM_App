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
    Filter,
    MessageCircle,
    Search
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
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

import { supabase } from "@/src/config/supabase";
import { useConversations } from "@/src/features/messaging/hooks/useConversations";
import { useChatStore } from "@/src/stores/chatStore";
import { ActiveUserCard } from "../components/ActiveUserCard";
import { ConversationCard } from "../components/ConversationCard";

// Brand Colors
const BRAND_BG = "#0F0814";
const ACCENT_PURPLE = "#8D69F6";
const WHITE = "#FFFFFF";
const SURFACE = "rgba(255,255,255,0.06)";
const SURFACE_BORDER = "rgba(141,105,246,0.18)";
const TEXT_SECONDARY = "rgba(255,255,255,0.75)";
const TEXT_MUTED = "rgba(255,255,255,0.5)";

/**
 * MessagesScreen Component
 *
 * Displays conversations list with active users section.
 * Integrates with Zustand chatStore for global state.
 */
export const MessagesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [, setFilterType] = useState<"all" | "unread" | "online">("all");

  // Get global unread count from Zustand store
  const totalUnreadCount = useChatStore((state) => state.totalUnreadCount);

  // Get current user ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setCurrentUserId(data.user.id);
      }
    });
  }, []);

  // Fetch conversations from backend (integrates with chatStore)
  const { conversations, loading, error, refresh } = useConversations({
    userId: currentUserId,
    autoLoad: true,
  });

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv) => {
    if (!conv.other_user) return false;
    if (!searchQuery) return true;
    const firstName = conv.other_user.first_name || "";
    return firstName.toLowerCase().includes(searchQuery.toLowerCase());
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
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" backgroundColor={BRAND_BG} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ACCENT_PURPLE} />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" backgroundColor={BRAND_BG} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Failed to load conversations</Text>
          <Text style={styles.errorSubtext}>{error.message}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_BG} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Messages</Text>
          {totalUnreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{totalUnreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setFilterType("all")}
        >
          <Filter size={22} color={WHITE} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search
            size={20}
            color={TEXT_MUTED}
            strokeWidth={2.5}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor={TEXT_MUTED}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Active Users Section */}
        {activeUsers.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MessageCircle
                size={18}
                color={ACCENT_PURPLE}
                strokeWidth={2.5}
              />
              <Text style={styles.sectionTitle}>Active Now</Text>
              <Text style={styles.sectionCount}>({activeUsers.length})</Text>
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
            <Text style={styles.sectionTitle}>All Messages</Text>
            <Text style={styles.sectionCount}>
              ({filteredConversations.length})
            </Text>
          </View>

          {filteredConversations.length === 0 ? (
            <View style={styles.emptyState}>
              <MessageCircle size={48} color={TEXT_MUTED} strokeWidth={1.5} />
              <Text style={styles.emptyStateText}>
                {searchQuery
                  ? "No conversations found"
                  : "No conversations yet"}
              </Text>
              <Text style={styles.emptyStateSubtext}>
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
    backgroundColor: BRAND_BG,
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
    color: WHITE,
    letterSpacing: 0.3,
  },
  headerBadge: {
    marginLeft: 12,
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ACCENT_PURPLE,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  headerBadgeText: {
    fontSize: 13,
    fontFamily: "DMSans-Bold",
    color: WHITE,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: SURFACE_BORDER,
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
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: SURFACE_BORDER,
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
    color: WHITE,
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
    color: WHITE,
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  sectionCount: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    color: TEXT_MUTED,
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
    color: TEXT_SECONDARY,
    marginTop: 20,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: TEXT_MUTED,
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
    color: TEXT_SECONDARY,
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    fontFamily: "DMSans-Bold",
    color: TEXT_SECONDARY,
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: TEXT_MUTED,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
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
