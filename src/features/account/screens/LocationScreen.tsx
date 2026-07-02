import AccountProgress from "@/src/components/account/AccountProgress";
import CustomTextInput from "@/src/components/forms/CustomTextInput";
import LocationItem from "@/src/components/location/LocationItem";
import LocationsList from "@/src/components/location/LocationsList";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import type { UserType } from "@/src/features/auth/api/authApi";
import { useAppTheme, makeStyles } from "@/src/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AlertCircle, MapPin, Search } from "lucide-react-native";
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
import { useAuthStore } from "@/src/stores/authStore";
import { accountApi, SavedLocation } from "../api/accountApi";
import {
  getManualLocationFromQuery,
  useLocationSearch,
} from "../hooks/useLocationSearch";

const formatLocationLabel = (location: { city: string; country?: string }) =>
  location.country ? `${location.city}, ${location.country}` : location.city;

export default function LocationScreen() {
  const theme = useAppTheme();
  const styles = useStyles();

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ userType?: string }>();
  const isDemoMode = useAuthStore((state) => state.isDemoMode);

  // Get userType from params
  const userType = params.userType as UserType;

  const {
    query,
    setQuery,
    filteredLocations,
    getCurrentLocation,
    saving: locating,
  } = useLocationSearch();

  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedCoordinates, setSelectedCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Redirect if no userType
  useEffect(() => {
    if (!userType || (userType !== "filipina" && userType !== "foreigner")) {
      console.warn("⚠️ No valid userType in location, redirecting to signin");
      router.replace("/(auth)/signin");
    }
  }, [userType, router]);

  const handleUseCurrentLocation = useCallback(async () => {
    try {
      const currentLocation = await getCurrentLocation();
      if (!currentLocation) return;

      const locationString = currentLocation.country
        ? `${currentLocation.city}, ${currentLocation.country}`
        : currentLocation.city;

      setUseCurrentLocation(true);
      setSelectedLocation(locationString);
      setSelectedCoordinates(currentLocation.coordinates ?? null);
      setLocationNotice(null);
      setQuery("");
    } catch (err) {
      setUseCurrentLocation(false);
      setLocationNotice(
        err instanceof Error
          ? err.message
          : "We could not get your current location. Type your city manually to continue.",
      );
      Alert.alert(
        "Could not get location",
        err instanceof Error
          ? err.message
          : "We could not get your current location. Type your city manually to continue.",
      );
    }
  }, [getCurrentLocation, setQuery]);

  const handleSelect = useCallback(
    (location: {
      city: string;
      country: string;
      coordinates?: { lat: number; lng: number };
    }) => {
      setUseCurrentLocation(false);
      const locationString = formatLocationLabel(location);
      setSelectedLocation(locationString);
      setSelectedCoordinates(location.coordinates ?? null);
      setLocationNotice(
        location.coordinates
          ? null
          : "Saved as a manual city. PinayMate will not treat this as exact GPS.",
      );
      setQuery("");
    },
    [setQuery],
  );

  const hasSelectedLocation = selectedLocation !== "" || useCurrentLocation;
  const manualLocation = getManualLocationFromQuery(query);
  const manualLocationLabel = manualLocation
    ? formatLocationLabel(manualLocation)
    : "";
  const hasExactManualMatch =
    !!manualLocationLabel &&
    filteredLocations.some(
      (loc) =>
        formatLocationLabel(loc).toLowerCase() ===
        manualLocationLabel.toLowerCase(),
    );
  const selectedLocationPrivacyLabel = useCurrentLocation
    ? "Current location selected. Approximate coordinates may be saved for matching preferences."
    : "Manual city selected. PinayMate will not treat this as exact GPS.";

  const handleNext = useCallback(async () => {
    if (!hasSelectedLocation) return;
    setSaving(true);
    try {
      if (isDemoMode) {
        router.push({
          pathname: "/(auth)/account-setup/preferences",
          params: { userType },
        });
        return;
      }

      const payload: SavedLocation = {
        locationType: useCurrentLocation ? "current" : "manual",
        locationName: selectedLocation,
        coordinates: selectedCoordinates,
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
        err instanceof Error ? err.message : "Unexpected error",
      );
    } finally {
      setSaving(false);
    }
  }, [
    selectedLocation,
    selectedCoordinates,
    hasSelectedLocation,
    useCurrentLocation,
    router,
    userType,
    isDemoMode,
  ]);

  // Don't render if userType is invalid
  if (!userType || (userType !== "filipina" && userType !== "foreigner")) {
    return null;
  }

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.semanticColors.background}
      />
      {Platform.OS !== "web" && (
        <View
          style={{
            height: insets.top,
            backgroundColor: theme.semanticColors.background,
          }}
        />
      )}

      <LinearGradient
        colors={[theme.semanticColors.background, theme.colors.dalisay[900]]}
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
              City-level location is enough to continue. Exact GPS is optional
              and can be denied.
            </Text>
          </View>

          <View style={styles.form}>
            <LocationItem
              label="Use Current Location"
              isCurrent
              selected={useCurrentLocation}
              onPress={handleUseCurrentLocation}
            />

            <View style={styles.privacyNote}>
              <MapPin size={16} color="rgba(255,255,255,0.82)" />
              <Text style={styles.privacyNoteText}>
                If permission fails or you prefer not to share GPS, type your
                city below and use the manual result.
              </Text>
            </View>

            {locationNotice ? (
              <View
                style={styles.noticeBox}
                accessibilityRole="alert"
                accessibilityLabel={`Location notice. ${locationNotice}`}
              >
                <AlertCircle size={16} color={theme.semanticColors.warning} strokeWidth={2.4} />
                <Text style={styles.noticeText}>{locationNotice}</Text>
              </View>
            ) : null}

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
                <View style={styles.searchResults}>
                  <LocationsList
                    locations={filteredLocations.map(formatLocationLabel)}
                    onSelect={(locStr) => {
                      const fallbackParts = locStr.split(", ");
                      const location = filteredLocations.find(
                        (loc) => formatLocationLabel(loc) === locStr,
                      ) ?? {
                        city: fallbackParts[0] ?? locStr,
                        country: fallbackParts[1] ?? "",
                      };
                      handleSelect(location);
                    }}
                    emptyLabel="No curated city match yet."
                  />

                  {manualLocation && !hasExactManualMatch ? (
                    <View style={styles.manualLocationWrap}>
                      <Text style={styles.manualLocationHint}>
                        Not listed? Save your typed city manually.
                      </Text>
                      <LocationItem
                        label={`Use "${manualLocationLabel}"`}
                        onPress={() => handleSelect(manualLocation)}
                      />
                    </View>
                  ) : null}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <MapPin
                    size={48}
                    color="rgba(141,105,246,0.4)"
                    strokeWidth={1.5}
                  />
                  <Text style={styles.emptyTitle}>Start typing to search</Text>
                  <Text style={styles.emptySubtitle}>
                    Enter any city name. If it is not listed, you can still save
                    it manually.
                  </Text>
                </View>
              )}
            </View>

            {selectedLocation && (
              <View
                style={styles.selectedBox}
                accessible
                accessibilityLabel={`Selected location: ${selectedLocation}. ${selectedLocationPrivacyLabel}`}
              >
                <MapPin size={18} color={theme.semanticColors.primary} />
                <View style={styles.selectedCopy}>
                  <Text style={styles.selectedText}>{selectedLocation}</Text>
                  <Text style={styles.selectedPrivacyText}>
                    {selectedLocationPrivacyLabel}
                  </Text>
                </View>
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
            disabled={!hasSelectedLocation || saving || locating}
            loading={saving || locating}
            accessibilityLabel="Continue to next step"
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  root: { flex: 1, backgroundColor: theme.semanticColors.background },
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
    color: theme.colors.neutral.white,
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
  privacyNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  privacyNoteText: {
    flex: 1,
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    lineHeight: 18,
  },
  noticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(245,158,11,0.12)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.32)",
  },
  noticeText: {
    flex: 1,
    color: "rgba(255,255,255,0.86)",
    fontSize: 13,
    lineHeight: 18,
  },
  searchResults: { gap: 12 },
  manualLocationWrap: { gap: 8 },
  manualLocationHint: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 13,
    lineHeight: 18,
  },
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
    fontSize: 15,
    color: theme.colors.neutral.white,
    fontWeight: "600",
  },
  selectedCopy: {
    flex: 1,
    gap: 4,
  },
  selectedPrivacyText: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 12,
    lineHeight: 17,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg ?? 24,
    paddingTop: theme.spacing.md ?? 16,
    backgroundColor: "rgba(15,8,20,0.95)",
  },
}));
