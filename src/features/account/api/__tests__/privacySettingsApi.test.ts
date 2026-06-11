import { supabase } from "@/src/config/supabase";
import {
  DEFAULT_PRIVACY_SETTINGS,
  getPrivacySettings,
  savePrivacySettings,
} from "../privacySettingsApi";

jest.mock("@/src/config/supabase", () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

describe("privacySettingsApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads privacy settings through the RPC with launch-safe defaults", async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: {
        show_online_status: true,
        show_distance: false,
        read_receipts: true,
        profile_visible: false,
        updated_at: "2026-06-10T13:00:00.000Z",
      },
      error: null,
    });

    await expect(getPrivacySettings()).resolves.toEqual({
      showOnlineStatus: true,
      showDistance: false,
      readReceipts: true,
      profileVisible: false,
      updatedAt: "2026-06-10T13:00:00.000Z",
    });
    expect(supabase.rpc).toHaveBeenCalledWith("get_privacy_settings");
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("falls back to default values when the RPC returns no row", async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: null,
      error: null,
    });

    await expect(getPrivacySettings()).resolves.toEqual(
      DEFAULT_PRIVACY_SETTINGS,
    );
  });

  it("saves privacy settings through the hardened RPC", async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: {
        show_online_status: false,
        show_distance: true,
        read_receipts: false,
        profile_visible: true,
        updated_at: "2026-06-10T13:10:00.000Z",
      },
      error: null,
    });

    const result = await savePrivacySettings({
      showOnlineStatus: false,
      showDistance: true,
      readReceipts: false,
      profileVisible: true,
    });

    expect(result).toEqual({
      showOnlineStatus: false,
      showDistance: true,
      readReceipts: false,
      profileVisible: true,
      updatedAt: "2026-06-10T13:10:00.000Z",
    });
    expect(supabase.rpc).toHaveBeenCalledWith("save_privacy_settings", {
      p_show_online_status: false,
      p_show_distance: true,
      p_read_receipts: false,
      p_profile_visible: true,
    });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("uses a sign-in message when Supabase reports an auth failure", async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: "JWT expired" },
    });

    await expect(getPrivacySettings()).rejects.toThrow(
      "Please sign in again before changing privacy settings.",
    );
  });
});
