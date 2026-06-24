import {
  getPasswordResetRedirectUrl,
  getRedirectUrl,
  supabase,
} from "@/src/config/supabase";
import { authApi, authValidation } from "../authApi";

jest.mock("@/src/config/supabase", () => ({
  getRedirectUrl: jest.fn(() => "pinaymate://verification-success"),
  getPasswordResetRedirectUrl: jest.fn(() => "pinaymate://reset-password"),
  supabase: {
    auth: {
      getUser: jest.fn(),
      resend: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn(),
      updateUser: jest.fn(),
    },
  },
}));

describe("authApi signup and signin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("normalizes signup email and metadata before Supabase auth", async () => {
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: {
        user: { email: "user@example.com" },
        session: null,
      },
      error: null,
    });

    await expect(
      authApi.signUp(" USER@Example.COM ", "Password1!", {
        firstName: " Maria ",
        userType: "filipina",
      }),
    ).resolves.toEqual({
      user: {
        email: "user@example.com",
        metadata: {
          firstName: "Maria",
          userType: "filipina",
        },
      },
      needsVerification: true,
      message: "Verification email sent. Please check your inbox.",
    });

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "Password1!",
      options: {
        data: {
          first_name: "Maria",
          user_type: "filipina",
        },
        emailRedirectTo: "pinaymate://verification-success",
      },
    });
  });

  it("rejects invalid signup input before Supabase auth", async () => {
    await expect(
      authApi.signUp("not-an-email", "Password1!", {
        firstName: "Maria",
        userType: "filipina",
      }),
    ).rejects.toThrow("Enter a valid email address.");

    await expect(
      authApi.signUp("user@example.com", "weak", {
        firstName: "Maria",
        userType: "filipina",
      }),
    ).rejects.toThrow("Password must be at least 8 characters");

    await expect(
      authApi.signUp("user@example.com", "Password1!", {
        firstName: "   ",
        userType: "filipina",
      }),
    ).rejects.toThrow("First name is required");

    expect(supabase.auth.signUp).not.toHaveBeenCalled();
  });

  it("normalizes signin email before Supabase auth", async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: {
        user: {
          email: "user@example.com",
          user_metadata: { user_type: "foreigner" },
        },
        session: { access_token: "token" },
      },
      error: null,
    });

    await expect(
      authApi.signIn(" USER@Example.COM ", "Password1!"),
    ).resolves.toEqual({
      user: {
        email: "user@example.com",
        userType: "foreigner",
      },
      session: { access_token: "token" },
    });

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "Password1!",
    });
  });
});

describe("authApi password recovery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requests a Supabase password reset email with the recovery redirect", async () => {
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
      error: null,
    });

    await expect(
      authApi.requestPasswordReset(" USER@Example.COM ")
    ).resolves.toEqual({ success: true });

    expect(getPasswordResetRedirectUrl).toHaveBeenCalled();
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      "user@example.com",
      {
        redirectTo: "pinaymate://reset-password",
      }
    );
  });

  it("surfaces Supabase reset request failures", async () => {
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
      error: new Error("Email provider unavailable"),
    });

    await expect(authApi.requestPasswordReset("user@example.com")).rejects.toThrow(
      "Password reset email could not be sent. Check your email and try again."
    );
  });

  it("updates the password through the active recovery session", async () => {
    (supabase.auth.updateUser as jest.Mock).mockResolvedValue({ error: null });

    await expect(authApi.updatePassword("NewPassword1!")).resolves.toEqual({
      success: true,
    });

    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      password: "NewPassword1!",
    });
  });

  it("uses one strong password policy for signup and recovery", () => {
    expect(authValidation.isValidPassword("short1A!")).toEqual({
      valid: true,
    });
    expect(authValidation.isValidPassword("NoSymbol1")).toEqual({
      valid: false,
      error: "Password must contain special character",
    });
    expect(authValidation.isValidPassword("nosymbol1!")).toEqual({
      valid: false,
      error: "Password must contain uppercase letter",
    });
  });
});

describe("authApi email verification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("resends signup verification email with the app redirect", async () => {
    (supabase.auth.resend as jest.Mock).mockResolvedValue({ error: null });

    await expect(
      authApi.resendVerificationEmail(" USER@Example.COM ")
    ).resolves.toEqual({ success: true });

    expect(getRedirectUrl).toHaveBeenCalled();
    expect(supabase.auth.resend).toHaveBeenCalledWith({
      type: "signup",
      email: "user@example.com",
      options: {
        emailRedirectTo: "pinaymate://verification-success",
      },
    });
  });

  it("surfaces Supabase verification resend failures", async () => {
    (supabase.auth.resend as jest.Mock).mockResolvedValue({
      error: new Error("Email provider unavailable"),
    });

    await expect(
      authApi.resendVerificationEmail("user@example.com")
    ).rejects.toThrow("Verification email could not be resent. Check your email and try again.");
  });
});
