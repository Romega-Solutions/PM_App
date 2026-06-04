// src/features/profile/api/__tests__/profileApi.test.ts
//
// Tests for the two functions relocated from ProfileScreen:
//   - getProfileScreenData  (session check + profiles table query)
//   - signOutUser           (supabase.auth.signOut)
//
// Pattern mirrors src/features/matching/api/__tests__/matchingApi.test.ts.

import { supabase } from "@/src/config/supabase";
import { getProfileScreenData, signOutUser } from "../profileApi";

// ---------------------------------------------------------------------------
// Mock the Supabase client
// ---------------------------------------------------------------------------
jest.mock("@/src/config/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const mockSession = (userId: string | null) => {
  (supabase.auth.getSession as jest.Mock).mockResolvedValue({
    data: {
      session: userId ? { user: { id: userId } } : null,
    },
  });
};

const mockProfileRow = (data: object | null, error: object | null = null) => {
  (supabase.from as jest.Mock).mockReturnValue({
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data, error }),
      }),
    }),
  });
};

// ---------------------------------------------------------------------------
// getProfileScreenData
// ---------------------------------------------------------------------------
describe("getProfileScreenData", () => {
  const userId = "user-abc-123";

  const mockRow = {
    id: userId,
    email: "maria@example.com",
    first_name: "Maria",
    last_name: "Santos",
    age: 26,
    user_type: "filipina",
    gender: "female",
    location_name: "Cebu City",
    photos: ["https://cdn.example.com/photo1.jpg"],
    is_verified: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Success cases", () => {
    it("returns the profile row when authenticated and row exists", async () => {
      mockSession(userId);
      mockProfileRow(mockRow);

      const result = await getProfileScreenData();

      expect(result).toEqual(mockRow);
    });

    it("returns null when there is no active session", async () => {
      mockSession(null);

      const result = await getProfileScreenData();

      expect(result).toBeNull();
      // supabase.from must NOT be called when unauthenticated
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it("queries exactly the expected columns and table", async () => {
      mockSession(userId);
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockRow, error: null }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      await getProfileScreenData();

      expect(supabase.from).toHaveBeenCalledWith("profiles");
      expect(mockSelect).toHaveBeenCalledWith(
        "id, email, first_name, last_name, age, user_type, gender, location_name, photos, is_verified, interested_in, relationship_goal, age_min, age_max, max_distance_km",
      );
    });

    it("filters by the authenticated user's id", async () => {
      mockSession(userId);
      const mockEq = jest.fn().mockReturnValue({
        single: jest
          .fn()
          .mockResolvedValue({ data: mockRow, error: null }),
      });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      await getProfileScreenData();

      expect(mockEq).toHaveBeenCalledWith("id", userId);
    });
  });

  describe("Error cases", () => {
    it("throws when the database returns an error", async () => {
      mockSession(userId);
      mockProfileRow(null, { message: "relation does not exist", code: "42P01" });

      await expect(getProfileScreenData()).rejects.toThrow(
        "relation does not exist",
      );
    });

    it("throws with a generic message when the error message is empty", async () => {
      mockSession(userId);
      mockProfileRow(null, { message: "" });

      // Should still throw (message may be empty but an Error is thrown)
      await expect(getProfileScreenData()).rejects.toThrow();
    });

    it("propagates unexpected errors thrown by getSession", async () => {
      (supabase.auth.getSession as jest.Mock).mockRejectedValue(
        new Error("Network failure"),
      );

      await expect(getProfileScreenData()).rejects.toThrow("Network failure");
    });

    it("propagates unexpected errors thrown by supabase.from", async () => {
      mockSession(userId);
      (supabase.from as jest.Mock).mockImplementation(() => {
        throw new Error("Unexpected SDK error");
      });

      await expect(getProfileScreenData()).rejects.toThrow(
        "Unexpected SDK error",
      );
    });
  });

  describe("Edge cases", () => {
    it("handles a profile with an empty photos array", async () => {
      mockSession(userId);
      mockProfileRow({ ...mockRow, photos: [] });

      const result = await getProfileScreenData();

      expect(result?.photos).toEqual([]);
    });

    it("handles a profile with null optional fields", async () => {
      mockSession(userId);
      const sparseRow = {
        id: userId,
        email: "sparse@example.com",
        first_name: null,
        last_name: null,
        age: null,
        user_type: null,
        gender: null,
        location_name: null,
        photos: null,
        is_verified: null,
      };
      mockProfileRow(sparseRow);

      const result = await getProfileScreenData();

      expect(result).toEqual(sparseRow);
    });
  });
});

// ---------------------------------------------------------------------------
// signOutUser
// ---------------------------------------------------------------------------
describe("signOutUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Success cases", () => {
    it("resolves without error when sign-out succeeds", async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null });

      await expect(signOutUser()).resolves.toBeUndefined();
    });

    it("calls supabase.auth.signOut exactly once", async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null });

      await signOutUser();

      expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
    });
  });

  describe("Error cases", () => {
    it("throws when Supabase returns a sign-out error", async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: { message: "Session expired" },
      });

      await expect(signOutUser()).rejects.toThrow("Session expired");
    });

    it("propagates an unexpected exception from signOut", async () => {
      (supabase.auth.signOut as jest.Mock).mockRejectedValue(
        new Error("Network unreachable"),
      );

      await expect(signOutUser()).rejects.toThrow("Network unreachable");
    });
  });
});
