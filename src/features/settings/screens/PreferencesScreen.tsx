import { useMatchPreferences } from "@/src/features/settings/hooks/useMatchPreferences";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Save } from "lucide-react-native";
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
const SURFACE_STRONG = "rgba(255, 255, 255, 0.08)";
const TILE_BORDER = "rgba(168, 85, 247, 0.13)";

export function PreferencesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { preferences, loading, saving, savePreferences } =
    useMatchPreferences();

  const [ageMin, setAgeMin] = useState("18");
  const [ageMax, setAgeMax] = useState("35");
  const [maxDistance, setMaxDistance] = useState("50");
  const [lookingFor, setLookingFor] = useState("");

  // Seed local string state once the hook delivers preferences
  useEffect(() => {
    if (preferences) {
      setAgeMin(preferences.ageMin?.toString() || "18");
      setAgeMax(preferences.ageMax?.toString() || "35");
      setMaxDistance(preferences.maxDistanceKm?.toString() || "50");
      setLookingFor(preferences.interestedIn || "");
    }
  }, [preferences]);

  const handleSave = async () => {
    try {
      await savePreferences({
        ageMin: parseInt(ageMin, 10),
        ageMax: parseInt(ageMax, 10),
        maxDistanceKm: parseInt(maxDistance, 10),
        interestedIn: lookingFor,
      });
      Alert.alert("Success", "Preferences updated successfully!");
      router.back();
    } catch (error) {
      if (__DEV__) {
        console.error("Error saving preferences:", error);
      }
      Alert.alert("Error", "Failed to update preferences");
    }
  };

  if (loading) {
    return (
      <View style={[styles.root, styles.centered]}>
        <StatusBar barStyle="light-content" backgroundColor={BRAND_BG} />
        <LinearGradient
          colors={[BRAND_BG, "#1A0F1F", "#2D1B35", BRAND_BG]}
          locations={[0, 0.3, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color={ACCENT_PINK} />
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
        >
          <ArrowLeft size={24} color={WHITE} />
        </TouchableOpacity>
        <Text style={styles.title}>Preferences</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={ACCENT_PINK} />
          ) : (
            <Save size={24} color={ACCENT_PINK} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Match Preferences</Text>

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
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Looking For</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={lookingFor}
              onChangeText={setLookingFor}
              placeholder="E.g. Serious relationship, friendship, casual dating..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={{ height: 40 }} />
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    color: WHITE,
    fontFamily: "DMSans-Bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: ACCENT_PINK,
    fontFamily: "DMSans-Bold",
    marginTop: 20,
    marginBottom: 20,
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
    height: 80,
    paddingTop: 16,
  },
});
