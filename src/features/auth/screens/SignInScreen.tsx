import AuthHeader from "@/src/components/auth/AuthHeader";
import AuthLayout from "@/src/components/auth/AuthLayout";
import SignUpPrompt from "@/src/components/auth/SignUpPrompt";
import SocialSignInButton from "@/src/components/auth/SocialSignInButton";
import TestAccountsHelper from "@/src/components/dev/TestAccountsHelper";
import CustomTextInput from "@/src/components/forms/CustomTextInput";
import FormDivider from "@/src/components/forms/FormDivider";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import { semanticColors, theme } from "@/src/theme";
import { useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
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
        error instanceof Error ? error.message : "An error occurred"
      );
    }
  };

  // Handle test account selection
  const handleTestAccountSelect = async (
    testEmail: string,
    testPassword: string
  ) => {
    setEmail(testEmail);
    setPassword(testPassword);
    setEmailError("");
    setPasswordError("");

    // Auto sign in with test account
    try {
      await signIn(testEmail, testPassword);
    } catch (error) {
      Alert.alert(
        "Sign In Failed",
        error instanceof Error ? error.message : "An error occurred"
      );
    }
  };

  // Handle Google sign in (placeholder)
  const handleGoogleSignIn = async () => {
    Alert.alert("Coming Soon", "Google sign-in will be available soon!");
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    router.push("/(auth)/forgot-password");
  };

  return (
    <AuthLayout showBackButton>
      {/* Header */}
      <AuthHeader
        title="Welcome Back"
        subtitle="Continue your journey to find love"
        showLogo={true}
      />

      {/* Form Container */}
      <View style={styles.formContainer}>
        {/* Test Accounts Helper - Only visible in development */}
        <TestAccountsHelper onSelectAccount={handleTestAccountSelect} />

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
          secureTextEntry={!showPassword}
          autoComplete="current-password"
          error={passwordError}
        />

        {/* Forgot Password Link */}
        <TouchableOpacity
          onPress={handleForgotPassword}
          style={styles.forgotPasswordContainer}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Forgot password"
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

        {/* Divider */}
        <FormDivider text="Or continue with" />

        {/* Social Sign In */}
        <SocialSignInButton provider="google" onPress={handleGoogleSignIn} />

        {/* Sign Up Prompt */}
        <SignUpPrompt
          questionText="New to PinayMate?"
          actionText="Create Account"
        />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: theme.spacing.xl,
    paddingVertical: moderateScale(4),
  },
  forgotPasswordText: {
    color: semanticColors.primary,
    fontSize: moderateScale(14),
    fontFamily: theme.fontFamilies.body.semiBold,
    letterSpacing: Platform.select({ ios: 0.2, android: 0.15, web: 0.2 }),
  },
});
