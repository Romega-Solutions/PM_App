// app/(auth)/account-setup/basic-info.tsx
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Calendar, User, Users } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
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
import CustomTextInput from "../../../src/components/forms/CustomTextInput";
import PrimaryButton from "../../../src/components/ui/PrimaryButton";

const { width, height } = Dimensions.get("window");

// Brand Colors
const BRAND_BG = "#0F0814";
const ACCENT_PURPLE = "#8D69F6";
const ACCENT_PINK = "#EF3E78";
const WHITE = "#FFFFFF";
const SURFACE = "rgba(255,255,255,0.08)";
const SURFACE_BORDER = "rgba(141,105,246,0.25)";
const ICON_BG = "rgba(141,105,246,0.12)";

// Responsive Typography
const TITLE_SIZE = Math.min(width * 0.08, 32);
const SUBTITLE_SIZE = 15;

interface FormData {
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
}

interface GenderOptionProps {
  option: string;
  selected: boolean;
  onSelect: () => void;
}

const GenderOption: React.FC<GenderOptionProps> = ({
  option,
  selected,
  onSelect,
}) => (
  <TouchableOpacity
    onPress={onSelect}
    style={[styles.optionRow, selected && styles.optionRowActive]}
    activeOpacity={0.9}
    accessibilityRole="radio"
    accessibilityState={{ selected }}
    accessibilityLabel={`Select ${option} as gender`}
  >
    <View style={styles.optionIconBox}>
      <Users
        size={18}
        color={selected ? ACCENT_PINK : ACCENT_PURPLE}
        strokeWidth={2.5}
      />
    </View>

    <Text
      style={[styles.optionText, selected && styles.optionTextActive]}
      numberOfLines={1}
    >
      {option}
    </Text>

    <View style={[styles.radio, selected && styles.radioActive]}>
      {selected && <View style={styles.radioDot} />}
    </View>
  </TouchableOpacity>
);

