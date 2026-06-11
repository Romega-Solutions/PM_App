import AuthHeader from "@/src/components/auth/AuthHeader";
import AuthLayout from "@/src/components/auth/AuthLayout";
import SignUpPrompt from "@/src/components/auth/SignUpPrompt";
import CustomTextInput from "@/src/components/forms/CustomTextInput";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import { semanticColors, theme } from "@/src/theme";
import { useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSignIn } from "../hooks/useSignIn";

const { width } = Dimensions.get("window");
const scale = (size: number) => (width / 375) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, loading } = useSignIn();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Validation errors
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Validate form
  const validateForm = (): boolean => {
    let isValid = true;

    // Email validation
    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email");
      isValid = false;
    } else {
      setEmailError("");
    }

    // Password validation
    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    } else {
      setPasswordError("");
    }

    return isValid;
  };

  // Handle sign in
  const handleSignIn = async () => {
    if (!validateForm()) return;

    try {
      await signIn(email, password);
      // Navigation handled by useSignIn hook
    } catch (error) {
      Alert.alert(
        "Sign In Failed",
        error instanceof Error
          ? error.message
          : "Sign in failed. Check your connection and try again.",
      );
    }
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    router.push("/(auth)/forgot-password");
  };

  return (
    <AuthLayout showBackButton>
      {/* Header */}
      <AuthHeader
        title="Welcome back"
        subtitle="Sign in to continue your profile setup, verification, and match access."
        showLogo={true}
      />

      {/* Form Container */}
      <View style={styles.formContainer}>
        {/* Email Input */}
        <CustomTextInput
          label="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setEmailError("");
          }}
          placeholder="Enter your email"
          LeftIcon={Mail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={emailError}
        />

        {/* Password Input */}
        <CustomTextInput
          label="Password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setPasswordError("");
          }}
          placeholder="Enter your password"
          LeftIcon={Lock}
          RightIcon={showPassword ? EyeOff : Eye}
          onRightIconPress={() => setShowPassword(!showPassword)}
          rightIconAccessibilityLabel={
            showPassword ? "Hide password" : "Show password"
          }
          secureTextEntry={!showPassword}
          autoComplete="current-password"
          error={passwordError}
        />

        <View
          style={styles.trustCard}
          accessible
          accessibilityLabel="Account safety note. PinayMate keeps sign in focused on verified profiles and launch-stage safety checks."
        >
          <ShieldCheck
            size={18}
            color={theme.colors.amihan[300]}
            strokeWidth={2.4}
          />
          <Text style={styles.trustCardText}>
            We keep sign in focused on verified profiles, safety review, and
            clear account recovery before matching access.
          </Text>
        </View>

        {/* Forgot Password Link */}
        <TouchableOpacity
          onPress={handleForgotPassword}
          style={styles.forgotPasswordContainer}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Forgot password"
          accessibilityHint="Opens account recovery for your PinayMate email"
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Sign In Button */}
        <PrimaryButton
          title="Sign In"
          onPress={handleSignIn}
          loading={loading}
          showChevron={true}
        />

        {/* Sign Up Prompt */}
        <SignUpPrompt
          questionText="New to PinayMate?"
          actionText="Create Account"
          onPress={() => router.push("/(auth)/user-type-selection")}
        />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  trustCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(141,105,246,0.24)",
    backgroundColor: "rgba(141,105,246,0.1)",
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  trustCardText: {
    flex: 1,
    color: "rgba(255,255,255,0.78)",
    fontSize: moderateScale(13),
    lineHeight: moderateScale(19),
    fontFamily: theme.fontFamilies.body.regular,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: theme.spacing.xl,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: moderateScale(4),
  },
  forgotPasswordText: {
    color: semanticColors.primary,
    fontSize: moderateScale(14),
    fontFamily: theme.fontFamilies.body.semiBold,
    letterSpacing: Platform.select({ ios: 0.2, android: 0.15, web: 0.2 }),
  },
});
