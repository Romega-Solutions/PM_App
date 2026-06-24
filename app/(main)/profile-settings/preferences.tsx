import { accountApi } from "@/src/features/account/api/accountApi";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { AlertCircle, ArrowLeft, RefreshCw, Save } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BRAND_BG = "#0F0814";
const ACCENT_PINK = "#EF3E78";
const WHITE = "#FFFFFF";
const TEXT_SECONDARY = "rgba(255, 255, 255, 0.74)";
const TEXT_MUTED = "rgba(255, 255, 255, 0.56)";
const SURFACE_STRONG = "rgba(255, 255, 255, 0.08)";
const TILE_BORDER = "rgba(168, 85, 247, 0.13)";
const COMPLETE_BASIC_INFO_MESSAGE =
  "Complete basic info before saving preferences.";
const SAVE_PREFERENCES_ERROR =
  "Failed to update preferences. Check your connection and try again.";

export default function PreferencesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [ageMin, setAgeMin] = useState("18");
  const [ageMax, setAgeMax] = useState("35");
  const [maxDistance, setMaxDistance] = useState("50");
  const [relationshipGoal, setRelationshipGoal] = useState("");

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    setLoading(true);
    setLoadError(null);
    setSaveError(null);

    try {
      const preferences = await accountApi.getPreferences();

      if (preferences) {
        setAgeMin(preferences.ageMin?.toString() || "18");
        setAgeMax(preferences.ageMax?.toString() || "35");
        setMaxDistance(preferences.maxDistanceKm?.toString() || "50");
        setRelationshipGoal(
          preferences.relationshipGoal?.replace(/_/g, " ") || "",
        );
      }
    } catch {
      console.error("Error fetching preferences.");
      setLoadError(
        "Saved preferences did not load. You can retry, or edit the default values before saving.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const parsedAgeMin = Number.parseInt(ageMin, 10);
    const parsedAgeMax = Number.parseInt(ageMax, 10);
    const parsedMaxDistance = Number.parseInt(maxDistance, 10);
    const trimmedGoal = relationshipGoal.trim();

    setSaveError(null);

    if (!Number.isFinite(parsedAgeMin) || parsedAgeMin < 18) {
      setSaveError("Minimum age must be 18 or higher.");
      return;
    }

    if (!Number.isFinite(parsedAgeMax) || parsedAgeMax > 100) {
      setSaveError("Maximum age must be 100 or lower.");
      return;
    }

    if (parsedAgeMin > parsedAgeMax) {
      setSaveError("Minimum age cannot be higher than maximum age.");
      return;
    }

    if (
      !Number.isFinite(parsedMaxDistance) ||
      parsedMaxDistance < 1 ||
      parsedMaxDistance > 500
    ) {
      setSaveError("Maximum distance must be between 1 and 500 km.");
      return;
    }

    if (!trimmedGoal) {
      setSaveError(
        "Add the kind of connection you want before saving preferences.",
      );
      return;
    }

    setSaving(true);
    try {
      const basicInfo = await accountApi.getBasicInfo();
      if (!basicInfo?.userType) {
        setSaveError(COMPLETE_BASIC_INFO_MESSAGE);
        return;
      }

      await accountApi.savePreferences({
        ageMin: parsedAgeMin,
        ageMax: parsedAgeMax,
        maxDistanceKm: parsedMaxDistance,
        relationshipGoal: trimmedGoal.toLowerCase().replace(/\s+/g, "_"),
        userType: basicInfo.userType,
      });

      Alert.alert("Success", "Preferences updated successfully!");
      router.back();
    } catch {
      console.error("Error saving preferences.");
      setSaveError(SAVE_PREFERENCES_ERROR);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View
        style={[styles.root, styles.centered]}
        accessibilityLiveRegion="polite"
      >
        <StatusBar barStyle="light-content" backgroundColor={BRAND_BG} />
        <LinearGradient
          colors={[BRAND_BG, "#1A0F1F", "#2D1B35", BRAND_BG]}
          locations={[0, 0.3, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingState}>
          <ActivityIndicator
            size="large"
            color={ACCENT_PINK}
            accessibilityLabel="Loading match preferences"
          />
          <Text style={styles.loadingTitle}>Loading preferences</Text>
          <Text style={styles.loadingText}>
            Pulling your saved match settings before you edit them.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_BG} />
      {Platform.OS === "ios" && (
        <View style={{ height: insets.top, backgroundColor: BRAND_BG }} />
      )}

      <LinearGradient
        colors={[BRAND_BG, "#1A0F1F", "#2D1B35", BRAND_BG]}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/(main)/profile")}
          style={styles.backBtn}
          activeOpacity={0.78}
          accessibilityRole="button"
          accessibilityLabel="Back to profile"
          accessibilityHint="Returns to your profile screen"
        >
          <ArrowLeft size={24} color={WHITE} />
        </TouchableOpacity>
        <Text style={styles.title}>Match Preferences</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={[styles.iconBtn, saving && styles.disabledControl]}
          accessibilityRole="button"
          accessibilityLabel={
            saving ? "Saving preferences" : "Save preferences"
          }
          accessibilityState={{ disabled: saving }}
        >
          {saving ? (
            <ActivityIndicator size="small" color={ACCENT_PINK} />
          ) : (
            <Save size={24} color={ACCENT_PINK} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentBody,
          { paddingBottom: Math.max(insets.bottom, 24) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Match Preferences</Text>
        <Text style={styles.sectionSubtitle}>
          Keep these accurate so Discover can show better matches and avoid
          mismatched expectations.
        </Text>

        <View
          style={styles.guidanceStrip}
          accessible
          accessibilityLabel="Match preference guidance. Preferences guide discovery and do not guarantee matches."
        >
          <Text style={styles.guidanceTitle}>Preference signals, not promises</Text>
          <Text style={styles.guidanceText}>
            These settings help shape who appears in Discover. They do not
            guarantee matches, conversations, or outcomes.
          </Text>
        </View>

        {loadError ? (
          <View
            style={styles.noticeStrip}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            <AlertCircle size={18} color={ACCENT_PINK} strokeWidth={2.4} />
            <Text style={styles.noticeText}>{loadError}</Text>
            <TouchableOpacity
              onPress={fetchPreferences}
              style={styles.retryButton}
              activeOpacity={0.84}
              accessibilityRole="button"
              accessibilityLabel="Retry loading saved preferences"
            >
              <RefreshCw size={15} color={WHITE} strokeWidth={2.4} />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.form}>
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Minimum Age</Text>
            <TextInput
              style={styles.input}
              value={ageMin}
              onChangeText={setAgeMin}
              placeholder="18"
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="numeric"
              accessibilityLabel="Minimum match age"
              accessibilityHint="Enter the youngest age you want to see in matches"
              maxLength={3}
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Maximum Age</Text>
            <TextInput
              style={styles.input}
              value={ageMax}
              onChangeText={setAgeMax}
              placeholder="35"
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="numeric"
              accessibilityLabel="Maximum match age"
              accessibilityHint="Enter the oldest age you want to see in matches"
              maxLength={3}
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Maximum Distance (km)</Text>
            <TextInput
              style={styles.input}
              value={maxDistance}
              onChangeText={setMaxDistance}
              placeholder="50"
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="numeric"
              accessibilityLabel="Maximum match distance"
              accessibilityHint="Enter the farthest distance in kilometers for suggested matches"
              maxLength={3}
            />
            <Text style={styles.helper}>
              Distance is saved in kilometers. Wider distance can show more
              people.
            </Text>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Relationship Goal</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={relationshipGoal}
              onChangeText={setRelationshipGoal}
              placeholder="E.g. Serious relationship, friendship, casual dating..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              accessibilityLabel="Relationship goal"
              accessibilityHint="Describe the type of relationship or connection you want"
              maxLength={80}
            />
            <Text style={styles.helper}>
              Be specific and honest. This helps avoid mismatched expectations.
            </Text>
          </View>
        </View>

        {saveError ? (
          <View
            style={styles.errorStrip}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            <AlertCircle size={17} color={ACCENT_PINK} strokeWidth={2.4} />
            <Text style={styles.errorText}>{saveError}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={[styles.primaryButton, saving && styles.disabledControl]}
          accessibilityRole="button"
          accessibilityLabel={
            saving ? "Saving preferences" : "Save preferences"
          }
          accessibilityHint="Saves age, distance, and relationship goal preferences"
          accessibilityState={{ disabled: saving, busy: saving }}
          activeOpacity={0.86}
        >
          {saving ? (
            <ActivityIndicator color={WHITE} />
          ) : (
            <Text style={styles.primaryButtonText}>Save preferences</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND_BG,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  loadingState: {
    width: "100%",
    maxWidth: 320,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: "center",
  },
  loadingTitle: {
    marginTop: 16,
    color: WHITE,
    fontFamily: "DMSans-Bold",
    fontSize: 18,
    textAlign: "center",
  },
  loadingText: {
    marginTop: 8,
    color: TEXT_SECONDARY,
    fontFamily: "DMSans-Regular",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledControl: {
    opacity: 0.65,
  },
  title: {
    flex: 1,
    fontSize: 20,
    color: WHITE,
    fontFamily: "DMSans-Bold",
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentBody: {
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: ACCENT_PINK,
    fontFamily: "DMSans-Bold",
    marginTop: 20,
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    fontFamily: "DMSans-Regular",
    lineHeight: 22,
    marginBottom: 18,
  },
  noticeStrip: {
    borderLeftWidth: 3,
    borderLeftColor: ACCENT_PINK,
    backgroundColor: "rgba(239, 62, 120, 0.08)",
    paddingLeft: 14,
    paddingVertical: 12,
    gap: 10,
    marginBottom: 18,
  },
  guidanceStrip: {
    borderLeftWidth: 3,
    borderLeftColor: "rgba(141, 105, 246, 0.78)",
    paddingLeft: 14,
    paddingVertical: 4,
    marginBottom: 18,
  },
  guidanceTitle: {
    color: WHITE,
    fontFamily: "DMSans-Bold",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  guidanceText: {
    color: TEXT_MUTED,
    fontFamily: "DMSans-Regular",
    fontSize: 13,
    lineHeight: 19,
  },
  noticeText: {
    color: TEXT_SECONDARY,
    fontFamily: "DMSans-Medium",
    fontSize: 14,
    lineHeight: 20,
  },
  retryButton: {
    alignSelf: "flex-start",
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: ACCENT_PINK,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  retryButtonText: {
    color: WHITE,
    fontFamily: "DMSans-Bold",
    fontSize: 14,
  },
  form: {
    gap: 20,
  },
  fieldWrap: {
    gap: 8,
  },
  label: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontFamily: "DMSans-SemiBold",
  },
  helper: {
    color: TEXT_MUTED,
    fontFamily: "DMSans-Regular",
    fontSize: 13,
    lineHeight: 18,
  },
  input: {
    backgroundColor: SURFACE_STRONG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: TILE_BORDER,
    padding: 16,
    color: WHITE,
    fontSize: 16,
    fontFamily: "DMSans-Regular",
  },
  textArea: {
    minHeight: 92,
    paddingTop: 16,
  },
  errorStrip: {
    marginTop: 18,
    borderLeftWidth: 3,
    borderLeftColor: ACCENT_PINK,
    backgroundColor: "rgba(239, 62, 120, 0.08)",
    paddingLeft: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: TEXT_SECONDARY,
    fontFamily: "DMSans-Bold",
    fontSize: 13,
    lineHeight: 18,
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: ACCENT_PINK,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  primaryButtonText: {
    color: WHITE,
    fontFamily: "DMSans-Bold",
    fontSize: 16,
  },
});
