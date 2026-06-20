import VerificationSuccessActions from "@/src/components/auth/VerificationSuccessActions";
import VerificationSuccessHeader from "@/src/components/auth/VerificationSuccessHeader";
import { supabase } from "@/src/config/supabase";
import { ensureUserProfile, EnsuredProfile } from "@/src/features/profile/api/ensureUserProfile";
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
    HelloParis: require("@/assets/fonts/hello-paris-sans/HelloParisSans-Bold.ttf"),
    Lora: require("@/assets/fonts/lora/Lora-SemiBold.ttf"),
    DMSans: require("@/assets/fonts/dm-sans/DMSans-Regular.ttf"),
  });

  // 📦 Load from Zustand and ensure profile exists
  useEffect(() => {
    const loadDataAndEnsureProfile = async () => {
      // Try to get from params first
      let finalUserType = params.userType;
      let finalFirstName = params.firstName;

      // If missing, try Zustand
      if (!finalUserType || !finalFirstName) {
        const storedData = getSignupData();

        if (storedData) {
          finalUserType = storedData.userType;
          finalFirstName = storedData.firstName;
          setUserType(finalUserType);
          setFirstName(finalFirstName);
        }
      }

      // Get session and ensure profile exists
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setIsChecking(false);
        return;
      }

      const userId = session.user.id;
      const metadata = session.user.user_metadata;

      // Use metadata as fallback
      if (!finalUserType && metadata.user_type) {
        finalUserType = metadata.user_type;
        setUserType(finalUserType);
      }
      if (!finalFirstName && metadata.first_name) {
        finalFirstName = metadata.first_name;
        setFirstName(finalFirstName);
      }

      try {
        const ensuredProfile = await ensureUserProfile({
          userId,
          email: session.user.email,
          userType: finalUserType || metadata.user_type,
          firstName: finalFirstName || metadata.first_name,
        });

        setUserType(ensuredProfile.user_type);
        setFirstName(ensuredProfile.first_name);

        redirectToIncompleteStep(ensuredProfile, finalUserType, finalFirstName);
      } catch {
        console.error("Profile setup check failed.");

        // On any exception, redirect to basic-info
        setTimeout(() => {
          router.replace({
            pathname: "/(auth)/account-setup/basic-info",
            params: {
              userType: finalUserType || metadata.user_type || "foreigner",
              firstName: finalFirstName || metadata.first_name || "",
            },
          });
        }, 2000);
        setIsChecking(false);
      }
    };

    const redirectToIncompleteStep = (
      profile: EnsuredProfile,
      userType?: string,
      firstName?: string,
    ) => {
      const finalUserType = userType || profile.user_type || "foreigner";
      const finalFirstName = firstName || profile.first_name || "";

      // Determine which step is incomplete and redirect
      if (!profile.basic_info_completed) {
        setTimeout(() => {
          router.replace({
            pathname: "/(auth)/account-setup/basic-info",
            params: { userType: finalUserType, firstName: finalFirstName },
          });
        }, 2000);
      } else if (!profile.photos_completed) {
        setTimeout(() => {
          router.replace({
            pathname: "/(auth)/account-setup/profile-photos",
            params: { userType: finalUserType },
          });
        }, 2000);
      } else if (!profile.location_completed) {
        setTimeout(() => {
          router.replace({
            pathname: "/(auth)/account-setup/location",
            params: { userType: finalUserType },
          });
        }, 2000);
      } else if (!profile.preferences_completed) {
        setTimeout(() => {
          router.replace({
            pathname: "/(auth)/account-setup/preferences",
            params: { userType: finalUserType },
          });
        }, 2000);
      } else {
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
  }, [getSignupData, params.firstName, params.userType, router]);

  const goNext = useCallback(() => {
    // This will be triggered by redirectToIncompleteStep automatically
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
