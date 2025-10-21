import AuthHeader from "@/src/components/auth/AuthHeader";
import AuthLayout from "@/src/components/auth/AuthLayout";
import SignUpPrompt from "@/src/components/auth/SignUpPrompt";
import SocialSignInButton from "@/src/components/auth/SocialSignInButton";
import CustomTextInput from "@/src/components/forms/CustomTextInput";
import FormDivider from "@/src/components/forms/FormDivider";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import { theme } from "@/src/theme";
import { useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, Dimensions, Image, StyleSheet, View } from "react-native";
import { useSignUp } from "../hooks/useSignUp";

const { width } = Dimensions.get("window");
const scale = (size: number) => (width / 375) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

type FormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, loading } = useSignUp();
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const validate = (): boolean => {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Please enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8)
      e.password = "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    try {
      const result = await signUp(form.email, form.password, {
        name: form.name,
      });

      if (result?.needsVerification) {
        router.replace({
          pathname: "/(auth)/verify-email",
          params: { email: form.email },
        });
        return;
      }

      router.replace("/(main)");
    } catch (err) {
      Alert.alert(
        "Sign Up Failed",
        err instanceof Error ? err.message : "An error occurred"
      );
    }
  };

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
        title="Create Account"
        subtitle="Join thousands of Filipino singles"
        showLogo={false}
      />

      <View style={styles.formContainer}>
        <CustomTextInput
          label="Full name"
          value={form.name}
          onChangeText={(t) => {
            setForm((s) => ({ ...s, name: t }));
            setErrors((s) => ({ ...s, name: undefined }));
          }}
          placeholder="Enter your full name"
          LeftIcon={User}
          autoCapitalize="words"
          autoComplete="name"
          error={errors.name}
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
          questionText="Already with us?"
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
    width: Math.min(160, width * 0.45),
    height: undefined,
    aspectRatio: 1.8,
  },
  formContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: moderateScale(12),
  },
});