export default function BasicInfo() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
  });

  const genderOptions = useMemo(() => ["Woman", "Man", "Non-binary"], []);
  const minAge = 18;
  const maxAge = 70;

  const isFormValid = () => {
    const ageNum = parseInt(formData.age, 10);
    return (
      formData.firstName.trim().length >= 2 &&
      formData.lastName.trim().length >= 2 &&
      !Number.isNaN(ageNum) &&
      ageNum >= minAge &&
      ageNum <= maxAge &&
      formData.gender !== ""
    );
  };

  const handleNext = () => {
    if (isFormValid()) {
      router.push("/(auth)/account-setup/profile-photos");
    }
  };

  return (
    <View style={styles.root}>
      {/* Status Bar Configuration */}
      <StatusBar
        barStyle="light-content"
        backgroundColor={BRAND_BG}
        translucent={false}
      />
      {Platform.OS === "ios" && (
        <View style={{ height: insets.top, backgroundColor: BRAND_BG }} />
      )}

      {/* Background Gradient */}
      <LinearGradient
        colors={[BRAND_BG, "#1A0F1F", "#2D1B35", BRAND_BG]}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + 24, 40) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progress Indicator */}
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              {[1, 2, 3, 4, 5].map((step, idx) => (
                <View
                  key={step}
                  style={[
                    styles.progressDot,
                    idx === 0 && styles.progressDotActive,
                  ]}
                />
              ))}
            </View>

            {/* Header */}
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Tell us about yourself</Text>
            </View>

            <Text style={styles.subtitle}>
              Let's start with the basics to create your profile
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <CustomTextInput
              label="First Name"
              value={formData.firstName}
              onChangeText={(text) =>
                setFormData((p) => ({ ...p, firstName: text }))
              }
              placeholder="Enter your first name"
              LeftIcon={User}
              autoCapitalize="words"
              autoComplete="given-name"
            />

            <CustomTextInput
              label="Last Name"
              value={formData.lastName}
              onChangeText={(text) =>
                setFormData((p) => ({ ...p, lastName: text }))
              }
              placeholder="Enter your last name"
              LeftIcon={User}
              autoCapitalize="words"
              autoComplete="family-name"
            />

            <CustomTextInput
              label="Age"
              value={formData.age}
              onChangeText={(text) => {
                const clean = text.replace(/[^0-9]/g, "");
                setFormData((p) => ({ ...p, age: clean }));
              }}
              placeholder={`${minAge} - ${maxAge} years old`}
              LeftIcon={Calendar}
              keyboardType="number-pad"
              maxLength={2}
            />

            {/* Gender Selection */}
            <View style={styles.genderSection}>
              <Text style={styles.genderLabel}>Gender</Text>

              <View style={styles.genderOptions}>
                {genderOptions.map((option) => (
                  <GenderOption
                    key={option}
                    option={option}
                    selected={formData.gender === option}
                    onSelect={() =>
                      setFormData((p) => ({ ...p, gender: option }))
                    }
                  />
                ))}
              </View>
            </View>
          </View>

          {/* Helper Text */}
          <View style={styles.helperContainer}>
            <Text style={styles.helperText}>
              Your information is secure and will only be visible according to
              your privacy settings
            </Text>
          </View>
        </ScrollView>

        {/* Footer CTA */}
        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom + 16, 32) },
          ]}
        >
          <PrimaryButton
            title="Continue"
            onPress={handleNext}
            disabled={!isFormValid()}
            accessibilityLabel="Continue to next step"
            accessibilityHint="Proceeds to profile photos setup"
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND_BG,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 32 : 24,
  },

  // Progress Section
  progressSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  progressBar: {
    flexDirection: "row",
    marginBottom: 28,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  progressDotActive: {
    width: 28,
    backgroundColor: ACCENT_PINK,
  },

  // Header
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  title: {
    fontSize: TITLE_SIZE,
    fontFamily: "Lora-Bold",
    color: WHITE,
    textAlign: "center",
    letterSpacing: 0.4,
    ...Platform.select({
      ios: {
        textShadowColor: "rgba(0, 0, 0, 0.6)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
      },
    }),
  },
  subtitle: {
    fontSize: SUBTITLE_SIZE,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
    letterSpacing: 0.2,
  },

  // Form
  formContainer: {
    gap: 20,
  },

  // Gender Section
  genderSection: {
    marginTop: 4,
  },
  genderLabel: {
    fontSize: 14,
    fontFamily: "DMSans-SemiBold",
    color: "rgba(255, 255, 255, 0.95)",
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  genderOptions: {
    gap: 12,
  },

  // Gender Option
  optionRow: {
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: SURFACE_BORDER,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 16 : 14,
    minHeight: Platform.OS === "ios" ? 60 : 56,
    flexDirection: "row",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  optionRowActive: {
    backgroundColor: "rgba(239, 62, 120, 0.12)",
    borderColor: ACCENT_PINK,
    ...Platform.select({
      ios: {
        shadowColor: ACCENT_PINK,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  optionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: ICON_BG,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  optionText: {
    flex: 1,
    color: WHITE,
    fontSize: 16,
    fontFamily: "DMSans-Medium",
    letterSpacing: 0.2,
  },
  optionTextActive: {
    fontFamily: "DMSans-Bold",
  },

  // Radio Button
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: {
    borderColor: ACCENT_PINK,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ACCENT_PINK,
  },

  // Helper Text
  helperContainer: {
    marginTop: 20,
    paddingHorizontal: 8,
  },
  helperText: {
    fontSize: 13,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.65)",
    textAlign: "center",
    lineHeight: 19,
    letterSpacing: 0.2,
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: "rgba(15, 8, 20, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(141, 105, 246, 0.15)",
  },

  // Back Button
  backBtn: {
    position: "absolute",
    zIndex: 10,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});
