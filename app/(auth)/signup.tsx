// app/(auth)/signup.tsx
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
  StyleSheet,
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
            <Text style={[styles.title, styles.fontTitle]}>Join PinayMate</Text>

            {/* Head - Lora (head) */}
            <Text style={[styles.head, styles.fontHead]}>
              Find your perfect Filipino match today
            </Text>
          </View>

          {/* Form */}
          <View style={{ paddingHorizontal: 24, paddingBottom: 40 }}>
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
              placeholder="Create a strong password"
              LeftIcon={Lock}
              RightIcon={showPassword ? EyeOff : Eye}
              onRightIconPress={() => setShowPassword(!showPassword)}
              secureTextEntry={!showPassword}
              autoComplete="password-new"
            />

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

            {/* Create Account Button - gradient, body font */}
            <TouchableOpacity
              style={styles.createBtn}
              onPress={handleSignUp}
              activeOpacity={0.85}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Create your account"
            >
              <LinearGradient
                colors={["#EF3E78", "#8D69F6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={[styles.createBtnText, styles.fontBodySemibold]}>
                Create Account
              </Text>
              <ChevronRight size={22} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              {/* Head label - Lora */}
              <Text style={[styles.dividerText, styles.fontHeadMedium]}>
                Or continue with
              </Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign Up */}
            <TouchableOpacity
              style={styles.googleBtn}
              activeOpacity={0.8}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Sign up with Google"
            >
              <Text style={[styles.googleBtnText, styles.fontBodySemibold]}>
                🌐 Continue with Google
              </Text>
            </TouchableOpacity>

            {/* Sign In Link */}
            <View style={{ alignItems: "center", paddingBottom: 20 }}>
              {/* Body - DMSans */}
              <Text style={[styles.supportText, styles.fontBody]}>
                Already finding love with us?
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/signin")}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Sign in to existing account"
              >
                {/* Body CTA - DMSans Semibold */}
                <Text style={[styles.linkCta, styles.fontBodySemibold]}>
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
    marginBottom: 32,
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

  // Title (HelloParis)
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

  // Head (Lora)
  head: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 24,
  },

  // Buttons and links
  createBtn: {
    borderRadius: Platform.select({ ios: 28, android: 26 }),
    height: Platform.select({ ios: 56, android: 52 }),
    marginBottom: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: "#EF3E78",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: Platform.select({ ios: 0.5, android: 0.4 }) as number,
    shadowRadius: 20,
    elevation: 12,
    overflow: "hidden",
  },
  createBtnText: {
    color: "#FFFFFF",
    fontSize: 18,
    marginRight: 4,
    letterSpacing: 0.5,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
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

  googleBtn: {
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
  },
  googleBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    letterSpacing: 0.3,
  },

  supportText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    marginBottom: 10,
  },
  linkCta: {
    color: "#EF3E78",
    fontSize: 16,
    letterSpacing: 0.3,
  },

  // Font helpers that match expo-font registrations
  // Title = HelloParis
  fontTitle: { fontFamily: "HelloParis-Bold" },

  // Head = Lora
  fontHead: { fontFamily: "Lora-Regular" },
  fontHeadMedium: { fontFamily: "Lora-Medium" },

  // Body = DMSans
  fontBody: { fontFamily: "DMSans-Regular" },
  fontBodySemibold: { fontFamily: "DMSans-SemiBold" },
});
