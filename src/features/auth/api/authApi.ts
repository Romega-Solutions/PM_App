import { supabase } from "@/src/config/supabase";

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

export const authApi = {
  /**
   * Sign up new user with Supabase
   */
  signUp: async (
    email: string,
    password: string,
    metadata: SignUpMetadata
  ): Promise<SignUpResult> => {
    console.log("🚀 Supabase sign up with:", { email, ...metadata });

    // Validate metadata
    if (!metadata.firstName || !metadata.firstName.trim()) {
      throw new Error("First name is required");
    }

    if (!["filipina", "foreigner"].includes(metadata.userType)) {
      throw new Error("Please select a valid account type");
    }

    try {
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: metadata.firstName.trim(),
            user_type: metadata.userType,
          },
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
    console.log("📧 Resending verification email to:", email);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (error) throw error;
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
    return { valid: true };
  },

  isValidUserType: (userType: any): userType is UserType => {
    return userType === "filipina" || userType === "foreigner";
  },
};

export default authApi;
