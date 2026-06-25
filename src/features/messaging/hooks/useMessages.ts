/**
 * useMessages Hook
 *
 * Manages message state for a conversation.
 * Loads messages, sends new messages, handles updates.
 *
 * @module features/messaging/hooks/useMessages
 */

import { useCallback, useEffect, useState } from "react";
import {
  createSeedOutgoingImageMessage,
  createSeedOutgoingMessage,
  DEMO_CURRENT_USER_ID,
  getSeedMessages,
  isSeedConversationId,
} from "@/src/features/messaging/data/seedConversations";
import {
    getMessages,
    getMessagesByConversationId,
    markConversationAsRead,
    sendImageMessage,
    sendTextMessage,
} from "../api/messages.api";
import type { Message } from "../types/messaging.types";
import { useMessageStore } from "@/src/stores/messageStore";

interface UseMessagesOptions {
  conversationId?: string;
  userId: string;
  recipientId: string;
  autoLoad?: boolean;
}

interface UseMessagesReturn {
  messages: Message[];
  loading: boolean;
  error: Error | null;
  sendText: (text: string) => Promise<Message | null>;
  sendImage: (imageUrl: string) => Promise<Message | null>;
  markAsRead: () => Promise<void>;
  markMessageIdsAsReadLocal: (messageIds: string[]) => void;
  refresh: () => Promise<void>;
  addMessage: (message: Message) => void;
}

