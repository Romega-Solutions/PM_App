/**
 * useChatRealtime Hook
 *
 * Subscribes to realtime updates for a conversation.
 * Handles new messages, typing indicators, read receipts.
 *
 * TanStack Query integration:
 *   When a new message arrives over the Supabase Realtime subscription, the
 *   hook upserts it directly into the ["messages", userId, recipientId] cache
 *   (no refetch — the payload IS the new message). The onNewMessage callback
 *   is still invoked so the screen can scroll to the bottom.
 *
 * @module features/messaging/hooks/useChatRealtime
 */

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { messageKeys } from "./useMessages";
import { realtimeApi } from "../api/realtimeApi";
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
  const queryClient = useQueryClient();

  /**
   * Subscribe to new messages.
   * On arrival: upsert the message into the Query cache (no refetch), then
   * call onNewMessage so the screen can scroll to the bottom.
   */
  useEffect(() => {
    if (!conversationId || !userId) return;

    if (__DEV__) {
      console.log(
        "[useChatRealtime] Subscribing to messages for conversation:",
        conversationId,
      );
    }

    const unsubscribe = realtimeApi.subscribeToMessages(
      conversationId,
      userId,
      (message) => {
        // 1. Upsert the realtime message straight into the Query cache — no
        //    refetch (avoids a full re-fetch on every incoming message).
        queryClient.setQueryData<Message[]>(
          messageKeys.byChat(userId, recipientId),
          (prev = []) =>
            prev.some((m) => m.id === message.id)
              ? prev.map((m) => (m.id === message.id ? message : m))
              : [...prev, message],
        );

        // 2. Notify the screen (e.g. scroll to bottom) — UI side-effect only.
        onNewMessage?.(message);
      },
    );

    return () => {
      if (__DEV__) {
        console.log("[useChatRealtime] Unsubscribing from messages");
      }
      unsubscribe();
    };
  }, [conversationId, userId, recipientId, onNewMessage, queryClient]);

  /**
   * Subscribe to typing indicators.
   */
  useEffect(() => {
    if (!conversationId || !onTyping) return;

    if (__DEV__) {
      console.log("[useChatRealtime] Subscribing to typing indicators");
    }

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
      if (__DEV__) {
        console.log("[useChatRealtime] Unsubscribing from typing");
      }
      unsubscribe();
    };
  }, [conversationId, recipientId, onTyping]);

  /**
   * Subscribe to read receipts.
   */
  useEffect(() => {
    if (!conversationId || !onReadReceipt) return;

    if (__DEV__) {
      console.log("[useChatRealtime] Subscribing to read receipts");
    }

    const unsubscribe = realtimeApi.subscribeToReadReceipts(
      conversationId,
      onReadReceipt,
    );

    return () => {
      if (__DEV__) {
        console.log("[useChatRealtime] Unsubscribing from read receipts");
      }
      unsubscribe();
    };
  }, [conversationId, onReadReceipt]);

  /**
   * Send typing indicator to other participants.
   */
  const sendTyping = useCallback(
    async (isTyping: boolean) => {
      if (!conversationId) return;

      try {
        await realtimeApi.broadcastTyping(conversationId, userId, isTyping);
      } catch (err) {
        if (__DEV__) {
          console.error("[useChatRealtime] Error broadcasting typing:", err);
        }
      }
    },
    [conversationId, userId],
  );

  /**
   * Send read receipt to other participants.
   */
  const sendReadReceipt = useCallback(
    async (messageIds: string[]) => {
      if (!conversationId || messageIds.length === 0) return;

      try {
        await realtimeApi.broadcastReadReceipt(conversationId, messageIds);
      } catch (err) {
        if (__DEV__) {
          console.error(
            "[useChatRealtime] Error broadcasting read receipt:",
            err,
          );
        }
      }
    },
    [conversationId],
  );

  return {
    sendTyping,
    sendReadReceipt,
  };
}
