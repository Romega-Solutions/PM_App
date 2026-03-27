// src/features/messaging/api/messagesApi.ts
import { supabase } from "@/src/config/supabase";

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

/**
 * Get all conversations for the current user
 * Returns a list of conversations with the latest message
 */
export const getConversations = async (
  userId: string
): Promise<{ data: Conversation[] | null; error: any }> => {
  try {
    // Get all messages where user is either sender or receiver
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select(
        `
        *,
        sender:sender_id(id, first_name, photos, is_active),
        recipient:recipient_id(id, first_name, photos, is_active)
      `
      )
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (messagesError) {
      return { data: null, error: messagesError };
    }

    if (!messages || messages.length === 0) {
      return { data: [], error: null };
    }

    // Group messages by conversation (other user)
    const conversationsMap = new Map<string, any>();

    messages.forEach((message: any) => {
      // Determine the other user in the conversation
      const isCurrentUserSender = message.sender_id === userId;
      const otherUser = isCurrentUserSender
        ? message.recipient
        : message.sender;
      const otherUserId = isCurrentUserSender
        ? message.recipient_id
        : message.sender_id;

      // If this conversation doesn't exist yet, or this message is newer
      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          message,
          otherUser,
          otherUserId,
        });
      }
    });

    // Get unread counts for each conversation
    const conversationsList: Conversation[] = [];

    for (const [otherUserId, convData] of conversationsMap.entries()) {
      // Count unread messages from this user
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("sender_id", otherUserId)
        .eq("recipient_id", userId)
        .eq("is_read", false);

      conversationsList.push({
        id: convData.message.conversation_id || otherUserId,
        other_user_id: otherUserId,
        other_user_name: convData.otherUser?.first_name || "User",
        other_user_image: convData.otherUser?.photos?.[0] || null,
        latest_message: convData.message.text || convData.message.content || "",
        latest_message_time: convData.message.created_at,
        unread_count: count || 0,
        is_online: convData.otherUser?.is_active || false,
      });
    }

    // Sort by latest message time
    conversationsList.sort(
      (a, b) =>
        new Date(b.latest_message_time).getTime() -
        new Date(a.latest_message_time).getTime()
    );

    return { data: conversationsList, error: null };
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return { data: null, error };
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
    const { error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("sender_id", otherUserId)
      .eq("recipient_id", userId)
      .eq("is_read", false);

    if (error) {
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error("Error marking conversation as read:", error);
    return { success: false, error };
  }
};
