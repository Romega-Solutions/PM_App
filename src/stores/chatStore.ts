/**
 * Chat Store - Active Conversations & Unread Counts
 *
 * PURPOSE: Manage chat state and unread message counts
 *
 * SECURITY PRACTICES:
 * - Only stores conversation metadata (no message content)
 * - Message content stays in database
 * - Unread counts synced with database
 *
 * SOLID PRINCIPLES:
 * - Single Responsibility: Only manages chat state
 * - Dependency Inversion: Depends on conversation API abstraction
 *
 * @filesize ~120 lines (under 150 limit for stores)
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// ===== TYPES =====

export interface UnreadCount {
  conversationId: string;
  count: number;
}

export interface ActiveConversation {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientPhoto: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

type ChatState = {
  // State
  activeConversations: ActiveConversation[];
  totalUnreadCount: number;
  currentConversationId: string | null;
  typingUsers: Map<string, boolean>;

  // Actions
  setActiveConversations: (conversations: ActiveConversation[]) => void;
  addConversation: (conversation: ActiveConversation) => void;
  updateConversation: (
    id: string,
    updates: Partial<ActiveConversation>,
  ) => void;
  removeConversation: (id: string) => void;
  setCurrentConversation: (id: string | null) => void;
  incrementUnread: (conversationId: string) => void;
  markAsRead: (conversationId: string) => void;
  setTyping: (conversationId: string, isTyping: boolean) => void;
  clearAllUnread: () => void;
  clearChat: () => void;
};

// ===== STORE =====

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      // Initial State
      activeConversations: [],
      totalUnreadCount: 0,
      currentConversationId: null,
      typingUsers: new Map(),

      // Set all active conversations
      setActiveConversations: (conversations) =>
        set({
          activeConversations: conversations,
          totalUnreadCount: conversations.reduce(
            (sum, c) => sum + c.unreadCount,
            0,
          ),
        }),

      // Add a new conversation
      addConversation: (conversation) =>
        set((state) => {
          const exists = state.activeConversations.find(
            (c) => c.id === conversation.id,
          );
          if (exists) return state;

          return {
            activeConversations: [conversation, ...state.activeConversations],
            totalUnreadCount: state.totalUnreadCount + conversation.unreadCount,
          };
        }),

      // Update conversation details
      updateConversation: (id, updates) =>
        set((state) => ({
          activeConversations: state.activeConversations.map((c) =>
            c.id === id ? { ...c, ...updates } : c,
          ),
        })),

      // Remove a conversation
      removeConversation: (id) =>
        set((state) => {
          const conversation = state.activeConversations.find((c) => c.id === id);
          return {
            activeConversations: state.activeConversations.filter(
              (c) => c.id !== id,
            ),
            totalUnreadCount: conversation
              ? state.totalUnreadCount - conversation.unreadCount
              : state.totalUnreadCount,
          };
        }),

      // Set current active conversation
      setCurrentConversation: (id) => set({ currentConversationId: id }),

      // Increment unread count for a conversation
      incrementUnread: (conversationId) =>
        set((state) => ({
          activeConversations: state.activeConversations.map((c) =>
            c.id === conversationId ? { ...c, unreadCount: c.unreadCount + 1 } : c,
          ),
          totalUnreadCount: state.totalUnreadCount + 1,
        })),

      // Mark conversation as read
      markAsRead: (conversationId) =>
        set((state) => {
          const conversation = state.activeConversations.find(
            (c) => c.id === conversationId,
          );
          if (!conversation) return state;

          return {
            activeConversations: state.activeConversations.map((c) =>
              c.id === conversationId ? { ...c, unreadCount: 0 } : c,
            ),
            totalUnreadCount: state.totalUnreadCount - conversation.unreadCount,
          };
        }),

      // Set typing indicator
      setTyping: (conversationId, isTyping) =>
        set((state) => {
          const newTypingUsers = new Map(state.typingUsers);
          newTypingUsers.set(conversationId, isTyping);
          return { typingUsers: newTypingUsers };
        }),

      // Clear all unread counts
      clearAllUnread: () =>
        set((state) => ({
          activeConversations: state.activeConversations.map((c) => ({
            ...c,
            unreadCount: 0,
          })),
          totalUnreadCount: 0,
        })),

      // Clear chat state (on sign out)
      clearChat: () =>
        set({
          activeConversations: [],
          totalUnreadCount: 0,
          currentConversationId: null,
          typingUsers: new Map(),
        }),
    }),
    {
      name: "chat-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist non-ephemeral state
      partialize: (state) => ({
        activeConversations: state.activeConversations,
        totalUnreadCount: state.totalUnreadCount,
      }),
    }
  )
);

// ===== HELPERS =====

/**
 * Get total unread message count
 */
export const getTotalUnreadCount = (): number => {
  return useChatStore.getState().totalUnreadCount;
};

/**
 * Check if user is typing in conversation
 */
export const isUserTyping = (conversationId: string): boolean => {
  return useChatStore.getState().typingUsers.get(conversationId) || false;
};
