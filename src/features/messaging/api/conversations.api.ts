/**
 * Conversations API
 *
 * API layer for fetching conversation lists with participant details
 *
 * @module features/messaging/api/conversations
 */

import { supabase } from "@/src/config/supabase";
import type { ConversationWithUser } from "../types/messaging.types";

const CONVERSATIONS_FETCH_ERROR =
  "Conversations could not be loaded. Check your connection and try again.";
const CONVERSATION_FETCH_ERROR =
  "Conversation could not be loaded. Check your connection and try again.";
const CONVERSATION_SIGN_IN_ERROR =
  "Please sign in before opening conversations.";

type ConversationRpcRow = {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  last_message_id?: string;
  last_message_text?: string;
  last_message_sender_id?: string;
  last_message_at?: string;
  participant_1_unread_count?: number;
  participant_2_unread_count?: number;
  created_at: string;
  updated_at: string;
  other_user_id: string;
  other_user_first_name?: string;
  other_user_photos?: string[];
  other_user_is_active?: boolean;
  other_user_last_active_at?: string;
  unread_count?: number;
};

/**
 * Get all conversations for a user with participant details and last message
 */
export async function getConversationsForUser(
  userId: string,
): Promise<{ data: ConversationWithUser[] | null; error: Error | null }> {
  try {
    const { data: conversations, error: convError } = await supabase.rpc(
      "get_user_conversations",
      { p_user_id: userId },
    );

    if (convError) throw convError;
    if (!conversations) return { data: [], error: null };

    const conversationsWithUsers: ConversationWithUser[] = (
      conversations as ConversationRpcRow[]
    ).map((conv) => {
      return {
        id: conv.id,
        participant_1_id: conv.participant_1_id,
        participant_2_id: conv.participant_2_id,
        last_message_id: conv.last_message_id,
        last_message_text: conv.last_message_text,
        last_message_sender_id: conv.last_message_sender_id,
        last_message_at: conv.last_message_at,
        participant_1_unread_count: conv.participant_1_unread_count || 0,
        participant_2_unread_count: conv.participant_2_unread_count || 0,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        other_user: {
          id: conv.other_user_id,
          first_name: conv.other_user_first_name || "Unknown User",
          photos: conv.other_user_photos || [],
          is_active: conv.other_user_is_active || false,
          last_active_at: conv.other_user_last_active_at,
        },
        unread_count: conv.unread_count || 0,
      };
    });

    return { data: conversationsWithUsers, error: null };
  } catch {
    console.error("Failed to fetch conversations.");
    return {
      data: null,
      error: new Error(CONVERSATIONS_FETCH_ERROR),
    };
  }
}

/**
 * Get a single conversation by ID
 */
export async function getConversationById(
  conversationId: string,
): Promise<{ data: ConversationWithUser | null; error: Error | null }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error(CONVERSATION_SIGN_IN_ERROR);

    const { data, error } = await getConversationsForUser(user.id);

    if (error) throw error;

    return {
      data:
        data?.find((conversation) => conversation.id === conversationId) ||
        null,
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch conversation.");
    return {
      data: null,
      error:
        error instanceof Error &&
        error.message === CONVERSATION_SIGN_IN_ERROR
          ? error
          : new Error(CONVERSATION_FETCH_ERROR),
    };
  }
}
