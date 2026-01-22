import { supabase } from "@/src/config/supabase";
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
const ACCENT_PURPLE = "#8D69F6";
const ACCENT_PINK = "#EF3E78";
const WHITE = "#FFFFFF";
const SURFACE_STRONG = "rgba(255, 255, 255, 0.08)";
const TILE_BORDER = "rgba(168, 85, 247, 0.13)";

export default function PreferencesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [ageMin, setAgeMin] = useState("18");
  const [ageMax, setAgeMax] = useState("35");
  const [maxDistance, setMaxDistance] = useState("50");
  const [lookingFor, setLookingFor] = useState("");

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("age_min, age_max, max_distance_km, interested_in")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setAgeMin(data.age_min?.toString() || "18");
        setAgeMax(data.age_max?.toString() || "35");
        setMaxDistance(data.max_distance_km?.toString() || "50");
        setLookingFor(data.interested_in || "");
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          age_min: parseInt(ageMin),
          age_max: parseInt(ageMax),
          max_distance_km: parseInt(maxDistance),
          interested_in: lookingFor,
        })
        .eq("id", user.id);

      if (error) throw error;

      Alert.alert("Success", "Preferences updated successfully!");
      router.back();
    } catch (error) {
      console.error("Error saving preferences:", error);
      Alert.alert("Error", "Failed to update preferences");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.root,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <LinearGradient
          colors={[BRAND_BG, "#1A0F1F", "#2D1B35", BRAND_BG]}
          locations={[0, 0.3, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color={ACCENT_PURPLE} />
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
        <Text style={styles.title}>Match Preferences</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Age Range</Text>
        <View style={styles.rowInputs}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Min Age</Text>
            <TextInput
              style={styles.input}
              value={ageMin}
              onChangeText={setAgeMin}
              keyboardType="numeric"
              placeholderTextColor="#888"
            />
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Max Age</Text>
            <TextInput
              style={styles.input}
              value={ageMax}
              onChangeText={setAgeMax}
              keyboardType="numeric"
              placeholderTextColor="#888"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Distance</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Maximum Distance (km)</Text>
          <TextInput
            style={styles.input}
            value={maxDistance}
            onChangeText={setMaxDistance}
            keyboardType="numeric"
            placeholderTextColor="#888"
          />
        </View>

        <Text style={styles.sectionTitle}>Looking For</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={lookingFor}
          onChangeText={setLookingFor}
          placeholder="e.g., Serious relationship, friendship, etc."
          placeholderTextColor="#888"
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={WHITE} />
          ) : (
            <>
              <Save size={20} color={WHITE} />
              <Text style={styles.saveBtnText}>Save Preferences</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
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
    fontWeight: "600",
    color: WHITE,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: WHITE,
    marginTop: 20,
    marginBottom: 12,
  },
  rowInputs: {
    flexDirection: "row",
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: "#999",
    marginBottom: 8,
  },
  input: {
    backgroundColor: SURFACE_STRONG,
    borderWidth: 1,
    borderColor: TILE_BORDER,
    borderRadius: 12,
    padding: 14,
    color: WHITE,
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
    marginTop: 0,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: ACCENT_PURPLE,
    borderRadius: 12,
    padding: 16,
    marginTop: 30,
    marginBottom: 40,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: WHITE,
  },
});
