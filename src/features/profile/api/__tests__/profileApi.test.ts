import { supabase } from "@/src/config/supabase";
import { updateUserProfile } from "../profileApi";

jest.mock("@/src/config/supabase", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
    storage: {
      from: jest.fn(),
    },
  },
}));

jest.mock("expo-file-system/legacy", () => ({}));

jest.mock("base64-arraybuffer", () => ({
  decode: jest.fn(),
}));

describe("profileApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date("2026-06-10T00:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("updateUserProfile", () => {
    it("strips server-owned verification fields before updating profiles", async () => {
      const eq = jest.fn().mockResolvedValue({ error: null });
      const update = jest.fn().mockReturnValue({ eq });

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: "user-123" } },
      });
      (supabase.from as jest.Mock).mockReturnValue({ update });

      const result = await updateUserProfile({
        first_name: "Maria",
        location_name: "Manila",
        is_verified: true,
        verification_status: "approved",
        verified_at: "2026-06-10T00:00:00.000Z",
      } as any);

      expect(result).toEqual({ success: true });
      expect(supabase.from).toHaveBeenCalledWith("profiles");
      expect(update).toHaveBeenCalledWith({
        first_name: "Maria",
        location_name: "Manila",
        updated_at: "2026-06-10T00:00:00.000Z",
      });
      expect(eq).toHaveBeenCalledWith("id", "user-123");
    });

    it("returns an auth error before updating when no user is signed in", async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      const result = await updateUserProfile({ first_name: "Maria" });

      expect(result).toEqual({
        success: false,
        error: "Not authenticated",
      });
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });
});
