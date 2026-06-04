// src/features/auth/api/__tests__/authApi.test.ts
//
// Tests for the functions added to authApi as part of the A3 refactor:
//   getVerifiedSession, refreshVerifiedSession, signInWithPasswordForVerification,
//   getSession, ensureProfile, plus the pre-existing resendVerificationEmail.
//
// Models the style of src/features/matching/api/__tests__/matchingApi.test.ts.

import { supabase } from "@/src/config/supabase";
import { authApi } from "../authApi";

// ---------------------------------------------------------------------------
// Mock Supabase client
// ---------------------------------------------------------------------------
jest.mock("@/src/config/supabase", () => ({
  getRedirectUrl: jest.fn(() => "https://example.com/redirect"),
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      resend: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      getSession: jest.fn(),
      refreshSession: jest.fn(),
    },
    from: jest.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const CONFIRMED_AT = "2026-06-02T00:00:00Z";

const makeSession = (emailConfirmedAt: string | null = CONFIRMED_AT) => ({
  user: {
    id: "user-123",
    email: "user@example.com",
    email_confirmed_at: emailConfirmedAt,
    user_metadata: { first_name: "Ana", user_type: "filipina" },
  },
});

// ---------------------------------------------------------------------------
// getVerifiedSession
// ---------------------------------------------------------------------------
describe("authApi.getVerifiedSession", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns AuthSession when email is confirmed", async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: makeSession() },
    });

    const result = await authApi.getVerifiedSession();

    expect(result).not.toBeNull();
    expect(result?.user.email_confirmed_at).toBe(CONFIRMED_AT);
    expect(result?.user.id).toBe("user-123");
  });

  it("returns null when email is not confirmed", async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: makeSession(null) },
    });

    const result = await authApi.getVerifiedSession();

    expect(result).toBeNull();
  });

  it("returns null when there is no session", async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
    });

    const result = await authApi.getVerifiedSession();

    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// refreshVerifiedSession
// ---------------------------------------------------------------------------
describe("authApi.refreshVerifiedSession", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns AuthSession when refreshed session has confirmed email", async () => {
    (supabase.auth.refreshSession as jest.Mock).mockResolvedValue({
      data: { session: makeSession() },
    });

    const result = await authApi.refreshVerifiedSession();

    expect(result).not.toBeNull();
    expect(result?.user.email_confirmed_at).toBe(CONFIRMED_AT);
  });

  it("returns null when refreshed session has unconfirmed email", async () => {
    (supabase.auth.refreshSession as jest.Mock).mockResolvedValue({
      data: { session: makeSession(null) },
    });

    const result = await authApi.refreshVerifiedSession();

    expect(result).toBeNull();
  });

  it("returns null when there is no refreshed session", async () => {
    (supabase.auth.refreshSession as jest.Mock).mockResolvedValue({
      data: { session: null },
    });

    const result = await authApi.refreshVerifiedSession();

    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// signInWithPasswordForVerification
// ---------------------------------------------------------------------------
describe("authApi.signInWithPasswordForVerification", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns AuthSession when sign-in succeeds and email is confirmed", async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { session: makeSession(), user: makeSession().user },
      error: null,
    });

    const result = await authApi.signInWithPasswordForVerification(
      "user@example.com",
      "Password1"
    );

    expect(result).not.toBeNull();
    expect(result?.user.email_confirmed_at).toBe(CONFIRMED_AT);
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "Password1",
    });
  });

  it("returns null when sign-in succeeds but email is not confirmed", async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { session: makeSession(null), user: makeSession(null).user },
      error: null,
    });

    const result = await authApi.signInWithPasswordForVerification(
      "user@example.com",
      "Password1"
    );

    expect(result).toBeNull();
  });

  it("throws when Supabase returns an error", async () => {
    const authError = new Error("Invalid login credentials");
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { session: null, user: null },
      error: authError,
    });

    await expect(
      authApi.signInWithPasswordForVerification("user@example.com", "wrong")
    ).rejects.toThrow("Invalid login credentials");
  });
});

