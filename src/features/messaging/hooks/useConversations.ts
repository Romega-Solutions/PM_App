/**
 * useConversations Hook
 *
 * React hook for managing conversation list state and operations
 * Integrates with Zustand chatStore for global state management
 *
 * REFACTORING RULES FOLLOWED:
 * - Feature-First: Lives in features/messaging/hooks
 * - Single Responsibility: Only manages conversation list
 * - Zustand Integration: Updates global chatStore
 * - Security: Uses validated API calls
 *
 * @module features/messaging/hooks/useConversations
 */

import type { ActiveConversation } from "@/src/stores/chatStore";
import { useChatStore } from "@/src/stores/chatStore";
import { useCallback, useEffect, useState } from "react";
import { getConversationsForUser } from "../api/conversations.api";
import type { ConversationWithUser } from "../types/messaging.types";

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

export function useConversations({
  userId,
  autoLoad = true,
}: UseConversationsProps): UseConversationsReturn {
  // Local state for loading/error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Global state from Zustand
  const { activeConversations, setActiveConversations, totalUnreadCount } =
    useChatStore();

  // Use local state for conversations (feature-specific)
  const [conversations, setConversations] = useState<ConversationWithUser[]>(
    [],
  );

  const loadConversations = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      console.log(
        `🔄 useConversations: Loading conversations for user ${userId}`,
      );
      const { data, error: fetchError } = await getConversationsForUser(userId);

      if (fetchError) throw fetchError;

      console.log(
        `✅ useConversations: Loaded ${data?.length || 0} conversations`,
      );
      if (data && data.length > 0) {
        console.log(`📋 First conversation:`, JSON.stringify(data[0], null, 2));
      }

      // Update local state
      setConversations(data || []);

      // Sync with global chatStore for unread counts
      if (data) {
        const activeConvs: ActiveConversation[] = data.map((conv) => ({
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
      }
    } catch (err) {
      console.error("❌ Error loading conversations:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to load conversations"),
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const refresh = useCallback(async () => {
    await loadConversations();
  }, [loadConversations]);

  // Auto-load on mount if enabled
  useEffect(() => {
    if (autoLoad && userId) {
      loadConversations();
    }
  }, [autoLoad, userId, loadConversations]);

  return {
    conversations,
    loading,
    error,
    totalUnread: totalUnreadCount, // From global store
    refresh,
  };
}
