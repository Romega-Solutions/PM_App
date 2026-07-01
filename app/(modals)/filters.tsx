import { accountApi } from "@/src/features/account/api/accountApi";
import {
  getDemoMatchPreferences,
  saveDemoMatchPreferences,
} from "@/src/features/profile/data/demoSettingsStore";
import { useAuthStore } from "@/src/stores/authStore";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  HeartHandshake,
  RefreshCw,
  SlidersHorizontal,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import Slider from "@react-native-community/slider";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AgeRangeSlider from "@/src/components/preferences/AgeRangeSlider";

const BRAND_BG = "#0F0814";
const ACCENT_PINK = "#EF3E78";
const WHITE = "#FFFFFF";
const TEXT_SECONDARY = "rgba(255, 255, 255, 0.74)";
const TEXT_MUTED = "rgba(255, 255, 255, 0.56)";
const SURFACE = "rgba(255, 255, 255, 0.08)";
const BORDER = "rgba(239, 62, 120, 0.22)";
const COMPLETE_BASIC_INFO_MESSAGE =
  "Complete basic info before saving discovery filters.";
const SAVE_FILTERS_ERROR =
  "Could not save filters. Check your connection and try again.";
const RELATIONSHIP_GOALS = [
  "serious relationship",
  "marriage",
  "long term",
  "friendship first",
  "casual dating",
  "still deciding",
];

