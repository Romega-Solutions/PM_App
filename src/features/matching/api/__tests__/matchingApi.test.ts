// src/features/matching/api/__tests__/matchingApi.test.ts
import { supabase } from "@/src/config/supabase";
import {
  fetchDiscoverProfiles,
  getMatches,
  likeProfile,
  passProfile,
  superLikeProfile,
  undoLastSwipe,
} from "../matchingApi";

// Mock Supabase client
jest.mock("@/src/config/supabase", () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

function createQueryMock<T>(response: T) {
  const query: any = {
    select: jest.fn(() => query),
    eq: jest.fn(() => query),
    not: jest.fn(() => query),
    gte: jest.fn(() => query),
    lte: jest.fn(() => query),
    limit: jest.fn(() => query),
    single: jest.fn(() => Promise.resolve(response)),
    then: (onFulfilled: any, onRejected: any) =>
      Promise.resolve(response).then(onFulfilled, onRejected),
  };

  return query;
}

describe("fetchDiscoverProfiles", () => {
  const mockUserId = "user-123";

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("reads candidates from discoverable_profiles and applies privacy filters", async () => {
    const logSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => undefined);
    const currentUser = {
      id: mockUserId,
      first_name: "John",
      age: 32,
      gender: "male",
      user_type: "foreigner",
      relationship_goal: "marriage",
      interests: ["Travel", "Food"],
      languages: ["English", "Tagalog"],
      city: "Manila",
      country: "Philippines",
      looking_for_gender: "female",
      age_preference_min: 24,
      age_preference_max: 35,
      is_verified: true,
      is_active: true,
    };
    const safeCandidates = [
      {
        id: "candidate-strong",
        first_name: "Maria",
        age: 29,
        gender: "female",
        user_type: "filipina",
        relationship_goal: "marriage",
        interests: ["Travel", "Food"],
        languages: ["English", "Tagalog"],
        city: "Manila",
        country: "Philippines",
        is_verified: true,
        is_active: true,
        last_active_at: new Date().toISOString(),
      },
      {
        id: "candidate-weaker",
        first_name: "Ana",
        age: 34,
        gender: "female",
        user_type: "filipina",
        relationship_goal: "dating",
        interests: ["Books"],
        languages: ["Tagalog"],
        city: "Cebu",
        country: "Philippines",
        is_verified: false,
        is_active: true,
      },
    ];

    const currentUserQuery = createQueryMock({
      data: currentUser,
      error: null,
    });
    const likedQuery = createQueryMock({
      data: [{ to_user_id: "liked-1" }],
      error: null,
    });
    const passedQuery = createQueryMock({
      data: [{ to_user_id: "passed-1" }],
      error: null,
    });
    const discoverableQuery = createQueryMock({
      data: safeCandidates,
      error: null,
    });

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === "profiles") return currentUserQuery;
      if (table === "likes") return likedQuery;
      if (table === "passes") return passedQuery;
      if (table === "discoverable_profiles") return discoverableQuery;
      throw new Error(`Unexpected table: ${table}`);
    });

    const result = await fetchDiscoverProfiles(mockUserId, 1);

    expect(result.error).toBeNull();
    expect(result.data).toHaveLength(1);
    expect(result.data?.[0].id).toBe("candidate-strong");
    expect(result.data?.[0].matchScore).toBeGreaterThan(
      result.data?.[1]?.matchScore ?? 0,
    );
    expect(supabase.from).toHaveBeenCalledWith("discoverable_profiles");
    expect(discoverableQuery.select).toHaveBeenCalledWith(
      expect.not.stringContaining("email"),
    );
    expect(discoverableQuery.eq).toHaveBeenCalledWith("user_type", "filipina");
    expect(discoverableQuery.eq).toHaveBeenCalledWith("is_verified", true);
    expect(discoverableQuery.eq).toHaveBeenCalledWith("is_active", true);
    expect(discoverableQuery.eq).toHaveBeenCalledWith("gender", "female");
    expect(discoverableQuery.gte).toHaveBeenCalledWith("age", 24);
    expect(discoverableQuery.lte).toHaveBeenCalledWith("age", 35);
    expect(discoverableQuery.not).toHaveBeenCalledWith(
      "id",
      "in",
      "(liked-1,passed-1,user-123)",
    );
    expect(discoverableQuery.limit).toHaveBeenCalledWith(3);
    logSpy.mockRestore();
  });

  it("returns an empty list when the safe discovery view has no candidates", async () => {
    const currentUserQuery = createQueryMock({
      data: {
        id: mockUserId,
        user_type: "filipina",
        looking_for_gender: "male",
        is_verified: true,
        is_active: true,
      },
      error: null,
    });
    const likedQuery = createQueryMock({ data: [], error: null });
    const passedQuery = createQueryMock({ data: [], error: null });
    const discoverableQuery = createQueryMock({ data: [], error: null });

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === "profiles") return currentUserQuery;
      if (table === "likes") return likedQuery;
      if (table === "passes") return passedQuery;
      if (table === "discoverable_profiles") return discoverableQuery;
      throw new Error(`Unexpected table: ${table}`);
    });

    const result = await fetchDiscoverProfiles(mockUserId);

    expect(result).toEqual({ data: [], error: null });
    expect(supabase.from).toHaveBeenCalledWith("discoverable_profiles");
  });

  it("does not query discovery candidates when the current profile cannot be loaded", async () => {
    const currentUserQuery = createQueryMock({
      data: null,
      error: { message: "Profile not found" },
    });

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === "profiles") return currentUserQuery;
      throw new Error(`Unexpected table: ${table}`);
    });

    const result = await fetchDiscoverProfiles(mockUserId);

    expect(result.data).toBeNull();
    expect(result.error).toEqual({ message: "Profile not found" });
    expect(supabase.from).not.toHaveBeenCalledWith("discoverable_profiles");
  });

  it("does not query discovery candidates before launch review approval", async () => {
    const currentUserQuery = createQueryMock({
      data: {
        id: mockUserId,
        user_type: "filipina",
        looking_for_gender: "male",
        is_verified: false,
        is_active: true,
      },
      error: null,
    });

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === "profiles") return currentUserQuery;
      throw new Error(`Unexpected table: ${table}`);
    });

    const result = await fetchDiscoverProfiles(mockUserId);

    expect(result).toEqual({ data: [], error: null });
    expect(supabase.from).not.toHaveBeenCalledWith("discoverable_profiles");
  });
});

