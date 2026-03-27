/**
 * useChatRealtime Hook
 *
 * Subscribes to realtime updates for a conversation.
 * Handles new messages, typing indicators, read receipts.
 *
 * @module features/messaging/hooks/useChatRealtime
 */

import { useCallback, useEffect } from "react";
import { realtimeApi } from "../api/realtime.api";
import type { Message } from "../types/messaging.types";

interface UseChatRealtimeOptions {
  conversationId?: string;
  userId: string;
  recipientId: string;
  onNewMessage?: (message: Message) => void;
  onTyping?: (isTyping: boolean) => void;
  onReadReceipt?: (messageIds: string[]) => void;
}

export function useChatRealtime({
  conversationId,
  userId,
  recipientId,
  onNewMessage,
  onTyping,
  onReadReceipt,
}: UseChatRealtimeOptions): {
  sendTyping: (isTyping: boolean) => Promise<void>;
  sendReadReceipt: (messageIds: string[]) => Promise<void>;
} {
  /**
   * Subscribe to new messages
   */
  useEffect(() => {
    if (!conversationId || !userId || !onNewMessage) return;

    console.log("🔴 Subscribing to messages for conversation:", conversationId);

    const unsubscribe = realtimeApi.subscribeToMessages(
      conversationId,
      userId,
      onNewMessage,
    );

    return () => {
      console.log("🔴 Unsubscribing from messages");
      unsubscribe();
    };
  }, [conversationId, userId, onNewMessage]);

  /**
   * Subscribe to typing indicators
   */
  useEffect(() => {
    if (!conversationId || !onTyping) return;

    console.log("⌨️ Subscribing to typing indicators");

    const unsubscribe = realtimeApi.subscribeToTyping(
      conversationId,
      (typingUserId, isTyping) => {
        // Only notify if it's the other user typing
        if (typingUserId === recipientId) {
          onTyping(isTyping);
        }
      },
    );

    return () => {
      console.log("⌨️ Unsubscribing from typing");
      unsubscribe();
    };
  }, [conversationId, recipientId, onTyping]);

  /**
   * Subscribe to read receipts
   */
  useEffect(() => {
    if (!conversationId || !onReadReceipt) return;

    console.log("✅ Subscribing to read receipts");

    const unsubscribe = realtimeApi.subscribeToReadReceipts(
      conversationId,
      onReadReceipt,
    );

    return () => {
      console.log("✅ Unsubscribing from read receipts");
      unsubscribe();
    };
  }, [conversationId, onReadReceipt]);

  /**
   * Send typing indicator
   */
  const sendTyping = useCallback(
    async (isTyping: boolean) => {
      if (!conversationId) return;

      try {
        await realtimeApi.broadcastTyping(conversationId, userId, isTyping);
      } catch (err) {
        console.error("❌ Error broadcasting typing:", err);
      }
    },
    [conversationId, userId],
  );

  /**
   * Send read receipt
   */
  const sendReadReceipt = useCallback(
    async (messageIds: string[]) => {
      if (!conversationId || messageIds.length === 0) return;

      try {
        await realtimeApi.broadcastReadReceipt(conversationId, messageIds);
      } catch (err) {
        console.error("❌ Error broadcasting read receipt:", err);
      }
    },
    [conversationId],
  );

  return {
    sendTyping,
    sendReadReceipt,
  };
}
