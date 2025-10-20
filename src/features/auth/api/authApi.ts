import { supabase } from "@/src/config/supabase";

export const authApi = {
  signIn: async (email: string, password: string) => {
    // TODO: Remove this mock when Supabase is set up
    console.log("Sign in with:", email);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Mock success response
    return { user: { email }, session: { access_token: "mock-token" } };
    
    /* 
    // Real implementation (uncomment when Supabase is ready):
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
    */
  },

  signUp: async (email: string, password: string, metadata?: any) => {
    // TODO: Implement when needed
    throw new Error("Sign up not implemented yet");
  },

  signOut: async () => {
    // TODO: Implement when needed
    throw new Error("Sign out not implemented yet");
  },
};