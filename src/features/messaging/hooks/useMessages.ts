/**
 * useMessages Hook
 *
 * Manages message state for a conversation.
 * Uses TanStack Query v5 for server-state caching (loading) and
 * useMutation for writes (sendText, sendImage, markAsRead).
 *
 * @module features/messaging/hooks/useMessages
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getMessages,
  markConversationAsRead,
  sendImageMessage,
  sendTextMessage,
} from "../api/messagesApi";
import type { Message } from "../types/messaging.types";

// ─── Query Key Factory ────────────────────────────────────────────────────────

export const messageKeys = {
  all: ["messages"] as const,
  byChat: (userId: string, recipientId: string) =>
    ["messages", userId, recipientId] as const,
};

// ─── Hook Types ───────────────────────────────────────────────────────────────

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
  sendText: (text: string) => Promise<void>;
  sendImage: (imageUrl: string) => Promise<void>;
  markAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
  addMessage: (message: Message) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMessages({
  conversationId,
  userId,
  recipientId,
  autoLoad = true,
}: UseMessagesOptions): UseMessagesReturn {
  const queryClient = useQueryClient();
  const queryKey = messageKeys.byChat(userId, recipientId);

  // ── READ — fetch message list from Supabase ──────────────────────────────

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<Message[]> => {
      const { data, error: fetchError } = await getMessages(
        userId,
        recipientId,
        100,
      );

      if (fetchError) throw fetchError;

      return data ?? [];
    },
    enabled: autoLoad && Boolean(userId) && Boolean(recipientId),
    staleTime: 10_000, // 10 s — messages refresh via realtime; this is a fallback
  });

  // ── WRITE — send text message ────────────────────────────────────────────

  const sendTextMutation = useMutation({
    mutationFn: async (text: string): Promise<Message> => {
      const { data, error: sendError } = await sendTextMessage(
        userId,
        recipientId,
        text,
        conversationId,
      );

      if (sendError) throw sendError;
      if (!data) throw new Error("No message returned from sendTextMessage");

      return data;
    },
    onSuccess: (newMessage) => {
      // Optimistically append the new message to the cached list
      queryClient.setQueryData<Message[]>(queryKey, (prev = []) => [
        ...prev,
        newMessage,
      ]);
    },
  });

  // ── WRITE — send image message ───────────────────────────────────────────

  const sendImageMutation = useMutation({
    mutationFn: async (imageUrl: string): Promise<Message> => {
      const { data, error: sendError } = await sendImageMessage(
        userId,
        recipientId,
        imageUrl,
        conversationId,
      );

      if (sendError) throw sendError;
      if (!data) throw new Error("No message returned from sendImageMessage");

      return data;
    },
    onSuccess: (newMessage) => {
      queryClient.setQueryData<Message[]>(queryKey, (prev = []) => [
        ...prev,
        newMessage,
      ]);
    },
  });

  // ── WRITE — mark conversation as read ───────────────────────────────────

  const markAsReadMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!conversationId) return;
      await markConversationAsRead(conversationId, userId);
    },
    onSuccess: () => {
      // Update read-status on cached messages without a full refetch
      queryClient.setQueryData<Message[]>(queryKey, (prev = []) =>
        prev.map((msg) =>
          msg.recipient_id === userId && msg.status !== "read"
            ? { ...msg, status: "read", read_at: new Date().toISOString() }
            : msg,
        ),
      );
    },
  });

  // ── REALTIME helper — append / update a single message in the cache ──────
  // Called by useChatRealtime when a new message arrives over the subscription.

  const addMessage = (message: Message): void => {
    queryClient.setQueryData<Message[]>(queryKey, (prev = []) => {
      const exists = prev.some((msg) => msg.id === message.id);
      if (exists) {
        return prev.map((msg) => (msg.id === message.id ? message : msg));
      }
      return [...prev, message];
    });
  };

  // ── Refresh — force refetch ──────────────────────────────────────────────

  const refresh = async (): Promise<void> => {
    await query.refetch();
  };

  // ── Public interface wrappers ────────────────────────────────────────────

  const sendText = async (text: string): Promise<void> => {
    if (!text.trim()) return;
    await sendTextMutation.mutateAsync(text);
  };

  const sendImage = async (imageUrl: string): Promise<void> => {
    await sendImageMutation.mutateAsync(imageUrl);
  };

  const markAsRead = async (): Promise<void> => {
    await markAsReadMutation.mutateAsync();
  };

  return {
    messages: query.data ?? [],
    loading: query.isLoading,
    error: query.error as Error | null,
    sendText,
    sendImage,
    markAsRead,
    refresh,
    addMessage,
  };
}
