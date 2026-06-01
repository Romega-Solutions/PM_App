// src/features/matching/api/__tests__/matchingApi.test.ts
import { supabase } from "@/src/config/supabase";
import {
  getCurrentUser,
  likeProfile,
  passProfile,
  superLikeProfile,
} from "../matchingApi";

// Mock Supabase client — includes both `from` (table queries) and `auth`
jest.mock("@/src/config/supabase", () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  },
}));

describe("likeProfile", () => {
  const mockFromUserId = "user-123";
  const mockToUserId = "user-456";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("✅ Success Cases", () => {
    it("should successfully like a profile without match", async () => {
      const mockLike = {
        id: "like-123",
        from_user_id: mockFromUserId,
        to_user_id: mockToUserId,
        is_match: false,
        created_at: new Date().toISOString(),
      };

      // Mock insert like
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockLike,
            error: null,
          }),
        }),
      });

      // Mock check for mutual like (none exists)
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: "PGRST116" }, // Not found
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === "likes") {
          return {
            insert: mockInsert,
            select: mockSelect,
          };
        }
      });

      const result = await likeProfile(mockFromUserId, mockToUserId);

      expect(result.success).toBe(true);
      expect(result.isMatch).toBe(false);
      expect(result.matchedProfile).toBeUndefined();
    });

    it("should create a match when mutual like exists", async () => {
      const mockNewLike = {
        id: "like-123",
        from_user_id: mockFromUserId,
        to_user_id: mockToUserId,
        is_match: false,
      };

      const mockMutualLike = {
        id: "like-456",
        from_user_id: mockToUserId,
        to_user_id: mockFromUserId,
        is_match: false,
      };

      const mockMatchedProfile = {
        id: mockToUserId,
        first_name: "Maria",
        age: 25,
        gender: "female",
        user_type: "filipina",
      };

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === "likes") {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockNewLike,
                  error: null,
                }),
              }),
            }),
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: mockMutualLike,
                    error: null,
                  }),
                }),
              }),
            }),
            update: mockUpdate,
          };
        } else if (table === "profiles") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockMatchedProfile,
                  error: null,
                }),
              }),
            }),
          };
        }
      });

      const result = await likeProfile(mockFromUserId, mockToUserId);

      expect(result.success).toBe(true);
      expect(result.isMatch).toBe(true);
      expect(result.matchedProfile).toEqual(mockMatchedProfile);
      expect(mockUpdate).toHaveBeenCalledTimes(2); // Both likes updated
    });
  });

  describe("❌ Error Cases", () => {
    it("should handle database error when inserting like", async () => {
      const mockError = {
        message: "Database connection failed",
        code: "PGRST500",
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      const result = await likeProfile(mockFromUserId, mockToUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError.message);
    });

    it("should handle duplicate like error gracefully", async () => {
      const duplicateError = {
        message:
          'duplicate key value violates unique constraint "likes_from_user_id_to_user_id_key"',
        code: "23505",
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: duplicateError,
            }),
          }),
        }),
      });

      const result = await likeProfile(mockFromUserId, mockToUserId);

      expect(result.success).toBe(false);
      expect(result.error).toContain("duplicate");
    });

    it("should handle exception thrown during like process", async () => {
      (supabase.from as jest.Mock).mockImplementation(() => {
        throw new Error("Network error");
      });

      const result = await likeProfile(mockFromUserId, mockToUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error");
    });
  });

  describe("🔍 Edge Cases", () => {
    it("should handle empty user IDs", async () => {
      const result = await likeProfile("", mockToUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should handle same user liking themselves", async () => {
      const sameUserId = "user-123";

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: {
                message: "Cannot like yourself",
                code: "CHECK_VIOLATION",
              },
            }),
          }),
        }),
      });

      const result = await likeProfile(sameUserId, sameUserId);

      expect(result.success).toBe(false);
    });

    it("should handle null profile data when match is created", async () => {
      const mockNewLike = {
        id: "like-123",
        from_user_id: mockFromUserId,
        to_user_id: mockToUserId,
      };
      const mockMutualLike = {
        id: "like-456",
        from_user_id: mockToUserId,
        to_user_id: mockFromUserId,
      };

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === "likes") {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest
                  .fn()
                  .mockResolvedValue({ data: mockNewLike, error: null }),
              }),
            }),
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest
                    .fn()
                    .mockResolvedValue({ data: mockMutualLike, error: null }),
                }),
              }),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: null, error: null }),
            }),
          };
        } else if (table === "profiles") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest
                  .fn()
                  .mockResolvedValue({ data: null, error: null }), // Profile not found
              }),
            }),
          };
        }
      });

      const result = await likeProfile(mockFromUserId, mockToUserId);

      expect(result.success).toBe(true);
      expect(result.isMatch).toBe(true);
      expect(result.matchedProfile).toBeUndefined(); // Should handle gracefully
    });

    it("should handle UUID format validation", async () => {
      const invalidUUID = "not-a-valid-uuid";

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: {
                message: "invalid input syntax for type uuid",
                code: "22P02",
              },
            }),
          }),
        }),
      });

      const result = await likeProfile(invalidUUID, mockToUserId);

      expect(result.success).toBe(false);
      expect(result.error).toContain("uuid");
    });
  });

  describe("🔄 Race Conditions", () => {
    it("should handle concurrent mutual likes", async () => {
      // Simulate both users liking each other at the same time
      const mockLike1 = {
        id: "like-1",
        from_user_id: mockFromUserId,
        to_user_id: mockToUserId,
      };
      const mockLike2 = {
        id: "like-2",
        from_user_id: mockToUserId,
        to_user_id: mockFromUserId,
      };

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === "likes") {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest
                  .fn()
                  .mockResolvedValue({ data: mockLike1, error: null }),
              }),
            }),
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest
                    .fn()
                    .mockResolvedValue({ data: mockLike2, error: null }),
                }),
              }),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: null, error: null }),
            }),
          };
        } else if (table === "profiles") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { id: mockToUserId, first_name: "Maria" },
                  error: null,
                }),
              }),
            }),
          };
        }
      });

      const result = await likeProfile(mockFromUserId, mockToUserId);

      expect(result.success).toBe(true);
      expect(result.isMatch).toBe(true);
    });
  });
});

