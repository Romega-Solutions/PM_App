import { supabase } from "@/src/config/supabase";
import {
  deleteMessage,
  hydrateMessageMedia,
  markConversationAsRead,
  markMessagesAsRead,
  sendImageMessage,
  sendTextMessage,
  updateMessageStatus,
} from "../messages.api";
import type { Message } from "../../types/messaging.types";

jest.mock("@/src/config/supabase", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
    rpc: jest.fn(),
    storage: {
      from: jest.fn(),
    },
  },
}));

const CURRENT_USER_ID = "11111111-1111-4111-8111-111111111111";
const RECIPIENT_ID = "22222222-2222-4222-8222-222222222222";
const CONVERSATION_ID = "33333333-3333-4333-8333-333333333333";
const CREATED_CONVERSATION_ID = "66666666-6666-4666-8666-666666666666";
const MESSAGE_ID = "44444444-4444-4444-8444-444444444444";
const SECOND_MESSAGE_ID = "55555555-5555-4555-8555-555555555555";
const IMAGE_PATH = `${CONVERSATION_ID}/image.jpg`;
const CREATED_IMAGE_PATH = `${CREATED_CONVERSATION_ID}/image.jpg`;

const baseMessage = (overrides: Partial<Message> = {}): Message => ({
  id: MESSAGE_ID,
  conversation_id: CONVERSATION_ID,
  sender_id: CURRENT_USER_ID,
  recipient_id: RECIPIENT_ID,
  text: "Hello",
  type: "text",
  status: "sent",
  is_deleted: false,
  created_at: "2026-06-10T00:00:00.000Z",
  updated_at: "2026-06-10T00:00:00.000Z",
  ...overrides,
});

