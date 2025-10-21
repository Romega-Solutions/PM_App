import { authApi } from "@/src/features/auth/api/authApi";
import { useState } from "react";

export const useSignUp = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setLoading(true);
      setError(null);

      const result = await authApi.signUp(email, password, metadata);

      // return result to caller; let screen decide navigation
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign up failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { signUp, loading, error };
};
