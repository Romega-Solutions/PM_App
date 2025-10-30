import VerificationSuccessActions from "@/src/components/auth/VerificationSuccessActions";
import VerificationSuccessHeader from "@/src/components/auth/VerificationSuccessHeader";
import { supabase } from "@/src/config/supabase";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StatusBar,
  View,
} from "react-native";

export default function VerificationSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    userType?: string;
    firstName?: string;
  }>();

  const [userType, setUserType] = useState(params.userType);
  const [firstName, setFirstName] = useState(params.firstName);
  const [isChecking, setIsChecking] = useState(false);

  const [fontsLoaded] = useFonts({
    HelloParis: require("@/assets/fonts/hello-paris-sans/HelloParisSans-Bold.ttf"),
    Lora: require("@/assets/fonts/lora/Lora-SemiBold.ttf"),
    DMSans: require("@/assets/fonts/dm-sans/DMSans-Regular.ttf"),
  });

  // Ensure profile exists and fetch user data
  useEffect(() => {
    const ensureProfileExists = async () => {
      console.log('📦 Ensuring profile exists...');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.log('⚠️ No session found');
        return;
      }

      const userId = session.user.id;
      const metadata = session.user.user_metadata;
      
      console.log('📦 User metadata:', metadata);

      try {
        // Check if profile exists
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('id, user_type, first_name')
          .eq('id', userId)
          .single();

        if (fetchError && fetchError.code === 'PGRST116') {
          // Profile doesn't exist - create it manually
          console.log('⚠️ Profile not found, creating manually...');
          
          const userTypeValue = metadata.user_type || 'foreigner';
          const genderValue = userTypeValue === 'filipina' ? 'female' : 'male';
          
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: session.user.email,
              first_name: metadata.first_name || '',
              user_type: userTypeValue,
              gender: genderValue,
            })
            .select()
            .single();

          if (insertError) {
            console.error('❌ Error creating profile:', insertError);
            throw insertError;
          }

          console.log('✅ Profile created manually:', newProfile);
          
          setUserType(newProfile.user_type);
          setFirstName(newProfile.first_name);
        } else if (existingProfile) {
          // Profile exists
          console.log('✅ Profile found:', existingProfile);
          
          setUserType(existingProfile.user_type || metadata.user_type);
          setFirstName(existingProfile.first_name || metadata.first_name);
        } else if (fetchError) {
          console.error('❌ Error fetching profile:', fetchError);
        }
      } catch (error) {
        console.error('❌ Error ensuring profile:', error);
      }
    };

    ensureProfileExists();
  }, []);

  const goNext = useCallback(() => {
    console.log("✅ Navigating to basic info...");
    console.log("📦 Passing params:", { userType, firstName });

    router.replace({
      pathname: "/(auth)/account-setup/basic-info",
      params: {
        userType: userType || "",
        firstName: firstName || "",
      },
    });
  }, [router, userType, firstName]);

  // Check authentication and auto-advance
  useEffect(() => {
    const checkAuth = async () => {
      console.log("🔍 Checking authentication status...");
      console.log("📦 Current params:", { userType, firstName });
      
      setIsChecking(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user?.email_confirmed_at) {
          console.log("✅ Email verified!");
          
          // Ensure we have userType and firstName before advancing
          if (userType && firstName) {
            console.log("✅ User data ready, auto-advancing in 2 seconds...");
            setTimeout(() => {
              goNext();
            }, 2000);
          } else {
            console.log("⚠️ Still waiting for user data...");
            // Will retry after ensureProfileExists completes
          }
        } else {
          console.log("⚠️ Email not yet verified");
        }
      } catch (error) {
        console.error("❌ Error checking auth:", error);
      } finally {
        setIsChecking(false);
      }
    };

    // Only check if we have the required data
    if (userType && firstName) {
      checkAuth();
    }
  }, [userType, firstName, goNext]);

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