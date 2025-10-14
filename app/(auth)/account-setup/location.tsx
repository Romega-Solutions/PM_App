// app/(auth)/account-setup/location.tsx
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MapPin, Navigation, Search } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomTextInput from "../../../src/components/forms/CustomTextInput";
import PrimaryButton from "../../../src/components/ui/PrimaryButton";

const { width } = Dimensions.get("window");

// Brand Colors
const BRAND_BG = "#0F0814";
const ACCENT_PURPLE = "#8D69F6";
const ACCENT_PINK = "#EF3E78";
const WHITE = "#FFFFFF";
const SURFACE = "rgba(255,255,255,0.08)";
const SURFACE_BORDER = "rgba(141,105,246,0.25)";
const ICON_BG = "rgba(141,105,246,0.12)";

// Responsive Typography
const TITLE_SIZE = Math.min(width * 0.08, 32);
const SUBTITLE_SIZE = 15;

interface LocationItemProps {
  location: string;
  selected: boolean;
  onSelect: () => void;
  isCurrentLocation?: boolean;
}

const LocationItem: React.FC<LocationItemProps> = ({
  location,
  selected,
  onSelect,
  isCurrentLocation = false,
}) => (
  <TouchableOpacity
    onPress={onSelect}
    style={[styles.locationRow, selected && styles.locationRowActive]}
    activeOpacity={0.9}
    accessibilityRole="radio"
    accessibilityState={{ selected }}
    accessibilityLabel={`Select ${location} as your location`}
  >
    <View style={styles.locationIconBox}>
      {isCurrentLocation ? (
        <Navigation
          size={18}
          color={selected ? ACCENT_PINK : ACCENT_PURPLE}
          strokeWidth={2.5}
        />
      ) : (
        <MapPin
          size={18}
          color={selected ? ACCENT_PINK : ACCENT_PURPLE}
          strokeWidth={2.5}
        />
      )}
    </View>

    <Text style={[styles.locationText, selected && styles.locationTextActive]}>
      {location}
    </Text>

    <View style={[styles.radio, selected && styles.radioActive]}>
      {selected && <View style={styles.radioDot} />}
    </View>
  </TouchableOpacity>
);

