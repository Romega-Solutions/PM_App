import { supabase } from "@/src/config/supabase";
import { getConversations, markConversationAsRead } from "../messagesApi";

jest.mock("@/src/config/supabase", () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

describe("legacy messagesApi conversation helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getConversations", () => {
    it("uses the hardened get_user_conversations RPC instead of direct joins", async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: [
          {
            id: "conversation-123",
            other_user_id: "user-456",
            other_user_first_name: "Maria",
            other_user_photos: ["photo-1.jpg"],
            other_user_is_active: true,
            last_message_text: "Hello",
            last_message_at: "2026-06-10T01:00:00.000Z",
            unread_count: 2,
          },
        ],
        error: null,
      });

      const result = await getConversations("user-123");

      expect(result).toEqual({
        data: [
          {
            id: "conversation-123",
            other_user_id: "user-456",
            other_user_name: "Maria",
            other_user_image: "photo-1.jpg",
            latest_message: "Hello",
            latest_message_time: "2026-06-10T01:00:00.000Z",
            unread_count: 2,
            is_online: true,
          },
        ],
        error: null,
      });
      expect(supabase.rpc).toHaveBeenCalledWith("get_user_conversations", {
        p_user_id: "user-123",
      });
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it("returns an empty list when the RPC has no rows", async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await getConversations("user-123");

      expect(result).toEqual({ data: [], error: null });
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it("returns RPC errors without falling back to direct table reads", async () => {
      const rpcError = { message: "RLS rejected conversation read" };
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: rpcError,
      });

      const result = await getConversations("user-123");

      expect(result).toEqual({ data: null, error: rpcError });
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe("markConversationAsRead", () => {
    it("uses the hardened pair-read RPC", async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });

      const result = await markConversationAsRead("user-123", "user-456");

      expect(result).toEqual({ success: true });
      expect(supabase.rpc).toHaveBeenCalledWith("mark_pair_messages_read", {
        p_other_user_id: "user-456",
      });
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });
});
