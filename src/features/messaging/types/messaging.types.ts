/**
 * Messaging Types
 *
 * TypeScript types for the messaging feature.
 * Matches the database schema and API contracts.
 *
 * @module features/messaging/types
 */

/**
 * Message type - what kind of message it is
 */
export type MessageType = "text" | "image" | "voice" | "video" | "file";

/**
 * Message status - delivery and read status
 */
export type MessageStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

/**
 * Message entity from database
 * Matches your actual database schema
 */
export interface Message {
  id: string;
  conversation_id?: string; // Optional initially, required after migration
  sender_id: string;
  recipient_id: string;
  text: string; // Your DB uses 'text', not 'content'
  type: MessageType; // Your DB uses 'type', not 'message_type'
  image_url?: string;
  status: MessageStatus;
  is_deleted: boolean;
  deleted_by?: string[];
  reply_to_message_id?: string;
  delivery_method?: string; // Your DB has this
  read_at?: string; // Your DB has this
  created_at: string;
  updated_at: string;
}

/**
 * Input for creating a new message
 * Matches your actual database schema
 */
export interface MessageInput {
  recipient_id: string;
  text: string; // Your DB uses 'text', not 'content'
  type?: MessageType; // Your DB uses 'type', not 'message_type'
  image_url?: string;
  conversation_id?: string;
}

/**
 * Conversation entity from database
 */
export interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  last_message_id?: string;
  last_message_text?: string;
  last_message_sender_id?: string;
  last_message_at?: string;
  participant_1_unread_count: number;
  participant_2_unread_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Conversation with populated user data (for display)
 */
export interface ConversationWithUser extends Conversation {
  other_user: {
    id: string;
    first_name: string;
    photos: string[];
    is_active: boolean;
    last_active_at?: string;
  };
  unread_count: number;
}

/**
 * Typing indicator event
 */
export interface TypingEvent {
  user_id: string;
  is_typing: boolean;
  timestamp: string;
}

/**
 * Read receipt event
 */
export interface ReadReceiptEvent {
  message_ids: string[];
  user_id: string;
  timestamp: string;
}

/**
 * Presence event (online/offline status)
 */
export interface PresenceEvent {
  user_id: string;
  online: boolean;
  last_seen?: string;
}
