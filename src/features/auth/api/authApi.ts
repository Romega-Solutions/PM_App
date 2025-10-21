export const authApi = {
  signIn: async (email: string, password: string) => {
    // TODO: Remove this mock when Supabase is set up
    console.log("Sign in with:", email);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock success response
    return { user: { email }, session: { access_token: "mock-token" } };
  },

  // ...existing code...
  signUp: async (email: string, password: string, metadata?: any) => {
    // Mock implementation for sign up
    console.log("Sign up with:", email, metadata);

    // Simulate network / processing delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Return a shape your UI can use.
    // needsVerification = true simulates that user must verify email
    return {
      user: { email, metadata },
      needsVerification: true,
      message: "Verification email sent",
    };

    /* Real implementation example (Supabase)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (error) throw error;
    return data;
    */
  },

  signOut: async () => {
    // ...existing code...
    throw new Error("Sign out not implemented yet");
  },
};