export default function Location() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  // Sample locations for demo
  const sampleLocations = useMemo(
    () => [
      "Manila, Philippines",
      "Cebu City, Philippines",
      "Davao City, Philippines",
      "Quezon City, Philippines",
      "Makati, Philippines",
      "Taguig, Philippines",
      "Pasig, Philippines",
      "Caloocan, Philippines",
      "Los Angeles, CA, USA",
      "New York, NY, USA",
      "Toronto, ON, Canada",
      "London, UK",
      "Sydney, Australia",
      "Tokyo, Japan",
      "Singapore",
      "Hong Kong",
    ],
    []
  );

  const filteredLocations = searchQuery.trim()
    ? sampleLocations.filter((loc) =>
        loc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sampleLocations;

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    setUseCurrentLocation(false);
  };

  const handleUseCurrentLocation = () => {
    setUseCurrentLocation(true);
    setSelectedLocation("Current Location");

    // TODO: Integrate expo-location for real geolocation
    Alert.alert(
      "Location Access",
      "We'll use your current location to find matches nearby.",
      [{ text: "OK" }]
    );
  };

  const isFormValid = () => selectedLocation !== "" || useCurrentLocation;

  const handleNext = () => {
    if (isFormValid()) {
      // Format location data for algorithm
      const formattedLocation = {
        locationType: useCurrentLocation ? "current" : "manual",
        locationName: selectedLocation,
        coordinates: useCurrentLocation ? null : null, // TODO: Add geocoding
        timestamp: new Date().toISOString(),
      };

      console.log("Formatted location data:", formattedLocation);
      router.push("/(auth)/account-setup/preferences");
    }
  };

  return (
    <View style={styles.root}>
      {/* Status Bar Configuration */}
      <StatusBar
        barStyle="light-content"
        backgroundColor={BRAND_BG}
        translucent={false}
      />
      {Platform.OS === "ios" && (
        <View style={{ height: insets.top, backgroundColor: BRAND_BG }} />
      )}

      {/* Background Gradient */}
      <LinearGradient
        colors={[BRAND_BG, "#1A0F1F", "#2D1B35", BRAND_BG]}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + 24, 40) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progress Indicator */}
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              {[1, 2, 3, 4, 5].map((step, idx) => (
                <View
                  key={step}
                  style={[
                    styles.progressDot,
                    idx === 2 && styles.progressDotActive,
                  ]}
                />
              ))}
            </View>

            {/* Header */}
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Where are you located?</Text>
            </View>

            <Text style={styles.subtitle}>
              This helps us find matches near you
            </Text>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Current Location Button */}
            <View style={styles.section}>
              <LocationItem
                location="Use Current Location"
                selected={useCurrentLocation}
                onSelect={handleUseCurrentLocation}
                isCurrentLocation={true}
              />
            </View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or search for a city</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Search Input */}
            <View style={styles.section}>
              <CustomTextInput
                label="Search Location"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Type your city name..."
                LeftIcon={Search}
                autoCapitalize="words"
                autoComplete="off"
              />
            </View>

            {/* Location Results */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Popular locations</Text>
              <View style={styles.locationsGroup}>
                {filteredLocations.slice(0, 10).map((loc, idx) => (
                  <LocationItem
                    key={`${loc}-${idx}`}
                    location={loc}
                    selected={selectedLocation === loc}
                    onSelect={() => handleLocationSelect(loc)}
                  />
                ))}

                {filteredLocations.length === 0 && (
                  <View style={styles.emptyState}>
                    <MapPin
                      size={32}
                      color="rgba(255, 255, 255, 0.3)"
                      strokeWidth={1.5}
                    />
                    <Text style={styles.emptyText}>No locations found</Text>
                    <Text style={styles.emptySubtext}>
                      Try a different search term
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer CTA */}
        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom + 16, 32) },
          ]}
        >
          <PrimaryButton
            title="Continue"
            onPress={handleNext}
            disabled={!isFormValid()}
            accessibilityLabel="Continue to preferences"
            accessibilityHint="Proceeds to dating preferences setup"
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND_BG,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 32 : 24,
  },

  // Progress Section
  progressSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  progressBar: {
    flexDirection: "row",
    marginBottom: 28,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  progressDotActive: {
    width: 28,
    backgroundColor: ACCENT_PINK,
  },

  // Header
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  title: {
    fontSize: TITLE_SIZE,
    fontFamily: "Lora-Bold",
    color: WHITE,
    textAlign: "center",
    letterSpacing: 0.4,
    ...Platform.select({
      ios: {
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
      },
    }),
  },
  subtitle: {
    fontSize: SUBTITLE_SIZE,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
    letterSpacing: 0.2,
  },

  // Form
  formContainer: {
    gap: 24,
  },

  // Section
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: "DMSans-SemiBold",
    color: "rgba(255, 255, 255, 0.85)",
    marginBottom: 4,
    letterSpacing: 0.3,
  },

  // Divider
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  dividerText: {
    fontSize: 13,
    fontFamily: "DMSans-Medium",
    color: "rgba(255, 255, 255, 0.6)",
    marginHorizontal: 16,
    letterSpacing: 0.2,
  },

  // Locations Group
  locationsGroup: {
    gap: 10,
  },

  // Location Row
  locationRow: {
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: SURFACE_BORDER,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 16 : 14,
    minHeight: Platform.OS === "ios" ? 60 : 56,
    flexDirection: "row",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  locationRowActive: {
    backgroundColor: "rgba(239, 62, 120, 0.12)",
    borderColor: ACCENT_PINK,
    ...Platform.select({
      ios: {
        shadowColor: ACCENT_PINK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  locationIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: ICON_BG,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  locationText: {
    flex: 1,
    color: WHITE,
    fontSize: 16,
    fontFamily: "DMSans-Medium",
    letterSpacing: 0.2,
  },
  locationTextActive: {
    fontFamily: "DMSans-Bold",
  },

  // Radio Button
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: {
    borderColor: ACCENT_PINK,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ACCENT_PINK,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "DMSans-SemiBold",
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: "center",
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: "rgba(15, 8, 20, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(141, 105, 246, 0.15)",
  },
});
