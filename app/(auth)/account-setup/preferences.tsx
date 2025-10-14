// app/(auth)/account-setup/preferences.tsx
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Calendar,
  Heart,
  MapPin,
  Minus,
  Plus,
  Users,
} from "lucide-react-native";
import React, { useState } from "react";
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
import PrimaryButton from "../../../src/components/ui/PrimaryButton";

const { width } = Dimensions.get("window");

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

// Age Range Constants
const MIN_AGE = 18;
const MAX_AGE = 70;

interface Preferences {
  interestedIn: string;
  ageRange: [number, number];
  maxDistance: number;
  relationship: string;
}

interface OptionButtonProps {
  option: string;
  selected: boolean;
  onSelect: () => void;
  icon?: React.ReactNode;
}

const OptionButton: React.FC<OptionButtonProps> = ({
  option,
  selected,
  onSelect,
  icon,
}) => (
  <TouchableOpacity
    onPress={onSelect}
    style={[styles.optionRow, selected && styles.optionRowActive]}
    activeOpacity={0.9}
    accessibilityRole="radio"
    accessibilityState={{ selected }}
    accessibilityLabel={`Select ${option}`}
  >
    {icon && <View style={styles.optionIconBox}>{icon}</View>}

    <Text
      style={[styles.optionText, selected && styles.optionTextActive]}
      numberOfLines={2}
    >
      {option}
    </Text>

    <View style={[styles.radio, selected && styles.radioActive]}>
      {selected && <View style={styles.radioDot} />}
    </View>
  </TouchableOpacity>
);

interface DistanceButtonProps {
  distance: number;
  selected: boolean;
  onSelect: () => void;
}

const DistanceButton: React.FC<DistanceButtonProps> = ({
  distance,
  selected,
  onSelect,
}) => (
  <TouchableOpacity
    onPress={onSelect}
    style={[styles.distanceBtn, selected && styles.distanceBtnActive]}
    activeOpacity={0.9}
    accessibilityRole="radio"
    accessibilityState={{ selected }}
    accessibilityLabel={`Select ${distance} kilometers`}
  >
    <Text style={[styles.distanceText, selected && styles.distanceTextActive]}>
      {distance}km
    </Text>
  </TouchableOpacity>
);

interface AgeRangeControlProps {
  minAge: number;
  maxAge: number;
  onRangeChange: (min: number, max: number) => void;
}

