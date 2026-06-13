// src/features/messaging/api/messagesApi.ts
import { supabase } from "@/src/config/supabase";

const LEGACY_CONVERSATIONS_ERROR =
  "Conversations could not be loaded. Check your connection and try again.";
const LEGACY_READ_STATUS_ERROR =
  "Message read status did not update. Check your connection and try again.";

export interface Conversation {
  id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_image: string | null;
  latest_message: string;
  latest_message_time: string;
  unread_count: number;
  is_online: boolean;
}

type ConversationRpcRow = {
  id: string;
  last_message_text?: string | null;
  last_message_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  other_user_id: string;
  other_user_first_name?: string | null;
  other_user_photos?: string[] | null;
  other_user_is_active?: boolean | null;
  unread_count?: number | null;
};

/**
 * Get all conversations for the current user
 * Returns a list of conversations with the latest message
 */
export const getConversations = async (
  userId: string
): Promise<{ data: Conversation[] | null; error: any }> => {
  try {
    const { data, error } = await supabase.rpc("get_user_conversations", {
      p_user_id: userId,
    });

    if (error) {
      return { data: null, error: new Error(LEGACY_CONVERSATIONS_ERROR) };
    }

    if (!data || data.length === 0) {
      return { data: [], error: null };
    }

    const conversationsList: Conversation[] = (data as ConversationRpcRow[]).map(
      (conversation) => ({
        id: conversation.id,
        other_user_id: conversation.other_user_id,
        other_user_name: conversation.other_user_first_name || "User",
        other_user_image: conversation.other_user_photos?.[0] || null,
        latest_message: conversation.last_message_text || "",
        latest_message_time:
          conversation.last_message_at ||
          conversation.updated_at ||
          conversation.created_at ||
          "",
        unread_count: conversation.unread_count || 0,
        is_online: Boolean(conversation.other_user_is_active),
      }),
    );

    // Sort by latest message time
    conversationsList.sort(
      (a, b) =>
        new Date(b.latest_message_time).getTime() -
        new Date(a.latest_message_time).getTime()
    );

    return { data: conversationsList, error: null };
  } catch {
    console.error("Error fetching conversations.");
    return { data: null, error: new Error(LEGACY_CONVERSATIONS_ERROR) };
  }
};

/**
 * Mark all messages in a conversation as read
 */
export const markConversationAsRead = async (
  userId: string,
  otherUserId: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    void userId;

    const { error } = await supabase.rpc("mark_pair_messages_read", {
      p_other_user_id: otherUserId,
    });

    if (error) {
      return { success: false, error: new Error(LEGACY_READ_STATUS_ERROR) };
    }

    return { success: true };
  } catch {
    console.error("Error marking conversation as read.");
    return { success: false, error: new Error(LEGACY_READ_STATUS_ERROR) };
  }
};
