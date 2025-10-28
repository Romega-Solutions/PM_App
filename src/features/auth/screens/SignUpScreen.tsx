import AuthHeader from "@/src/components/auth/AuthHeader";
import AuthLayout from "@/src/components/auth/AuthLayout";
import SignUpPrompt from "@/src/components/auth/SignUpPrompt";
import SocialSignInButton from "@/src/components/auth/SocialSignInButton";
import CustomTextInput from "@/src/components/forms/CustomTextInput";
import FormDivider from "@/src/components/forms/FormDivider";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import { theme } from "@/src/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, Dimensions, Image, StyleSheet, Text, View } from "react-native";
import { useSignUp } from "../hooks/useSignUp";

const { width } = Dimensions.get("window");
const scale = (size: number) => (width / 375) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

type UserType = "filipina" | "foreigner";

type FormState = {
  firstName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function SignUpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ userType?: string }>();
  const { signUp, loading } = useSignUp();

  const [form, setForm] = useState<FormState>({
    firstName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  // Cast and validate userType
  const userType = params.userType as UserType;

  // Redirect if no userType selected
  useEffect(() => {
    if (!userType || (userType !== "filipina" && userType !== "foreigner")) {
      console.warn("⚠️ No valid userType found, redirecting to selection");
      router.replace("/(auth)/user-type-selection");
    }
  }, [userType, router]);

  const userTypeLabel = userType === "filipina" ? "Filipina" : "Foreign Man";

  const validate = (): boolean => {
    const e: Partial<FormState> = {};

    if (!form.firstName.trim()) {
      e.firstName = "First name is required";
    } else if (form.firstName.trim().length < 2) {
      e.firstName = "First name must be at least 2 characters";
    }

    if (!form.email.trim()) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Please enter a valid email";
    }

    if (!form.password) {
      e.password = "Password is required";
    } else if (form.password.length < 8) {
      e.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      e.password = "Password must include uppercase, lowercase, and number";
    }

    if (form.password !== form.confirmPassword) {
      e.confirmPassword = "Passwords do not match";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    // Double-check userType exists
    if (!userType) {
      Alert.alert("Error", "Please select your account type first");
      router.replace("/(auth)/user-type-selection");
      return;
    }

    try {
      console.log("🚀 Starting signup with:", {
        email: form.email,
        firstName: form.firstName.trim(),
        userType,
      });

      const result = await signUp(form.email, form.password, {
        firstName: form.firstName.trim(),
        userType: userType,
      });

      console.log("✅ Signup result:", result);

      if (result?.needsVerification) {
        console.log("📧 Navigating to email verification with params:", {
          email: form.email,
          firstName: form.firstName.trim(),
          userType,
        });

        router.replace({
          pathname: "/(auth)/verify-email",
          params: {
            email: form.email,
            firstName: form.firstName.trim(), // Use trimmed version
            userType: userType,
          },
        });
        return;
      }

      // If no verification needed, go directly to basic info
      console.log("🎯 No verification needed, going to basic info with:", {
        userType,
        firstName: form.firstName.trim(),
      });

      router.replace({
        pathname: "/(auth)/account-setup/basic-info",
        params: {
          userType: userType,
          firstName: form.firstName.trim(), // Use trimmed version
        },
      });
    } catch (err) {
      console.error("❌ Signup error:", err);
      Alert.alert(
        "Sign Up Failed",
        err instanceof Error ? err.message : "An error occurred"
      );
    }
  };

  // Don't render if userType is invalid
  if (!userType || (userType !== "filipina" && userType !== "foreigner")) {
    return null;
  }

  return (
    <AuthLayout showBackButton>
      {/* Logo above header */}
      <View style={styles.logoWrap}>
        <Image
          source={require("@/assets/logo-no-bg.png")}
          style={styles.logo}
          resizeMode="contain"
          accessible
          accessibilityLabel="PinayMate logo"
        />
      </View>

      <AuthHeader
        title={`Create Your ${userTypeLabel} Account`}
        subtitle="Join thousands of Filipino singles worldwide"
        showLogo={false}
      />

      {/* User Type Badge */}
      <View style={styles.userTypeBadge}>
        <Text style={styles.userTypeBadgeText}>
          Account Type: {userTypeLabel}
        </Text>
      </View>

      <View style={styles.formContainer}>
        <CustomTextInput
          label="First name"
          value={form.firstName}
          onChangeText={(t) => {
            setForm((s) => ({ ...s, firstName: t }));
            setErrors((s) => ({ ...s, firstName: undefined }));
          }}
          placeholder="Enter your first name"
          LeftIcon={User}
          autoCapitalize="words"
          autoComplete="given-name"
          error={errors.firstName}
        />

        <CustomTextInput
          label="Email"
          value={form.email}
          onChangeText={(t) => {
            setForm((s) => ({ ...s, email: t }));
            setErrors((s) => ({ ...s, email: undefined }));
          }}
          placeholder="Enter your email"
          LeftIcon={Mail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={errors.email}
        />

        <CustomTextInput
          label="Password"
          value={form.password}
          onChangeText={(t) => {
            setForm((s) => ({ ...s, password: t }));
            setErrors((s) => ({ ...s, password: undefined }));
          }}
          placeholder="Create a strong password"
          LeftIcon={Lock}
          RightIcon={showPassword ? EyeOff : Eye}
          onRightIconPress={() => setShowPassword((v) => !v)}
          secureTextEntry={!showPassword}
          autoComplete="password-new"
          error={errors.password}
        />

        <CustomTextInput
          label="Confirm Password"
          value={form.confirmPassword}
          onChangeText={(t) => {
            setForm((s) => ({ ...s, confirmPassword: t }));
            setErrors((s) => ({ ...s, confirmPassword: undefined }));
          }}
          placeholder="Confirm your password"
          LeftIcon={Lock}
          RightIcon={showConfirm ? EyeOff : Eye}
          onRightIconPress={() => setShowConfirm((v) => !v)}
          secureTextEntry={!showConfirm}
          autoComplete="password-new"
          error={errors.confirmPassword}
        />

        <PrimaryButton
          title="Create Account"
          onPress={handleSignUp}
          loading={loading}
          showChevron
        />

        <FormDivider text="Or continue with" />
        <SocialSignInButton
          provider="google"
          onPress={() => console.log("google")}
        />

        <SignUpPrompt
          questionText="Already have an account?"
          actionText="Sign In"
          onPress={() => router.push("/(auth)/signin")}
        />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  logoWrap: {
    alignItems: "center",
    marginTop: moderateScale(8),
    marginBottom: theme.spacing.sm,
  },
  logo: {
    width: Math.min(140, width * 0.4),
    height: undefined,
    aspectRatio: 1.8,
  },
  userTypeBadge: {
    backgroundColor: "rgba(141,105,246,0.15)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "rgba(141,105,246,0.3)",
  },
  userTypeBadgeText: {
    fontSize: 13,
    fontFamily: theme.fontFamilies.body.semiBold,
    color: theme.colors.dalisay[400],
    textAlign: "center",
  },
  formContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: moderateScale(12),
  },
});
