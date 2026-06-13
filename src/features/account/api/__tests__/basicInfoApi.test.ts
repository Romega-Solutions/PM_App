import { supabase } from "@/src/config/supabase";
import { saveBasicInfo } from "../basicInfoApi";

jest.mock("@/src/config/supabase", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

describe("basicInfoApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("saves basic info through the hardened RPC instead of direct profile update", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: [
        {
          updated_at: "2026-06-10T10:00:00.000Z",
          gender: "female",
          user_type: "filipina",
        },
      ],
      error: null,
    });

    const result = await saveBasicInfo({
      firstName: " Maria ",
      lastName: " Santos ",
      age: 28,
      userType: "filipina",
    });

    expect(result).toEqual({
      ok: true,
      data: {
        firstName: "Maria",
        lastName: "Santos",
        age: 28,
        gender: "female",
        userType: "filipina",
        createdAt: "2026-06-10T10:00:00.000Z",
      },
    });
    expect(supabase.rpc).toHaveBeenCalledWith("save_basic_info", {
      p_first_name: "Maria",
      p_last_name: "Santos",
      p_age: 28,
      p_user_type: "filipina",
    });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("throws before saving when the user is not authenticated", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: null,
    });

    await expect(
      saveBasicInfo({
        firstName: "Maria",
        lastName: "Santos",
        age: 28,
        userType: "filipina",
      }),
    ).rejects.toThrow("Please sign in before saving basic profile information.");

    expect(supabase.rpc).not.toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("rejects invalid profile basics before the RPC boundary", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    await expect(
      saveBasicInfo({
        firstName: "   ",
        lastName: "Santos",
        age: 28,
        userType: "filipina",
      }),
    ).rejects.toThrow("Check your basic profile information and try again.");

    await expect(
      saveBasicInfo({
        firstName: "Maria",
        lastName: "Santos",
        age: 17,
        userType: "filipina",
      }),
    ).rejects.toThrow("Check your basic profile information and try again.");

    await expect(
      saveBasicInfo({
        firstName: "Maria",
        lastName: "Santos",
        age: 28,
        userType: "admin" as never,
      }),
    ).rejects.toThrow("Check your basic profile information and try again.");

    expect(supabase.rpc).not.toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalled();
  });
});
