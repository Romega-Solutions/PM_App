/**
 * Messages API
 *
 * Pure API layer for all message-related database operations.
 * No UI logic, no state management - just data operations.
 *
 * @module features/messaging/api/messages
 */

import { supabase } from "@/src/config/supabase";
import type {
    Message,
    MessageStatus
} from "../types/messaging.types";

/**
 * Send a text message
 * Creates a new message in the database
 */
export async function sendTextMessage(
  senderId: string,
  recipientId: string,
  content: string,
  conversationId?: string,
): Promise<{ data: Message | null; error: Error | null }> {
  try {
    // Get or create conversation if not provided
    let convId = conversationId;
    if (!convId) {
      const { data: convData, error: convError } = await supabase.rpc(
        "get_or_create_conversation",
        {
          p_user1_id: senderId,
          p_user2_id: recipientId,
        },
      );

      if (convError) throw convError;
      convId = convData;
    }

    // Insert message
    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: convId,
        sender_id: senderId,
        recipient_id: recipientId,
        text: content, // Using 'text' column (your DB schema)
        type: "text", // Using 'type' column (your DB schema)
        status: "sent",
        is_deleted: false,
      })
      .select()
      .single();

    if (error) throw error;

    return { data: data as Message, error: null };
  } catch (error) {
    console.error("❌ Error sending text message:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * Send an image message
 * Creates a message with image URL
 */
export async function sendImageMessage(
  senderId: string,
  recipientId: string,
  imageUrl: string,
  conversationId?: string,
): Promise<{ data: Message | null; error: Error | null }> {
  try {
    // Get or create conversation if not provided
    let convId = conversationId;
    if (!convId) {
      const { data: convData, error: convError } = await supabase.rpc(
        "get_or_create_conversation",
        {
          p_user1_id: senderId,
          p_user2_id: recipientId,
        },
      );

      if (convError) throw convError;
      convId = convData;
    }

    // Insert message
    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: convId,
        sender_id: senderId,
        recipient_id: recipientId,
        text: "", // Empty text for image messages
        type: "image", // Using 'type' column (your DB schema)
        image_url: imageUrl,
        status: "sent",
        is_deleted: false,
      })
      .select()
      .single();

    if (error) throw error;

    return { data: data as Message, error: null };
  } catch (error) {
    console.error("❌ Error sending image message:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * Get all messages for a conversation
 * Ordered by creation time (oldest first)
 */
export async function getMessages(
  userId: string,
  recipientId: string,
  limit: number = 100,
): Promise<{ data: Message[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${userId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${userId})`,
      )
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) throw error;

    return { data: data as Message[], error: null };
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * Get messages by conversation ID
 * More efficient when you already have the conversation ID
 */
export async function getMessagesByConversationId(
  conversationId: string,
  limit: number = 100,
): Promise<{ data: Message[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) throw error;

    return { data: data as Message[], error: null };
  } catch (error) {
    console.error("❌ Error fetching messages by conversation:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * Mark messages as read
 * Updates status to 'read' for specified message IDs
 */
export async function markMessagesAsRead(
  messageIds: string[],
  userId: string,
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from("messages")
      .update({ status: "read" })
      .in("id", messageIds)
      .eq("recipient_id", userId); // Only recipient can mark as read

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error("❌ Error marking messages as read:", error);
    return { success: false, error: error as Error };
  }
}

/**
 * Mark all messages in a conversation as read
 * Efficient way to mark entire conversation as read
 */
export async function markConversationAsRead(
  conversationId: string,
  userId: string,
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // Update message status
    const { error: messagesError } = await supabase
      .from("messages")
      .update({ status: "read" })
      .eq("conversation_id", conversationId)
      .eq("recipient_id", userId)
      .neq("status", "read"); // Only update unread messages

    if (messagesError) throw messagesError;

    // Reset unread count
    const { error: unreadError } = await supabase.rpc("reset_unread_count", {
      p_conversation_id: conversationId,
      p_user_id: userId,
    });

    if (unreadError) throw unreadError;

    return { success: true, error: null };
  } catch (error) {
    console.error("❌ Error marking conversation as read:", error);
    return { success: false, error: error as Error };
  }
}

/**
 * Update message status
 * For delivery confirmations, read receipts, etc.
 */
export async function updateMessageStatus(
  messageId: string,
  status: MessageStatus,
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from("messages")
      .update({ status })
      .eq("id", messageId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error("❌ Error updating message status:", error);
    return { success: false, error: error as Error };
  }
}

/**
 * Soft delete a message
 * Marks message as deleted for the current user
 */
export async function deleteMessage(
  messageId: string,
  userId: string,
  deleteForEveryone: boolean = false,
): Promise<{ success: boolean; error: Error | null }> {
  try {
    if (deleteForEveryone) {
      // Delete for everyone (only sender can do this)
      const { error } = await supabase
        .from("messages")
        .update({ is_deleted: true })
        .eq("id", messageId)
        .eq("sender_id", userId);

      if (error) throw error;
    } else {
      // Delete for me only - add to deleted_by array
      const { data: message, error: fetchError } = await supabase
        .from("messages")
        .select("deleted_by")
        .eq("id", messageId)
        .single();

      if (fetchError) throw fetchError;

      const deletedBy = message.deleted_by || [];
      if (!deletedBy.includes(userId)) {
        deletedBy.push(userId);
      }

      const { error: updateError } = await supabase
        .from("messages")
        .update({ deleted_by: deletedBy })
        .eq("id", messageId);

      if (updateError) throw updateError;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("❌ Error deleting message:", error);
    return { success: false, error: error as Error };
  }
}

/**
 * Get unread message count for a user
 * Counts all unread messages across all conversations
 */
export async function getUnreadCount(
  userId: string,
): Promise<{ count: number; error: Error | null }> {
  try {
    const { count, error } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("recipient_id", userId)
      .eq("status", "sent");

    if (error) throw error;

    return { count: count || 0, error: null };
  } catch (error) {
    console.error("❌ Error getting unread count:", error);
    return { count: 0, error: error as Error };
  }
}

/**
 * Upload image to Supabase Storage
 * Returns the public URL of the uploaded image
 */
export async function uploadChatImage(
  userId: string,
  conversationId: string,
  imageUri: string,
): Promise<{ url: string | null; error: Error | null }> {
  try {
    // Convert image URI to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Generate unique filename
    const fileName = `${conversationId}/${Date.now()}_${userId}.jpg`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("chat-images")
      .upload(fileName, blob, {
        contentType: "image/jpeg",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("chat-images").getPublicUrl(fileName);

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error("❌ Error uploading image:", error);
    return { url: null, error: error as Error };
  }
}

/**
 * Delete image from storage
 */
export async function deleteChatImage(
  imageUrl: string,
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // Extract file path from URL
    const urlParts = imageUrl.split("/chat-images/");
    if (urlParts.length < 2) {
      throw new Error("Invalid image URL");
    }

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from("chat-images")
      .remove([filePath]);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error("❌ Error deleting image:", error);
    return { success: false, error: error as Error };
  }
}
