import { supabase } from "@/src/config/supabase";
import { getPreferences, savePreferences } from "../preferencesApi";

jest.mock("@/src/config/supabase", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

function createQueryMock(result: unknown) {
  return {
    update: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(result),
  };
}

describe("preferencesApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("saves preferences to the canonical discovery columns and legacy compatibility columns", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });
    const query = createQueryMock({ data: null, error: null });
    query.eq.mockResolvedValue({ error: null });
    (supabase.from as jest.Mock).mockReturnValue(query);

    await savePreferences({
      ageMin: 24,
      ageMax: 36,
      maxDistanceKm: 80,
      relationshipGoal: "serious_relationship",
      userType: "foreigner",
    });

    expect(supabase.from).toHaveBeenCalledWith("profiles");
    expect(query.update).toHaveBeenCalledWith({
      interested_in: "Women",
      age_min: 24,
      age_max: 36,
      max_distance_km: 80,
      looking_for_gender: "female",
      age_preference_min: 24,
      age_preference_max: 36,
      distance_preference_km: 80,
      relationship_goal: "serious_relationship",
      preferences_completed: true,
    });
    expect(query.eq).toHaveBeenCalledWith("id", "user-123");
  });

  it("normalizes numeric preferences and relationship goal before saving", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });
    const query = createQueryMock({ data: null, error: null });
    query.eq.mockResolvedValue({ error: null });
    (supabase.from as jest.Mock).mockReturnValue(query);

    await savePreferences({
      ageMin: 24.8,
      ageMax: 36.2,
      maxDistanceKm: 80.9,
      relationshipGoal: " marriage ",
      userType: "filipina",
    });

    expect(query.update).toHaveBeenCalledWith(
      expect.objectContaining({
        interested_in: "Men",
        looking_for_gender: "male",
        age_preference_min: 24,
        age_preference_max: 36,
        distance_preference_km: 80,
        relationship_goal: "marriage",
      }),
    );
  });

  it("rejects invalid preference payloads before profile update", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    await expect(
      savePreferences({
        ageMin: 17,
        ageMax: 36,
        maxDistanceKm: 80,
        relationshipGoal: "marriage",
        userType: "filipina",
      }),
    ).rejects.toThrow("Check your match preferences and try again.");

    await expect(
      savePreferences({
        ageMin: 40,
        ageMax: 36,
        maxDistanceKm: 80,
        relationshipGoal: "marriage",
        userType: "filipina",
      }),
    ).rejects.toThrow("Check your match preferences and try again.");

    await expect(
      savePreferences({
        ageMin: 24,
        ageMax: 36,
        maxDistanceKm: 1000,
        relationshipGoal: "marriage",
        userType: "filipina",
      }),
    ).rejects.toThrow("Check your match preferences and try again.");

    await expect(
      savePreferences({
        ageMin: 24,
        ageMax: 36,
        maxDistanceKm: 80,
        relationshipGoal: "unsupported",
        userType: "filipina",
      }),
    ).rejects.toThrow("Check your match preferences and try again.");

    await expect(
      savePreferences({
        ageMin: 24,
        ageMax: 36,
        maxDistanceKm: 80,
        relationshipGoal: "marriage",
        userType: "admin" as never,
      }),
    ).rejects.toThrow("Check your match preferences and try again.");

    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("loads canonical discovery preference values before legacy fallback values", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });
    const query = createQueryMock({
      data: {
        interested_in: "Women",
        age_min: 18,
        age_max: 60,
        max_distance_km: 200,
        age_preference_min: 25,
        age_preference_max: 38,
        distance_preference_km: 90,
        relationship_goal: "marriage",
        user_type: "foreigner",
        created_at: "2026-06-10T12:00:00.000Z",
      },
      error: null,
    });
    (supabase.from as jest.Mock).mockReturnValue(query);

    await expect(getPreferences()).resolves.toEqual({
      interestedIn: "Women",
      ageMin: 25,
      ageMax: 38,
      maxDistanceKm: 90,
      relationshipGoal: "marriage",
      userType: "foreigner",
      createdAt: "2026-06-10T12:00:00.000Z",
    });
  });
});
