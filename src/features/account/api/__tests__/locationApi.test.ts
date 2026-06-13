import { supabase } from "@/src/config/supabase";
import { saveLocation } from "../locationApi";

jest.mock("@/src/config/supabase", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

function mockProfileUpdate(error: unknown = null) {
  const eq = jest.fn().mockResolvedValue({ error });
  const update = jest.fn(() => ({ eq }));

  (supabase.from as jest.Mock).mockReturnValue({ update });

  return { eq, update };
}

describe("locationApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });
  });

  it("saves normalized location data to the signed-in profile", async () => {
    const { eq, update } = mockProfileUpdate();

    const result = await saveLocation({
      locationType: "manual",
      locationName: ` ${"Makati ".repeat(30)} `,
      coordinates: { lat: 14.5547, lng: 121.0244 },
      timestamp: "client-time",
    });

    expect(result.ok).toBe(true);
    expect(result.data.locationName).toBe("Makati ".repeat(30).trim().slice(0, 120));
    expect(result.data.coordinates).toEqual({ lat: 14.5547, lng: 121.0244 });
    expect(supabase.from).toHaveBeenCalledWith("profiles");
    expect(update).toHaveBeenCalledWith({
      location_type: "manual",
      location_name: "Makati ".repeat(30).trim().slice(0, 120),
      location_coordinates: { lat: 14.5547, lng: 121.0244 },
      location_timestamp: expect.any(String),
      location_completed: true,
    });
    expect(eq).toHaveBeenCalledWith("id", "user-123");
  });

  it("rejects invalid location payloads before updating profiles", async () => {
    await expect(
      saveLocation({
        locationType: "manual",
        locationName: "   ",
        coordinates: null,
        timestamp: "client-time",
      }),
    ).rejects.toThrow("Check your location and try again.");

    await expect(
      saveLocation({
        locationType: "manual",
        locationName: "Manila",
        coordinates: { lat: 91, lng: 121 },
        timestamp: "client-time",
      }),
    ).rejects.toThrow("Check your location and try again.");

    await expect(
      saveLocation({
        locationType: "precise" as never,
        locationName: "Manila",
        coordinates: null,
        timestamp: "client-time",
      }),
    ).rejects.toThrow("Check your location and try again.");

    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("throws before saving when the user is not authenticated", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: null,
    });

    await expect(
      saveLocation({
        locationType: "manual",
        locationName: "Manila",
        coordinates: null,
        timestamp: "client-time",
      }),
    ).rejects.toThrow("Please sign in before saving your location.");

    expect(supabase.from).not.toHaveBeenCalled();
  });
});
