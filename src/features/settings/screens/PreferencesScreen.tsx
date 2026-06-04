import {
  SettingsScreenScaffold,
  SettingsSectionTitle,
} from "@/src/components/settings/SettingsScreenScaffold";
import { useMatchPreferences } from "@/src/features/settings/hooks/useMatchPreferences";
import { useTheme, withAlpha } from "@/src/theme";
import { useRouter } from "expo-router";
import { Save } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export function PreferencesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { preferences, loading, saving, savePreferences } =
    useMatchPreferences();

  const [ageMin, setAgeMin] = useState("18");
  const [ageMax, setAgeMax] = useState("35");
  const [maxDistance, setMaxDistance] = useState("50");
  const [lookingFor, setLookingFor] = useState("");

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
      Alert.alert("Success", "Preferences updated successfully.");
      router.back();
    } catch (error) {
      if (__DEV__) {
        console.error("Error saving preferences:", error);
      }
      Alert.alert("Error", "Failed to update preferences");
    }
  };

  const saveAction = (
    <TouchableOpacity
      onPress={handleSave}
      disabled={saving}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={saving ? "Saving preferences" : "Save preferences"}
      accessibilityState={{ disabled: saving, busy: saving }}
    >
      {saving ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <Save size={24} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SettingsScreenScaffold
      title="Preferences"
      loading={loading}
      rightAction={saveAction}
    >
      <SettingsSectionTitle>Match Preferences</SettingsSectionTitle>

      <View style={styles.form}>
        <PreferenceField
          label="Minimum Age"
          value={ageMin}
          onChangeText={setAgeMin}
          placeholder="18"
          keyboardType="numeric"
        />
        <PreferenceField
          label="Maximum Age"
          value={ageMax}
          onChangeText={setAgeMax}
          placeholder="35"
          keyboardType="numeric"
        />
        <PreferenceField
          label="Maximum Distance (km)"
          value={maxDistance}
          onChangeText={setMaxDistance}
          placeholder="50"
          keyboardType="numeric"
        />
        <PreferenceField
          label="Looking For"
          value={lookingFor}
          onChangeText={setLookingFor}
          placeholder="E.g. Serious relationship, friendship, casual dating..."
          multiline
        />
      </View>
    </SettingsScreenScaffold>
  );
}

interface PreferenceFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "numeric";
  multiline?: boolean;
}

function PreferenceField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline = false,
}: PreferenceFieldProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={withAlpha(colors.onPrimary, 0.42)}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    form: {
      gap: 20,
    },
    fieldWrap: {
      gap: 8,
    },
    label: {
      color: withAlpha(colors.onPrimary, 0.9),
      fontFamily: "DMSans-SemiBold",
      fontSize: 14,
    },
    input: {
      backgroundColor: colors.brandSurface,
      borderColor: colors.brandBorder,
      borderRadius: 12,
      borderWidth: 1,
      color: colors.onPrimary,
      fontFamily: "DMSans-Regular",
      fontSize: 16,
      minHeight: 54,
      padding: 16,
    },
    textArea: {
      minHeight: 92,
      paddingTop: 16,
    },
  });