// ---------------------------------------------------------------------------
// getSession (raw, no email_confirmed_at filter)
// ---------------------------------------------------------------------------
describe("authApi.getSession", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns AuthSession when a session exists (confirmed or not)", async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: makeSession(null) },
    });

    const result = await authApi.getSession();

    expect(result).not.toBeNull();
    expect(result?.user.id).toBe("user-123");
    expect(result?.user.email_confirmed_at).toBeNull();
  });

  it("returns null when there is no session", async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
    });

    const result = await authApi.getSession();

    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// resendVerificationEmail
// ---------------------------------------------------------------------------
describe("authApi.resendVerificationEmail", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns { success: true } on success", async () => {
    (supabase.auth.resend as jest.Mock).mockResolvedValue({ error: null });

    const result = await authApi.resendVerificationEmail("user@example.com");

    expect(result).toEqual({ success: true });
    expect(supabase.auth.resend).toHaveBeenCalledWith({
      type: "signup",
      email: "user@example.com",
    });
  });

  it("throws when Supabase returns an error", async () => {
    const resendError = new Error("Rate limit exceeded");
    (supabase.auth.resend as jest.Mock).mockResolvedValue({
      error: resendError,
    });

    await expect(
      authApi.resendVerificationEmail("user@example.com")
    ).rejects.toThrow("Rate limit exceeded");
  });
});

// ---------------------------------------------------------------------------
// resetPassword
// ---------------------------------------------------------------------------
describe("authApi.resetPassword", () => {
  beforeEach(() => jest.clearAllMocks());

  it("requests a password reset email with the app redirect URL", async () => {
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
      error: null,
    });

    const result = await authApi.resetPassword("user@example.com");

    expect(result).toEqual({ success: true });
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      "user@example.com",
      { redirectTo: "https://example.com/redirect" }
    );
  });

  it("throws when Supabase rejects the password reset request", async () => {
    const resetError = new Error("Rate limit exceeded");
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
      error: resetError,
    });

    await expect(authApi.resetPassword("user@example.com")).rejects.toThrow(
      "Rate limit exceeded"
    );
  });
});

