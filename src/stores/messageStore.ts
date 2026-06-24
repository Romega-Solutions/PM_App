/**
 * Message Store - Offline Message Caching
 *
 * PURPOSE: Cache messages per conversation for offline access and zero-latency UI
 *
 * SECURITY PRACTICES:
 * - Stored locally in AsyncStorage
 * - Automatically cleared on sign out
 *
 * SOLID PRINCIPLES:
 * - Single Responsibility: Only manages message cache
 *
 * @filesize ~100 lines (under 150 limit for stores)
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Message } from "../features/messaging/types/messaging.types";

const MAX_MESSAGES_PER_CONVERSATION = 100;

type MessageState = {
  // State: Maps conversationId to an array of messages
  messagesByConversation: Record<string, Message[]>;

  // Actions
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  markAsRead: (conversationId: string, userId: string) => void;
  clearCache: () => void;
};

// ===== STORE =====

export const useMessageStore = create<MessageState>()(
  persist(
    (set) => ({
      // Initial State
      messagesByConversation: {},

      // Set all messages for a conversation (from fetch)
      setMessages: (conversationId, messages) =>
        set((state) => {
          // Keep only the most recent MAX_MESSAGES_PER_CONVERSATION
          // Assuming messages are ordered oldest to newest, we slice the end
          const trimmedMessages =
            messages.length > MAX_MESSAGES_PER_CONVERSATION
              ? messages.slice(-MAX_MESSAGES_PER_CONVERSATION)
              : messages;

          return {
            messagesByConversation: {
              ...state.messagesByConversation,
              [conversationId]: trimmedMessages,
            },
          };
        }),

      // Add a single message to a conversation
      addMessage: (conversationId, message) =>
        set((state) => {
          const currentMessages =
            state.messagesByConversation[conversationId] || [];
          
          // Check if message already exists
          const exists = currentMessages.some((msg) => msg.id === message.id);
          let newMessages;
          
          if (exists) {
            newMessages = currentMessages.map((msg) =>
              msg.id === message.id ? message : msg
            );
          } else {
            newMessages = [...currentMessages, message];
          }

          // Trim to max limit
          if (newMessages.length > MAX_MESSAGES_PER_CONVERSATION) {
            newMessages = newMessages.slice(-MAX_MESSAGES_PER_CONVERSATION);
          }

          return {
            messagesByConversation: {
              ...state.messagesByConversation,
              [conversationId]: newMessages,
            },
          };
        }),

      // Mark all messages as read locally for a specific conversation
      markAsRead: (conversationId, userId) =>
        set((state) => {
          const currentMessages =
            state.messagesByConversation[conversationId] || [];
          
          const updatedMessages = currentMessages.map((msg) =>
            msg.recipient_id === userId && msg.status !== "read"
              ? { ...msg, status: "read" as const, read_at: new Date().toISOString() }
              : msg
          );

          return {
            messagesByConversation: {
              ...state.messagesByConversation,
              [conversationId]: updatedMessages,
            },
          };
        }),

      // Clear all cached messages (e.g. on sign out)
      clearCache: () =>
        set({
          messagesByConversation: {},
        }),
    }),
    {
      name: "message-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