describe("messages.api media handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: CURRENT_USER_ID } },
      error: null,
    });
  });

  describe("hydrateMessageMedia", () => {
    it("leaves text messages unchanged and does not request signed URLs", async () => {
      const message = baseMessage();

      const result = await hydrateMessageMedia(message);

      expect(result).toBe(message);
      expect(supabase.storage.from).not.toHaveBeenCalled();
    });

    it("signs private chat image storage paths before rendering", async () => {
      const createSignedUrl = jest.fn().mockResolvedValue({
        data: { signedUrl: "https://signed.example/chat-image.jpg" },
        error: null,
      });
      (supabase.storage.from as jest.Mock).mockReturnValue({ createSignedUrl });

      const message = baseMessage({
        type: "image",
        image_url: IMAGE_PATH,
      });

      const result = await hydrateMessageMedia(message);

      expect(supabase.storage.from).toHaveBeenCalledWith("chat-images");
      expect(createSignedUrl).toHaveBeenCalledWith(IMAGE_PATH, 3600);
      expect(result.image_url).toBe("https://signed.example/chat-image.jpg");
    });

    it("extracts storage paths from legacy chat-images URLs before signing", async () => {
      const createSignedUrl = jest.fn().mockResolvedValue({
        data: { signedUrl: "https://signed.example/legacy.jpg" },
        error: null,
      });
      (supabase.storage.from as jest.Mock).mockReturnValue({ createSignedUrl });

      const message = baseMessage({
        type: "image",
        image_url:
          "https://project.supabase.co/storage/v1/object/public/chat-images/user-123/legacy%20image.jpg?token=old",
      });

      const result = await hydrateMessageMedia(message);

      expect(createSignedUrl).toHaveBeenCalledWith(
        "user-123/legacy image.jpg",
        3600,
      );
      expect(result.image_url).toBe("https://signed.example/legacy.jpg");
    });

    it("does not sign external image URLs outside the chat-images bucket", async () => {
      const message = baseMessage({
        type: "image",
        image_url: "https://cdn.example.com/external.jpg",
      });

      const result = await hydrateMessageMedia(message);

      expect(result).toBe(message);
      expect(supabase.storage.from).not.toHaveBeenCalled();
    });

    it("keeps the original storage path when signing fails", async () => {
      const warnSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      const createSignedUrl = jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Signing failed" },
      });
      (supabase.storage.from as jest.Mock).mockReturnValue({ createSignedUrl });

      const message = baseMessage({
        type: "image",
        image_url: IMAGE_PATH,
      });

      const result = await hydrateMessageMedia(message);

      expect(result).toBe(message);
      expect(warnSpy).toHaveBeenCalledWith("Unable to sign chat image URL.");
      warnSpy.mockRestore();
    });
  });

  describe("sendImageMessage", () => {
    it("stores the durable chat image path through send_message and returns a signed display URL", async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: baseMessage({
          type: "image",
          image_url: IMAGE_PATH,
          text: "",
        }),
        error: null,
      });
      const createSignedUrl = jest.fn().mockResolvedValue({
        data: { signedUrl: "https://signed.example/chat-image.jpg" },
        error: null,
      });

      (supabase.storage.from as jest.Mock).mockReturnValue({ createSignedUrl });

      const result = await sendImageMessage(
        CURRENT_USER_ID,
        RECIPIENT_ID,
        IMAGE_PATH,
        CONVERSATION_ID,
      );

      expect(supabase.rpc).toHaveBeenCalledWith("send_message", {
        p_recipient_id: RECIPIENT_ID,
        p_content: "",
        p_message_type: "image",
        p_image_url: IMAGE_PATH,
        p_conversation_id: CONVERSATION_ID,
      });
      expect(supabase.from).not.toHaveBeenCalled();
      expect(result.error).toBeNull();
      expect(result.data?.image_url).toBe(
        "https://signed.example/chat-image.jpg",
      );
    });

    it("rejects image sends without a conversation-bound storage path", async () => {
      const errorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: baseMessage({
          conversation_id: CREATED_CONVERSATION_ID,
          type: "image",
          image_url: CREATED_IMAGE_PATH,
          text: "",
        }),
        error: null,
      });
      const createSignedUrl = jest.fn().mockResolvedValue({
        data: { signedUrl: "https://signed.example/created.jpg" },
        error: null,
      });

      (supabase.storage.from as jest.Mock).mockReturnValue({ createSignedUrl });

      const result = await sendImageMessage(
        CURRENT_USER_ID,
        RECIPIENT_ID,
        CREATED_IMAGE_PATH,
        CONVERSATION_ID,
      );

      expect(supabase.rpc).not.toHaveBeenCalled();
      expect(result.data).toBeNull();
      expect(result.error?.message).toBe(
        "Message did not send. Check your connection and try again.",
      );
      errorSpy.mockRestore();
    });

    it("returns a safe error without inserting a message when send_message fails", async () => {
      const errorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      const rpcError = new Error("Blocked members cannot chat");
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: rpcError,
      });

      const result = await sendImageMessage(
        CURRENT_USER_ID,
        RECIPIENT_ID,
        IMAGE_PATH,
        CONVERSATION_ID,
      );

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe(
        "Message did not send. Check your connection and try again.",
      );
      expect(errorSpy).toHaveBeenCalledWith("Error sending image message.");
      expect(supabase.from).not.toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });

  describe("sendTextMessage", () => {
    it("routes text sends through the send_message RPC", async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: baseMessage({
          text: "Hello",
        }),
        error: null,
      });

      const result = await sendTextMessage(
        CURRENT_USER_ID,
        RECIPIENT_ID,
        "Hello",
      );

      expect(supabase.rpc).toHaveBeenCalledWith("send_message", {
        p_recipient_id: RECIPIENT_ID,
        p_content: "Hello",
        p_message_type: "text",
        p_image_url: null,
        p_conversation_id: null,
      });
      expect(supabase.from).not.toHaveBeenCalled();
      expect(result.error).toBeNull();
    });
  });

  describe("message state RPCs", () => {
    it("marks selected messages read through the hardened privacy-aware RPC", async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });

      const result = await markMessagesAsRead(
        [MESSAGE_ID, SECOND_MESSAGE_ID],
        RECIPIENT_ID,
      );

      expect(result).toEqual({ success: true, error: null });
      expect(supabase.rpc).toHaveBeenCalledWith("mark_messages_read", {
        p_message_ids: [MESSAGE_ID, SECOND_MESSAGE_ID],
      });
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it("marks a conversation read through the hardened privacy-aware RPC", async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });

      const result = await markConversationAsRead(
        CONVERSATION_ID,
        RECIPIENT_ID,
      );

      expect(result).toEqual({ success: true, error: null });
      expect(supabase.rpc).toHaveBeenCalledWith("mark_conversation_read", {
        p_conversation_id: CONVERSATION_ID,
      });
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it("updates message status through the hardened privacy-aware RPC", async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });

      const result = await updateMessageStatus(MESSAGE_ID, "read");

      expect(result).toEqual({ success: true, error: null });
      expect(supabase.rpc).toHaveBeenCalledWith("update_message_status", {
        p_message_id: MESSAGE_ID,
        p_status: "read",
      });
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it("deletes a message for the current user through the hardened RPC", async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });

      const result = await deleteMessage(MESSAGE_ID, CURRENT_USER_ID);

      expect(result).toEqual({ success: true, error: null });
      expect(supabase.rpc).toHaveBeenCalledWith("delete_message_for_me", {
        p_message_id: MESSAGE_ID,
      });
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it("deletes a message for everyone through the hardened RPC", async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });

      const result = await deleteMessage(MESSAGE_ID, CURRENT_USER_ID, true);

      expect(result).toEqual({ success: true, error: null });
      expect(supabase.rpc).toHaveBeenCalledWith("delete_message_for_everyone", {
        p_message_id: MESSAGE_ID,
      });
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });
});
