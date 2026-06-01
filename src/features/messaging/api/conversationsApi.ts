/**
 * Conversations API
 *
 * API layer for fetching conversation lists with participant details
 *
 * @module features/messaging/api/conversations
 */

import { supabase } from "@/src/config/supabase";
import type { ConversationWithUser } from "../types/messaging.types";

/**
 * Get the currently authenticated user's ID.
 * Used by screens (via hook) to resolve the current user without importing
 * supabase directly — keeps supabase confined to the api/ layer (rule A3).
 */
export async function getCurrentUserId(): Promise<{
  userId: string | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { userId: data.user?.id ?? null, error: null };
  } catch (error) {
    if (__DEV__) {
      console.log("[conversationsApi] getCurrentUserId error:", error);
    }
    return {
      userId: null,
      error:
        error instanceof Error ? error : new Error("Failed to get current user"),
    };
  }
}

/**
 * Get all conversations for a user with participant details and last message
 */
export async function getConversationsForUser(
  userId: string,
): Promise<{ data: ConversationWithUser[] | null; error: Error | null }> {
  try {
    // Fetch conversations where user is a participant
    const { data: conversations, error: convError } = await supabase
      .from("conversations")
      .select(
        `
        *,
        participant_1:profiles!conversations_participant_1_id_fkey(*),
        participant_2:profiles!conversations_participant_2_id_fkey(*)
      `,
      )
      .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
      .order("updated_at", { ascending: false });

    if (convError) throw convError;
    if (!conversations) return { data: [], error: null };

    // Transform data to include the OTHER user's details
    const conversationsWithUsers: ConversationWithUser[] = conversations.map(
      (conv) => {
        const isParticipant1 = conv.participant_1_id === userId;
        const otherUser = isParticipant1
          ? conv.participant_2
          : conv.participant_1;

        return {
          ...conv,
          other_user: {
            id: otherUser.id,
            first_name: otherUser.first_name || "Unknown User",
            photos: otherUser.photos || [],
            is_active: otherUser.is_active || false,
            last_active_at: otherUser.last_active_at,
          },
          unread_count: isParticipant1
            ? conv.participant_1_unread_count || 0
            : conv.participant_2_unread_count || 0,
        };
      },
    );

    console.log(
      `✅ Fetched ${conversationsWithUsers.length} conversations for user ${userId}`,
    );
    return { data: conversationsWithUsers, error: null };
  } catch (error) {
    console.error("❌ Error fetching conversations:", error);
    return {
      data: null,
      error:
        error instanceof Error
          ? error
          : new Error("Failed to fetch conversations"),
    };
  }
}

/**
 * Get a single conversation by ID
 */
export async function getConversationById(
  conversationId: string,
): Promise<{ data: any | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select(
        `
        *,
        participant_1:profiles!conversations_participant_1_id_fkey(*),
        participant_2:profiles!conversations_participant_2_id_fkey(*)
      `,
      )
      .eq("id", conversationId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("❌ Error fetching conversation:", error);
    return {
      data: null,
      error:
        error instanceof Error
          ? error
          : new Error("Failed to fetch conversation"),
    };
  }
}
