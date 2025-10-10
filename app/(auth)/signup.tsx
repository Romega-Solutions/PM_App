import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react-native";
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

interface FormData {
  firstName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const handleSignUp = (): void => {
    if (!formData.firstName || !formData.email || !formData.password) {
      Alert.alert("Missing Information", "Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords don't match");
      return;
    }

    // TODO: Sign up with Supabase
    router.push("/(auth)/verify-email");
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
            colors={["#340839", "rgba(141, 105, 246, 0.15)", "#340839"]}
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
              marginBottom: 32,
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

            {/* Welcome Text - Using Hello Paris for main heading */}
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
              Join PinayMate
            </Text>

            {/* Subtitle - Using Playfair for body text */}
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
              Find your perfect Filipino match today
            </Text>
          </View>

          {/* Form Container */}
          <View style={{ paddingHorizontal: 24, paddingBottom: 40 }}>
            {/* First Name Field */}
            <CustomTextInput
              label="First Name"
              value={formData.firstName}
              onChangeText={(text: string) =>
                setFormData({ ...formData, firstName: text })
              }
              placeholder="Enter your first name"
              LeftIcon={User}
              autoComplete="name-given"
            />

            {/* Email Field */}
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

            {/* Password Field */}
            <CustomTextInput
              label="Password"
              value={formData.password}
              onChangeText={(text: string) =>
                setFormData({ ...formData, password: text })
              }
              placeholder="Create a strong password"
              LeftIcon={Lock}
              RightIcon={showPassword ? EyeOff : Eye}
              onRightIconPress={() => setShowPassword(!showPassword)}
              secureTextEntry={!showPassword}
              autoComplete="password-new"
            />

            {/* Confirm Password Field */}
            <View style={{ marginBottom: 28 }}>
              <CustomTextInput
                label="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={(text: string) =>
                  setFormData({ ...formData, confirmPassword: text })
                }
                placeholder="Confirm your password"
                LeftIcon={Lock}
                RightIcon={showConfirmPassword ? EyeOff : Eye}
                onRightIconPress={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                secureTextEntry={!showConfirmPassword}
                autoComplete="password-new"
              />
            </View>

            {/* Create Account Button - Brand Gradient */}
            <TouchableOpacity
              style={{
                borderRadius: Platform.select({ ios: 28, android: 26 }),
                height: Platform.select({ ios: 56, android: 52 }),
                marginBottom: 24,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#EF3E78",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: Platform.select({ ios: 0.5, android: 0.4 }),
                shadowRadius: 20,
                elevation: 12,
                overflow: "hidden",
              }}
              onPress={handleSignUp}
              activeOpacity={0.85}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Create your account"
            >
              <LinearGradient
                colors={["#EF3E78", "#8D69F6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              />
              {/* Button text - Using Hello Paris for UI elements */}
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 18,
                  fontFamily: "HelloParis",
                  fontWeight: "700",
                  marginRight: 8,
                  letterSpacing: 0.5,
                  textShadowColor: "rgba(0, 0, 0, 0.3)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 3,
                }}
              >
                Create Account
              </Text>
              <ChevronRight size={22} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>

            {/* Divider */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <View
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                }}
              />
              {/* Divider text - Using Playfair for body text */}
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

            {/* Google Sign Up */}
            <TouchableOpacity
              style={{
                backgroundColor: "rgba(141, 105, 246, 0.12)",
                borderRadius: Platform.select({ ios: 28, android: 26 }),
                height: Platform.select({ ios: 56, android: 52 }),
                borderWidth: Platform.select({ ios: 1.5, android: 2 }),
                borderColor: "rgba(141, 105, 246, 0.3)",
                marginBottom: 32,
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#8D69F6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 4,
              }}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Sign up with Google"
            >
              {/* Google button text - Using Hello Paris for UI elements */}
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 16,
                  fontFamily: "HelloParis",
                  fontWeight: "500",
                  letterSpacing: 0.3,
                }}
              >
                🌐 Continue with Google
              </Text>
            </TouchableOpacity>

            {/* Sign In Link */}
            <View style={{ alignItems: "center", paddingBottom: 20 }}>
              {/* Supporting text - Using Playfair for body text */}
              <Text
                style={{
                  color: "rgba(255, 255, 255, 0.6)",
                  fontSize: 14,
                  fontFamily: "PlayfairDisplay",
                  fontWeight: "400",
                  marginBottom: 10,
                }}
              >
                Already finding love with us?
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/signin")}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Sign in to existing account"
              >
                {/* Link text - Using Hello Paris for UI elements */}
                <Text
                  style={{
                    color: "#EF3E78",
                    fontSize: 16,
                    fontFamily: "HelloParis",
                    fontWeight: "600",
                    letterSpacing: 0.3,
                  }}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
