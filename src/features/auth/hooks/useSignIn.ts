// src/features/auth/hooks/useSignIn.ts
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
        // Real authentication (to be implemented with Supabase)
        await authApi.signIn(email, password);
      }

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
