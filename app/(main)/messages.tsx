// app/(tabs)/messages.tsx
import {
  CheckCheck,
  Circle,
  Filter,
  MessageCircle,
  MoreVertical,
  Search,
} from "lucide-react-native";
import React, { useState } from "react";
import {
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

// Active users data - updated to use all 15 AI images
const activeUsers = [
  {
    id: 1,
    name: "Maria",
    image: require("../../assets/girls/ai1.jpg"),
    isOnline: true,
  },
  {
    id: 2,
    name: "Angel",
    image: require("../../assets/girls/ai2.jpg"),
    isOnline: true,
  },
  {
    id: 3,
    name: "Jessa",
    image: require("../../assets/girls/ai3.jpg"),
    isOnline: true,
  },
  {
    id: 4,
    name: "Kim",
    image: require("../../assets/girls/ai4.jpg"),
    isOnline: true,
  },
  {
    id: 5,
    name: "Liza",
    image: require("../../assets/girls/ai5.jpg"),
    isOnline: false,
  },
  {
    id: 6,
    name: "Bea",
    image: require("../../assets/girls/ai6.jpg"),
    isOnline: true,
  },
  {
    id: 7,
    name: "Carla",
    image: require("../../assets/girls/ai7.jpg"),
    isOnline: true,
  },
  {
    id: 8,
    name: "Denise",
    image: require("../../assets/girls/ai8.jpg"),
    isOnline: false,
  },
  {
    id: 9,
    name: "Erika",
    image: require("../../assets/girls/ai9.jpg"),
    isOnline: true,
  },
  {
    id: 10,
    name: "Faith",
    image: require("../../assets/girls/ai10.jpg"),
    isOnline: false,
  },
  {
    id: 11,
    name: "Grace",
    image: require("../../assets/girls/ai11.jpg"),
    isOnline: true,
  },
  {
    id: 12,
    name: "Hannah",
    image: require("../../assets/girls/ai12.png"),
    isOnline: false,
  },
  {
    id: 13,
    name: "Irene",
    image: require("../../assets/girls/ai13.png"),
    isOnline: true,
  },
  {
    id: 14,
    name: "Joy",
    image: require("../../assets/girls/ai14.png"),
    isOnline: false,
  },
  {
    id: 15,
    name: "Kaye",
    image: require("../../assets/girls/ai15.png"),
    isOnline: true,
  },
] as const;

// Conversations data - updated to use all 15 AI images
const conversations = [
  {
    id: 1,
    name: "Maria",
    image: require("../../assets/girls/ai1.jpg"),
    lastMessage: "That sounds amazing! When are you free?",
    time: "2m",
    unread: 2,
    isTyping: true,
    isOnline: true,
    isSent: false,
  },
  {
    id: 2,
    name: "Angel",
    image: require("../../assets/girls/ai2.jpg"),
    lastMessage: "You: Hey! What is up, long time...",
    time: "18m",
    unread: 0,
    isTyping: false,
    isOnline: true,
    isSent: true,
    isRead: true,
  },
  {
    id: 3,
    name: "Jessa",
    image: require("../../assets/girls/ai3.jpg"),
    lastMessage: "I would love to meet this weekend.",
    time: "24m",
    unread: 1,
    isTyping: false,
    isOnline: false,
    isSent: false,
  },
  {
    id: 4,
    name: "Kim",
    image: require("../../assets/girls/ai4.jpg"),
    lastMessage: "You: Great. I will message later.",
    time: "32m",
    unread: 0,
    isTyping: false,
    isOnline: true,
    isSent: true,
    isRead: false,
  },
  {
    id: 5,
    name: "Liza",
    image: require("../../assets/girls/ai5.jpg"),
    lastMessage: "You: Hi. How are you?",
    time: "1h",
    unread: 0,
    isTyping: false,
    isOnline: false,
    isSent: true,
    isRead: true,
  },
  {
    id: 6,
    name: "Bea",
    image: require("../../assets/girls/ai6.jpg"),
    lastMessage: "Cafe later after work?",
    time: "1h",
    unread: 0,
    isTyping: false,
    isOnline: true,
    isSent: true,
    isRead: true,
  },
  {
    id: 7,
    name: "Carla",
    image: require("../../assets/girls/ai7.jpg"),
    lastMessage: "You: Let me check my schedule.",
    time: "2h",
    unread: 3,
    isTyping: false,
    isOnline: true,
    isSent: false,
  },
  {
    id: 8,
    name: "Denise",
    image: require("../../assets/girls/ai8.jpg"),
    lastMessage: "New cafe opened in BGC. Want to try?",
    time: "2h",
    unread: 0,
    isTyping: false,
    isOnline: false,
    isSent: true,
    isRead: false,
  },
  {
    id: 9,
    name: "Erika",
    image: require("../../assets/girls/ai9.jpg"),
    lastMessage: "Send me the photos later please.",
    time: "3h",
    unread: 0,
    isTyping: false,
    isOnline: true,
    isSent: true,
    isRead: true,
  },
  {
    id: 10,
    name: "Faith",
    image: require("../../assets/girls/ai10.jpg"),
    lastMessage: "You: Flight booked for next month.",
    time: "4h",
    unread: 0,
    isTyping: false,
    isOnline: false,
    isSent: true,
    isRead: true,
  },
  {
    id: 11,
    name: "Grace",
    image: require("../../assets/girls/ai11.jpg"),
    lastMessage: "Let us plan the hike soon.",
    time: "5h",
    unread: 1,
    isTyping: false,
    isOnline: true,
    isSent: true,
    isRead: false,
  },
  {
    id: 12,
    name: "Hannah",
    image: require("../../assets/girls/ai12.png"),
    lastMessage: "Tea or coffee for our catch up?",
    time: "6h",
    unread: 0,
    isTyping: false,
    isOnline: false,
    isSent: true,
    isRead: true,
  },
  {
    id: 13,
    name: "Irene",
    image: require("../../assets/girls/ai13.png"),
    lastMessage: "Gym tomorrow morning?",
    time: "Yesterday",
    unread: 0,
    isTyping: false,
    isOnline: true,
    isSent: true,
    isRead: true,
  },
  {
    id: 14,
    name: "Joy",
    image: require("../../assets/girls/ai14.png"),
    lastMessage: "You: Board game night on Friday?",
    time: "Yesterday",
    unread: 2,
    isTyping: false,
    isOnline: false,
    isSent: false,
  },
  {
    id: 15,
    name: "Kaye",
    image: require("../../assets/girls/ai15.png"),
    lastMessage: "Cooking class signup is open.",
    time: "2d",
    unread: 0,
    isTyping: false,
    isOnline: true,
    isSent: true,
    isRead: true,
  },
] as const;

interface ActiveUserProps {
  user: (typeof activeUsers)[number];
}

const ActiveUser: React.FC<ActiveUserProps> = ({ user }) => (
  <TouchableOpacity
    style={styles.activeUser}
    accessibilityRole="button"
    accessibilityLabel={`Chat with ${user.name}`}
  >
    <View style={styles.activeUserImageContainer}>
      <View style={styles.activeUserImageWrap}>
        <Image
          source={user.image}
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

interface ConversationProps {
  conversation: (typeof conversations)[number];
}

const ConversationItem: React.FC<ConversationProps> = ({ conversation }) => (
  <TouchableOpacity
    style={styles.conversationItem}
    activeOpacity={0.85}
    accessibilityRole="button"
    accessibilityLabel={`Open chat with ${conversation.name}`}
  >
    {/* Profile Image */}
    <View style={styles.conversationImageContainer}>
      <View style={styles.conversationImageWrap}>
        <Image
          source={conversation.image}
          style={styles.conversationImage}
          resizeMode="cover"
        />
      </View>
      {conversation.isOnline && <View style={styles.conversationOnlineDot} />}
    </View>

    {/* Message Info */}
    <View style={styles.conversationContent}>
      <View style={styles.conversationHeader}>
        <Text style={styles.conversationName}>{conversation.name}</Text>
        <Text style={styles.conversationTime}>{conversation.time}</Text>
      </View>

      <View style={styles.conversationFooter}>
        <View style={styles.lastMessageContainer}>
          {/* Read or Sent indicator */}
          {conversation.isSent && (
            <CheckCheck
              size={14}
              color={conversation.isRead ? ACCENT_PURPLE : TEXT_MUTED}
              strokeWidth={2}
              style={{ marginRight: 4 }}
            />
          )}
          {/* Typing indicator */}
          {conversation.isTyping && (
            <View style={styles.typingIndicator}>
              <Circle size={4} color={ACCENT_PINK} fill={ACCENT_PINK} />
              <Circle size={4} color={ACCENT_PINK} fill={ACCENT_PINK} />
              <Circle size={4} color={ACCENT_PINK} fill={ACCENT_PINK} />
            </View>
          )}
          <Text
            style={[
              styles.lastMessage,
              conversation.isTyping && styles.lastMessageTyping,
              conversation.unread > 0 && styles.lastMessageUnread,
            ]}
            numberOfLines={1}
          >
            {conversation.isTyping ? "Typing..." : conversation.lastMessage}
          </Text>
        </View>

        {conversation.unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{conversation.unread}</Text>
          </View>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

export default function Messages() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              style={styles.headerIconBtn}
              accessibilityRole="button"
              accessibilityLabel="Filter conversations"
            >
              <Filter size={22} color={ACCENT_PURPLE} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIconBtn}
              accessibilityRole="button"
              accessibilityLabel="More options"
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
            <ActiveUser key={user.id} user={user} />
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
});
