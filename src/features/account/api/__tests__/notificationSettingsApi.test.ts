import { supabase } from "@/src/config/supabase";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  getNotificationPreferences,
  saveNotificationPreferences,
} from "../notificationSettingsApi";

jest.mock("@/src/config/supabase", () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

describe("notificationSettingsApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads notification preferences through the RPC with launch-safe defaults", async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: {
        push_enabled: true,
        new_matches: true,
        new_messages: false,
        new_likes: true,
        email_updates: false,
        updated_at: "2026-06-11T12:30:00.000Z",
      },
      error: null,
    });

    await expect(getNotificationPreferences()).resolves.toEqual({
      pushEnabled: true,
      newMatches: true,
      newMessages: false,
      newLikes: true,
      emailUpdates: false,
      updatedAt: "2026-06-11T12:30:00.000Z",
    });
    expect(supabase.rpc).toHaveBeenCalledWith("get_notification_preferences");
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("falls back to default values when the RPC returns no row", async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: null,
      error: null,
    });

    await expect(getNotificationPreferences()).resolves.toEqual(
      DEFAULT_NOTIFICATION_PREFERENCES,
    );
  });

  it("saves notification preferences through the hardened RPC", async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: {
        push_enabled: false,
        new_matches: false,
        new_messages: false,
        new_likes: false,
        email_updates: true,
        updated_at: "2026-06-11T12:35:00.000Z",
      },
      error: null,
    });

    const result = await saveNotificationPreferences({
      pushEnabled: false,
      newMatches: true,
      newMessages: true,
      newLikes: true,
      emailUpdates: true,
    });

    expect(result).toEqual({
      pushEnabled: false,
      newMatches: false,
      newMessages: false,
      newLikes: false,
      emailUpdates: true,
      updatedAt: "2026-06-11T12:35:00.000Z",
    });
    expect(supabase.rpc).toHaveBeenCalledWith("save_notification_preferences", {
      p_push_enabled: false,
      p_new_matches: false,
      p_new_messages: false,
      p_new_likes: false,
      p_email_updates: true,
    });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("normalizes loaded child push preferences off when push is disabled", async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: {
        push_enabled: false,
        new_matches: true,
        new_messages: true,
        new_likes: true,
        email_updates: true,
      },
      error: null,
    });

    await expect(getNotificationPreferences()).resolves.toEqual({
      pushEnabled: false,
      newMatches: false,
      newMessages: false,
      newLikes: false,
      emailUpdates: true,
      updatedAt: undefined,
    });
  });
});
