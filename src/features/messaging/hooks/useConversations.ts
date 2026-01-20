/**
 * useConversations Hook
 *
 * React hook for managing conversation list state and operations
 *
 * @module features/messaging/hooks/useConversations
 */

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
  refresh: () => Promise<void>;
}

export function useConversations({
  userId,
  autoLoad = true,
}: UseConversationsProps): UseConversationsReturn {
  const [conversations, setConversations] = useState<ConversationWithUser[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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
      setConversations(data || []);
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
    refresh,
  };
}
