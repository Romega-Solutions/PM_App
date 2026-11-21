import { supabase } from "@/src/config/supabase";
import { getMySignupSoftFlag } from "../signupSignalApi";

jest.mock("@/src/config/supabase", () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

describe("getMySignupSoftFlag", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("calls the server RPC and returns the soft flag", async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: [{ soft_flag: "review_suggested", checked_at: "2026-11-21T00:00:00Z" }],
      error: null,
    });

    await expect(getMySignupSoftFlag()).resolves.toBe("review_suggested");
    expect(supabase.rpc).toHaveBeenCalledWith("get_my_signup_signal");
  });

  it("returns unknown when no signal row exists", async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({ data: [], error: null });

    await expect(getMySignupSoftFlag()).resolves.toBe("unknown");
  });

  it("returns unknown for unexpected values or RPC errors", async () => {
    (supabase.rpc as jest.Mock).mockResolvedValueOnce({ data: [{ soft_flag: "blocked" }], error: null });
    await expect(getMySignupSoftFlag()).resolves.toBe("unknown");

    (supabase.rpc as jest.Mock).mockResolvedValueOnce({ data: null, error: { message: "boom" } });
    await expect(getMySignupSoftFlag()).resolves.toBe("unknown");
  });
});