export function useMessages({
  conversationId,
  userId,
  recipientId,
  autoLoad = true,
}: UseMessagesOptions): UseMessagesReturn {
  const isSeedConversation = conversationId
    ? isSeedConversationId(conversationId)
    : false;
  // Grab global cached messages for instant rendering
  const cachedMessages = useMessageStore((state) => 
    conversationId ? state.messagesByConversation[conversationId] || [] : []
  );
  
  const setMessagesToStore = useMessageStore((state) => state.setMessages);
  const addMessageToStore = useMessageStore((state) => state.addMessage);
  const markAsReadInStore = useMessageStore((state) => state.markAsRead);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // If we don't have a conversation ID yet, we fallback to a local array
  // (though realistically, this should be rare in the actual chat screen)
  const [localFallbackMessages, setLocalFallbackMessages] = useState<Message[]>([]);

  const messages = conversationId && cachedMessages.length > 0 
    ? cachedMessages 
    : localFallbackMessages;

  const getNextDemoMessageSequence = useCallback(() => {
    if (!conversationId) return 1;

    const currentMessages =
      useMessageStore.getState().messagesByConversation[conversationId] || [];

    return (
      currentMessages.filter(
        (message) => message.delivery_method === "demo-local",
      ).length + 1
    );
  }, [conversationId]);

  /**
   * Load messages from database
   */
  const loadMessages = useCallback(async () => {
    if (isSeedConversation && conversationId) {
      setError(null);
      setLoading(false);

      const currentMessages =
        useMessageStore.getState().messagesByConversation[conversationId] || [];
      const localDemoMessages = currentMessages.filter(
        (message) => message.delivery_method === "demo-local",
      );

      setMessagesToStore(conversationId, [
        ...getSeedMessages(
          conversationId,
          userId || DEMO_CURRENT_USER_ID,
          recipientId,
        ),
        ...localDemoMessages,
      ]);

      return;
    }

    if (!userId || (!conversationId && !recipientId)) return;

    // Only show loading if we don't have cached messages
    if (!conversationId || cachedMessages.length === 0) {
      setLoading(true);
    }
    setError(null);

    try {
      const { data, error: fetchError } = conversationId
        ? await getMessagesByConversationId(conversationId, 100)
        : await getMessages(
            userId,
            recipientId,
            100,
          );

      if (fetchError) throw fetchError;

      const newMessages = data || [];

      if (conversationId) {
        setMessagesToStore(conversationId, newMessages);
      } else {
        setLocalFallbackMessages(newMessages);
      }
    } catch (err) {
      console.error("Error loading messages.");
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [
    cachedMessages.length,
    conversationId,
    isSeedConversation,
    recipientId,
    setMessagesToStore,
    userId,
  ]);

  /**
   * Send text message
   */
  const sendText = useCallback(
    async (text: string) => {
      if (!text.trim()) return null;

      try {
        if (isSeedConversation && conversationId) {
          const data = createSeedOutgoingMessage({
            conversationId,
            currentUserId: userId || DEMO_CURRENT_USER_ID,
            recipientId,
            text: text.trim(),
            sequence: getNextDemoMessageSequence(),
          });

          addMessageToStore(conversationId, data);
          return data;
        }

        const { data, error: sendError } = await sendTextMessage(
          userId,
          recipientId,
          text,
          conversationId,
        );

        if (sendError) throw sendError;

        if (data) {
          if (conversationId) {
            addMessageToStore(conversationId, data);
          } else {
            setLocalFallbackMessages((prev) => [...prev, data]);
          }
        }

        return data;
      } catch (err) {
        console.error("Error sending message.");
        setError(err as Error);
        throw err;
      }
    },
    [
      addMessageToStore,
      conversationId,
      getNextDemoMessageSequence,
      isSeedConversation,
      recipientId,
      userId,
    ],
  );

  /**
   * Send image message
   */
  const sendImage = useCallback(
    async (imageUrl: string) => {
      try {
        if (isSeedConversation && conversationId) {
          const data = createSeedOutgoingImageMessage({
            conversationId,
            currentUserId: userId || DEMO_CURRENT_USER_ID,
            recipientId,
            imageUrl,
            sequence: getNextDemoMessageSequence(),
          });

          addMessageToStore(conversationId, data);
          return data;
        }

        if (!conversationId) {
          throw new Error(
            "Photo sharing needs an active matched conversation before sending.",
          );
        }

        const { data, error: sendError } = await sendImageMessage(
          userId,
          recipientId,
          imageUrl,
          conversationId,
        );

        if (sendError) throw sendError;

        if (data) {
          addMessageToStore(conversationId, data);
        }

        return data;
      } catch (err) {
        console.error("Error sending image.");
        setError(err as Error);
        throw err;
      }
    },
    [
      addMessageToStore,
      conversationId,
      getNextDemoMessageSequence,
      isSeedConversation,
      recipientId,
      userId,
    ],
  );

  /**
   * Mark conversation as read
   */
  const markAsRead = useCallback(async () => {
    if (!conversationId) return;

    if (isSeedConversation) {
      markAsReadInStore(conversationId, userId || DEMO_CURRENT_USER_ID);
      return;
    }

    try {
      await markConversationAsRead(conversationId, userId);

      // Update local store state
      markAsReadInStore(conversationId, userId);
    } catch {
      console.error("Error marking as read.");
    }
  }, [conversationId, isSeedConversation, markAsReadInStore, userId]);

  /**
   * Apply read-receipt updates received over realtime.
   */
  const markMessageIdsAsReadLocal = useCallback((messageIds: string[]) => {
    if (messageIds.length === 0) return;

    const applyReadStatus = (items: Message[]) =>
      items.map((msg) =>
        messageIds.includes(msg.id)
          ? {
              ...msg,
              status: "read" as const,
              read_at: msg.read_at || new Date().toISOString(),
            }
          : msg,
      );

    if (conversationId) {
      const currentMessages =
        useMessageStore.getState().messagesByConversation[conversationId] || [];
      setMessagesToStore(conversationId, applyReadStatus(currentMessages));
      return;
    }

    setLocalFallbackMessages((prev) => applyReadStatus(prev));
  }, [conversationId, setMessagesToStore]);

  /**
   * Add message to local state (from realtime)
   */
  const addMessage = useCallback((message: Message) => {
    if (conversationId) {
      addMessageToStore(conversationId, message);
    } else {
      setLocalFallbackMessages((prev) => {
        if (prev.some((msg) => msg.id === message.id)) {
          return prev.map((msg) => (msg.id === message.id ? message : msg));
        }
        return [...prev, message];
      });
    }
  }, [conversationId, addMessageToStore]);

  /**
   * Refresh messages
   */
  const refresh = useCallback(async () => {
    await loadMessages();
  }, [loadMessages]);

  /**
   * Auto-load messages on mount
   */
  useEffect(() => {
    if (autoLoad) {
      loadMessages();
    }
  }, [autoLoad, loadMessages]);

  return {
    messages,
    loading,
    error,
    sendText,
    sendImage,
    markAsRead,
    markMessageIdsAsReadLocal,
    refresh,
    addMessage,
  };
}
