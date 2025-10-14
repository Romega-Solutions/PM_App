// app/(auth)/signup.tsx
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Chrome,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomTextInput from "../../src/components/forms/CustomTextInput";
import PrimaryButton from "../../src/components/ui/PrimaryButton";

interface FormData {
  firstName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function SignUp() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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

  const handleGoogle = () => {
    // TODO: Google sign up
    console.log("Google Sign Up");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#340839" }}>
      <StatusBar
        translucent
        barStyle="light-content"
        backgroundColor="transparent"
      />

      {/* Full-screen brand gradient */}
      <LinearGradient
        colors={["#340839", "rgba(141, 105, 246, 0.15)", "#340839"]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            minHeight: SCREEN_HEIGHT + insets.top + insets.bottom,
            paddingTop: insets.top + 60,
            paddingBottom: insets.bottom + 32,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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

            {/* Title - Lora */}
            <Text
              style={[styles.title, { fontFamily: "Lora", fontWeight: "600" }]}
            >
              Join PinayMate
            </Text>

            {/* Subhead - Lora */}
            <Text
              style={[styles.head, { fontFamily: "Lora", fontWeight: "500" }]}
            >
              Find your perfect Filipino match today
            </Text>
          </View>

          {/* Form */}
          <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
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

            {/* Primary CTA - DMSans 700 to match Sign In */}
            <PrimaryButton
              title="Create Account"
              onPress={handleSignUp}
              accessibilityLabel="Create your account"
            />

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text
                style={[
                  styles.dividerText,
                  { fontFamily: "Lora", fontWeight: "500" },
                ]}
              >
                Or continue with
              </Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Button (Lucide Chrome icon, Google-style) */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogle}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Sign up with Google"
            >
              <Chrome
                size={18}
                color="#4285F4"
                strokeWidth={2.4}
                style={{ marginRight: 10 }}
              />
              <Text
                style={[
                  styles.googleBtnText,
                  { fontFamily: "DMSans", fontWeight: "700" },
                ]}
              >
                Continue with Google
              </Text>
            </TouchableOpacity>

            {/* Sign In Link */}
            <View style={{ alignItems: "center", paddingVertical: 20 }}>
              <Text
                style={[
                  styles.supportText,
                  { fontFamily: "DMSans", fontWeight: "400" },
                ]}
              >
                Already finding love with us?
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/signin")}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Sign in to existing account"
              >
                <Text
                  style={[
                    styles.linkCta,
                    { fontFamily: "DMSans", fontWeight: "700" },
                  ]}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Back Button overlay padded by safe area */}
      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 12, left: 16 }]}
        onPress={() => router.back()}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    position: "absolute",
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerWrap: {
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 24,
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

  // Title (Lora)
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

  // Subhead (Lora)
  head: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 24,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 16, // tighter to Google button
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

  // Google button (white, bordered)
  googleBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: Platform.select({ ios: 28, android: 26 }),
    height: Platform.select({ ios: 56, android: 52 }),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 16, // tightened spacing below
  },
  googleBtnText: {
    color: "#1F2937",
    fontSize: 16,
    letterSpacing: 0.2,
  },

  supportText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  linkCta: {
    color: "#EF3E78",
    fontSize: 16,
    letterSpacing: 0.3,
  },
});
