import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomTextInput from "../../src/components/forms/CustomTextInput";
import PrimaryButton from "../../src/components/ui/PrimaryButton";
import SecondaryButton from "../../src/components/ui/SecondaryButton";

interface FormData {
  email: string;
  password: string;
}

export default function SignIn() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSignIn = (): void => {
    if (!formData.email || !formData.password) {
      Alert.alert("Missing Information", "Please fill in all fields");
      return;
    }

    // TODO: Sign in with Supabase
    router.push("/(main)");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#340839" }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#340839"
        translucent={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Background Gradient */}
          <LinearGradient
            colors={[
              "#340839", // Deep purple
              "rgba(141, 105, 246, 0.15)", // Subtle purple tint
              "#340839", // Back to deep purple
            ]}
            locations={[0, 0.5, 1]}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }}
          />

          {/* Back Button */}
          <TouchableOpacity
            style={{
              position: "absolute",
              top: Platform.select({ ios: 16, android: 12 }),
              left: 20,
              zIndex: 10,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => router.back()}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Header with Logo */}
          <View
            style={{
              paddingTop: Platform.select({ ios: 60, android: 50 }),
              paddingHorizontal: 24,
              alignItems: "center",
              marginBottom: 40,
            }}
          >
            {/* Logo */}
            <View
              style={{
                width: 100,
                height: 100,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 24,
                shadowColor: "#EF3E78",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 25,
                elevation: 15,
              }}
            >
              <Image
                source={require("../../assets/logo-no-bg.png")}
                style={{
                  width: 100,
                  height: 100,
                }}
                resizeMode="contain"
              />
            </View>

            {/* Welcome Text - Using HelloParis for main heading */}
            <Text
              style={{
                fontSize: 36,
                fontFamily: "HelloParis",
                fontWeight: "700",
                color: "#FFFFFF",
                textAlign: "center",
                marginBottom: 12,
                textShadowColor: "rgba(239, 62, 120, 0.6)",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 8,
                letterSpacing: -0.5,
              }}
            >
              Welcome Back
            </Text>

            {/* Subtitle - Using PlayfairDisplay for body text */}
            <Text
              style={{
                fontSize: 16,
                fontFamily: "PlayfairDisplay",
                fontWeight: "400",
                color: "rgba(255, 255, 255, 0.85)",
                textAlign: "center",
                lineHeight: 24,
              }}
            >
              Continue your journey to find love
            </Text>
          </View>

          {/* Form Container */}
          <View style={{ paddingHorizontal: 24, paddingBottom: 40 }}>
            {/* Email Field - Using CustomTextInput */}
            <CustomTextInput
              label="Email Address"
              value={formData.email}
              onChangeText={(text: string) =>
                setFormData({ ...formData, email: text })
              }
              placeholder="Enter your email"
              LeftIcon={Mail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            {/* Password Field - Using CustomTextInput */}
            <CustomTextInput
              label="Password"
              value={formData.password}
              onChangeText={(text: string) =>
                setFormData({ ...formData, password: text })
              }
              placeholder="Enter your password"
              LeftIcon={Lock}
              RightIcon={showPassword ? EyeOff : Eye}
              onRightIconPress={() => setShowPassword(!showPassword)}
              secureTextEntry={!showPassword}
              autoComplete="current-password"
            />

            {/* Forgot Password */}
            <TouchableOpacity
              style={{ alignSelf: "flex-end", marginBottom: 28, padding: 4 }}
              onPress={() => router.push("/(auth)/forgot-password")}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Forgot password"
            >
              {/* Link text - Using HelloParis for UI elements */}
              <Text
                style={{
                  color: "#EF3E78",
                  fontSize: 14,
                  fontFamily: "HelloParis",
                  fontWeight: "600",
                  letterSpacing: 0.2,
                }}
              >
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Sign In Button - Using PrimaryButton */}
            <PrimaryButton
              title="Sign In"
              onPress={handleSignIn}
              accessibilityLabel="Sign in to your account"
            />

            {/* Divider */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 24,
              }}
            >
              <View
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                }}
              />
              {/* Divider text - Using PlayfairDisplay for body text */}
              <Text
                style={{
                  color: "rgba(255, 255, 255, 0.5)",
                  marginHorizontal: 16,
                  fontSize: 13,
                  fontFamily: "PlayfairDisplay",
                  fontWeight: "400",
                }}
              >
                Or continue with
              </Text>
              <View
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                }}
              />
            </View>

            {/* Google Sign In - Using SecondaryButton */}
            <SecondaryButton
              title="🌐 Continue with Google"
              variant="purple"
              onPress={() => {
                // TODO: Implement Google Sign In
                console.log("Google Sign In");
              }}
              accessibilityLabel="Sign in with Google"
            />

            {/* Sign Up Link */}
            <View style={{ alignItems: "center", paddingVertical: 32 }}>
              {/* Supporting text - Using PlayfairDisplay for body text */}
              <Text
                style={{
                  color: "rgba(255, 255, 255, 0.6)",
                  fontSize: 14,
                  fontFamily: "PlayfairDisplay",
                  fontWeight: "400",
                  marginBottom: 10,
                }}
              >
                New to PinayMate?
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/signup")}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Create a new account"
              >
                {/* Link text - Using HelloParis for UI elements */}
                <Text
                  style={{
                    color: "#EF3E78",
                    fontSize: 16,
                    fontFamily: "HelloParis",
                    fontWeight: "600",
                    letterSpacing: 0.3,
                  }}
                >
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
