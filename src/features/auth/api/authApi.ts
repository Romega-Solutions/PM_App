import {
  getPasswordResetRedirectUrl,
  getRedirectUrl,
  supabase,
} from "@/src/config/supabase";

export type UserType = "filipina" | "foreigner";

export type SignUpMetadata = {
  firstName: string;
  userType: UserType;
};

export type SignUpResult = {
  user: {
    email: string;
    metadata: SignUpMetadata;
  };
  needsVerification: boolean;
  message: string;
};

export type SignInResult = {
  user: {
    email: string;
    userType?: UserType;
  };
  session: {
    access_token: string;
  };
};

const AUTH_SIGNUP_ERROR =
  "We could not create your account. Check your connection and try again.";
const AUTH_SIGNIN_ERROR =
  "Email or password is incorrect, or sign in did not complete. Try again.";
const AUTH_SIGNOUT_ERROR =
  "Sign out did not complete. Check your connection and try again.";
const AUTH_RESEND_ERROR =
  "Verification email could not be resent. Check your email and try again.";
const AUTH_PASSWORD_RESET_ERROR =
  "Password reset email could not be sent. Check your email and try again.";
const AUTH_PASSWORD_UPDATE_ERROR =
  "Password could not be updated. Check your connection and try again.";
const AUTH_EMAIL_INPUT_ERROR = "Enter a valid email address.";
const AUTH_FIRST_NAME_INPUT_ERROR = "First name is required";
const MAX_FIRST_NAME_LENGTH = 80;

function normalizeEmail(email: string): string {
  const normalizedEmail = email.trim().toLowerCase();

  if (!authValidation.isValidEmail(normalizedEmail)) {
    throw new Error(AUTH_EMAIL_INPUT_ERROR);
  }

  return normalizedEmail;
}

function normalizeFirstName(firstName: string): string {
  const normalizedFirstName = firstName.trim().slice(0, MAX_FIRST_NAME_LENGTH);

  if (!normalizedFirstName) {
    throw new Error(AUTH_FIRST_NAME_INPUT_ERROR);
  }

  return normalizedFirstName;
}

export const authApi = {
  signUp: async (
    email: string,
    password: string,
    metadata: SignUpMetadata,
  ): Promise<SignUpResult> => {
    const normalizedEmail = normalizeEmail(email);
    const normalizedFirstName = normalizeFirstName(metadata.firstName);
    const passwordValidation = authValidation.isValidPassword(password);

    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.error ?? AUTH_SIGNUP_ERROR);
    }

    if (!authValidation.isValidUserType(metadata.userType)) {
      throw new Error("Please select a valid account type");
    }

    try {
      const redirectUrl = getRedirectUrl();

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            first_name: normalizedFirstName,
            user_type: metadata.userType,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error("Supabase signup failed.");
        throw new Error(AUTH_SIGNUP_ERROR);
      }

      if (!data.user) {
        throw new Error(AUTH_SIGNUP_ERROR);
      }

      return {
        user: {
          email: data.user.email || normalizedEmail,
          metadata: {
            firstName: normalizedFirstName,
            userType: metadata.userType,
          },
        },
        needsVerification: !data.session,
        message: data.session
          ? "Account created successfully"
          : "Verification email sent. Please check your inbox.",
      };
    } catch (e) {
      console.error("Signup failed.");
      if (e instanceof Error) {
        if (e.message === AUTH_FIRST_NAME_INPUT_ERROR) throw new Error(AUTH_FIRST_NAME_INPUT_ERROR);
        if (e.message === AUTH_EMAIL_INPUT_ERROR) throw new Error(AUTH_EMAIL_INPUT_ERROR);
        if (e.message === "Please select a valid account type") throw new Error("Please select a valid account type");
      }
      throw new Error(AUTH_SIGNUP_ERROR);
    }
  },

  /**
   * Sign in existing user
   */
  signIn: async (email: string, password: string): Promise<SignInResult> => {
    try {
      const normalizedEmail = normalizeEmail(email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        console.error("Supabase signin failed.");
        throw new Error(AUTH_SIGNIN_ERROR);
      }

      if (!data.session || !data.user) {
        throw new Error(AUTH_SIGNIN_ERROR);
      }

      return {
        user: {
          email: data.user.email || normalizedEmail,
          userType: data.user.user_metadata?.user_type as UserType,
        },
        session: {
          access_token: data.session.access_token,
        },
      };
    } catch {
      console.error("Signin failed.");
      throw new Error(AUTH_SIGNIN_ERROR);
    }
  },

  /**
   * Sign out current user
   */
  signOut: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(AUTH_SIGNOUT_ERROR);
  },

  /**
   * Get current user session
   */
  getCurrentUser: async (): Promise<{
    email: string;
    userType: UserType;
  } | null> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    return {
      email: user.email!,
      userType: user.user_metadata?.user_type as UserType,
    };
  },

  /**
   * Resend verification email
   */
  resendVerificationEmail: async (
    email: string,
  ): Promise<{ success: boolean }> => {
    const normalizedEmail = normalizeEmail(email);
    const redirectUrl = getRedirectUrl();

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: normalizedEmail,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) throw new Error(AUTH_RESEND_ERROR);
    return { success: true };
  },

  requestPasswordReset: async (
    email: string,
  ): Promise<{ success: boolean }> => {
    const redirectUrl = getPasswordResetRedirectUrl();
    const normalizedEmail = normalizeEmail(email);

    const { error } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      {
        redirectTo: redirectUrl,
      },
    );

    if (error) throw new Error(AUTH_PASSWORD_RESET_ERROR);
    return { success: true };
  },

  updatePassword: async (password: string): Promise<{ success: boolean }> => {
    const { error } = await supabase.auth.updateUser({ password });

    if (error) throw new Error(AUTH_PASSWORD_UPDATE_ERROR);
    return { success: true };
  },
};

export const authValidation = {
  isValidEmail: (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  isValidPassword: (password: string): { valid: boolean; error?: string } => {
    if (password.length < 8) {
      return { valid: false, error: "Password must be at least 8 characters" };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, error: "Password must contain lowercase letter" };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, error: "Password must contain uppercase letter" };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, error: "Password must contain number" };
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      return {
        valid: false,
        error: "Password must contain special character",
      };
    }
    return { valid: true };
  },

  isValidUserType: (userType: unknown): userType is UserType => {
    return userType === "filipina" || userType === "foreigner";
  },
};

export default authApi;
