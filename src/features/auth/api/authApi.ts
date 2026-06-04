import { getRedirectUrl, supabase } from "@/src/config/supabase";

export type UserType = "filipina" | "foreigner";

/** Minimal session shape returned by session-checking helpers. */
export type AuthSession = {
  user: {
    id: string;
    email: string | undefined;
    email_confirmed_at: string | null;
    user_metadata: Record<string, unknown>;
  };
};

/** Result returned by ensureProfile — the profile row columns we care about. */
export type ProfileRow = {
  id: string;
  user_type: string;
  first_name: string;
  basic_info_completed: boolean;
  photos_completed: boolean;
  location_completed: boolean;
  preferences_completed: boolean;
};

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

export const authApi = {
  signUp: async (
    email: string,
    password: string,
    metadata: SignUpMetadata
  ): Promise<SignUpResult> => {
    console.log("🚀 Supabase sign up with:", { email, ...metadata });

    if (!metadata.firstName || !metadata.firstName.trim()) {
      throw new Error("First name is required");
    }

    if (!["filipina", "foreigner"].includes(metadata.userType)) {
      throw new Error("Please select a valid account type");
    }

    try {
      const redirectUrl = getRedirectUrl();
      console.log("🔗 Using redirect URL:", redirectUrl);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: metadata.firstName.trim(),
            user_type: metadata.userType,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error("❌ Supabase signup error:", error);
        throw error;
      }

      if (!data.user) {
        throw new Error("Failed to create user");
      }

      console.log("✅ Supabase signup successful:", {
        userId: data.user.id,
        needsVerification: !data.session,
        emailConfirmed: !!data.user.email_confirmed_at,
        redirectUrl: redirectUrl,
      });

      return {
        user: {
          email: data.user.email!,
          metadata,
        },
        needsVerification: !data.session,
        message: data.session
          ? "Account created successfully"
          : "Verification email sent. Please check your inbox.",
      };
    } catch (error) {
      console.error("❌ Signup error:", error);
      throw error;
    }
  },

  /**
   * Sign in existing user
   */
  signIn: async (email: string, password: string): Promise<SignInResult> => {
    console.log("🔐 Supabase sign in with:", email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ Supabase signin error:", error);
        throw error;
      }

      if (!data.session || !data.user) {
        throw new Error("Sign in failed");
      }

      console.log("✅ Supabase signin successful");

      return {
        user: {
          email: data.user.email!,
          userType: data.user.user_metadata?.user_type as UserType,
        },
        session: {
          access_token: data.session.access_token,
        },
      };
    } catch (error) {
      console.error("❌ Signin error:", error);
      throw error;
    }
  },

  /**
   * Sign out current user
   */
  signOut: async (): Promise<void> => {
    console.log("👋 Signing out user");
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
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
    email: string
  ): Promise<{ success: boolean }> => {
    if (__DEV__) console.log("📧 Resending verification email");

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (error) throw error;
    return { success: true };
  },

  resetPassword: async (email: string): Promise<{ success: boolean }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getRedirectUrl(),
    });

    if (error) throw error;
    return { success: true };
  },

  /**
   * Get the current session.  Returns the session when the user's email has
   * been confirmed, or null otherwise.  Used by VerifyEmailScreen to poll for
   * email-verification completion.
   */
  getVerifiedSession: async (): Promise<AuthSession | null> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user?.email_confirmed_at) {
      return {
        user: {
          id: session.user.id,
          email: session.user.email,
          email_confirmed_at: session.user.email_confirmed_at,
          user_metadata: session.user.user_metadata ?? {},
        },
      };
    }
    return null;
  },

  /**
   * Attempt to refresh the current session token and return it if the user's
   * email is confirmed, or null if not yet confirmed / no session exists.
   */
  refreshVerifiedSession: async (): Promise<AuthSession | null> => {
    const {
      data: { session },
    } = await supabase.auth.refreshSession();

    if (session?.user?.email_confirmed_at) {
      return {
        user: {
          id: session.user.id,
          email: session.user.email,
          email_confirmed_at: session.user.email_confirmed_at,
          user_metadata: session.user.user_metadata ?? {},
        },
      };
    }
    return null;
  },

  /**
   * Sign in with email + password and return an AuthSession if the email is
   * confirmed, or null if the account exists but email is not yet verified.
   * Throws on credential/network errors so callers can surface error messages.
   */
  signInWithPasswordForVerification: async (
    email: string,
    password: string
  ): Promise<AuthSession | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.session?.user?.email_confirmed_at) {
      return {
        user: {
          id: data.session.user.id,
          email: data.session.user.email,
          email_confirmed_at: data.session.user.email_confirmed_at,
          user_metadata: data.session.user.user_metadata ?? {},
        },
      };
    }
    return null;
  },

  /**
   * Get the current raw session (without filtering on email_confirmed_at).
   * Used by VerificationSuccessScreen and hooks that need the full session.
   */
  getSession: async (): Promise<AuthSession | null> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) return null;

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        email_confirmed_at: session.user.email_confirmed_at ?? null,
        user_metadata: session.user.user_metadata ?? {},
      },
    };
  },

  /**
   * Ensure a profile row exists for the authenticated user.
   *
   * - Fetches the profile by userId.
   * - If missing (PGRST116), inserts a minimal profile row.
   * - Returns the profile row on success, or null when no session / insert
   *   error (callers handle fallback navigation themselves).
   *
   * NOTE: column names match the live schema dump (sql_existing_setup.md).
   * Do NOT alter column names here — schema drift is tracked separately.
   */
  ensureProfile: async (
    userId: string,
    sessionEmail: string | undefined,
    metadata: Record<string, unknown>,
    overrideUserType?: string,
    overrideFirstName?: string
  ): Promise<{ profile: ProfileRow | null; created: boolean; error: unknown }> => {
    const SELECT_COLS =
      "id, user_type, first_name, basic_info_completed, photos_completed, location_completed, preferences_completed";

    const { data: existing, error: fetchError } = await supabase
      .from("profiles")
      .select(SELECT_COLS)
      .eq("id", userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // Unexpected fetch error — surface it to the caller
      return { profile: null, created: false, error: fetchError };
    }

    if (existing) {
      return { profile: existing as ProfileRow, created: false, error: null };
    }

    // Profile not found — create it
    const userTypeValue =
      overrideUserType || (metadata.user_type as string) || "foreigner";
    const genderValue = userTypeValue === "filipina" ? "female" : "male";

    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email: sessionEmail,
        first_name:
          overrideFirstName || (metadata.first_name as string) || "",
        user_type: userTypeValue,
        gender: genderValue,
        looking_for_gender: genderValue === "female" ? "male" : "female",
        age_preference_min: 18,
        age_preference_max: 70,
      })
      .select(SELECT_COLS)
      .single();

    if (insertError) {
      return { profile: null, created: true, error: insertError };
    }

    return { profile: newProfile as ProfileRow, created: true, error: null };
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
    return { valid: true };
  },

  isValidUserType: (userType: any): userType is UserType => {
    return userType === "filipina" || userType === "foreigner";
  },
};

export default authApi;
