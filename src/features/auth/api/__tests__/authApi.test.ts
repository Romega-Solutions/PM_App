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
      "Email provider unavailable"
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
    ).rejects.toThrow("Email provider unavailable");
  });
});