describe("likeProfile", () => {
  const mockFromUserId = "user-123";
  const mockToUserId = "user-456";

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("calls the hardened like_profile RPC and returns a non-match", async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: {
        success: true,
        is_match: false,
        matched_profile: null,
        error: null,
      },
      error: null,
    });

    const result = await likeProfile(mockFromUserId, mockToUserId);

    expect(result).toEqual({ success: true, isMatch: false });
    expect(supabase.rpc).toHaveBeenCalledWith("like_profile", {
      p_to_user_id: mockToUserId,
    });
    expect(supabase.from).not.toHaveBeenCalledWith("likes");
  });

  it("returns matched profile data from the hardened RPC", async () => {
    const mockMatchedProfile = {
      id: mockToUserId,
      first_name: "Maria",
      age: 25,
      gender: "female",
      user_type: "filipina",
    };

    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: {
        success: true,
        is_match: true,
        matched_profile: mockMatchedProfile,
        error: null,
      },
      error: null,
    });

    const result = await likeProfile(mockFromUserId, mockToUserId);

    expect(result.success).toBe(true);
    expect(result.isMatch).toBe(true);
    expect(result.matchedProfile).toEqual(mockMatchedProfile);
  });

  it("handles RPC-level database errors", async () => {
    const mockError = {
      message: "Database connection failed",
      code: "PGRST500",
    };

    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: null,
      error: mockError,
    });

    const result = await likeProfile(mockFromUserId, mockToUserId);

    expect(result.success).toBe(false);
    expect(result.error).toBe(
      "Like did not send. Check your connection and try again.",
    );
  });

  it("handles RPC business-rule errors", async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: {
        success: false,
        is_match: false,
        matched_profile: null,
        error: "This member is unavailable because of a safety setting",
      },
      error: null,
    });

    const result = await likeProfile(mockFromUserId, mockToUserId);

    expect(result.success).toBe(false);
    expect(result.error).toBe(
      "Like did not send. Check your connection and try again.",
    );
  });

  it("handles exception thrown during like process", async () => {
    const errorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const networkError = new Error("Network error");
    (supabase.rpc as jest.Mock).mockRejectedValue(networkError);

    const result = await likeProfile(mockFromUserId, mockToUserId);

    expect(result.success).toBe(false);
    expect(result.error).toBe(
      "Like did not send. Check your connection and try again.",
    );
    expect(errorSpy).toHaveBeenCalledWith("Error liking profile.");
    errorSpy.mockRestore();
  });

  it("rejects empty user IDs before calling the RPC", async () => {
    const result = await likeProfile("", mockToUserId);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Choose a member to like.");
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("rejects same-user likes before calling the RPC", async () => {
    const result = await likeProfile(mockFromUserId, mockFromUserId);

    expect(result.success).toBe(false);
    expect(result.error).toBe("You cannot like yourself.");
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});
describe("passProfile", () => {
  const mockFromUserId = "user-123";
  const mockToUserId = "user-456";

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should successfully pass a profile", async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({ data: true, error: null });

    const result = await passProfile(mockFromUserId, mockToUserId);

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    expect(supabase.rpc).toHaveBeenCalledWith("pass_profile", {
      p_to_user_id: mockToUserId,
    });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("should handle database error when passing", async () => {
    const mockError = { message: "Database error" };

    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: null,
      error: mockError,
    });

    const result = await passProfile(mockFromUserId, mockToUserId);

    expect(result.success).toBe(false);
    expect(result.error).toBe(
      "Pass did not save. Check your connection and try again.",
    );
  });

  it("should treat duplicate passes as idempotent RPC success", async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({ data: true, error: null });

    const result = await passProfile(mockFromUserId, mockToUserId);

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should reject empty user IDs before inserting a pass", async () => {
    const result = await passProfile(mockFromUserId, "");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Choose a member to pass.");
    expect(supabase.from).not.toHaveBeenCalled();
  });
});

