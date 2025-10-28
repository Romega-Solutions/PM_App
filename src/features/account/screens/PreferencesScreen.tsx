import AccountProgress from "@/src/components/account/AccountProgress";
import AgeRangeSlider from "@/src/components/preferences/AgeRangeSlider";
import DistanceSlider from "@/src/components/preferences/DistanceSlider";
import PreferenceSection from "@/src/components/preferences/PreferenceSection";
import RelationshipOption from "@/src/components/preferences/RelationshipOption";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import type { UserType } from "@/src/features/auth/api/authApi";
import { theme } from "@/src/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, Heart, MapPin } from "lucide-react-native";
import React, { useEffect } from "react";
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePreferences } from "../hooks/usePreferences";

export default function PreferencesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ userType?: string }>();

  // Get userType from params (passed through the flow)
  const userType = params.userType as UserType;

  const { form, setField, isValid, loading, savePreferences } =
    usePreferences();

  // Redirect if no userType
  useEffect(() => {
    if (!userType || (userType !== "filipina" && userType !== "foreigner")) {
      console.warn(
        "⚠️ No valid userType in preferences, redirecting to signin"
      );
      router.replace("/(auth)/signin");
    }
  }, [userType, router]);

  const relationshipOptions = [
    "Long-term relationship",
    "Marriage",
    "Casual dating",
    "Friendship",
    "Not sure yet",
  ];

  // Auto-derived display text
  const interestedInText = userType === "filipina" ? "Men" : "Women";

  const handleNext = async () => {
    if (!isValid) return;
    const res = await savePreferences();
    if (res?.ok) {
      router.push({
        pathname: "/(auth)/account-setup/verification-upload",
        params: { userType },
      });
    }
  };

  // Don't render if userType is invalid
  if (!userType || (userType !== "filipina" && userType !== "foreigner")) {
    return null;
  }

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.dalisay[950] ?? "#0F0814"}
      />
      {Platform.OS === "ios" && (
        <View
          style={{
            height: insets.top,
            backgroundColor: theme.colors.dalisay[950] ?? "#0F0814",
          }}
        />
      )}

      <LinearGradient
        colors={[theme.colors.dalisay[950] ?? "#0F0814", "#1A0F1F"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + 24, 40) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <AccountProgress steps={5} activeIndex={3} />
          <Text style={styles.title}>Your preferences</Text>
          <Text style={styles.subtitle}>Help us find your perfect match</Text>
        </View>

        <View style={styles.form}>
          {/* Auto-assigned: No need for selection */}
          <View style={styles.autoAssignedBadge}>
            <Heart size={18} color={theme.colors.dalisay[400]} />
            <Text style={styles.autoAssignedText}>
              Looking for:{" "}
              <Text style={styles.autoAssignedValue}>{interestedInText}</Text>
            </Text>
          </View>

          <PreferenceSection
            Icon={Calendar}
            title={`Age range: ${form.ageMin} - ${form.ageMax}`}
          >
            <AgeRangeSlider
              minAge={form.ageMin}
              maxAge={form.ageMax}
              onChange={(vals) => {
                setField("ageMin", vals[0]);
                setField("ageMax", vals[1]);
              }}
            />
          </PreferenceSection>

          <PreferenceSection Icon={MapPin} title="Maximum distance">
            <DistanceSlider
              value={form.maxDistanceKm}
              onChange={(val) => setField("maxDistanceKm", val)}
            />
          </PreferenceSection>

          <PreferenceSection Icon={Heart} title="Looking for">
            <View style={{ gap: 12 }}>
              {relationshipOptions.map((opt) => (
                <RelationshipOption
                  key={opt}
                  option={opt}
                  selected={form.relationshipGoal === opt}
                  onSelect={() => setField("relationshipGoal", opt)}
                />
              ))}
            </View>
          </PreferenceSection>
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
          disabled={!isValid || loading}
          loading={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.dalisay[950] ?? "#0F0814" },
  content: {
    paddingHorizontal: theme.spacing.lg ?? 24,
    paddingTop:
      Platform.OS === "ios"
        ? (theme.spacing.xl ?? 32)
        : (theme.spacing.lg ?? 24),
  },
  header: { alignItems: "center", marginBottom: 24 },
  title: {
    fontSize: 28,
    color: theme.colors.neutral.white,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 8,
    fontFamily: theme.fontFamilies.header.semiBold,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  form: { gap: 24 },
  autoAssignedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(141,105,246,0.15)",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(141,105,246,0.3)",
  },
  autoAssignedText: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    fontFamily: theme.fontFamilies.body.regular,
  },
  autoAssignedValue: {
    fontFamily: theme.fontFamilies.body.semiBold,
    color: theme.colors.dalisay[400],
  },
  footer: {
    paddingHorizontal: theme.spacing.lg ?? 24,
    paddingTop: theme.spacing.md ?? 16,
    backgroundColor: "rgba(15,8,20,0.95)",
  },
});
