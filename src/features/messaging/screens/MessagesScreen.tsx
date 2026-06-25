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
  AlertCircle,
  MessageCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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
import {
  DEMO_CURRENT_USER_ID,
  getSeedConversations,
  isSeedConversationId,
} from "@/src/features/messaging/data/seedConversations";
import { useConversations } from "@/src/features/messaging/hooks/useConversations";
import { useAuthStore } from "@/src/stores/authStore";
import { useChatStore } from "@/src/stores/chatStore";
import { useMessageStore } from "@/src/stores/messageStore";
import { ActiveUserCard } from "../components/ActiveUserCard";
import { ConversationCard } from "../components/ConversationCard";
import type { ConversationWithUser, Message } from "../types/messaging.types";

// Brand Colors
const BRAND_BG = "#0F0814";
const ACCENT_PURPLE = "#8D69F6";
const WHITE = "#FFFFFF";
const SURFACE = "rgba(255,255,255,0.06)";
const SURFACE_BORDER = "rgba(141,105,246,0.18)";
const TEXT_SECONDARY = "rgba(255,255,255,0.75)";
const TEXT_MUTED = "rgba(255,255,255,0.5)";

type ConversationFilter = "all" | "unread" | "online";

const FILTER_OPTIONS: {
  key: ConversationFilter;
  label: string;
  accessibilityLabel: string;
}[] = [
  {
    key: "all",
    label: "All",
    accessibilityLabel: "Show all conversations",
  },
  {
    key: "unread",
    label: "Unread",
    accessibilityLabel: "Show unread conversations",
  },
  {
    key: "online",
    label: "Active",
    accessibilityLabel: "Show active conversations",
  },
];

function getConversationErrorMessage(error: Error): string {
  const message = error.message?.trim();

  if (!message) {
    return "Check your connection and try again.";
  }

  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("network") ||
    lowerMessage.includes("fetch") ||
    lowerMessage.includes("timeout")
  ) {
    return "Check your connection and try again.";
  }

  if (
    lowerMessage.includes("jwt") ||
    lowerMessage.includes("session") ||
    lowerMessage.includes("auth")
  ) {
    return "Please sign in again to load your messages.";
  }

  return message;
}

