import AccountHeader from "@/src/components/account/AccountHeader";
import AccountProgress from "@/src/components/account/AccountProgress";
import CustomTextInput from "@/src/components/forms/CustomTextInput";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import { accountApi } from "@/src/features/account/api/accountApi";
import type { UserType } from "@/src/features/auth/api/authApi";
import { useSignupStore } from "@/src/stores/signupStore";
import { theme } from "@/src/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, Heart, User } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FormState = {
  firstName: string;
  lastName: string;
  age: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

export default function AccountBasicInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    userType?: string;
    firstName?: string;
  }>();

  const { getSignupData, clearSignupData } = useSignupStore();

  const [form, setForm] = useState<FormState>({
    firstName: params.firstName || "",
    lastName: "",
    age: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<keyof FormState, boolean>>({
    firstName: false,
    lastName: false,
    age: false,
  });
  const [loading, setLoading] = useState(false);

  const userType = params.userType as UserType;

  // 📦 Load firstName from Zustand if missing
  useEffect(() => {
    if (!params.firstName) {
      console.log("⚠️ Missing firstName param, loading from Zustand...");
      const storedData = getSignupData();

      if (storedData) {
        console.log("✅ Loaded from Zustand:", storedData);
        setForm((prev) => ({ ...prev, firstName: storedData.firstName }));
      }
    }
  }, []);

  useEffect(() => {
    if (!userType || (userType !== "filipina" && userType !== "foreigner")) {
      Alert.alert("Error", "User type not found. Please start from signup.");
      router.replace("/(auth)/user-type-selection");
    }
  }, [userType]);

  const getUserTypeLabel = (): string => {
    if (userType === "filipina") return "Filipina";
    if (userType === "foreigner") return "Foreign Man";
    return "User";
  };

  const getGenderLabel = (): string => {
    if (userType === "filipina") return "Female";
    if (userType === "foreigner") return "Male";
    return "Not specified";
  };

  const validateField = (
    field: keyof FormState,
    value: string
  ): string | undefined => {
    switch (field) {
      case "firstName":
        if (!value.trim()) return "First name is required";
        if (value.trim().length < 2)
          return "First name must be at least 2 characters";
        return undefined;

      case "lastName":
        if (!value.trim()) return "Last name is required";
        if (value.trim().length < 2)
          return "Last name must be at least 2 characters";
        return undefined;

      case "age":
        if (!value.trim()) return "Age is required";
        const ageNum = parseInt(value, 10);
        if (isNaN(ageNum)) return "Please enter a valid age";
        if (ageNum < 18) return "You must be at least 18 years old";
        if (ageNum > 70) return "Age must be 70 or younger";
        return undefined;

      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    (Object.keys(form) as (keyof FormState)[]).forEach((field) => {
      const error = validateField(field, form[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    const error = validateField(field, form[field]);
    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleNext = async () => {
    setTouched({ firstName: true, lastName: true, age: true });

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await accountApi.saveBasicInfo({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        age: parseInt(form.age, 10),
        userType: userType,
      });

      if (result?.ok) {
        console.log("✅ Basic info saved:", result.data);

        // 🗑️ CLEAR ZUSTAND STORE AFTER SUCCESSFUL SAVE
        clearSignupData();
        console.log("🗑️ Signup data cleared from Zustand");

        router.push({
          pathname: "/(auth)/account-setup/profile-photos",
          params: { userType },
        });
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to save profile information"
      );
    } finally {
      setLoading(false);
    }
  };

  const isValid =
    !errors.firstName &&
    !errors.lastName &&
    !errors.age &&
    form.firstName.trim() !== "" &&
    form.lastName.trim() !== "" &&
    form.age.trim() !== "";

  if (!userType || (userType !== "filipina" && userType !== "foreigner")) {
    return null;
  }

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        translucent={false}
        backgroundColor={theme.colors.dalisay[950]}
      />
      {Platform.OS === "ios" && (
        <View
          style={{
            height: insets.top,
            backgroundColor: theme.colors.dalisay[950],
          }}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + 16, 32) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.top}>
            <AccountProgress steps={6} activeIndex={0} />
            <AccountHeader
              title={`${getUserTypeLabel()} Account Setup`}
              subtitle="Tell us a bit about yourself"
            />
          </View>

          <View style={styles.infoBanner}>
            <Heart size={16} color={theme.colors.amihan[400]} />
            <Text style={styles.infoBannerText}>
              Account type:{" "}
              <Text style={styles.infoBannerBold}>{getUserTypeLabel()}</Text>
              {"\n"}
              Gender:{" "}
              <Text style={styles.infoBannerBold}>{getGenderLabel()}</Text>{" "}
              (auto-assigned)
            </Text>
          </View>

          <View style={styles.formContainer}>
            <CustomTextInput
              label="First Name"
              value={form.firstName}
              onChangeText={(text) => handleFieldChange("firstName", text)}
              onBlur={() => handleBlur("firstName")}
              placeholder="Enter your first name"
              LeftIcon={User}
              autoCapitalize="words"
              autoComplete="given-name"
              error={touched.firstName ? errors.firstName : undefined}
            />

            <CustomTextInput
              label="Last Name"
              value={form.lastName}
              onChangeText={(text) => handleFieldChange("lastName", text)}
              onBlur={() => handleBlur("lastName")}
              placeholder="Enter your last name"
              LeftIcon={User}
              autoCapitalize="words"
              autoComplete="family-name"
              error={touched.lastName ? errors.lastName : undefined}
            />

            <CustomTextInput
              label="Age"
              value={form.age}
              onChangeText={(text) =>
                handleFieldChange("age", text.replace(/[^0-9]/g, ""))
              }
              onBlur={() => handleBlur("age")}
              placeholder="18 - 70 years old"
              LeftIcon={Calendar}
              keyboardType="number-pad"
              maxLength={2}
              error={touched.age ? errors.age : undefined}
            />
          </View>

          <View style={styles.helperContainer}>
            <Text style={styles.helperText}>
              🔒 Your information is secure and will only be visible according
              to your privacy settings
            </Text>
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom + 12, 20) },
          ]}
        >
          <PrimaryButton
            title="Continue"
            onPress={handleNext}
            disabled={!isValid || loading}
            loading={loading}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.dalisay[950] },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: Platform.OS === "ios" ? theme.spacing.lg : theme.spacing.md,
  },
  top: { alignItems: "center", marginBottom: theme.spacing.md },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239,62,120,0.12)",
    borderRadius: 14,
    padding: 14,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: "rgba(239,62,120,0.25)",
    gap: 10,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    fontFamily: theme.fontFamilies.body.regular,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 19,
  },
  infoBannerBold: {
    fontFamily: theme.fontFamilies.body.semiBold,
    color: theme.colors.amihan[300],
  },
  formContainer: { gap: theme.spacing.sm },
  helperContainer: { marginTop: theme.spacing.md, paddingHorizontal: 2 },
  helperText: {
    fontSize: 12,
    fontFamily: theme.fontFamilies.body.regular,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    backgroundColor: "rgba(15, 8, 20, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(141, 105, 246, 0.06)",
  },
});
