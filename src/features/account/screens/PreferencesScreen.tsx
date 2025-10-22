import AccountProgress from "@/src/components/account/AccountProgress";
import AgeRangeSlider from "@/src/components/preferences/AgeRangeSlider";
import DistanceSlider from "@/src/components/preferences/DistanceSlider";
import GenderPreferenceOption from "@/src/components/preferences/GenderPreferenceOption";
import PreferenceSection from "@/src/components/preferences/PreferenceSection";
import RelationshipOption from "@/src/components/preferences/RelationshipOption";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import { theme } from "@/src/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Calendar, Heart, MapPin } from "lucide-react-native";
import React from "react";
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
  const { form, setField, isValid, loading, savePreferences } =
    usePreferences();

  const genderOptions = ["Women", "Men", "Everyone"];
  const relationshipOptions = [
    "Long-term relationship",
    "Marriage",
    "Casual dating",
    "Friendship",
    "Not sure yet",
  ];

  const handleNext = async () => {
    if (!isValid) return;
    const res = await savePreferences();
    if (res?.ok) {
      router.push("/(auth)/account-setup/verification-upload");
    }
  };

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
          <PreferenceSection Icon={Heart} title="I'm interested in">
            <View style={{ gap: 12 }}>
              {genderOptions.map((opt) => (
                <GenderPreferenceOption
                  key={opt}
                  option={opt}
                  selected={form.interestedIn === opt}
                  onSelect={() => setField("interestedIn", opt)}
                />
              ))}
            </View>
          </PreferenceSection>

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
  footer: {
    paddingHorizontal: theme.spacing.lg ?? 24,
    paddingTop: theme.spacing.md ?? 16,
    backgroundColor: "rgba(15,8,20,0.95)",
  },
});
