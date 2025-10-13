// app/(auth)/signin.tsx
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
  StyleSheet,
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
      <StatusBar barStyle="light-content" backgroundColor="#340839" />

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
            style={StyleSheet.absoluteFill}
          />

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Header with Logo */}
          <View style={styles.headerWrap}>
            <View style={styles.logoWrap}>
              <Image
                source={require("../../assets/logo-no-bg.png")}
                style={{ width: 100, height: 100 }}
                resizeMode="contain"
                accessible
                accessibilityLabel="PinayMate logo"
              />
            </View>

            {/* Title - HelloParis (title) */}
            <Text style={[styles.title, styles.fontTitle]}>Welcome Back</Text>

            {/* Head - Lora (head) */}
            <Text style={[styles.head, styles.fontHead]}>
              Continue your journey to find love
            </Text>
          </View>

          {/* Form */}
          <View style={{ paddingHorizontal: 24, paddingBottom: 40 }}>
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

            {/* Forgot Password - DMSans (body) */}
            <TouchableOpacity
              style={{ alignSelf: "flex-end", marginBottom: 28, padding: 4 }}
              onPress={() => router.push("/(auth)/forgot-password")}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Forgot password"
            >
              <Text style={[styles.forgotLink, styles.fontBodySemibold]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <PrimaryButton
              title="Sign In"
              onPress={handleSignIn}
              accessibilityLabel="Sign in to your account"
            />

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              {/* Head label - Lora */}
              <Text style={[styles.dividerText, styles.fontHeadMedium]}>
                Or continue with
              </Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign In */}
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
              {/* Body - DMSans */}
              <Text style={[styles.supportText, styles.fontBody]}>
                New to PinayMate?
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/signup")}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Create a new account"
              >
                {/* Body CTA - DMSans Semibold */}
                <Text style={[styles.ctaLink, styles.fontBodySemibold]}>
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

const styles = StyleSheet.create({
  backBtn: {
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
  },
  headerWrap: {
    paddingTop: Platform.select({ ios: 60, android: 50 }),
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 40,
  },
  logoWrap: {
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
  },

  // Title
  title: {
    fontSize: 36,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 12,
    textShadowColor: "rgba(239, 62, 120, 0.6)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: -0.5,
  },

  // Head
  head: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 24,
  },

  // Body texts
  forgotLink: {
    color: "#EF3E78",
    fontSize: 14,
    letterSpacing: 0.2,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  dividerText: {
    color: "rgba(255, 255, 255, 0.6)",
    marginHorizontal: 16,
    fontSize: 13,
  },
  supportText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    marginBottom: 10,
  },
  ctaLink: {
    color: "#EF3E78",
    fontSize: 16,
    letterSpacing: 0.3,
  },

  // Font helpers that match expo-font registrations
  // Title = HelloParis
  fontTitle: { fontFamily: "HelloParis-Bold" },

  // Head = Lora
  fontHead: { fontFamily: "Lora-SemiBold" },
  fontHeadMedium: { fontFamily: "Lora-Medium" },

  // Body = DMSans
  fontBody: { fontFamily: "DMSans-Regular" },
  fontBodySemibold: { fontFamily: "DMSans-SemiBold" },
});