describe("passProfile", () => {
  const mockFromUserId = "user-123";
  const mockToUserId = "user-456";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully pass a profile", async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockResolvedValue({ data: null, error: null }),
    });

    const result = await passProfile(mockFromUserId, mockToUserId);

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should handle database error when passing", async () => {
    const mockError = { message: "Database error" };

    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockResolvedValue({ data: null, error: mockError }),
    });

    const result = await passProfile(mockFromUserId, mockToUserId);

    expect(result.success).toBe(false);
    expect(result.error).toBe(mockError.message);
  });

  it("should handle duplicate pass", async () => {
    const duplicateError = { message: "duplicate key", code: "23505" };

    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest
        .fn()
        .mockResolvedValue({ data: null, error: duplicateError }),
    });

    const result = await passProfile(mockFromUserId, mockToUserId);

    expect(result.success).toBe(false);
    expect(result.error).toContain("duplicate");
  });
});

describe("superLikeProfile", () => {
  const mockFromUserId = "user-123";
  const mockToUserId = "user-456";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully super like a profile without match", async () => {
    const mockLike = {
      id: "like-123",
      from_user_id: mockFromUserId,
      to_user_id: mockToUserId,
    };

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === "likes") {
        return {
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest
                .fn()
                .mockResolvedValue({ data: mockLike, error: null }),
            }),
          }),
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest
                  .fn()
                  .mockResolvedValue({
                    data: null,
                    error: { code: "PGRST116" },
                  }),
              }),
            }),
          }),
        };
      }
    });

    const result = await superLikeProfile(mockFromUserId, mockToUserId);

    expect(result.success).toBe(true);
    expect(result.isMatch).toBe(false);
  });

  it("should create match with super like when mutual like exists", async () => {
    const mockNewLike = { id: "like-123" };
    const mockMutualLike = { id: "like-456" };
    const mockProfile = { id: mockToUserId, first_name: "Sofia" };

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === "likes") {
        return {
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest
                .fn()
                .mockResolvedValue({ data: mockNewLike, error: null }),
            }),
          }),
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest
                  .fn()
                  .mockResolvedValue({ data: mockMutualLike, error: null }),
              }),
            }),
          }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
        };
      } else if (table === "profiles") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest
                .fn()
                .mockResolvedValue({ data: mockProfile, error: null }),
            }),
          }),
        };
      }
    });

    const result = await superLikeProfile(mockFromUserId, mockToUserId);

    expect(result.success).toBe(true);
    expect(result.isMatch).toBe(true);
    expect(result.matchedProfile).toEqual(mockProfile);
  });
});

// ---------------------------------------------------------------------------
// getCurrentUser
// ---------------------------------------------------------------------------

describe("getCurrentUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("✅ Success Cases", () => {
    it("should return the authenticated user when session is valid", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        aud: "authenticated",
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await getCurrentUser();

      expect(result.data).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it("should return null user with no error when session is missing (bypass flow)", async () => {
      const authSessionMissingError = {
        name: "AuthSessionMissingError",
        message: "Auth session missing!",
        status: 400,
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: authSessionMissingError,
      });

      const result = await getCurrentUser();

      // AuthSessionMissingError is surfaced as-is — callers decide how to handle
      expect(result.data).toBeNull();
      expect(result.error).toEqual(authSessionMissingError);
    });
  });

  describe("❌ Error Cases", () => {
    it("should return null data and the error on a generic auth error", async () => {
      const authError = {
        name: "AuthApiError",
        message: "Invalid JWT",
        status: 401,
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: authError,
      });

      const result = await getCurrentUser();

      expect(result.data).toBeNull();
      expect(result.error).toEqual(authError);
    });

    it("should catch a thrown exception and return { data: null, error }", async () => {
      const networkError = new Error("Network request failed");

      (supabase.auth.getUser as jest.Mock).mockRejectedValue(networkError);

      const result = await getCurrentUser();

      expect(result.data).toBeNull();
      expect(result.error).toBe(networkError);
    });
  });

  describe("🔍 Edge Cases", () => {
    it("should return null when supabase returns null user without error", async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await getCurrentUser();

      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
    });
  });
});
