import AccountProgress from "@/src/components/account/AccountProgress";
import CustomTextInput from "@/src/components/forms/CustomTextInput";
import LocationItem from "@/src/components/location/LocationItem";
import LocationsList from "@/src/components/location/LocationsList";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import type { UserType } from "@/src/features/auth/api/authApi";
import { theme } from "@/src/theme";
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
                    color="rgba(141,105,246,0.4)"
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
              <View style={styles.selectedBox}>
                <MapPin size={18} color="#EF3E78" />
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
  root: { flex: 1, backgroundColor: theme.colors.dalisay[950] ?? "#0F0814" },
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
    color: "#FFF",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 8,
    fontFamily: theme.fontFamilies.header?.semiBold ?? "System",
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  form: { gap: 12 },
  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 8 },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  dividerText: {
    marginHorizontal: 12,
    color: "rgba(255,255,255,0.6)",
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
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    lineHeight: 20,
  },
  selectedBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    backgroundColor: "rgba(239,62,120,0.12)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239,62,120,0.28)",
    marginTop: 8,
  },
  selectedText: {
    flex: 1,
    fontSize: 15,
    color: "#FFF",
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: theme.spacing.lg ?? 24,
    paddingTop: theme.spacing.md ?? 16,
    backgroundColor: "rgba(15,8,20,0.95)",
  },
});
