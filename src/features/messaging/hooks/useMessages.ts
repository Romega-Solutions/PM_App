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
    getMessages,
    getMessagesByConversationId,
    markConversationAsRead,
    sendImageMessage,
    sendTextMessage,
} from "../api/messages.api";
import type { Message } from "../types/messaging.types";

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Load messages from database
   */
  const loadMessages = useCallback(async () => {
    if (!userId || (!conversationId && !recipientId)) return;

    setLoading(true);
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

      setMessages(data || []);
    } catch (err) {
      console.error("Error loading messages.");
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId, recipientId, conversationId]);

  /**
   * Send text message
   */
  const sendText = useCallback(
    async (text: string) => {
      if (!text.trim()) return null;

      try {
        const { data, error: sendError } = await sendTextMessage(
          userId,
          recipientId,
          text,
          conversationId,
        );

        if (sendError) throw sendError;

        if (data) {
          setMessages((prev) => [...prev, data]);
        }

        return data;
      } catch (err) {
        console.error("Error sending message.");
        setError(err as Error);
        throw err;
      }
    },
    [userId, recipientId, conversationId],
  );

  /**
   * Send image message
   */
  const sendImage = useCallback(
    async (imageUrl: string) => {
      try {
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
          setMessages((prev) => [...prev, data]);
        }

        return data;
      } catch (err) {
        console.error("Error sending image.");
        setError(err as Error);
        throw err;
      }
    },
    [userId, recipientId, conversationId],
  );

  /**
   * Mark conversation as read
   */
  const markAsRead = useCallback(async () => {
    if (!conversationId) return;

    try {
      await markConversationAsRead(conversationId, userId);

      // Update local state
      setMessages((prev) =>
        prev.map((msg) =>
          msg.recipient_id === userId && msg.status !== "read"
            ? { ...msg, status: "read", read_at: new Date().toISOString() }
            : msg,
        ),
      );
    } catch {
      console.error("Error marking as read.");
    }
  }, [conversationId, userId]);

  /**
   * Apply read-receipt updates received over realtime.
   */
  const markMessageIdsAsReadLocal = useCallback((messageIds: string[]) => {
    if (messageIds.length === 0) return;

    setMessages((prev) =>
      prev.map((msg) =>
        messageIds.includes(msg.id)
          ? {
              ...msg,
              status: "read",
              read_at: msg.read_at || new Date().toISOString(),
            }
          : msg,
      ),
    );
  }, []);

  /**
   * Add message to local state (from realtime)
   */
  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      // Check if message already exists
      if (prev.some((msg) => msg.id === message.id)) {
        // Update existing message
        return prev.map((msg) => (msg.id === message.id ? message : msg));
      }
      // Add new message
      return [...prev, message];
    });
  }, []);

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
