import VerificationSuccessActions from "@/src/components/auth/VerificationSuccessActions";
import VerificationSuccessHeader from "@/src/components/auth/VerificationSuccessHeader";
import { authApi } from "@/src/features/auth/api/authApi";
import { useSignupStore } from "@/src/stores/signupStore";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Platform, StatusBar, View } from "react-native";

export default function VerificationSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    userType?: string;
    firstName?: string;
  }>();

  const getSignupData = useSignupStore((state) => state.getSignupData);

  const [, setUserType] = useState(params.userType);
  const [, setFirstName] = useState(params.firstName);
  const [isChecking, setIsChecking] = useState(true);

  const [fontsLoaded] = useFonts({
    Lora: require("@/assets/fonts/lora/Lora-SemiBold.ttf"),
    DMSans: require("@/assets/fonts/dm-sans/DMSans-Regular.ttf"),
  });

  // 📦 Load from Zustand and ensure profile exists
  useEffect(() => {
    const loadDataAndEnsureProfile = async () => {
      if (__DEV__) console.log("📦 Loading data and ensuring profile...");

      // Try to get from params first
      let finalUserType = params.userType;
      let finalFirstName = params.firstName;

      // If missing, try Zustand
      if (!finalUserType || !finalFirstName) {
        if (__DEV__) console.log("⚠️ Missing params, loading from Zustand...");
        const storedData = getSignupData();

        if (storedData) {
          if (__DEV__) console.log("✅ Loaded from Zustand");
          finalUserType = storedData.userType;
          finalFirstName = storedData.firstName;
          setUserType(finalUserType);
          setFirstName(finalFirstName);
        }
      }

      // Get session and ensure profile exists
      const session = await authApi.getSession();

      if (!session?.user) {
        if (__DEV__) console.log("⚠️ No session found");
        setIsChecking(false);
        return;
      }

      const { id: userId, email: sessionEmail, user_metadata: metadata } =
        session.user;

      // Use metadata as fallback
      if (!finalUserType && metadata.user_type) {
        finalUserType = metadata.user_type as string;
        setUserType(finalUserType);
      }
      if (!finalFirstName && metadata.first_name) {
        finalFirstName = metadata.first_name as string;
        setFirstName(finalFirstName);
      }

      try {
        const { profile, created, error } = await authApi.ensureProfile(
          userId,
          sessionEmail,
          metadata,
          finalUserType,
          finalFirstName
        );

        if (error && !profile) {
          if (__DEV__) console.error("❌ Profile error:", error);
          // Even if profile creation/fetch fails, try to redirect to basic-info
          if (__DEV__) console.log("⚠️ Profile error, redirecting anyway...");
          setTimeout(() => {
            router.replace({
              pathname: "/(auth)/account-setup/basic-info",
              params: {
                userType: finalUserType || (metadata.user_type as string) || "foreigner",
                firstName: finalFirstName || (metadata.first_name as string) || "",
              },
            });
          }, 2000);
          setIsChecking(false);
          return;
        }

        if (profile) {
          if (__DEV__)
            console.log(created ? "✅ Profile created" : "✅ Profile exists");
          setUserType(profile.user_type);
          setFirstName(profile.first_name);
          // Check which step to redirect to
          redirectToIncompleteStep(profile, finalUserType, finalFirstName);
        }
      } catch (error) {
        if (__DEV__) console.error("❌ Exception ensuring profile:", error);

        // On any exception, redirect to basic-info
        setTimeout(() => {
          router.replace({
            pathname: "/(auth)/account-setup/basic-info",
            params: {
              userType: finalUserType || (metadata.user_type as string) || "foreigner",
              firstName: finalFirstName || (metadata.first_name as string) || "",
            },
          });
        }, 2000);
        setIsChecking(false);
      }
    };

    const redirectToIncompleteStep = (
      profile: any,
      userType?: string,
      firstName?: string
    ) => {
      if (__DEV__)
        console.log("🔍 Checking profile completion status:", {
          basic_info_completed: profile.basic_info_completed,
          photos_completed: profile.photos_completed,
          location_completed: profile.location_completed,
          preferences_completed: profile.preferences_completed,
        });

      const finalUserType = userType || profile.user_type || "foreigner";
      const finalFirstName = firstName || profile.first_name || "";

      // Determine which step is incomplete and redirect
      if (!profile.basic_info_completed) {
        if (__DEV__) console.log("📍 Redirecting to: basic-info (not completed)");
        setTimeout(() => {
          router.replace({
            pathname: "/(auth)/account-setup/basic-info",
            params: { userType: finalUserType, firstName: finalFirstName },
          });
        }, 2000);
      } else if (!profile.photos_completed) {
        if (__DEV__) console.log("📍 Redirecting to: profile-photos (not completed)");
        setTimeout(() => {
          router.replace({
            pathname: "/(auth)/account-setup/profile-photos",
            params: { userType: finalUserType },
          });
        }, 2000);
      } else if (!profile.location_completed) {
        if (__DEV__) console.log("📍 Redirecting to: location (not completed)");
        setTimeout(() => {
          router.replace({
            pathname: "/(auth)/account-setup/location",
            params: { userType: finalUserType },
          });
        }, 2000);
      } else if (!profile.preferences_completed) {
        if (__DEV__) console.log("📍 Redirecting to: preferences (not completed)");
        setTimeout(() => {
          router.replace({
            pathname: "/(auth)/account-setup/preferences",
            params: { userType: finalUserType },
          });
        }, 2000);
      } else {
        if (__DEV__) console.log("✅ All steps completed! Redirecting to welcome-complete");
        setTimeout(() => {
          router.replace({
            pathname: "/(auth)/account-setup/welcome-complete",
            params: { userType: finalUserType },
          });
        }, 2000);
      }

      setIsChecking(false);
    };

    loadDataAndEnsureProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  const goNext = useCallback(() => {
    // This will be triggered by redirectToIncompleteStep automatically
    if (__DEV__) console.log("⏭️ Manual continue clicked (will use auto-redirect)");
  }, []);

  // Remove the old auto-advance useEffect since redirectToIncompleteStep handles it now

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#340839",
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <LinearGradient
        colors={["#340839", "#8D69F6", "#EF3E78", "#340839"]}
        locations={[0, 0.4, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 32,
          paddingTop: Platform.select({ ios: 72, android: 56 }),
        }}
      >
        <VerificationSuccessHeader />

        {isChecking && (
          <View
            style={{
              marginVertical: 20,
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderRadius: 12,
            }}
          >
            <ActivityIndicator size="small" color="#fff" />
          </View>
        )}

        <VerificationSuccessActions
          countdown={0}
          onContinue={goNext}
          onCancel={() => {
            router.replace("/(auth)/signin");
          }}
        />
      </View>
    </View>
  );
}
