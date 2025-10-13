import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MapPin, Navigation, Search } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomTextInput from "../../../src/components/forms/CustomTextInput";
import PrimaryButton from "../../../src/components/ui/PrimaryButton";

const { width, height } = Dimensions.get("window");

export default function Location() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  // Sample locations for demo
  const sampleLocations = [
    "Manila, Philippines",
    "Cebu City, Philippines",
    "Davao City, Philippines",
    "Quezon City, Philippines",
    "Los Angeles, CA, USA",
    "New York, NY, USA",
    "Toronto, ON, Canada",
    "London, UK",
    "Sydney, Australia",
  ];

  const filteredLocations = sampleLocations.filter(location =>
    location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    setUseCurrentLocation(false);
  };

  const handleUseCurrentLocation = () => {
    setUseCurrentLocation(true);
    setSelectedLocation("Current Location");
    // In real app, would request location permission and get coordinates
    Alert.alert("Location Access", "Using your current location for better matches nearby.");
  };

  const isFormValid = () => {
    return selectedLocation !== "" || useCurrentLocation;
  };

  const handleNext = () => {
    if (isFormValid()) {
      router.push("/(auth)/account-setup/preferences");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Brand Gradient Background */}
      <LinearGradient
        colors={["#340839", "#8D69F6", "#EF3E78", "#340839"]}
        locations={[0, 0.4, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 32,
          paddingTop: Platform.select({ 
            ios: height * 0.08, 
            android: height * 0.06 
          }),
          paddingBottom: Platform.select({ ios: 40, android: 32 }),
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          {/* Progress Indicator */}
          <View style={{ 
            flexDirection: "row", 
            marginBottom: 32, 
            gap: Platform.select({ ios: 8, android: 6 })
          }}>
            {[1, 2, 3, 4, 5].map((step, index) => (
              <View
                key={step}
                style={{
                  width: index === 2 ? 24 : 8,
                  height: Platform.select({ ios: 8, android: 6 }),
                  borderRadius: Platform.select({ ios: 4, android: 3 }),
                  backgroundColor: index <= 2 ? "#EF3E78" : "rgba(255, 255, 255, 0.3)",
                }}
              />
            ))}
          </View>

          {/* Main heading - Using HelloParis for UI elements */}
          <Text
            style={{
              fontSize: Math.min(
                width * 0.08, 
                Platform.select({ ios: 32, android: 30 })
              ),
              fontFamily: "HelloParis",
              fontWeight: "700",
              color: "#FFFFFF",
              textAlign: "center",
              marginBottom: 12,
              textShadowColor: "rgba(0, 0, 0, 0.8)",
              textShadowOffset: { width: 0, height: 3 },
              textShadowRadius: 10,
              letterSpacing: Platform.select({ ios: -0.5, android: -0.3 }),
            }}
          >
            Where are you located?
          </Text>

          {/* Subtitle - Using PlayfairDisplay for body text */}
          <Text
            style={{
              fontSize: Platform.select({ ios: 16, android: 15 }),
              fontFamily: "PlayfairDisplay",
              fontWeight: "400",
              color: "rgba(255, 255, 255, 0.8)",
              textAlign: "center",
              lineHeight: Platform.select({ ios: 24, android: 22 }),
              paddingHorizontal: 20,
            }}
          >
            This helps us find matches near you
          </Text>
        </View>

        {/* Current Location Button */}
        <TouchableOpacity
          onPress={handleUseCurrentLocation}
          style={{
            backgroundColor: useCurrentLocation 
              ? "rgba(239, 62, 120, 0.15)" 
              : "rgba(255, 255, 255, 0.08)",
            borderRadius: 16,
            borderWidth: 2,
            borderColor: useCurrentLocation 
              ? "#EF3E78" 
              : "rgba(141, 105, 246, 0.25)",
            paddingHorizontal: 18,
            paddingVertical: Platform.select({ ios: 18, android: 16 }),
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 24,
            minHeight: Platform.select({ ios: 56, android: 52 }),
          }}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Use current location"
          accessibilityHint="Automatically detects your current location"
        >
          <Navigation size={20} color="#EF3E78" style={{ marginRight: 12 }} />
          {/* Location button text - Using PlayfairDisplay for body text */}
          <Text style={{
            fontSize: 16,
            fontFamily: "PlayfairDisplay",
            fontWeight: "400",
            color: "#FFFFFF",
            flex: 1,
          }}>
            Use Current Location
          </Text>
          {useCurrentLocation && (
            <View style={{
              width: Platform.select({ ios: 20, android: 18 }),
              height: Platform.select({ ios: 20, android: 18 }),
              borderRadius: Platform.select({ ios: 10, android: 9 }),
              backgroundColor: "#EF3E78",
              justifyContent: "center",
              alignItems: "center",
            }}>
              <View style={{
                width: Platform.select({ ios: 8, android: 7 }),
                height: Platform.select({ ios: 8, android: 7 }),
                borderRadius: Platform.select({ ios: 4, android: 3.5 }),
                backgroundColor: "#FFFFFF",
              }} />
            </View>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          marginVertical: Platform.select({ ios: 24, android: 20 }),
        }}>
          <View style={{ 
            flex: 1, 
            height: 1, 
            backgroundColor: "rgba(255, 255, 255, 0.3)" 
          }} />
          {/* Divider text - Using PlayfairDisplay for body text */}
          <Text style={{
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: Platform.select({ ios: 14, android: 13 }),
            fontFamily: "PlayfairDisplay",
            fontWeight: "400",
            marginHorizontal: 16,
          }}>
            or search for a city
          </Text>
          <View style={{ 
            flex: 1, 
            height: 1, 
            backgroundColor: "rgba(255, 255, 255, 0.3)" 
          }} />
        </View>

        {/* Search Input - Using CustomTextInput */}
        <View style={{ marginBottom: Platform.select({ ios: 20, android: 18 }) }}>
          <CustomTextInput
            label="Search Location"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for your city..."
            LeftIcon={Search}
            autoCapitalize="words"
            autoComplete="street-address"
          />
        </View>

        {/* Location Results */}
        <View style={{ 
          gap: Platform.select({ ios: 12, android: 10 }), 
          marginBottom: Platform.select({ ios: 40, android: 32 })
        }}>
          {filteredLocations.slice(0, 8).map((location, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleLocationSelect(location)}
              style={{
                backgroundColor: selectedLocation === location 
                  ? "rgba(239, 62, 120, 0.15)" 
                  : "rgba(255, 255, 255, 0.08)",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: selectedLocation === location 
                  ? "#EF3E78" 
                  : "rgba(255, 255, 255, 0.2)",
                paddingHorizontal: 16,
                paddingVertical: Platform.select({ ios: 14, android: 12 }),
                flexDirection: "row",
                alignItems: "center",
                minHeight: Platform.select({ ios: 48, android: 44 }),
              }}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedLocation === location }}
              accessibilityLabel={`Select ${location} as your location`}
            >
              <MapPin 
                size={18} 
                color="rgba(255, 255, 255, 0.7)" 
                style={{ marginRight: 12 }} 
              />
              {/* Location name - Using PlayfairDisplay for body text */}
              <Text style={{
                fontSize: Platform.select({ ios: 15, android: 14 }),
                fontFamily: "PlayfairDisplay",
                fontWeight: "400",
                color: "#FFFFFF",
                flex: 1,
              }}>
                {location}
              </Text>
              {selectedLocation === location && (
                <View style={{
                  width: Platform.select({ ios: 18, android: 16 }),
                  height: Platform.select({ ios: 18, android: 16 }),
                  borderRadius: Platform.select({ ios: 9, android: 8 }),
                  backgroundColor: "#EF3E78",
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                  <View style={{
                    width: Platform.select({ ios: 6, android: 5 }),
                    height: Platform.select({ ios: 6, android: 5 }),
                    borderRadius: Platform.select({ ios: 3, android: 2.5 }),
                    backgroundColor: "#FFFFFF",
                  }} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Continue Button - Using PrimaryButton */}
      <View style={{ 
        paddingHorizontal: 32, 
        paddingBottom: Platform.select({ ios: 40, android: 32 })
      }}>
        <PrimaryButton
          title="Continue"
          onPress={handleNext}
          disabled={!isFormValid()}
          accessibilityLabel="Continue to preferences"
          accessibilityHint="Proceeds to dating preferences setup"
        />
      </View>
    </View>
  );
}