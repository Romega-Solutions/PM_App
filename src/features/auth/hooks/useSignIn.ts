// src/features/auth/hooks/useSignIn.ts
import { supabase } from "@/src/config/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";
import { authApi } from "../api/authApi";

function getSafeSignInError(err: unknown): string {
  const message = err instanceof Error ? err.message.toLowerCase() : "";

  if (
    message.includes("invalid login") ||
    message.includes("invalid credentials")
  ) {
    return "Email or password is incorrect. Please try again.";
  }

  if (message.includes("email not confirmed")) {
    return "Please verify your email before signing in.";
  }

  if (message.includes("rate") || message.includes("too many")) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  return "Sign in failed. Check your connection and try again.";
}

export const useSignIn = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      await authApi.signIn(email, password);

      // Check profile completion status and redirect accordingly
      await checkProfileAndRedirect();
    } catch (err) {
      const message = getSafeSignInError(err);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const checkProfileAndRedirect = async () => {
    try {
      // Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/(auth)/signin");
        return;
      }

      const userId = session.user.id;
      const userMetadata = session.user.user_metadata;

      // Fetch profile with completion flags
      const { data: profile, error } = await supabase
        .from("profiles")
        .select(
          "id, user_type, first_name, basic_info_completed, photos_completed, location_completed, verification_completed, preferences_completed",
        )
        .eq("id", userId)
        .single();

      if (error && error.code === "PGRST116") {
        // No profile found, create one and redirect to account setup
        const userTypeValue = userMetadata?.user_type || "foreigner";
        // Set gender based on user type: filipina = female, foreigner = male
        const genderValue = userTypeValue === "filipina" ? "female" : "male";

        try {
          const { error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: userId,
              email: session.user.email,
              first_name: userMetadata?.first_name || "",
              user_type: userTypeValue,
              gender: genderValue,
            })
            .select()
            .single();

          if (insertError) {
            console.error("Profile creation failed after sign in.");
          }
        } catch {
          console.error("Profile creation failed after sign in.");
        }

        router.replace({
          pathname: "/(auth)/verification-success",
          params: {
            userType: userTypeValue,
            firstName: userMetadata?.first_name || "",
          },
        });
        return;
      } else if (error) {
        console.error("Profile lookup failed after sign in.");
        router.replace("/(main)");
        return;
      }

      if (!profile) {
        router.replace({
          pathname: "/(auth)/verification-success",
          params: {
            userType: userMetadata?.user_type || "foreigner",
            firstName: userMetadata?.first_name || "",
          },
        });
        return;
      }

      // Check which step is incomplete and redirect
      if (!profile.basic_info_completed) {
        router.replace({
          pathname: "/(auth)/account-setup/basic-info",
          params: {
            userType: profile.user_type,
            firstName: profile.first_name,
          },
        });
      } else if (!profile.photos_completed) {
        router.replace({
          pathname: "/(auth)/account-setup/profile-photos",
          params: {
            userType: profile.user_type,
            firstName: profile.first_name,
          },
        });
      } else if (!profile.location_completed) {
        router.replace({
          pathname: "/(auth)/account-setup/location",
          params: {
            userType: profile.user_type,
            firstName: profile.first_name,
          },
        });
      } else if (!profile.preferences_completed) {
        router.replace({
          pathname: "/(auth)/account-setup/preferences",
          params: {
            userType: profile.user_type,
            firstName: profile.first_name,
          },
        });
      } else if (!profile.verification_completed) {
        router.replace("/(main)");
      } else {
        router.replace({
          pathname: "/(auth)/account-setup/welcome-complete",
          params: {
            userType: profile.user_type,
            firstName: profile.first_name,
          },
        });
      }
    } catch {
      console.error("Profile completion check failed after sign in.");
      // Fallback to main app on error
      router.replace("/(main)");
    }
  };

  return { signIn, loading, error };
};
