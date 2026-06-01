// src/features/messaging/api/__tests__/conversationsApi.test.ts

import { supabase } from "@/src/config/supabase";
import {
  getCurrentUserId,
  getConversationById,
  getConversationsForUser,
} from "../conversationsApi";

// Mock Supabase client
jest.mock("@/src/config/supabase", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

// ─── getCurrentUserId ─────────────────────────────────────────────────────────

describe("getCurrentUserId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("✅ Success Cases", () => {
    it("should return the user ID when auth session is active", async () => {
      const mockUserId = "user-abc-123";
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      const result = await getCurrentUserId();

      expect(result.userId).toBe(mockUserId);
      expect(result.error).toBeNull();
    });

    it("should return null userId when no user is signed in", async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await getCurrentUserId();

      expect(result.userId).toBeNull();
      expect(result.error).toBeNull();
    });
  });

  describe("❌ Error Cases", () => {
    it("should return an error when getUser throws an auth error", async () => {
      const mockError = new Error("JWT expired");
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: mockError,
      });

      const result = await getCurrentUserId();

      expect(result.userId).toBeNull();
      expect(result.error).toBe(mockError);
    });

    it("should return an error when getUser rejects (network failure)", async () => {
      (supabase.auth.getUser as jest.Mock).mockRejectedValue(
        new Error("Network error"),
      );

      const result = await getCurrentUserId();

      expect(result.userId).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe("Network error");
    });

    it("should wrap non-Error throws in an Error object", async () => {
      (supabase.auth.getUser as jest.Mock).mockRejectedValue("plain string");

      const result = await getCurrentUserId();

      expect(result.userId).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe("Failed to get current user");
    });
  });
});

// ─── getConversationsForUser ──────────────────────────────────────────────────

describe("getConversationsForUser", () => {
  const mockUserId = "user-001";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("✅ Success Cases", () => {
    it("should return conversations with the other user's details", async () => {
      const rawConv = {
        id: "conv-1",
        participant_1_id: mockUserId,
        participant_2_id: "user-002",
        last_message_text: "Hello!",
        last_message_at: "2026-06-01T10:00:00Z",
        updated_at: "2026-06-01T10:00:00Z",
        participant_1_unread_count: 2,
        participant_2_unread_count: 0,
        participant_1: {
          id: mockUserId,
          first_name: "Alice",
          photos: [],
          is_active: true,
        },
        participant_2: {
          id: "user-002",
          first_name: "Maria",
          photos: ["https://example.com/maria.jpg"],
          is_active: false,
          last_active_at: "2026-06-01T09:00:00Z",
        },
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          or: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [rawConv],
              error: null,
            }),
          }),
        }),
      });

      const result = await getConversationsForUser(mockUserId);

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      const conv = result.data![0];
      expect(conv.other_user.id).toBe("user-002");
      expect(conv.other_user.first_name).toBe("Maria");
      expect(conv.unread_count).toBe(2); // participant_1_unread_count
    });

    it("should return empty array when user has no conversations", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          or: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      const result = await getConversationsForUser(mockUserId);

      expect(result.error).toBeNull();
      expect(result.data).toEqual([]);
    });

    it("should return empty array when data is null", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          or: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      });

      const result = await getConversationsForUser(mockUserId);

      expect(result.error).toBeNull();
      expect(result.data).toEqual([]);
    });
  });

  describe("❌ Error Cases", () => {
    it("should return an error when the Supabase query fails", async () => {
      const mockError = new Error("Database connection failed");

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          or: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      const result = await getConversationsForUser(mockUserId);

      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe("Database connection failed");
    });

    it("should return an error when supabase.from throws", async () => {
      (supabase.from as jest.Mock).mockImplementation(() => {
        throw new Error("Unexpected failure");
      });

      const result = await getConversationsForUser(mockUserId);

      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
      // The impl passes Error instances through; only non-Errors get the
      // "Failed to fetch conversations" fallback.
      expect(result.error?.message).toBe("Unexpected failure");
    });
  });
});

// ─── getConversationById ──────────────────────────────────────────────────────

describe("getConversationById", () => {
  const mockConversationId = "conv-abc";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("✅ Success Cases", () => {
    it("should return a conversation by ID", async () => {
      const mockConv = { id: mockConversationId, participant_1_id: "user-1" };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockConv,
              error: null,
            }),
          }),
        }),
      });

      const result = await getConversationById(mockConversationId);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockConv);
    });
  });

  describe("❌ Error Cases", () => {
    it("should return an error when the conversation is not found", async () => {
      const notFoundError = new Error("Row not found");

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: notFoundError,
            }),
          }),
        }),
      });

      const result = await getConversationById(mockConversationId);

      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
    });

    it("should return an error when supabase.from throws", async () => {
      (supabase.from as jest.Mock).mockImplementation(() => {
        throw new Error("Network error");
      });

      const result = await getConversationById(mockConversationId);

      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
      // Error instances pass through; the fallback message is for non-Errors.
      expect(result.error?.message).toBe("Network error");
    });
  });
});
