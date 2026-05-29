/**
 * Realtime API
 *
 * Manages Supabase Realtime subscriptions for chat features.
 * Handles message updates, typing indicators, read receipts, and presence.
 *
 * @module features/messaging/api/realtime
 */

import { supabase } from "@/src/config/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import type { Message } from "../types/messaging.types";

export type MessageCallback = (message: Message) => void;
export type TypingCallback = (userId: string, isTyping: boolean) => void;
export type ReadReceiptCallback = (messageIds: string[]) => void;
export type PresenceCallback = (userId: string, online: boolean) => void;

class RealtimeAPI {
  private channels: Map<string, RealtimeChannel> = new Map();

  /**
   * Subscribe to new messages in a conversation
   */
  subscribeToMessages(
    conversationId: string,
    userId: string,
    onNewMessage: MessageCallback,
  ): () => void {
    const channelName = `conversation:${conversationId}`;

    // Remove existing channel if any
    this.unsubscribe(channelName);

    // Create new channel
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          // Only notify if message is from another user
          if (newMessage.sender_id !== userId) {
            onNewMessage(newMessage);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          onNewMessage(updatedMessage);
        },
      )
      .subscribe();

    this.channels.set(channelName, channel);

    // Return cleanup function
    return () => this.unsubscribe(channelName);
  }

  /**
   * Subscribe to typing indicators
   */
  subscribeToTyping(
    conversationId: string,
    onTyping: TypingCallback,
  ): () => void {
    const channelName = `typing:${conversationId}`;

    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on("broadcast", { event: "typing" }, (payload) => {
        const { user_id, is_typing } = payload.payload;
        onTyping(user_id, is_typing);
      })
      .subscribe();

    this.channels.set(channelName, channel);

    return () => this.unsubscribe(channelName);
  }

  /**
   * Broadcast typing status
   */
  async broadcastTyping(
    conversationId: string,
    userId: string,
    isTyping: boolean,
  ): Promise<void> {
    const channelName = `typing:${conversationId}`;
    let channel = this.channels.get(channelName);

    if (!channel) {
      channel = supabase.channel(channelName).subscribe();
      this.channels.set(channelName, channel);
    }

    await channel.send({
      type: "broadcast",
      event: "typing",
      payload: { user_id: userId, is_typing: isTyping },
    });
  }

  /**
   * Subscribe to read receipts
   */
  subscribeToReadReceipts(
    conversationId: string,
    onReadReceipt: ReadReceiptCallback,
  ): () => void {
    const channelName = `read-receipts:${conversationId}`;

    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on("broadcast", { event: "read" }, (payload) => {
        const { message_ids } = payload.payload;
        onReadReceipt(message_ids);
      })
      .subscribe();

    this.channels.set(channelName, channel);

    return () => this.unsubscribe(channelName);
  }

  /**
   * Broadcast read receipt
   */
  async broadcastReadReceipt(
    conversationId: string,
    messageIds: string[],
  ): Promise<void> {
    const channelName = `read-receipts:${conversationId}`;
    let channel = this.channels.get(channelName);

    if (!channel) {
      channel = supabase.channel(channelName).subscribe();
      this.channels.set(channelName, channel);
    }

    await channel.send({
      type: "broadcast",
      event: "read",
      payload: { message_ids: messageIds },
    });
  }

  /**
   * Subscribe to user presence (online/offline)
   */
  subscribeToPresence(
    userId: string,
    onPresenceChange: PresenceCallback,
  ): () => void {
    const channelName = `presence:${userId}`;

    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const isOnline = Object.keys(state).length > 0;
        onPresenceChange(userId, isOnline);
      })
      .on("presence", { event: "join" }, () => {
        onPresenceChange(userId, true);
      })
      .on("presence", { event: "leave" }, () => {
        onPresenceChange(userId, false);
      })
      .subscribe();

    this.channels.set(channelName, channel);

    return () => this.unsubscribe(channelName);
  }

  /**
   * Track user's own presence
   */
  async trackPresence(userId: string): Promise<() => void> {
    const channelName = `presence:${userId}`;
    let channel = this.channels.get(channelName);

    if (!channel) {
      channel = supabase.channel(channelName);
      this.channels.set(channelName, channel);
    }

    await channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          user_id: userId,
          online_at: new Date().toISOString(),
        });
      }
    });

    return () => this.unsubscribe(channelName);
  }

  /**
   * Unsubscribe from a specific channel
   */
  private async unsubscribe(channelName: string): Promise<void> {
    const channel = this.channels.get(channelName);
    if (channel) {
      await supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  async unsubscribeAll(): Promise<void> {
    const unsubscribePromises = Array.from(this.channels.keys()).map((name) =>
      this.unsubscribe(name),
    );
    await Promise.all(unsubscribePromises);
  }
}

// Export singleton instance
export const realtimeApi = new RealtimeAPI();