// ---------------------------------------------------------------------------
// ensureProfile
// ---------------------------------------------------------------------------
describe("authApi.ensureProfile", () => {
  const userId = "user-123";
  const sessionEmail = "user@example.com";
  const metadata = { user_type: "filipina", first_name: "Ana" };

  const existingProfile = {
    id: userId,
    user_type: "filipina",
    first_name: "Ana",
    basic_info_completed: false,
    photos_completed: false,
    location_completed: false,
    preferences_completed: false,
  };

  beforeEach(() => jest.clearAllMocks());

  // -- helpers to chain the Supabase query builder --
  const mockSelectChain = (resolvedValue: unknown) => {
    const singleMock = jest.fn().mockResolvedValue(resolvedValue);
    const eqMock = jest.fn().mockReturnValue({ single: singleMock });
    const selectMock = jest.fn().mockReturnValue({ eq: eqMock });
    return { selectMock, eqMock, singleMock };
  };

  it("returns existing profile without creating a new one", async () => {
    const { selectMock } = mockSelectChain({
      data: existingProfile,
      error: null,
    });
    (supabase.from as jest.Mock).mockReturnValue({ select: selectMock });

    const result = await authApi.ensureProfile(userId, sessionEmail, metadata);

    expect(result.created).toBe(false);
    expect(result.error).toBeNull();
    expect(result.profile?.id).toBe(userId);
    expect(result.profile?.user_type).toBe("filipina");
  });

  it("creates a new profile when none exists (PGRST116)", async () => {
    // First call: fetch — not found
    const fetchSingle = jest.fn().mockResolvedValue({
      data: null,
      error: { code: "PGRST116", message: "Not found" },
    });
    const fetchEq = jest.fn().mockReturnValue({ single: fetchSingle });
    const fetchSelect = jest.fn().mockReturnValue({ eq: fetchEq });

    // Second call: insert
    const newProfile = { ...existingProfile };
    const insertSingle = jest.fn().mockResolvedValue({
      data: newProfile,
      error: null,
    });
    const insertSelect = jest.fn().mockReturnValue({ single: insertSingle });
    const insertFn = jest.fn().mockReturnValue({ select: insertSelect });

    (supabase.from as jest.Mock).mockReturnValue({
      select: fetchSelect,
      insert: insertFn,
    });

    const result = await authApi.ensureProfile(userId, sessionEmail, metadata);

    expect(result.created).toBe(true);
    expect(result.error).toBeNull();
    expect(result.profile?.id).toBe(userId);
    expect(insertFn).toHaveBeenCalledWith(
      expect.objectContaining({
        id: userId,
        email: sessionEmail,
        user_type: "filipina",
        gender: "female",
        looking_for_gender: "male",
      })
    );
  });

  it("returns error when insert fails", async () => {
    // Fetch: not found
    const fetchSingle = jest.fn().mockResolvedValue({
      data: null,
      error: { code: "PGRST116", message: "Not found" },
    });
    const fetchEq = jest.fn().mockReturnValue({ single: fetchSingle });
    const fetchSelect = jest.fn().mockReturnValue({ eq: fetchEq });

    // Insert: fails
    const insertError = { message: "DB error", code: "23505" };
    const insertSingle = jest.fn().mockResolvedValue({
      data: null,
      error: insertError,
    });
    const insertSelect = jest.fn().mockReturnValue({ single: insertSingle });
    const insertFn = jest.fn().mockReturnValue({ select: insertSelect });

    (supabase.from as jest.Mock).mockReturnValue({
      select: fetchSelect,
      insert: insertFn,
    });

    const result = await authApi.ensureProfile(userId, sessionEmail, metadata);

    expect(result.profile).toBeNull();
    expect(result.created).toBe(true);
    expect(result.error).toEqual(insertError);
  });

  it("returns error when fetch fails with non-PGRST116 error", async () => {
    const fetchError = { code: "500", message: "Server error" };
    const fetchSingle = jest.fn().mockResolvedValue({
      data: null,
      error: fetchError,
    });
    const fetchEq = jest.fn().mockReturnValue({ single: fetchSingle });
    const fetchSelect = jest.fn().mockReturnValue({ eq: fetchEq });

    (supabase.from as jest.Mock).mockReturnValue({ select: fetchSelect });

    const result = await authApi.ensureProfile(userId, sessionEmail, metadata);

    expect(result.profile).toBeNull();
    expect(result.created).toBe(false);
    expect(result.error).toEqual(fetchError);
  });

  it("respects override userType and firstName params", async () => {
    // Fetch: not found
    const fetchSingle = jest.fn().mockResolvedValue({
      data: null,
      error: { code: "PGRST116", message: "Not found" },
    });
    const fetchEq = jest.fn().mockReturnValue({ single: fetchSingle });
    const fetchSelect = jest.fn().mockReturnValue({ eq: fetchEq });

    const newProfile = {
      ...existingProfile,
      user_type: "foreigner",
      first_name: "John",
      gender: "male",
    };
    const insertSingle = jest.fn().mockResolvedValue({
      data: newProfile,
      error: null,
    });
    const insertSelect = jest.fn().mockReturnValue({ single: insertSingle });
    const insertFn = jest.fn().mockReturnValue({ select: insertSelect });

    (supabase.from as jest.Mock).mockReturnValue({
      select: fetchSelect,
      insert: insertFn,
    });

    const result = await authApi.ensureProfile(
      userId,
      sessionEmail,
      metadata,
      "foreigner",
      "John"
    );

    expect(insertFn).toHaveBeenCalledWith(
      expect.objectContaining({
        user_type: "foreigner",
        first_name: "John",
        gender: "male",
        looking_for_gender: "female",
      })
    );
    expect(result.profile?.user_type).toBe("foreigner");
  });
});
