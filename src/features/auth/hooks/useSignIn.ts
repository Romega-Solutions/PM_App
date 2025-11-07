// src/features/auth/hooks/useSignIn.ts
import { supabase } from "@/src/config/supabase";
import { accountApi } from "@/src/features/account/api/accountApi";
import { useRouter } from "expo-router";
import { useState } from "react";
import { authApi, UserType } from "../api/authApi";

// Test accounts for development
export const TEST_ACCOUNTS = {
  // Foreigner Account 1
  foreigner1: {
    email: "john@test.com",
    password: "test123",
    userType: "foreigner" as UserType,
    profile: {
      firstName: "John",
      lastName: "Smith",
      age: 32,
    },
  },
  // Foreigner Account 2
  foreigner2: {
    email: "mike@test.com",
    password: "test123",
    userType: "foreigner" as UserType,
    profile: {
      firstName: "Michael",
      lastName: "Johnson",
      age: 28,
    },
  },
  // Filipina Account 1
  filipina1: {
    email: "maria@test.com",
    password: "test123",
    userType: "filipina" as UserType,
    profile: {
      firstName: "Maria",
      lastName: "Santos",
      age: 25,
    },
  },
  // Filipina Account 2
  filipina2: {
    email: "angel@test.com",
    password: "test123",
    userType: "filipina" as UserType,
    profile: {
      firstName: "Angel",
      lastName: "Cruz",
      age: 23,
    },
  },
};

export const useSignIn = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // Check if it's a test account
      const testAccount = Object.values(TEST_ACCOUNTS).find(
        (account) => account.email === email && account.password === password
      );

      if (testAccount) {
        // Mock sign in for test account
        await authApi.signIn(email, password);

        // Set up test account profile data
        await setupTestAccountProfile(testAccount);

        console.log(`✅ Signed in as test account: ${testAccount.userType}`);
      } else {
        // Real authentication
        await authApi.signIn(email, password);
      }

      // Check profile completion status and redirect accordingly
      await checkProfileAndRedirect();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkProfileAndRedirect = async () => {
    try {
      console.log("🔍 Checking profile completion status after sign in...");

      // Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        console.log("❌ No session found");
        router.replace("/(auth)/signin");
        return;
      }

      const userId = session.user.id;
      const userMetadata = session.user.user_metadata;

      // Fetch profile with completion flags
      const { data: profile, error } = await supabase
        .from("profiles")
        .select(
          "id, user_type, first_name, basic_info_completed, photos_completed, location_completed, verification_completed, preferences_completed"
        )
        .eq("id", userId)
        .single();

      if (error && error.code === "PGRST116") {
        // No profile found, create one and redirect to account setup
        console.log("⚠️ No profile found, creating profile and redirecting to account setup...");
        
        const userTypeValue = userMetadata?.user_type || "foreigner";
        // Set gender based on user type: filipina = female, foreigner = male
        const genderValue = userTypeValue === "filipina" ? "female" : "male";
        
        try {
          const { data: newProfile, error: insertError } = await supabase
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
            console.error("❌ Error creating profile:", insertError);
          } else {
            console.log("✅ Profile created:", newProfile);
          }
        } catch (err) {
          console.error("❌ Exception creating profile:", err);
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
        console.error("❌ Error fetching profile:", error);
        router.replace("/(main)");
        return;
      }

      if (!profile) {
        console.log("⚠️ No profile found, redirecting to account setup...");
        router.replace({
          pathname: "/(auth)/verification-success",
          params: {
            userType: userMetadata?.user_type || "foreigner",
            firstName: userMetadata?.first_name || "",
          },
        });
        return;
      }

      console.log("📊 Profile completion status:", {
        basic_info_completed: profile.basic_info_completed,
        photos_completed: profile.photos_completed,
        location_completed: profile.location_completed,
        verification_completed: profile.verification_completed,
        preferences_completed: profile.preferences_completed,
      });

      // Check which step is incomplete and redirect
      if (!profile.basic_info_completed) {
        console.log("📍 Redirecting to: basic-info (not completed)");
        router.replace({
          pathname: "/(auth)/account-setup/basic-info",
          params: {
            userType: profile.user_type,
            firstName: profile.first_name,
          },
        });
      } else if (!profile.photos_completed) {
        console.log("📍 Redirecting to: profile-photos (not completed)");
        router.replace({
          pathname: "/(auth)/account-setup/profile-photos",
          params: {
            userType: profile.user_type,
            firstName: profile.first_name,
          },
        });
      } else if (!profile.location_completed) {
        console.log("📍 Redirecting to: location (not completed)");
        router.replace({
          pathname: "/(auth)/account-setup/location",
          params: {
            userType: profile.user_type,
            firstName: profile.first_name,
          },
        });
      } else if (!profile.preferences_completed) {
        console.log("📍 Redirecting to: preferences (not completed)");
        router.replace({
          pathname: "/(auth)/account-setup/preferences",
          params: {
            userType: profile.user_type,
            firstName: profile.first_name,
          },
        });
      } else if (!profile.verification_completed) {
        console.log("📍 User not verified, skipping welcome screen and redirecting to main app");
        router.replace("/(main)");
      } else {
        console.log("✅ Profile complete and verified! Redirecting to welcome screen");
        router.replace({
          pathname: "/(auth)/account-setup/welcome-complete",
          params: {
            userType: profile.user_type,
            firstName: profile.first_name,
          },
        });
      }
    } catch (error) {
      console.error("❌ Error checking profile completion:", error);
      // Fallback to main app on error
      router.replace("/(main)");
    }
  };

  return { signIn, loading, error };
};

/**
 * Set up profile data for test accounts
 */
async function setupTestAccountProfile(
  testAccount: (typeof TEST_ACCOUNTS)[keyof typeof TEST_ACCOUNTS]
) {
  try {
    // Save basic info with user type
    await accountApi.saveBasicInfo({
      firstName: testAccount.profile.firstName,
      lastName: testAccount.profile.lastName,
      age: testAccount.profile.age,
      userType: testAccount.userType,
    });

    // Save mock location
    await accountApi.saveLocation({
      locationType: "current",
      locationName:
        testAccount.userType === "filipina"
          ? "Manila, Philippines"
          : "New York, USA",
      coordinates:
        testAccount.userType === "filipina"
          ? { lat: 14.5995, lng: 120.9842 }
          : { lat: 40.7128, lng: -74.006 },
      timestamp: new Date().toISOString(),
    });

    // Save mock preferences
    await accountApi.savePreferences({
      ageMin: 22,
      ageMax: 35,
      maxDistanceKm: testAccount.userType === "filipina" ? 15000 : 100,
      relationshipGoal: "long_term",
      userType: testAccount.userType,
    });

    // Save mock verification
    await accountApi.saveVerification({
      selfieUri: "mock://selfie.jpg",
      documentUri: "mock://document.jpg",
      extractedFirstName: testAccount.profile.firstName,
      extractedLastName: testAccount.profile.lastName,
      extractedAge: testAccount.profile.age,
      isVerified: true,
      verifiedAt: new Date().toISOString(),
    });

    console.log(`✅ Test profile set up for ${testAccount.profile.firstName}`);
  } catch (error) {
    console.error("Failed to setup test account profile:", error);
  }
}
