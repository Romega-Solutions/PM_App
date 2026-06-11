import { supabase } from "@/src/config/supabase";
import { ensureUserProfile } from "../ensureUserProfile";

jest.mock("@/src/config/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe("ensureUserProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function mockExistingProfile(result: unknown) {
    const single = jest.fn().mockResolvedValue(result);
    const eq = jest.fn().mockReturnValue({ single });
    const select = jest.fn().mockReturnValue({ eq });

    (supabase.from as jest.Mock).mockReturnValueOnce({ select });

    return { select, eq, single };
  }

  function mockInsertProfile(result: unknown) {
    const single = jest.fn().mockResolvedValue(result);
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });

    (supabase.from as jest.Mock).mockReturnValueOnce({ insert });

    return { insert, select, single };
  }

  it("returns the existing profile without inserting", async () => {
    const existingProfile = {
      id: "user-123",
      user_type: "filipina",
      first_name: "Maria",
      basic_info_completed: true,
      photos_completed: false,
      location_completed: false,
      preferences_completed: false,
    };

    const existing = mockExistingProfile({
      data: existingProfile,
      error: null,
    });

    const result = await ensureUserProfile({
      userId: "user-123",
      email: "maria@example.com",
      userType: "filipina",
      firstName: "Maria",
    });

    expect(result).toEqual(existingProfile);
    expect(supabase.from).toHaveBeenCalledTimes(1);
    expect(supabase.from).toHaveBeenCalledWith("profiles");
    expect(existing.eq).toHaveBeenCalledWith("id", "user-123");
  });

  it("creates a missing profile with safe defaults and no server-owned fields", async () => {
    const createdProfile = {
      id: "user-456",
      user_type: "foreigner",
      first_name: "",
      basic_info_completed: false,
      photos_completed: false,
      location_completed: false,
      preferences_completed: false,
    };

    mockExistingProfile({
      data: null,
      error: { code: "PGRST116", message: "No rows found" },
    });

    const inserted = mockInsertProfile({
      data: createdProfile,
      error: null,
    });

    const result = await ensureUserProfile({
      userId: "user-456",
      email: null,
      userType: "unexpected",
      firstName: null,
    });

    expect(result).toEqual(createdProfile);
    expect(supabase.from).toHaveBeenCalledTimes(2);
    expect(inserted.insert).toHaveBeenCalledWith({
      id: "user-456",
      email: null,
      first_name: "",
      user_type: "foreigner",
      gender: "male",
      looking_for_gender: "female",
      age_preference_min: 18,
      age_preference_max: 70,
    });

    const payload = inserted.insert.mock.calls[0][0];
    expect(payload).not.toHaveProperty("is_verified");
    expect(payload).not.toHaveProperty("verification_status");
    expect(payload).not.toHaveProperty("verified_at");
  });

  it("throws profile fetch errors other than missing rows", async () => {
    const fetchError = { code: "42501", message: "permission denied" };

    mockExistingProfile({
      data: null,
      error: fetchError,
    });

    await expect(
      ensureUserProfile({
        userId: "user-789",
      })
    ).rejects.toBe(fetchError);

    expect(supabase.from).toHaveBeenCalledTimes(1);
  });

  it("throws insert errors when profile creation fails", async () => {
    const insertError = { code: "23505", message: "duplicate key" };

    mockExistingProfile({
      data: null,
      error: { code: "PGRST116", message: "No rows found" },
    });

    mockInsertProfile({
      data: null,
      error: insertError,
    });

    await expect(
      ensureUserProfile({
        userId: "user-999",
        email: "user@example.com",
        userType: "filipina",
        firstName: "Ana",
      })
    ).rejects.toBe(insertError);
  });
});
