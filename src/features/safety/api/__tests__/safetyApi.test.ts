import { supabase } from "@/src/config/supabase";
import { blockUser, submitUserReport, unmatchUser } from "../safetyApi";

jest.mock("@/src/config/supabase", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

const mockUserId = "11111111-1111-4111-8111-111111111111";
const mockOtherUserId = "22222222-2222-4222-8222-222222222222";
const mockConversationId = "33333333-3333-4333-8333-333333333333";

function mockAuthenticatedUser(userId = mockUserId) {
  (supabase.auth.getUser as jest.Mock).mockResolvedValue({
    data: { user: { id: userId } },
    error: null,
  });
}

function mockUnauthenticatedUser(message = "Missing session") {
  (supabase.auth.getUser as jest.Mock).mockResolvedValue({
    data: { user: null },
    error: new Error(message),
  });
}

describe("safetyApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("submitUserReport", () => {
    it("submits a normalized authenticated report through the hardened RPC", async () => {
      mockAuthenticatedUser();
      (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });

      const result = await submitUserReport({
        reportedUserId: ` ${mockOtherUserId} `,
        reason: "  Harassment  ",
        details: "  Sent abusive messages  ",
        conversationId: ` ${mockConversationId} `,
        source: "chat",
      });

      expect(result).toEqual({ success: true });
      expect(supabase.rpc).toHaveBeenCalledWith("submit_user_report", {
        p_reported_user_id: mockOtherUserId,
        p_reason: "Harassment",
        p_details: "Sent abusive messages",
        p_conversation_id: mockConversationId,
        p_source: "chat",
      });
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it("rejects malformed reported member IDs before RPC calls", async () => {
      mockAuthenticatedUser();

      const result = await submitUserReport({
        reportedUserId: "not-a-user-id",
        reason: "Spam",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "This member could not be identified. Go back and try again.",
      );
      expect(supabase.rpc).not.toHaveBeenCalled();
    });

    it("rejects malformed conversation IDs before RPC calls", async () => {
      mockAuthenticatedUser();

      const result = await submitUserReport({
        reportedUserId: mockOtherUserId,
        reason: "Spam",
        conversationId: "not-a-conversation-id",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "The report was not sent. Check your connection and try again.",
      );
      expect(supabase.rpc).not.toHaveBeenCalled();
    });

    it("rejects empty reasons before RPC calls", async () => {
      mockAuthenticatedUser();

      const result = await submitUserReport({
        reportedUserId: mockOtherUserId,
        reason: "   ",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Choose a reason for the report.");
      expect(supabase.rpc).not.toHaveBeenCalled();
    });

    it("truncates long reason and details payloads before submitting", async () => {
      mockAuthenticatedUser();
      (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });

      const longReason = "R".repeat(180);
      const longDetails = "D".repeat(900);

      const result = await submitUserReport({
        reportedUserId: mockOtherUserId,
        reason: longReason,
        details: longDetails,
        source: "app",
      });

      expect(result).toEqual({ success: true });
      expect(supabase.rpc).toHaveBeenCalledWith(
        "submit_user_report",
        expect.objectContaining({
          p_reason: "R".repeat(120),
          p_details: "D".repeat(800),
        }),
      );
    });

    it("rejects self-reports before inserting", async () => {
      mockAuthenticatedUser();

      const result = await submitUserReport({
        reportedUserId: mockUserId,
        reason: "Self report",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Choose a different member to report.");
      expect(supabase.from).not.toHaveBeenCalled();
      expect(supabase.rpc).not.toHaveBeenCalled();
    });

    it("returns a safe auth error when the user is not signed in", async () => {
      mockUnauthenticatedUser("Auth session missing");

      const result = await submitUserReport({
        reportedUserId: mockOtherUserId,
        reason: "Spam",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Please sign in again before continuing.");
      expect(supabase.from).not.toHaveBeenCalled();
      expect(supabase.rpc).not.toHaveBeenCalled();
    });

    it("returns safe RPC errors without claiming success", async () => {
      mockAuthenticatedUser();
      (supabase.rpc as jest.Mock).mockResolvedValue({
        error: { message: "RLS rejected report" },
      });

      const result = await submitUserReport({
        reportedUserId: mockOtherUserId,
        reason: "Fake profile",
      });

      expect(result).toEqual({
        success: false,
        error: "The report was not sent. Check your connection and try again.",
      });
    });
  });

  describe("blockUser", () => {
    it("calls the block_user RPC for authenticated users", async () => {
      mockAuthenticatedUser();
      (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });

      const result = await blockUser(mockOtherUserId);

      expect(result).toEqual({ success: true });
      expect(supabase.rpc).toHaveBeenCalledWith("block_user", {
        p_blocked_user_id: mockOtherUserId,
      });
    });

    it("rejects empty member IDs before auth or RPC calls", async () => {
      const result = await blockUser("");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Choose a member to block.");
      expect(supabase.auth.getUser).not.toHaveBeenCalled();
      expect(supabase.rpc).not.toHaveBeenCalled();
    });

    it("rejects malformed member IDs before auth or RPC calls", async () => {
      const result = await blockUser("not-a-user-id");

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "This member could not be identified. Go back and try again.",
      );
      expect(supabase.auth.getUser).not.toHaveBeenCalled();
      expect(supabase.rpc).not.toHaveBeenCalled();
    });

    it("does not call block_user when the session is missing", async () => {
      mockUnauthenticatedUser("Auth session missing");

      const result = await blockUser(mockOtherUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Please sign in again before continuing.");
      expect(supabase.rpc).not.toHaveBeenCalled();
    });

    it("returns safe RPC errors for blocked-member persistence failures", async () => {
      mockAuthenticatedUser();
      (supabase.rpc as jest.Mock).mockResolvedValue({
        error: { message: "Block policy rejected" },
      });

      const result = await blockUser(mockOtherUserId);

      expect(result).toEqual({
        success: false,
        error: "Block failed. Check your connection and try again.",
      });
    });
  });

  describe("unmatchUser", () => {
    it("calls the unmatch_user RPC for authenticated users", async () => {
      mockAuthenticatedUser();
      (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });

      const result = await unmatchUser(mockOtherUserId);

      expect(result).toEqual({ success: true });
      expect(supabase.rpc).toHaveBeenCalledWith("unmatch_user", {
        p_other_user_id: mockOtherUserId,
      });
    });

    it("rejects empty member IDs before auth or RPC calls", async () => {
      const result = await unmatchUser("");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Choose a member to unmatch.");
      expect(supabase.auth.getUser).not.toHaveBeenCalled();
      expect(supabase.rpc).not.toHaveBeenCalled();
    });

    it("rejects malformed member IDs before auth or RPC calls", async () => {
      const result = await unmatchUser("not-a-user-id");

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "This member could not be identified. Go back and try again.",
      );
      expect(supabase.auth.getUser).not.toHaveBeenCalled();
      expect(supabase.rpc).not.toHaveBeenCalled();
    });

    it("does not call unmatch_user when the session is missing", async () => {
      mockUnauthenticatedUser("Auth session missing");

      const result = await unmatchUser(mockOtherUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Please sign in again before continuing.");
      expect(supabase.rpc).not.toHaveBeenCalled();
    });

    it("returns safe RPC errors for unmatch failures", async () => {
      mockAuthenticatedUser();
      (supabase.rpc as jest.Mock).mockResolvedValue({
        error: { message: "Unmatch policy rejected" },
      });

      const result = await unmatchUser(mockOtherUserId);

      expect(result).toEqual({
        success: false,
        error: "Unmatch failed. Check your connection and try again.",
      });
    });
  });
});
