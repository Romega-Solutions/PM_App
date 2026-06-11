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

const CHAT_IMAGES_BUCKET = "chat-images";
const CHAT_IMAGE_SIGNED_URL_TTL_SECONDS = 60 * 60;
const MAX_CHAT_IMAGE_BYTES = 6 * 1024 * 1024;
const CHAT_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
};
const MESSAGE_SEND_ERROR =
  "Message did not send. Check your connection and try again.";
const MESSAGE_LOAD_ERROR =
  "Messages could not be loaded. Check your connection and try again.";
const MESSAGE_READ_ERROR =
  "Message read status did not update. Check your connection and try again.";
const MESSAGE_STATUS_ERROR =
  "Message status did not update. Check your connection and try again.";
const MESSAGE_DELETE_ERROR =
  "Message could not be deleted. Check your connection and try again.";
const MESSAGE_UNREAD_ERROR =
  "Unread message count could not be loaded. Check your connection and try again.";
const CHAT_IMAGE_UPLOAD_ERROR =
  "Photo message did not upload. Check your connection and try again.";
const CHAT_IMAGE_DELETE_ERROR =
  "Photo message could not be removed. Check your connection and try again.";

function getChatImageStoragePath(imageUrlOrPath?: string | null): string | null {
  if (!imageUrlOrPath) return null;

  if (!/^https?:\/\//i.test(imageUrlOrPath)) {
    return imageUrlOrPath.replace(/^\/+/, "");
  }

  const marker = `/${CHAT_IMAGES_BUCKET}/`;
  const markerIndex = imageUrlOrPath.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  const pathWithQuery = imageUrlOrPath.slice(markerIndex + marker.length);
  return decodeURIComponent(pathWithQuery.split("?")[0]);
}

function assertConversationImagePath(
  imageStoragePath: string,
  conversationId: string,
) {
  const normalizedPath = getChatImageStoragePath(imageStoragePath);

  if (
    !normalizedPath ||
    normalizedPath.includes("..") ||
    normalizedPath.startsWith("/") ||
    !normalizedPath.startsWith(`${conversationId}/`)
  ) {
    throw new Error("Invalid chat image path");
  }

  return normalizedPath;
}

function getImageTypeFromUri(uri: string): string | null {
  const extension = uri
    .split("?")[0]
    .split("#")[0]
    .split(".")
    .pop()
    ?.toLowerCase();

  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  if (extension === "heic") return "image/heic";

  return null;
}

function assertChatImageUpload(blob: Blob, imageUri: string) {
  const contentType = blob.type || getImageTypeFromUri(imageUri);

  if (!contentType || !(contentType in CHAT_IMAGE_TYPES)) {
    throw new Error("Unsupported chat image type");
  }

  if (blob.size <= 0 || blob.size > MAX_CHAT_IMAGE_BYTES) {
    throw new Error("Chat image size is not allowed");
  }

  return {
    contentType,
    extension: CHAT_IMAGE_TYPES[contentType],
  };
}

export async function hydrateMessageMedia(message: Message): Promise<Message> {
  if (message.type !== "image" || !message.image_url) {
    return message;
  }

  const storedPath = getChatImageStoragePath(message.image_url);

  if (!storedPath) {
    return message;
  }

  const { data, error } = await supabase.storage
    .from(CHAT_IMAGES_BUCKET)
    .createSignedUrl(storedPath, CHAT_IMAGE_SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    console.warn("Unable to sign chat image URL.");
    return message;
  }

  return {
    ...message,
    image_url: data.signedUrl,
  };
}

async function hydrateMessagesMedia(messages: Message[]): Promise<Message[]> {
  return Promise.all(messages.map((message) => hydrateMessageMedia(message)));
}

async function getAuthenticatedUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.id) {
    throw new Error("Authentication required");
  }

  return user.id;
}

function clampMessageLimit(limit: number): number {
  if (!Number.isFinite(limit)) return 100;

  return Math.min(Math.max(Math.trunc(limit), 1), 100);
}

function assertUuid(value: string, label: string): void {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    throw new Error(`Invalid ${label}`);
  }
}

function assertOptionalUuid(value: string | undefined, label: string): void {
  if (!value) return;

  assertUuid(value, label);
}

function assertUuidList(values: string[], label: string): void {
  if (values.length === 0) return;

  values.forEach((value) => assertUuid(value, label));
}

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
    await getAuthenticatedUserId();
    void senderId;
    assertUuid(recipientId, "recipient ID");
    assertOptionalUuid(conversationId, "conversation ID");

    const { data, error } = await supabase.rpc("send_message", {
      p_recipient_id: recipientId,
      p_content: content,
      p_message_type: "text",
      p_image_url: null,
      p_conversation_id: conversationId ?? null,
    });

    if (error) throw error;

    return { data: data as Message, error: null };
  } catch (error) {
    console.error("Error sending text message.");
    return { data: null, error: new Error(MESSAGE_SEND_ERROR) };
  }
}

/**
 * Send an image message
 * Creates a message with image URL
 */
