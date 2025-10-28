/**
 * Authentication API
 * Handles user signup, signin, and signout operations
 */

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
   * Sign in existing user
   */
  signIn: async (email: string, password: string): Promise<SignInResult> => {
    console.log("Sign in with:", email);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock success response
    return {
      user: {
        email,
        // In real app, this would come from the database
        userType: "filipina", // or 'foreigner' based on user's account
      },
      session: {
        access_token: "mock-token",
      },
    };

    /* Real Supabase implementation:
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
    */
  },

  /**
   * Sign up new user
   * @param email - User's email address
   * @param password - User's password (min 8 characters)
   * @param metadata - Additional user data (firstName, userType)
   */
  signUp: async (
    email: string,
    password: string,
    metadata: SignUpMetadata
  ): Promise<SignUpResult> => {
    console.log("Sign up with:", { email, ...metadata });

    // Validate required metadata
    if (!metadata.firstName || !metadata.firstName.trim()) {
      throw new Error("First name is required");
    }

    if (
      !metadata.userType ||
      !["filipina", "foreigner"].includes(metadata.userType)
    ) {
      throw new Error("Please select a valid account type");
    }

    // Validate userType business rules
    if (metadata.userType === "filipina") {
      console.log(
        "Creating Filipina account - will require female gender in profile setup"
      );
    } else if (metadata.userType === "foreigner") {
      console.log(
        "Creating Foreign Man account - will require male gender in profile setup"
      );
    }

    // Simulate network / processing delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Mock success response
    // needsVerification = true means user must verify their email
    return {
      user: {
        email,
        metadata,
      },
      needsVerification: true,
      message: "Verification email sent. Please check your inbox.",
    };

    /* Real Supabase implementation:
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: {
          first_name: metadata.firstName,
          user_type: metadata.userType,
        },
        // Optional: Add email redirect URL
        emailRedirectTo: 'https://yourapp.com/auth/callback',
      },
    });
    
    if (error) throw error;
    
    return {
      user: data.user,
      needsVerification: !data.session, // If no session, email verification required
      message: data.session 
        ? "Account created successfully" 
        : "Verification email sent. Please check your inbox.",
    };
    */
  },

  /**
   * Sign out current user
   */
  signOut: async (): Promise<void> => {
    console.log("Signing out user");

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock implementation
    console.log("User signed out successfully");

    /* Real Supabase implementation:
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    */
  },

  /**
   * Verify email with OTP code
   * Used after signup when user receives verification email
   */
  verifyEmail: async (
    email: string,
    code: string
  ): Promise<{ success: boolean }> => {
    console.log("Verifying email:", email, "with code:", code);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock success
    return { success: true };

    /* Real Supabase implementation:
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'signup',
    });
    
    if (error) throw error;
    return { success: true };
    */
  },

  /**
   * Resend verification email
   */
  resendVerificationEmail: async (
    email: string
  ): Promise<{ success: boolean }> => {
    console.log("Resending verification email to:", email);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock success
    return { success: true };

    /* Real Supabase implementation:
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    
    if (error) throw error;
    return { success: true };
    */
  },

  /**
   * Get current user session
   */
  getCurrentUser: async (): Promise<{
    email: string;
    userType: UserType;
  } | null> => {
    console.log("Getting current user");

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Mock - return null if not logged in
    return null;

    /* Real Supabase implementation:
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    return {
      email: user.email!,
      userType: user.user_metadata?.user_type as UserType,
    };
    */
  },
};

/**
 * Validation helpers
 */
export const authValidation = {
  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  /**
   * Validate password strength
   */
  isValidPassword: (password: string): { valid: boolean; error?: string } => {
    if (password.length < 8) {
      return { valid: false, error: "Password must be at least 8 characters" };
    }
    // Add more rules as needed
    return { valid: true };
  },

  /**
   * Validate user type
   */
  isValidUserType: (userType: any): userType is UserType => {
    return userType === "filipina" || userType === "foreigner";
  },
};

export default authApi;
