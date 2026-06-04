import AccountProgress from "@/src/components/account/AccountProgress";
import CustomTextInput from "@/src/components/forms/CustomTextInput";
import LocationItem from "@/src/components/location/LocationItem";
import LocationsList from "@/src/components/location/LocationsList";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import type { UserType } from "@/src/features/auth/api/authApi";
import { colors, theme, withAlpha } from "@/src/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MapPin, Search } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { accountApi, SavedLocation } from "../api/accountApi";
import { useLocationSearch } from "../hooks/useLocationSearch";

const BRAND_BG = theme.lightColors.brandBackground;
const BRAND_GRADIENT = [BRAND_BG, colors.dalisay[950]] as const;

export default function LocationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ userType?: string }>();

  // Get userType from params
  const userType = params.userType as UserType;

  const { query, setQuery, filteredLocations } = useLocationSearch();

  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [saving, setSaving] = useState(false);

  // Redirect if no userType
  useEffect(() => {
    if (!userType || (userType !== "filipina" && userType !== "foreigner")) {
      console.warn("⚠️ No valid userType in location, redirecting to signin");
      router.replace("/(auth)/signin");
    }
  }, [userType, router]);

  const handleUseCurrentLocation = useCallback(() => {
    setUseCurrentLocation(true);
    setSelectedLocation("Current Location");
    Alert.alert(
      "Location Access",
      "We'll use your current location to find matches nearby.",
      [{ text: "OK" }]
    );
  }, []);

  // ✅ Fixed: Accept location object instead of string
  const handleSelect = useCallback(
    (location: { city: string; country: string }) => {
      setUseCurrentLocation(false);
      const locationString = `${location.city}, ${location.country}`;
      setSelectedLocation(locationString);
      setQuery("");
    },
    [setQuery]
  );

  const isValid = useCallback(
    () => selectedLocation !== "" || useCurrentLocation,
    [selectedLocation, useCurrentLocation]
  );

  const handleNext = useCallback(async () => {
    if (!isValid()) return;
    setSaving(true);
    try {
      const payload: SavedLocation = {
        locationType: useCurrentLocation ? "current" : "manual",
        locationName: selectedLocation,
        coordinates: null,
        timestamp: new Date().toISOString(),
      };
      await accountApi.saveLocation(payload);
      router.push({
        pathname: "/(auth)/account-setup/preferences",
        params: { userType },
      });
    } catch (err) {
      Alert.alert(
        "Save failed",
        err instanceof Error ? err.message : "Unexpected error"
      );
    } finally {
      setSaving(false);
    }
  }, [selectedLocation, useCurrentLocation, router, userType, isValid]);

  // Don't render if userType is invalid
  if (!userType || (userType !== "filipina" && userType !== "foreigner")) {
    return null;
  }

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={BRAND_BG}
      />
      {insets.top > 0 && (
        <View
          style={{
            height: insets.top,
            backgroundColor: BRAND_BG,
          }}
        />
      )}

      <LinearGradient
        colors={BRAND_GRADIENT}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom + 24, 40) },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <AccountProgress steps={5} activeIndex={2} />
            <Text style={styles.title}>Where are you located?</Text>
            <Text style={styles.subtitle}>
              This helps us find matches near you
            </Text>
          </View>

          <View style={styles.form}>
            <LocationItem
              label="Use Current Location"
              isCurrent
              selected={useCurrentLocation}
              onPress={handleUseCurrentLocation}
            />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or search for a city</Text>
              <View style={styles.dividerLine} />
            </View>

            <CustomTextInput
              label="Search Location"
              value={query}
              onChangeText={setQuery}
              placeholder="Type your city name..."
              LeftIcon={Search}
              autoCapitalize="words"
              autoComplete="off"
            />

            <View style={{ marginTop: 10 }}>
              {query.trim() !== "" ? (
                <LocationsList
                  // ✅ Fixed: Map Location objects to strings
                  locations={filteredLocations.map(
                    (loc) => `${loc.city}, ${loc.country}`
                  )}
                  // ✅ Fixed: Parse string back to location object
                  onSelect={(locStr) => {
                    const [city, country] = locStr.split(", ");
                    handleSelect({ city, country });
                  }}
                  emptyLabel="No cities found. Try a different search."
                />
              ) : (
                <View style={styles.emptyState}>
                  <MapPin
                    size={48}
                    color={withAlpha(colors.dalisay[500], 0.4)}
                    strokeWidth={1.5}
                  />
                  <Text style={styles.emptyTitle}>Start typing to search</Text>
                  <Text style={styles.emptySubtitle}>
                    Enter the name of your city or use your current location
                    above
                  </Text>
                </View>
              )}
            </View>

            {selectedLocation && !useCurrentLocation && (
              <View
                style={styles.selectedBox}
                accessible
                accessibilityRole="text"
                accessibilityLabel={`Selected location ${selectedLocation}`}
              >
                <MapPin size={18} color={theme.colors.amihan[500]} />
                <Text style={styles.selectedText}>{selectedLocation}</Text>
              </View>
            )}
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
            disabled={!isValid() || saving}
            loading={saving}
            accessibilityLabel="Continue to next step"
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND_BG },
  keyboardView: { flex: 1 },
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
    color: colors.neutral.white,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 8,
    fontFamily: theme.fontFamilies.header?.semiBold ?? "System",
  },
  subtitle: {
    fontSize: 15,
    color: withAlpha(colors.neutral.white, 0.85),
    textAlign: "center",
    paddingHorizontal: 20,
  },
  form: { gap: 12 },
  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 8 },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: withAlpha(colors.neutral.white, 0.15),
  },
  dividerText: {
    marginHorizontal: 12,
    color: withAlpha(colors.neutral.white, 0.6),
    fontSize: 13,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    color: withAlpha(colors.neutral.white, 0.9),
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: withAlpha(colors.neutral.white, 0.65),
    textAlign: "center",
    lineHeight: 20,
  },
  selectedBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    backgroundColor: withAlpha(colors.amihan[500], 0.12),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: withAlpha(colors.amihan[500], 0.28),
    marginTop: 8,
  },
  selectedText: {
    flex: 1,
    fontSize: 15,
    color: colors.neutral.white,
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: theme.spacing.lg ?? 24,
    paddingTop: theme.spacing.md ?? 16,
    backgroundColor: withAlpha(BRAND_BG, 0.95),
  },
});