export async function sendImageMessage(
  senderId: string,
  recipientId: string,
  imageStoragePath: string,
  conversationId: string,
): Promise<{ data: Message | null; error: Error | null }> {
  try {
    await getAuthenticatedUserId();
    void senderId;
    assertUuid(recipientId, "recipient ID");
    assertUuid(conversationId, "conversation ID");
    const normalizedImagePath = assertConversationImagePath(
      imageStoragePath,
      conversationId,
    );

    const { data, error } = await supabase.rpc("send_message", {
      p_recipient_id: recipientId,
      p_content: "",
      p_message_type: "image",
      p_image_url: normalizedImagePath,
      p_conversation_id: conversationId,
    });

    if (error) throw error;

    return { data: await hydrateMessageMedia(data as Message), error: null };
  } catch (error) {
    console.error("Error sending image message.");
    return { data: null, error: new Error(MESSAGE_SEND_ERROR) };
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
    const authUserId = await getAuthenticatedUserId();
    void userId;
    assertUuid(recipientId, "recipient ID");

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${authUserId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${authUserId})`,
      )
      .order("created_at", { ascending: true })
      .limit(clampMessageLimit(limit));

    if (error) throw error;

    return { data: await hydrateMessagesMedia(data as Message[]), error: null };
  } catch (error) {
    console.error("Error fetching messages.");
    return { data: null, error: new Error(MESSAGE_LOAD_ERROR) };
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
    await getAuthenticatedUserId();
    assertUuid(conversationId, "conversation ID");

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(clampMessageLimit(limit));

    if (error) throw error;

    return { data: await hydrateMessagesMedia(data as Message[]), error: null };
  } catch (error) {
    console.error("Error fetching messages by conversation.");
    return { data: null, error: new Error(MESSAGE_LOAD_ERROR) };
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
    await getAuthenticatedUserId();
    void userId;
    assertUuidList(messageIds, "message ID");

    const { error } = await supabase.rpc("mark_messages_read", {
      p_message_ids: messageIds,
    });

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error("Error marking messages as read.");
    return { success: false, error: new Error(MESSAGE_READ_ERROR) };
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
    await getAuthenticatedUserId();
    void userId;
    assertUuid(conversationId, "conversation ID");

    const { error } = await supabase.rpc("mark_conversation_read", {
      p_conversation_id: conversationId,
    });

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error("Error marking conversation as read.");
    return { success: false, error: new Error(MESSAGE_READ_ERROR) };
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
    await getAuthenticatedUserId();
    assertUuid(messageId, "message ID");

    const { error } = await supabase.rpc("update_message_status", {
      p_message_id: messageId,
      p_status: status,
    });

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error("Error updating message status.");
    return { success: false, error: new Error(MESSAGE_STATUS_ERROR) };
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
    await getAuthenticatedUserId();
    assertUuid(messageId, "message ID");

    if (deleteForEveryone) {
      void userId;

      const { error } = await supabase.rpc("delete_message_for_everyone", {
        p_message_id: messageId,
      });

      if (error) throw error;
    } else {
      void userId;

      const { error: updateError } = await supabase.rpc("delete_message_for_me", {
        p_message_id: messageId,
      });

      if (updateError) throw updateError;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Error deleting message.");
    return { success: false, error: new Error(MESSAGE_DELETE_ERROR) };
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
    const authUserId = await getAuthenticatedUserId();
    void userId;

    const { count, error } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("recipient_id", authUserId)
      .eq("status", "sent");

    if (error) throw error;

    return { count: count || 0, error: null };
  } catch (error) {
    console.error("Error getting unread count.");
    return { count: 0, error: new Error(MESSAGE_UNREAD_ERROR) };
  }
}

/**
 * Upload image to Supabase Storage
 * Returns the durable storage path. Messages store this path and sign it at read time.
 */
export async function uploadChatImage(
  userId: string,
  conversationId: string,
  imageUri: string,
): Promise<{ path: string | null; error: Error | null }> {
  try {
    const authUserId = await getAuthenticatedUserId();
    void userId;
    assertUuid(conversationId, "conversation ID");

    // Convert image URI to blob
    const response = await fetch(imageUri);
    if (!response.ok) {
      throw new Error("Unable to read image");
    }
    const blob = await response.blob();
    const { contentType, extension } = assertChatImageUpload(blob, imageUri);

    // Generate unique filename
    const fileName = `${conversationId}/${Date.now()}_${authUserId}.${extension}`;

    // Upload to storage
    const { data, error: uploadError } = await supabase.storage
      .from("chat-images")
      .upload(fileName, blob, {
        contentType,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const storedPath = data?.path || fileName;
    return { path: storedPath, error: null };
  } catch (error) {
    console.error("Error uploading image.");
    return { path: null, error: new Error(CHAT_IMAGE_UPLOAD_ERROR) };
  }
}

/**
 * Delete image from storage
 */
export async function deleteChatImage(
  imageUrlOrPath: string,
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const filePath = getChatImageStoragePath(imageUrlOrPath);

    if (!filePath) {
      throw new Error(CHAT_IMAGE_DELETE_ERROR);
    }

    const { error } = await supabase.storage
      .from(CHAT_IMAGES_BUCKET)
      .remove([filePath]);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error("Error deleting image.");
    return { success: false, error: new Error(CHAT_IMAGE_DELETE_ERROR) };
  }
}
