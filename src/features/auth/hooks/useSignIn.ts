import { useRouter } from "expo-router";
import { useState } from "react";
import { authApi } from "../api/authApi";

export const useSignIn = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual Supabase auth
      await authApi.signIn(email, password);

      // Navigate to main app on success
      router.replace("/(main)");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { signIn, loading, error };
};