function getMessagePreview(message: Message): string {
  if (message.type === "image") return "Photo";
  return message.text?.trim() || "Message";
}

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
  const [filterType, setFilterType] = useState<ConversationFilter>("all");
  const [showSeedSnackbar, setShowSeedSnackbar] = useState(false);
  const seedSnackbarOpacity = React.useRef(new Animated.Value(0)).current;
  const seedSnackbarRunKey = React.useRef<string | null>(null);

  // Get global unread count from Zustand store
  const isDemoMode = useAuthStore((state) => state.isDemoMode);
  const realTotalUnreadCount = useChatStore((state) => state.totalUnreadCount);
  const demoMessagesByConversation = useMessageStore(
    (state) => state.messagesByConversation,
  );
  const hiddenDemoConversationIds = useMessageStore(
    (state) => state.hiddenDemoConversationIds || [],
  );

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

  const seedConversations = React.useMemo(() => {
    return getSeedConversations(currentUserId)
      .filter((conv) => !hiddenDemoConversationIds.includes(conv.id))
      .map((conv) => {
        const cachedMessages = demoMessagesByConversation[conv.id] || [];
        if (cachedMessages.length === 0) return conv;

        const visibleMessages = cachedMessages.filter(
          (message) => !message.is_deleted,
        );
        const lastMessage = visibleMessages[visibleMessages.length - 1];
        const demoCurrentUserId = currentUserId || DEMO_CURRENT_USER_ID;
        const unreadCount = visibleMessages.filter(
          (message) =>
            message.recipient_id === demoCurrentUserId &&
            message.status !== "read",
        ).length;

        if (!lastMessage) {
          return { ...conv, unread_count: unreadCount };
        }

        return {
          ...conv,
          last_message_id: lastMessage.id,
          last_message_text: getMessagePreview(lastMessage),
          last_message_sender_id: lastMessage.sender_id,
          last_message_at: lastMessage.created_at,
          participant_1_unread_count: unreadCount,
          unread_count: unreadCount,
          updated_at: lastMessage.updated_at || lastMessage.created_at,
        };
      });
  }, [currentUserId, demoMessagesByConversation, hiddenDemoConversationIds]);
  const usingSeedConversations =
    isDemoMode && !loading && (Boolean(error) || conversations.length === 0);
  const displayConversations = usingSeedConversations
    ? seedConversations
    : conversations;
  const displayUnreadCount = usingSeedConversations
    ? displayConversations.reduce(
        (total, conv) => total + (conv.unread_count || 0),
        0,
      )
    : realTotalUnreadCount;
  const seedSnackbarText = error
    ? `Live messages did not refresh: ${getConversationErrorMessage(error)} Sample unread and active chats are shown for testing.`
    : "Sample unread and active chats are shown until real conversations are available.";
  const seedSnackbarKey = error ? "fallback-error" : "fallback-empty";
  const liveConversationError = usingSeedConversations ? null : error;

  useEffect(() => {
    if (!usingSeedConversations) {
      seedSnackbarOpacity.stopAnimation();
      seedSnackbarOpacity.setValue(0);
      setShowSeedSnackbar(false);
      seedSnackbarRunKey.current = null;
      return;
    }

    if (seedSnackbarRunKey.current === seedSnackbarKey) {
      return;
    }

    seedSnackbarRunKey.current = seedSnackbarKey;
    setShowSeedSnackbar(true);
    seedSnackbarOpacity.setValue(0);

    const animation = Animated.sequence([
      Animated.timing(seedSnackbarOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.delay(4600),
      Animated.timing(seedSnackbarOpacity, {
        toValue: 0,
        duration: 420,
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished) {
        setShowSeedSnackbar(false);
      }
    });

    return () => {
      animation.stop();
    };
  }, [seedSnackbarKey, seedSnackbarOpacity, usingSeedConversations]);

  // Extract active users from online conversations
  const activeUsers = displayConversations
    .filter((conv) => conv.other_user?.is_active)
    .slice(0, 15)
    .map((conv) => ({
      id: conv.other_user.id,
      conversationId: conv.id,
      name: conv.other_user.first_name,
      image:
        conv.other_user.demoPhotoSource ?? conv.other_user.photos?.[0] ?? null,
      isOnline: true,
    }));
  const unreadConversationCount = displayConversations.filter(
    (conv) => (conv.unread_count || 0) > 0,
  ).length;
  const filterCounts: Record<ConversationFilter, number> = {
    all: displayConversations.length,
    unread: unreadConversationCount,
    online: activeUsers.length,
  };

  // Filter conversations based on search and the visible segmented control.
  const filteredConversations = displayConversations.filter((conv) => {
    if (!conv.other_user) return false;
    if (filterType === "unread" && (conv.unread_count || 0) === 0) {
      return false;
    }
    if (filterType === "online" && !conv.other_user.is_active) {
      return false;
    }
    if (!searchQuery) return true;
    const firstName = conv.other_user.first_name || "";
    return firstName.toLowerCase().includes(searchQuery.toLowerCase());
  });
  const emptyTitle = liveConversationError
    ? "Messages did not refresh"
    : searchQuery
    ? "No conversations found"
    : filterType === "unread"
      ? "No unread messages"
      : filterType === "online"
        ? "No one active right now"
        : "No conversations yet";
  const emptyMessage = liveConversationError
    ? getConversationErrorMessage(liveConversationError)
    : searchQuery
    ? "Try a first name, or clear the search to see all chats."
    : filterType === "unread"
      ? "You are caught up. New replies will appear here when they arrive."
      : filterType === "online"
        ? "Active matches will appear here when they are available. You can still open any existing chat from All."
        : "Mutual matches appear here when a conversation starts. A specific, respectful hello is enough.";

  // Navigate to chat screen
  const handleChatPress = (conv: ConversationWithUser) => {
    const isSeedConversation = isSeedConversationId(conv.id);

    router.push({
      pathname: "/chat",
      params: {
        userId: conv.other_user.id,
        userName: conv.other_user.first_name,
        userImage: conv.other_user.photos?.[0] || undefined,
        isOnline: conv.other_user.is_active ? "true" : "false",
        conversationId: conv.id,
        ...(isSeedConversation ? { isDemo: "true" } : {}),
      },
    });
  };

  // Handler for active user chat
  const handleActiveUserPress = (userId: string) => {
    const user = activeUsers.find((u) => u.id === userId);
    if (!user) return;
    const isSeedConversation = isSeedConversationId(user.conversationId);

    router.push({
      pathname: "/chat",
      params: {
        userId: user.id,
        userName: user.name,
        userImage: typeof user.image === "string" ? user.image : undefined,
        isOnline: "true",
        ...(isSeedConversation
          ? { conversationId: user.conversationId, isDemo: "true" }
          : {}),
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
        <View
          style={styles.loadingContainer}
          accessibilityRole="progressbar"
          accessibilityLabel="Loading conversations"
        >
          <ActivityIndicator size="large" color={ACCENT_PURPLE} />
          <Text style={styles.loadingText}>Loading conversations...</Text>
          <Text style={styles.loadingSubtext}>
            Checking your latest matches and unread messages.
          </Text>
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
          {displayUnreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{displayUnreadCount}</Text>
            </View>
          )}
        </View>
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
            accessibilityLabel="Search conversations"
            accessibilityHint="Filters conversations by first name"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearSearchButton}
              onPress={() => setSearchQuery("")}
              activeOpacity={0.84}
              accessibilityRole="button"
              accessibilityLabel="Clear conversation search"
            >
              <X size={18} color={TEXT_SECONDARY} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View
        style={styles.filterTabs}
        accessibilityRole="tablist"
        accessibilityLabel="Conversation filters"
      >
        {FILTER_OPTIONS.map((option) => {
          const isSelected = filterType === option.key;

          return (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterTab,
                isSelected && styles.filterTabSelected,
              ]}
              onPress={() => setFilterType(option.key)}
              activeOpacity={0.84}
              accessibilityRole="tab"
              accessibilityLabel={`${option.accessibilityLabel}, ${filterCounts[option.key]} available`}
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  styles.filterTabText,
                  isSelected && styles.filterTabTextSelected,
                ]}
              >
                {option.label}
              </Text>
              <View
                style={[
                  styles.filterCount,
                  isSelected && styles.filterCountSelected,
                ]}
              >
                <Text
                  style={[
                    styles.filterCountText,
                    isSelected && styles.filterCountTextSelected,
                  ]}
                >
                  {filterCounts[option.key]}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View
          style={styles.trustNote}
          accessible
          accessibilityLabel="Chat at your pace. Keep conversations respectful. You never need to share private contact details, payment details, or meet before you are ready."
        >
          <View style={styles.trustIconWrap}>
            <ShieldCheck size={20} color={ACCENT_PURPLE} strokeWidth={2.4} />
          </View>
          <View style={styles.trustCopy}>
            <Text style={styles.trustTitle}>Chat at your pace</Text>
            <Text style={styles.trustText}>
              Keep it respectful. You never need to share private contact or
              payment details before you are ready.
            </Text>
          </View>
        </View>

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
              accessibilityLabel="Active conversations"
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
              <View style={styles.emptyIconWrap}>
                <MessageCircle
                  size={42}
                  color={ACCENT_PURPLE}
                  strokeWidth={1.7}
                />
              </View>
              <Text style={styles.emptyStateText}>
                {emptyTitle}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                {emptyMessage}
              </Text>
              <View
                style={styles.emptySafetyNote}
                accessible
                accessibilityLabel="Safety reminder. If a chat feels unsafe, use the chat safety options to report, block, or unmatch."
              >
                <ShieldCheck
                  size={15}
                  color={TEXT_SECONDARY}
                  strokeWidth={2.2}
                />
                <Text style={styles.emptySafetyText}>
                  If a chat feels unsafe, use Safety options inside the chat to
                  report, block, or unmatch.
                </Text>
              </View>
              {liveConversationError ? (
                <TouchableOpacity
                  style={styles.emptyActionButton}
                  onPress={refresh}
                  activeOpacity={0.84}
                  accessibilityRole="button"
                  accessibilityLabel="Retry loading conversations"
                >
                  <RefreshCw size={18} color={WHITE} strokeWidth={2.4} />
                  <Text style={styles.emptyActionButtonText}>Retry</Text>
                </TouchableOpacity>
              ) : searchQuery || filterType !== "all" ? (
                <TouchableOpacity
                  style={styles.emptyActionButton}
                  onPress={() => {
                    setSearchQuery("");
                    setFilterType("all");
                  }}
                  activeOpacity={0.84}
                  accessibilityRole="button"
                  accessibilityLabel="Show all conversations"
                  accessibilityHint="Clears search and resets conversation filters"
                >
                  <RefreshCw size={18} color={WHITE} strokeWidth={2.4} />
                  <Text style={styles.emptyActionButtonText}>Show all</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            <View style={styles.conversationsContainer}>
              {filteredConversations.map((conv) => (
                <ConversationCard
                  key={conv.id}
                  conversationId={conv.id}
                  userId={conv.other_user.id}
                  userName={conv.other_user.first_name}
                  userPhoto={
                    conv.other_user.demoPhotoSource ??
                    conv.other_user.photos?.[0] ??
                    null
                  }
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

      {showSeedSnackbar && usingSeedConversations && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.seedSnackbar,
            {
              bottom: Math.max(insets.bottom + 86, 92),
              opacity: seedSnackbarOpacity,
              transform: [
                {
                  translateY: seedSnackbarOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                  }),
                },
              ],
            },
          ]}
          accessible
          accessibilityLiveRegion="polite"
          accessibilityLabel={`Beta seeded inbox. ${seedSnackbarText}`}
        >
          <View style={styles.seedSnackbarIcon}>
            {error ? (
              <AlertCircle
                size={18}
                color={ACCENT_PURPLE}
                strokeWidth={2.4}
              />
            ) : (
              <MessageCircle
                size={18}
                color={ACCENT_PURPLE}
                strokeWidth={2.4}
              />
            )}
          </View>
          <View style={styles.seedSnackbarCopy}>
            <Text style={styles.seedSnackbarTitle}>Beta seeded inbox</Text>
            <Text style={styles.seedSnackbarText}>{seedSnackbarText}</Text>
          </View>
        </Animated.View>
      )}
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
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
  clearSearchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: -10,
    justifyContent: "center",
    alignItems: "center",
  },
  filterTabs: {
    minHeight: 52,
    marginHorizontal: 20,
    marginBottom: 18,
    padding: 4,
    borderRadius: 18,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: SURFACE_BORDER,
    flexDirection: "row",
    gap: 4,
  },
  filterTab: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  filterTabSelected: {
    backgroundColor: "rgba(141,105,246,0.24)",
    borderWidth: 1,
    borderColor: "rgba(141,105,246,0.42)",
  },
  filterTabText: {
    fontSize: 13,
    fontFamily: "DMSans-Bold",
    color: TEXT_MUTED,
  },
  filterTabTextSelected: {
    color: WHITE,
  },
  filterCount: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 7,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  filterCountSelected: {
    backgroundColor: ACCENT_PURPLE,
  },
  filterCountText: {
    fontSize: 12,
    fontFamily: "DMSans-Bold",
    color: TEXT_MUTED,
  },
  filterCountTextSelected: {
    color: WHITE,
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
  trustNote: {
    minHeight: 72,
    marginHorizontal: 20,
    marginBottom: 22,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(141,105,246,0.1)",
    borderWidth: 1,
    borderColor: SURFACE_BORDER,
    flexDirection: "row",
    alignItems: "center",
  },
  trustIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(141,105,246,0.14)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  trustCopy: {
    flex: 1,
  },
  trustTitle: {
    fontSize: 14,
    fontFamily: "DMSans-Bold",
    color: WHITE,
    marginBottom: 4,
  },
  trustText: {
    fontSize: 13,
    fontFamily: "DMSans-Regular",
    color: TEXT_SECONDARY,
    lineHeight: 19,
  },
  seedSnackbar: {
    position: "absolute",
    left: 16,
    right: 16,
    minHeight: 66,
    padding: 13,
    borderRadius: 16,
    backgroundColor: "rgba(24, 14, 31, 0.96)",
    borderWidth: 1,
    borderColor: "rgba(141,105,246,0.36)",
    flexDirection: "row",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.32,
        shadowRadius: 18,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  seedSnackbarIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(141,105,246,0.14)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  seedSnackbarCopy: {
    flex: 1,
  },
  seedSnackbarTitle: {
    fontSize: 13,
    fontFamily: "DMSans-Bold",
    color: WHITE,
    marginBottom: 4,
  },
  seedSnackbarText: {
    fontSize: 12,
    fontFamily: "DMSans-Medium",
    color: TEXT_SECONDARY,
    lineHeight: 17,
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
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(141,105,246,0.12)",
    borderWidth: 1,
    borderColor: SURFACE_BORDER,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 20,
    fontFamily: "DMSans-Bold",
    color: WHITE,
    marginTop: 20,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 15,
    fontFamily: "DMSans-Regular",
    color: TEXT_SECONDARY,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 300,
  },
  emptySafetyNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 16,
    maxWidth: 300,
  },
  emptySafetyText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "DMSans-Medium",
    color: "rgba(255,255,255,0.62)",
    lineHeight: 20,
    textAlign: "left",
  },
  emptyActionButton: {
    marginTop: 18,
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: ACCENT_PURPLE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyActionButtonText: {
    fontSize: 14,
    fontFamily: "DMSans-Bold",
    color: WHITE,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    color: TEXT_SECONDARY,
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 13,
    fontFamily: "DMSans-Regular",
    color: TEXT_MUTED,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 19,
  },
  errorText: {
    fontSize: 18,
    fontFamily: "DMSans-Bold",
    color: WHITE,
    textAlign: "center",
    marginTop: 18,
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
    paddingVertical: 14,
    minHeight: 48,
    backgroundColor: ACCENT_PURPLE,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: "DMSans-Bold",
    color: WHITE,
    letterSpacing: 0.3,
  },
  errorIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(141,105,246,0.12)",
    borderWidth: 1,
    borderColor: SURFACE_BORDER,
    justifyContent: "center",
    alignItems: "center",
  },
});
