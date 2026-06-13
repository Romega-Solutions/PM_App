import { supabase } from "@/src/config/supabase";
import { requestAccountDeletion } from "../privacyApi";

jest.mock("@/src/config/supabase", () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

describe("privacyApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requests account deletion through the hardened RPC", async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: {
        status: "pending",
        requested_at: "2026-06-10T12:00:00.000Z",
      },
      error: null,
    });

    const result = await requestAccountDeletion("  Please delete my account  ");

    expect(result).toEqual({
      success: true,
      status: "pending",
      requestedAt: "2026-06-10T12:00:00.000Z",
    });
    expect(supabase.rpc).toHaveBeenCalledWith("request_account_deletion", {
      p_reason: "Please delete my account",
      p_source: "privacy_settings",
    });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("returns a sign-in message when the session is missing", async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: "JWT expired" },
    });

    const result = await requestAccountDeletion();

    expect(result).toEqual({
      success: false,
      error: "Please sign in again before requesting account deletion.",
    });
  });

  it("does not claim success when the RPC rejects the request", async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: "Deletion queue unavailable" },
    });

    const result = await requestAccountDeletion();

    expect(result).toEqual({
      success: false,
      error: "Your deletion request was not sent. Check your connection and try again.",
    });
  });

  it("normalizes empty and oversized deletion reasons before the RPC call", async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: { status: "pending" },
      error: null,
    });

    await requestAccountDeletion("    ");
    await requestAccountDeletion("x".repeat(650));

    expect(supabase.rpc).toHaveBeenNthCalledWith(1, "request_account_deletion", {
      p_reason: "User requested account deletion from privacy settings",
      p_source: "privacy_settings",
    });
    expect(supabase.rpc).toHaveBeenNthCalledWith(2, "request_account_deletion", {
      p_reason: "x".repeat(500),
      p_source: "privacy_settings",
    });
    expect(supabase.from).not.toHaveBeenCalled();
  });
});