describe("getMatches", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("omits matches whose profile is no longer discoverable", async () => {
    const likes = [
      {
        id: "like-visible",
        from_user_id: "user-123",
        to_user_id: "visible-match",
        matched_at: "2026-06-10T10:00:00.000Z",
        created_at: "2026-06-10T09:00:00.000Z",
      },
      {
        id: "like-hidden",
        from_user_id: "user-123",
        to_user_id: "hidden-match",
        matched_at: "2026-06-10T11:00:00.000Z",
        created_at: "2026-06-10T09:30:00.000Z",
      },
    ];
    const visibleProfile = {
      id: "visible-match",
      first_name: "Maria",
      age: 28,
      gender: "female",
      user_type: "filipina",
      photos: [],
    };
    const likesQuery: any = {
      select: jest.fn(() => likesQuery),
      eq: jest.fn(() => likesQuery),
      or: jest.fn(() => likesQuery),
      order: jest.fn().mockResolvedValue({ data: likes, error: null }),
    };
    const profilesQuery: any = {
      select: jest.fn(() => profilesQuery),
      in: jest.fn().mockResolvedValue({ data: [visibleProfile], error: null }),
    };

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === "likes") return likesQuery;
      if (table === "discoverable_profiles") return profilesQuery;
      throw new Error(`Unexpected table: ${table}`);
    });

    const result = await getMatches("user-123");

    expect(result.error).toBeNull();
    expect(result.data).toEqual([
      {
        id: "like-visible",
        profile: visibleProfile,
        matched_at: "2026-06-10T10:00:00.000Z",
        is_mutual: true,
      },
    ]);
    expect(profilesQuery.in).toHaveBeenCalledWith("id", [
      "visible-match",
      "hidden-match",
    ]);
  });
});

describe("superLikeProfile", () => {
  const mockFromUserId = "user-123";
  const mockToUserId = "user-456";

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("uses the same hardened RPC path as a regular like", async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: {
        success: true,
        is_match: false,
        matched_profile: null,
        error: null,
      },
      error: null,
    });

    const result = await superLikeProfile(mockFromUserId, mockToUserId);

    expect(result).toEqual({ success: true, isMatch: false });
    expect(supabase.rpc).toHaveBeenCalledWith("like_profile", {
      p_to_user_id: mockToUserId,
    });
  });

  it("returns match details from the hardened RPC", async () => {
    const mockProfile = { id: mockToUserId, first_name: "Sofia" };

    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: {
        success: true,
        is_match: true,
        matched_profile: mockProfile,
        error: null,
      },
      error: null,
    });

    const result = await superLikeProfile(mockFromUserId, mockToUserId);

    expect(result.success).toBe(true);
    expect(result.isMatch).toBe(true);
    expect(result.matchedProfile).toEqual(mockProfile);
  });
});

describe("undoLastSwipe", () => {
  const mockUserId = "user-123";

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("uses the hardened undo_last_swipe RPC instead of direct deletes", async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });

    const result = await undoLastSwipe(mockUserId);

    expect(result).toEqual({ success: true });
    expect(supabase.rpc).toHaveBeenCalledWith("undo_last_swipe");
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("rejects missing user IDs before calling the RPC", async () => {
    const result = await undoLastSwipe("");

    expect(result).toEqual({
      success: false,
      error: "Sign in before undoing a swipe.",
    });
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});
