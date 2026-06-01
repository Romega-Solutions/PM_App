/**
 * useConversations Hook
 *
 * React hook for managing conversation list state and operations.
 * Uses TanStack Query v5 for server-state caching.
 * Integrates with Zustand chatStore for global unread-count state.
 *
 * REFACTORING RULES FOLLOWED:
 * - Feature-First: Lives in features/messaging/hooks
 * - Single Responsibility: Only manages conversation list
 * - Zustand Integration: Updates global chatStore (client state)
 * - TanStack Query: Owns server state (conversations from Supabase)
 * - Security: Uses validated API calls
 *
 * @module features/messaging/hooks/useConversations
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { ActiveConversation } from "@/src/stores/chatStore";
import { useChatStore } from "@/src/stores/chatStore";
import { getConversationsForUser } from "../api/conversationsApi";
import type { ConversationWithUser } from "../types/messaging.types";

// ─── Query Key Factory ────────────────────────────────────────────────────────

export const conversationKeys = {
  all: ["conversations"] as const,
  byUser: (userId: string) => ["conversations", userId] as const,
};

// ─── Hook Types ───────────────────────────────────────────────────────────────

interface UseConversationsProps {
  userId: string;
  autoLoad?: boolean;
}

interface UseConversationsReturn {
  conversations: ConversationWithUser[];
  loading: boolean;
  error: Error | null;
  totalUnread: number;
  refresh: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useConversations({
  userId,
  autoLoad = true,
}: UseConversationsProps): UseConversationsReturn {
  const queryClient = useQueryClient();

  // Global client state from Zustand (unread counts)
  const { setActiveConversations, totalUnreadCount } = useChatStore();

  const query = useQuery({
    queryKey: conversationKeys.byUser(userId),
    queryFn: async (): Promise<ConversationWithUser[]> => {
      if (__DEV__) {
        console.log(
          `[useConversations] Loading conversations for user ${userId}`,
        );
      }

      const { data, error: fetchError } = await getConversationsForUser(userId);

      if (fetchError) throw fetchError;

      const conversations = data ?? [];

      if (__DEV__) {
        console.log(
          `[useConversations] Loaded ${conversations.length} conversations`,
        );
      }

      return conversations;
    },
    enabled: autoLoad && Boolean(userId),
    staleTime: 30_000, // 30 s — conversations don't change every render
  });

  // Sync fetched conversations into Zustand chatStore for global unread counts.
  // This is a deliberate side-effect: TanStack Query owns the server data;
  // Zustand owns the derived client-side active-conversation list.
  useEffect(() => {
    const conversations = query.data;
    if (!conversations || conversations.length === 0) return;

    const activeConvs: ActiveConversation[] = conversations.map((conv) => ({
      id: conv.id,
      recipientId: conv.other_user.id,
      recipientName: conv.other_user.first_name,
      recipientPhoto: conv.other_user.photos?.[0] || "",
      lastMessage: conv.last_message_text || "No messages yet",
      lastMessageTime: conv.last_message_at || conv.updated_at || "",
      unreadCount: conv.unread_count || 0,
      isOnline: conv.other_user.is_active || false,
    }));

    setActiveConversations(activeConvs);
  }, [query.data, setActiveConversations]);

  const refresh = async (): Promise<void> => {
    await queryClient.invalidateQueries({
      queryKey: conversationKeys.byUser(userId),
    });
  };

  return {
    conversations: query.data ?? [],
    loading: query.isLoading,
    error: query.error as Error | null,
    totalUnread: totalUnreadCount, // From global Zustand store
    refresh,
  };
}
