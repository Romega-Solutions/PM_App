import { supabase } from "@/src/config/supabase";
import { blockUser, submitUserReport, unmatchUser } from "../safetyApi";

jest.mock("@/src/config/supabase", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    rpc: jest.fn(),
    from: jest.fn(),
  },
}));

const currentUserId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const otherUserId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const conversationId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

describe("safetyApi report and contact controls", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: currentUserId } },
      error: null,
    });
    (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });
  });

  it("submits reports through the hardened RPC with normalized payload", async () => {
    await expect(
      submitUserReport({
        reportedUserId: otherUserId,
        reason: ` ${"Harassment".repeat(20)} `,
        details: ` ${"Unsafe pressure ".repeat(80)} `,
        conversationId,
        source: "unknown" as never,
      }),
    ).resolves.toEqual({ success: true });

    expect(supabase.rpc).toHaveBeenCalledWith("submit_user_report", {
      p_reported_user_id: otherUserId,
      p_reason: `${"Harassment".repeat(20)}`.slice(0, 120),
      p_details: `${"Unsafe pressure ".repeat(80)}`.slice(0, 800),
      p_conversation_id: conversationId,
      p_source: "app",
    });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("rejects invalid or self-report IDs before calling the report RPC", async () => {
    await expect(
      submitUserReport({
        reportedUserId: "not-a-user-id",
        reason: "Harassment",
      }),
    ).resolves.toEqual({
      success: false,
      error: "This member could not be identified. Go back and try again.",
    });

    await expect(
      submitUserReport({
        reportedUserId: currentUserId,
        reason: "Harassment",
      }),
    ).resolves.toEqual({
      success: false,
      error: "Choose a different member to report.",
    });

    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("rejects blank reasons and invalid conversation context before the report RPC", async () => {
    await expect(
      submitUserReport({
        reportedUserId: otherUserId,
        reason: "   ",
      }),
    ).resolves.toEqual({
      success: false,
      error: "Choose a reason for the report.",
    });

    await expect(
      submitUserReport({
        reportedUserId: otherUserId,
        reason: "Harassment",
        conversationId: "not-a-conversation-id",
      }),
    ).resolves.toEqual({
      success: false,
      error: "The report was not sent. Check your connection and try again.",
    });

    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("blocks and unmatches only through contact-control RPCs", async () => {
    await expect(blockUser(otherUserId)).resolves.toEqual({ success: true });
    await expect(unmatchUser(otherUserId)).resolves.toEqual({ success: true });

    expect(supabase.rpc).toHaveBeenNthCalledWith(1, "block_user", {
      p_blocked_user_id: otherUserId,
    });
    expect(supabase.rpc).toHaveBeenNthCalledWith(2, "unmatch_user", {
      p_other_user_id: otherUserId,
    });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("rejects self block and self unmatch before contact-control RPCs", async () => {
    await expect(blockUser(currentUserId)).resolves.toEqual({
      success: false,
      error: "Choose a different member to block.",
    });
    await expect(unmatchUser(currentUserId)).resolves.toEqual({
      success: false,
      error: "Choose a different member to unmatch.",
    });

    expect(supabase.rpc).not.toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalled();
  });
});
