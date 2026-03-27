import { authApi, SignUpMetadata } from "@/src/features/auth/api/authApi";
import { useState } from "react";

export const useSignUp = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = async (
    email: string,
    password: string,
    metadata: SignUpMetadata
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Validate metadata before sending
      if (!metadata.userType) {
        throw new Error("User type is required");
      }

      if (!metadata.firstName || !metadata.firstName.trim()) {
        throw new Error("First name is required");
      }

      console.log("🚀 Signing up with metadata:", metadata);

      const result = await authApi.signUp(email, password, metadata);

      console.log("✅ Signup successful:", {
        email: result.user.email,
        userType: result.user.metadata.userType,
        firstName: result.user.metadata.firstName,
      });

      // Return result with metadata preserved
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign up failed";
      setError(message);
      console.error("❌ Signup error:", message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { signUp, loading, error };
};
