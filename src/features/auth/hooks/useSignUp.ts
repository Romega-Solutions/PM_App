import { authApi, SignUpMetadata } from "@/src/features/auth/api/authApi";
import { useState } from "react";

function getSafeSignUpError(err: unknown): string {
  const message = err instanceof Error ? err.message.toLowerCase() : "";

  if (message.includes("user type is required")) {
    return "Choose your account type before creating a profile.";
  }

  if (message.includes("first name is required")) {
    return "First name is required.";
  }

  if (
    message.includes("already") ||
    message.includes("registered") ||
    message.includes("exists")
  ) {
    return "An account may already use this email. Try signing in or resetting your password.";
  }

  if (message.includes("password")) {
    return "Use a stronger password and try again.";
  }

  if (message.includes("rate") || message.includes("too many")) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  return "We could not create your account. Check your connection and try again.";
}

export const useSignUp = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = async (
    email: string,
    password: string,
    metadata: SignUpMetadata,
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

      const result = await authApi.signUp(email, password, metadata);

      // Return result with metadata preserved
      return result;
    } catch (err) {
      const message = getSafeSignUpError(err);
      setError(message);
      console.error("Signup failed.");
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return { signUp, loading, error };
};
