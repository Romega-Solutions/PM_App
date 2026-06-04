import AuthHeader from "@/src/components/auth/AuthHeader";
import AuthLayout from "@/src/components/auth/AuthLayout";
import SignUpPrompt from "@/src/components/auth/SignUpPrompt";
import SocialSignInButton from "@/src/components/auth/SocialSignInButton";
import CustomTextInput from "@/src/components/forms/CustomTextInput";
import FormDivider from "@/src/components/forms/FormDivider";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import { theme, useTheme, type SemanticColors } from "@/src/theme";
import { useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSignIn } from "../hooks/useSignIn";

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, loading } = useSignIn();
  const { colors } = useTheme();
  const styles = createStyles(colors);

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

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    Alert.alert(
      "Unavailable",
      "Google sign-in is not available in this build.",
    );
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    router.push("/(auth)/forgot-password");
  };

  return (
    <AuthLayout scrollable={false}>
      {/* Logo only — title/subtitle removed to keep the screen on one page */}
      <AuthHeader showLogo={true} />

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

        {/* Password label row — "Forgot Password?" sits inline to the right */}
        <View style={styles.passwordLabelRow}>
          <Text style={styles.passwordLabel}>Password</Text>
          <Pressable
            onPress={handleForgotPassword}
            style={styles.forgotPasswordButton}
            hitSlop={theme.hitSlop.sm}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Forgot password"
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </Pressable>
        </View>

        {/* Password Input */}
        <CustomTextInput
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
          containerStyle={styles.passwordInput}
        />

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
        <SocialSignInButton
          provider="google"
          onPress={handleGoogleSignIn}
          unavailable
        />

        {/* Sign Up Prompt */}
        <SignUpPrompt
          questionText="New to PinayMate?"
          actionText="Create Account"
        />
      </View>
    </AuthLayout>
  );
}

const createStyles = (colors: SemanticColors) =>
  StyleSheet.create({
    formContainer: {
      paddingHorizontal: theme.spacing.lg,
    },
    passwordLabelRow: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: theme.spacing.sm,
    },
    forgotPasswordButton: {
      // Material 48dp touch target for the inline link.
      minHeight: theme.componentSizes.iconButton,
      justifyContent: "center",
    },
    passwordLabel: {
      ...theme.textStyles.label,
      color: colors.onPrimary,
    },
    passwordInput: {
      marginBottom: theme.spacing.xl,
    },
    forgotPasswordText: {
      color: colors.primary,
      fontFamily: theme.fontFamilies.body.semiBold,
      fontSize: 13,
      letterSpacing: 0,
    },
  });