const AgeRangeControl: React.FC<AgeRangeControlProps> = ({
  minAge,
  maxAge,
  onRangeChange,
}) => {
  const adjustMinAge = (delta: number) => {
    const newMin = Math.max(MIN_AGE, Math.min(minAge + delta, maxAge - 1));
    onRangeChange(newMin, maxAge);
  };

  const adjustMaxAge = (delta: number) => {
    const newMax = Math.max(minAge + 1, Math.min(maxAge + delta, MAX_AGE));
    onRangeChange(minAge, newMax);
  };

  return (
    <View style={styles.ageControlContainer}>
      {/* Minimum Age */}
      <View style={styles.ageControl}>
        <Text style={styles.ageControlLabel}>Min Age</Text>
        <View style={styles.ageControlButtons}>
          <TouchableOpacity
            onPress={() => adjustMinAge(-1)}
            style={styles.ageButton}
            disabled={minAge <= MIN_AGE}
            activeOpacity={0.7}
          >
            <Minus
              size={18}
              color={minAge <= MIN_AGE ? "rgba(255,255,255,0.3)" : WHITE}
              strokeWidth={2.5}
            />
          </TouchableOpacity>

          <View style={styles.ageValueBox}>
            <Text style={styles.ageValue}>{minAge}</Text>
          </View>

          <TouchableOpacity
            onPress={() => adjustMinAge(1)}
            style={styles.ageButton}
            disabled={minAge >= maxAge - 1}
            activeOpacity={0.7}
          >
            <Plus
              size={18}
              color={minAge >= maxAge - 1 ? "rgba(255,255,255,0.3)" : WHITE}
              strokeWidth={2.5}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.ageDivider} />

      {/* Maximum Age */}
      <View style={styles.ageControl}>
        <Text style={styles.ageControlLabel}>Max Age</Text>
        <View style={styles.ageControlButtons}>
          <TouchableOpacity
            onPress={() => adjustMaxAge(-1)}
            style={styles.ageButton}
            disabled={maxAge <= minAge + 1}
            activeOpacity={0.7}
          >
            <Minus
              size={18}
              color={maxAge <= minAge + 1 ? "rgba(255,255,255,0.3)" : WHITE}
              strokeWidth={2.5}
            />
          </TouchableOpacity>

          <View style={styles.ageValueBox}>
            <Text style={styles.ageValue}>{maxAge}</Text>
          </View>

          <TouchableOpacity
            onPress={() => adjustMaxAge(1)}
            style={styles.ageButton}
            disabled={maxAge >= MAX_AGE}
            activeOpacity={0.7}
          >
            <Plus
              size={18}
              color={maxAge >= MAX_AGE ? "rgba(255,255,255,0.3)" : WHITE}
              strokeWidth={2.5}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function Preferences() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [preferences, setPreferences] = useState<Preferences>({
    interestedIn: "",
    ageRange: [22, 35],
    maxDistance: 50,
    relationship: "",
  });

  const genderOptions = ["Women", "Men", "Everyone"];
  const relationshipOptions = [
    "Long-term relationship",
    "Marriage",
    "Casual dating",
    "Friendship",
    "Not sure yet",
  ];
  const distanceOptions = [10, 25, 50, 100, 200];

  const updatePreference = <K extends keyof Preferences>(
    key: K,
    value: Preferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handleAgeRangeChange = (min: number, max: number) => {
    setPreferences((prev) => ({ ...prev, ageRange: [min, max] }));
  };

  const isFormValid = () => {
    return preferences.interestedIn !== "" && preferences.relationship !== "";
  };

  const handleNext = () => {
    if (isFormValid()) {
      // Format preferences for algorithm
      const formattedPreferences = {
        interestedIn: preferences.interestedIn.toLowerCase(),
        ageMin: preferences.ageRange[0],
        ageMax: preferences.ageRange[1],
        maxDistanceKm: preferences.maxDistance,
        relationshipGoal: preferences.relationship
          .toLowerCase()
          .replace(/\s+/g, "_"),
        timestamp: new Date().toISOString(),
      };

      console.log("Formatted preferences for algorithm:", formattedPreferences);
      router.push("/(auth)/account-setup/verification-upload");
    }
  };

  const renderSectionHeader = (icon: React.ReactNode, title: string) => (
    <View style={styles.sectionHeader}>
      {icon}
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={BRAND_BG}
        translucent={false}
      />
      {Platform.OS === "ios" && (
        <View style={{ height: insets.top, backgroundColor: BRAND_BG }} />
      )}

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
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              {[1, 2, 3, 4, 5].map((step, idx) => (
                <View
                  key={step}
                  style={[
                    styles.progressDot,
                    idx === 3 && styles.progressDotActive,
                  ]}
                />
              ))}
            </View>

            <View style={styles.headerContainer}>
              <Text style={styles.title}>Your preferences</Text>
            </View>

            <Text style={styles.subtitle}>Help us find your perfect match</Text>
          </View>

          <View style={styles.formContainer}>
            {/* Interested In */}
            <View style={styles.section}>
              {renderSectionHeader(
                <Heart size={20} color={ACCENT_PINK} />,
                "I'm interested in"
              )}
              <View style={styles.optionsGroup}>
                {genderOptions.map((option) => (
                  <OptionButton
                    key={option}
                    option={option}
                    selected={preferences.interestedIn === option}
                    onSelect={() => updatePreference("interestedIn", option)}
                    icon={
                      <Users
                        size={18}
                        color={ACCENT_PURPLE}
                        strokeWidth={2.5}
                      />
                    }
                  />
                ))}
              </View>
            </View>

            {/* Age Range */}
            <View style={styles.section}>
              {renderSectionHeader(
                <Calendar size={20} color={ACCENT_PINK} />,
                `Age range: ${preferences.ageRange[0]} - ${preferences.ageRange[1]}`
              )}
              <View style={styles.ageBox}>
                <AgeRangeControl
                  minAge={preferences.ageRange[0]}
                  maxAge={preferences.ageRange[1]}
                  onRangeChange={handleAgeRangeChange}
                />
              </View>
            </View>

            {/* Distance */}
            <View style={styles.section}>
              {renderSectionHeader(
                <MapPin size={20} color={ACCENT_PINK} />,
                "Maximum distance"
              )}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.distanceScrollContent}
              >
                <View style={styles.distanceGroup}>
                  {distanceOptions.map((distance) => (
                    <DistanceButton
                      key={distance}
                      distance={distance}
                      selected={preferences.maxDistance === distance}
                      onSelect={() => updatePreference("maxDistance", distance)}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Relationship Type */}
            <View style={styles.section}>
              {renderSectionHeader(
                <Heart size={20} color={ACCENT_PINK} />,
                "Looking for"
              )}
              <View style={styles.optionsGroup}>
                {relationshipOptions.map((option) => (
                  <OptionButton
                    key={option}
                    option={option}
                    selected={preferences.relationship === option}
                    onSelect={() => updatePreference("relationship", option)}
                  />
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

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
            accessibilityLabel="Continue to verification upload"
            accessibilityHint="Proceeds to identity verification step"
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
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
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

  formContainer: {
    gap: 28,
  },

  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "DMSans-SemiBold",
    color: WHITE,
    letterSpacing: 0.3,
  },

  optionsGroup: {
    gap: 12,
  },

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
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
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

  // Age Range Control
  ageBox: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    paddingVertical: Platform.OS === "ios" ? 24 : 20,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  ageControlContainer: {
    gap: 20,
  },
  ageControl: {
    gap: 12,
  },
  ageControlLabel: {
    fontSize: 14,
    fontFamily: "DMSans-SemiBold",
    color: "rgba(255, 255, 255, 0.85)",
    letterSpacing: 0.3,
  },
  ageControlButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ageButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(141, 105, 246, 0.15)",
    borderWidth: 1.5,
    borderColor: "rgba(141, 105, 246, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  ageValueBox: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    backgroundColor: "rgba(239, 62, 120, 0.12)",
    borderWidth: 1.5,
    borderColor: ACCENT_PINK,
    alignItems: "center",
    justifyContent: "center",
  },
  ageValue: {
    fontSize: 28,
    fontFamily: "DMSans-Bold",
    color: WHITE,
    letterSpacing: 0.5,
  },
  ageDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    marginVertical: 4,
  },

  distanceScrollContent: {
    paddingRight: 20,
  },
  distanceGroup: {
    flexDirection: "row",
    gap: 12,
  },
  distanceBtn: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: SURFACE_BORDER,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    minWidth: 70,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  distanceBtnActive: {
    backgroundColor: "rgba(239, 62, 120, 0.12)",
    borderColor: ACCENT_PINK,
    ...Platform.select({
      ios: {
        shadowColor: ACCENT_PINK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  distanceText: {
    fontSize: 14,
    fontFamily: "DMSans-SemiBold",
    color: WHITE,
    letterSpacing: 0.2,
  },
  distanceTextActive: {
    fontFamily: "DMSans-Bold",
  },

  footer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: "rgba(15, 8, 20, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(141, 105, 246, 0.15)",
  },
});