export default function Filters() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDemoMode = useAuthStore((state) => state.isDemoMode);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ageMin, setAgeMin] = useState("18");
  const [ageMax, setAgeMax] = useState("35");
  const [maxDistance, setMaxDistance] = useState("50");
  const [relationshipGoal, setRelationshipGoal] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const ageRangeValue = [
    Number.parseInt(ageMin, 10) || 18,
    Number.parseInt(ageMax, 10) || 35,
  ];
  const distanceValue = Number.parseInt(maxDistance, 10) || 50;
  const visibleRelationshipGoals = relationshipGoal.trim()
    ? Array.from(new Set([relationshipGoal.trim(), ...RELATIONSHIP_GOALS]))
    : RELATIONSHIP_GOALS;

  useEffect(() => {
    let mounted = true;

    async function loadPreferences() {
      setLoadError(null);

      if (isDemoMode) {
        const demoPreferences = getDemoMatchPreferences();
        setAgeMin(demoPreferences.ageMin);
        setAgeMax(demoPreferences.ageMax);
        setMaxDistance(demoPreferences.maxDistance);
        setRelationshipGoal(demoPreferences.relationshipGoal);
        setLoading(false);
        return;
      }

      try {
        const preferences = await accountApi.getPreferences();

        if (!mounted || !preferences) return;

        setAgeMin(String(preferences.ageMin ?? 18));
        setAgeMax(String(preferences.ageMax ?? 35));
        setMaxDistance(String(preferences.maxDistanceKm ?? 50));
        setRelationshipGoal(
          preferences.relationshipGoal?.replace(/_/g, " ") ?? "",
        );
      } catch {
        console.error("Error loading discovery filters.");
        if (mounted) {
          setLoadError(
            "Saved filters did not load. You can retry, or edit the default values before saving.",
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPreferences();

    return () => {
      mounted = false;
    };
  }, [isDemoMode]);

  const saveFilters = async () => {
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
      setSaveError("Add the kind of connection you want before saving.");
      return;
    }

    if (isDemoMode) {
      saveDemoMatchPreferences({
        ageMin: parsedAgeMin.toString(),
        ageMax: parsedAgeMax.toString(),
        maxDistance: parsedMaxDistance.toString(),
        relationshipGoal: trimmedGoal,
      });

      Alert.alert(
        "Demo filters saved",
        "These filters update the beta preview only. Live discovery filters will save to your account when demo mode is off.",
      );
      router.replace("/");
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

      Alert.alert(
        "Filters updated",
        "Discover will use these preferences the next time profiles load.",
      );
      router.back();
    } catch {
      console.error("Error saving discovery filters.");
      setSaveError(SAVE_FILTERS_ERROR);
    } finally {
      setSaving(false);
    }
  };

  const retryLoadPreferences = () => {
    setLoading(true);
    setLoadError(null);
    setSaveError(null);

    if (isDemoMode) {
      const demoPreferences = getDemoMatchPreferences();
      setAgeMin(demoPreferences.ageMin);
      setAgeMax(demoPreferences.ageMax);
      setMaxDistance(demoPreferences.maxDistance);
      setRelationshipGoal(demoPreferences.relationshipGoal);
      setLoading(false);
      return;
    }

    accountApi
      .getPreferences()
      .then((preferences) => {
        if (!preferences) return;

        setAgeMin(String(preferences.ageMin ?? 18));
        setAgeMax(String(preferences.ageMax ?? 35));
        setMaxDistance(String(preferences.maxDistanceKm ?? 50));
        setRelationshipGoal(
          preferences.relationshipGoal?.replace(/_/g, " ") ?? "",
        );
      })
      .catch(() => {
        console.error("Error retrying discovery filters load.");
        setLoadError(
          "Saved filters still did not load. Check your connection before saving changes.",
        );
      })
      .finally(() => setLoading(false));
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={[BRAND_BG, "#1A0F1F", "#2D1B35", BRAND_BG]}
        locations={[0, 0.32, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <SlidersHorizontal size={24} color={ACCENT_PINK} />
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close discovery filters"
          >
            <X size={22} color={WHITE} />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Discovery filters</Text>
        <Text style={styles.subtitle}>
          Tune who appears in Discover. These are saved to your profile and used
          by matching, not just this screen.
        </Text>

        <View
          style={styles.guidanceCard}
          accessible
          accessibilityLabel="Discovery filter guidance. Filters guide who appears in Discover, but they do not guarantee matches."
        >
          <Text style={styles.guidanceTitle}>Filters guide discovery</Text>
          <Text style={styles.guidanceText}>
            Use honest preferences to reduce mismatches. Wider filters can show
            more people, but matches still depend on mutual interest and safety
            controls.
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator
              color={ACCENT_PINK}
              accessibilityLabel="Loading saved discovery filters"
            />
            <Text style={styles.loadingText}>Loading saved preferences...</Text>
          </View>
        ) : (
          <View style={styles.card} accessibilityLabel="Discovery filter form">
            {loadError ? (
              <View
                style={styles.notice}
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
              >
                <AlertCircle size={18} color={ACCENT_PINK} strokeWidth={2.4} />
                <Text style={styles.noticeText}>{loadError}</Text>
                <TouchableOpacity
                  style={styles.inlineRetryButton}
                  onPress={retryLoadPreferences}
                  accessibilityRole="button"
                  accessibilityLabel="Retry loading saved filters"
                  accessibilityHint="Attempts to load your saved discovery preferences again"
                  activeOpacity={0.84}
                >
                  <RefreshCw size={15} color={WHITE} strokeWidth={2.4} />
                  <Text style={styles.inlineRetryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <View style={styles.controlGroup}>
              <View style={styles.controlHeader}>
                <View>
                  <Text style={styles.label}>Age range</Text>
                  <Text style={styles.helper}>Drag both handles to tune who appears.</Text>
                </View>
                <View style={styles.valuePill}>
                  <Text style={styles.valuePillText}>
                    {ageMin}-{ageMax}
                  </Text>
                </View>
              </View>
              <AgeRangeSlider
                minAge={ageRangeValue[0]}
                maxAge={ageRangeValue[1]}
                min={18}
                max={70}
                onChange={(values) => {
                  setAgeMin(String(values[0]));
                  setAgeMax(String(values[1]));
                }}
              />
            </View>

            <View style={styles.controlGroup}>
              <View style={styles.controlHeader}>
                <View>
                  <Text style={styles.label}>Distance radius</Text>
                  <Text style={styles.helper}>Wider radius can show more people.</Text>
                </View>
                <View style={styles.valuePill}>
                  <Text style={styles.valuePillText}>{maxDistance} km</Text>
                </View>
              </View>
              <View style={styles.sliderCard}>
                <Slider
                  style={styles.distanceSlider}
                  minimumValue={10}
                  maximumValue={500}
                  step={5}
                  value={distanceValue}
                  onValueChange={(value) =>
                    setMaxDistance(String(Math.round(value)))
                  }
                  minimumTrackTintColor={ACCENT_PINK}
                  maximumTrackTintColor="rgba(255, 255, 255, 0.18)"
                  thumbTintColor={ACCENT_PINK}
                  accessibilityLabel="Maximum match distance radius"
                  accessibilityValue={{ text: `${maxDistance} kilometers` }}
                />
                <View style={styles.rangeLabels}>
                  <Text style={styles.rangeLabel}>10 km</Text>
                  <Text style={styles.rangeLabel}>500 km</Text>
                </View>
              </View>
              <Text style={styles.helper}>
                Distance is saved in kilometers. Wider distance can show more
                people.
              </Text>
            </View>

            <View style={styles.controlGroup}>
              <View style={styles.controlHeader}>
                <View>
                  <Text style={styles.label}>Relationship goal</Text>
                  <Text style={styles.helper}>Pick the closest intention.</Text>
                </View>
              </View>
              <View
                style={styles.goalGrid}
                accessibilityRole="radiogroup"
                accessibilityLabel="Relationship goal suggestions"
              >
                {visibleRelationshipGoals.map((goal) => {
                  const selected =
                    relationshipGoal.trim().toLowerCase() === goal.toLowerCase();

                  return (
                    <TouchableOpacity
                      key={goal}
                      style={[styles.goalChip, selected && styles.goalChipSelected]}
                      onPress={() => setRelationshipGoal(goal)}
                      activeOpacity={0.86}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      accessibilityLabel={`${goal}${selected ? ", selected" : ""}`}
                    >
                      {selected ? (
                        <HeartHandshake
                          size={14}
                          color={WHITE}
                          strokeWidth={2.4}
                        />
                      ) : null}
                      <Text
                        style={[
                          styles.goalChipText,
                          selected && styles.goalChipTextSelected,
                        ]}
                      >
                        {goal}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.helper}>
                Keep this specific and honest. It helps avoid mismatched
                expectations.
              </Text>
            </View>
          </View>
        )}

        {saveError ? (
          <View
            style={styles.saveError}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            <AlertCircle size={17} color={ACCENT_PINK} strokeWidth={2.4} />
            <Text style={styles.saveErrorText}>{saveError}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          onPress={saveFilters}
          disabled={loading || saving}
          style={[
            styles.primaryButton,
            (loading || saving) && styles.disabledControl,
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            saving ? "Saving filters" : "Save discovery filters"
          }
          accessibilityHint="Saves age, distance, and relationship goal filters for Discover"
          accessibilityState={{ disabled: loading || saving }}
        >
          {saving ? (
            <ActivityIndicator color={WHITE} />
          ) : (
            <Text style={styles.primaryButtonText}>Save filters</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND_BG,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(239, 62, 120, 0.13)",
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: WHITE,
    fontFamily: "DMSans-Bold",
    fontSize: 32,
    letterSpacing: -0.6,
    marginBottom: 10,
  },
  subtitle: {
    color: TEXT_SECONDARY,
    fontFamily: "DMSans-Regular",
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 24,
  },
  loadingCard: {
    minHeight: 180,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: SURFACE,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    color: TEXT_SECONDARY,
    fontFamily: "DMSans-Medium",
    fontSize: 14,
  },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: SURFACE,
    padding: 18,
    gap: 18,
  },
  guidanceCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    padding: 14,
    marginBottom: 16,
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
  notice: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(239, 62, 120, 0.3)",
    backgroundColor: "rgba(239, 62, 120, 0.12)",
    padding: 14,
    gap: 10,
  },
  noticeText: {
    color: TEXT_SECONDARY,
    fontFamily: "DMSans-Medium",
    fontSize: 14,
    lineHeight: 20,
  },
  inlineRetryButton: {
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
  inlineRetryText: {
    color: WHITE,
    fontFamily: "DMSans-Bold",
    fontSize: 14,
  },
  controlGroup: {
    gap: 8,
  },
  controlHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  label: {
    color: WHITE,
    fontFamily: "DMSans-Bold",
    fontSize: 14,
  },
  valuePill: {
    minHeight: 34,
    borderRadius: 17,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239, 62, 120, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(239, 62, 120, 0.38)",
  },
  valuePillText: {
    color: WHITE,
    fontFamily: "DMSans-Bold",
    fontSize: 13,
  },
  sliderCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.13)",
    backgroundColor: "rgba(15, 8, 20, 0.5)",
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 12,
    overflow: "hidden",
  },
  multiSlider: {
    alignSelf: "center",
    marginBottom: -4,
  },
  selectedTrack: {
    backgroundColor: ACCENT_PINK,
    height: 4,
    borderRadius: 999,
  },
  unselectedTrack: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    height: 4,
    borderRadius: 999,
  },
  sliderMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: ACCENT_PINK,
    borderWidth: 3,
    borderColor: WHITE,
  },
  sliderMarkerPressed: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ACCENT_PINK,
    borderWidth: 3,
    borderColor: WHITE,
  },
  distanceSlider: {
    width: "100%",
    height: 44,
  },
  rangeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rangeLabel: {
    color: TEXT_MUTED,
    fontFamily: "DMSans-Bold",
    fontSize: 12,
  },
  helper: {
    color: TEXT_MUTED,
    fontFamily: "DMSans-Regular",
    fontSize: 13,
    lineHeight: 18,
  },
  goalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  goalChip: {
    minHeight: 40,
    borderRadius: 20,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(15, 8, 20, 0.58)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.16)",
  },
  goalChipSelected: {
    backgroundColor: ACCENT_PINK,
    borderColor: "rgba(255, 255, 255, 0.34)",
  },
  goalChipText: {
    color: TEXT_SECONDARY,
    fontFamily: "DMSans-Bold",
    fontSize: 13,
    textTransform: "capitalize",
  },
  goalChipTextSelected: {
    color: WHITE,
  },
  saveError: {
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(239, 62, 120, 0.3)",
    backgroundColor: "rgba(239, 62, 120, 0.12)",
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  saveErrorText: {
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
    marginTop: 22,
    marginBottom: 4,
  },
  primaryButtonText: {
    color: WHITE,
    fontFamily: "DMSans-Bold",
    fontSize: 16,
  },
  disabledControl: {
    opacity: 0.62,
  },
});
