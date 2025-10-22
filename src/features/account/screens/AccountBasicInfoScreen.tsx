// ...existing code...
import AccountHeader from "@/src/components/account/AccountHeader";
import AccountProgress from "@/src/components/account/AccountProgress";
import GenderOption from "@/src/components/account/GenderOption";
import CustomTextInput from "@/src/components/forms/CustomTextInput";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import { theme } from "@/src/theme";
import { useRouter } from "expo-router";
import { Calendar, User } from "lucide-react-native";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAccountBasicInfo } from "../hooks/useAccountBasicInfo";
// ...existing code...

export default function AccountBasicInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    form,
    setField,
    touched,
    setTouched,
    errors,
    isValid,
    loading,
    saveBasicInfo,
  } = useAccountBasicInfo();

  // use explicit label/value pairs
  const genderOptions = [
    { label: "Female", value: "female" },
    { label: "Male", value: "male" },
    { label: "Prefer not to say", value: "prefer_not_to_say" },
  ];

  const handleNext = async () => {
    setTouched({ firstName: true, lastName: true, age: true, gender: true });
    if (!isValid) return;
    const res = await saveBasicInfo();
    if (res?.ok) {
      router.push("/(auth)/account-setup/profile-photos");
    } else {
      // show error UI / toast as needed
    }
  };

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
            <AccountProgress steps={5} activeIndex={0} />
            <AccountHeader />
          </View>

          <View style={styles.formContainer}>
            <CustomTextInput
              label="First Name"
              value={form.firstName}
              onChangeText={(t) => setField("firstName", t)}
              onBlur={() => setTouched((s) => ({ ...s, firstName: true }))}
              placeholder="Enter your first name"
              LeftIcon={User}
              autoCapitalize="words"
              autoComplete="given-name"
              error={errors.firstName}
            />

            <CustomTextInput
              label="Last Name"
              value={form.lastName}
              onChangeText={(t) => setField("lastName", t)}
              onBlur={() => setTouched((s) => ({ ...s, lastName: true }))}
              placeholder="Enter your last name"
              LeftIcon={User}
              autoCapitalize="words"
              autoComplete="family-name"
              error={errors.lastName}
            />

            <CustomTextInput
              label="Age"
              value={form.age}
              onChangeText={(text) =>
                setField("age", text.replace(/[^0-9]/g, ""))
              }
              onBlur={() => setTouched((s) => ({ ...s, age: true }))}
              placeholder="18 - 70 years old"
              LeftIcon={Calendar}
              keyboardType="number-pad"
              maxLength={2}
              error={errors.age}
            />

            <View style={styles.genderSection}>
              <Text style={styles.genderLabel}>Gender</Text>
              <View
                style={styles.genderOptionsColumn}
                accessibilityRole="radiogroup"
                accessible
              >
                {genderOptions.map((opt) => (
                  <GenderOption
                    key={opt.value}
                    option={opt.label}
                    selected={form.gender === opt.value}
                    onSelect={() => {
                      setField("gender", opt.value);
                      setTouched((s) => ({ ...s, gender: true }));
                    }}
                  />
                ))}
              </View>
              {errors.gender ? (
                <Text style={styles.fieldError}>{errors.gender}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.helperContainer}>
            <Text style={styles.helperText}>
              Your information is secure and will only be visible according to
              your privacy settings
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

// reduced spacing values for tighter layout
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.dalisay[950] },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.md, // reduced from lg
    paddingTop: Platform.OS === "ios" ? theme.spacing.lg : theme.spacing.md, // reduced
  },
  top: { alignItems: "center", marginBottom: theme.spacing.md }, // reduced
  formContainer: { gap: theme.spacing.sm }, // reduced gap
  genderSection: { marginTop: theme.spacing.sm }, // reduced
  genderLabel: {
    fontSize: 13,
    fontFamily: theme.fontFamilies.body.semiBold,
    color: "rgba(255,255,255,0.95)",
    marginBottom: theme.spacing.xs ?? 6,
  },
  genderOptionsColumn: {
    gap: theme.spacing.sm,
    flexDirection: "column",
  },
  helperContainer: { marginTop: theme.spacing.sm, paddingHorizontal: 2 },
  helperText: {
    fontSize: 12,
    fontFamily: theme.fontFamilies.body.regular,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: theme.spacing.md, // reduced
    paddingTop: theme.spacing.sm,
    backgroundColor: "rgba(15, 8, 20, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(141, 105, 246, 0.06)", // lighter border
  },
  fieldError: {
    marginTop: theme.spacing.xs ?? 6,
    color: theme.colors.amihan?.[500] ?? "#EF3E78",
    fontSize: 12,
    fontFamily: theme.fontFamilies.body.regular,
  },
});
// ...existing code...
