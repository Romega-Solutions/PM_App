import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ChevronRight, MapPin, Search, Navigation } from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

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
          paddingTop: Platform.select({ ios: height * 0.08, android: height * 0.06 }),
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          {/* Progress Indicator */}
          <View style={{ flexDirection: "row", marginBottom: 32, gap: 8 }}>
            {[1, 2, 3, 4, 5].map((step, index) => (
              <View
                key={step}
                style={{
                  width: index === 2 ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: index <= 2 ? "#EF3E78" : "rgba(255, 255, 255, 0.3)",
                }}
              />
            ))}
          </View>

          <Text
            style={{
              fontSize: Math.min(width * 0.08, 32),
              fontFamily: "PlayfairDisplay-Bold",
              color: "#FFFFFF",
              textAlign: "center",
              marginBottom: 12,
              textShadowColor: "rgba(0, 0, 0, 0.8)",
              textShadowOffset: { width: 0, height: 3 },
              textShadowRadius: 10,
            }}
          >
            Where are you located?
          </Text>

          <Text
            style={{
              fontSize: 16,
              fontFamily: "PlayfairDisplay-Regular",
              color: "rgba(255, 255, 255, 0.8)",
              textAlign: "center",
              lineHeight: 24,
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
              ? "rgba(239, 62, 120, 0.2)" 
              : "rgba(255, 255, 255, 0.1)",
            borderRadius: 16,
            borderWidth: 1.5,
            borderColor: useCurrentLocation 
              ? "#EF3E78" 
              : "rgba(255, 255, 255, 0.3)",
            paddingHorizontal: 20,
            paddingVertical: 16,
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 24,
          }}
          activeOpacity={0.8}
        >
          <Navigation size={20} color="#EF3E78" style={{ marginRight: 12 }} />
          <Text style={{
            fontSize: 16,
            fontFamily: "PlayfairDisplay-SemiBold",
            color: "#FFFFFF",
            flex: 1,
          }}>
            Use Current Location
          </Text>
          {useCurrentLocation && (
            <View style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: "#EF3E78",
              justifyContent: "center",
              alignItems: "center",
            }}>
              <View style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#FFFFFF",
              }} />
            </View>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          marginVertical: 24,
        }}>
          <View style={{ flex: 1, height: 1, backgroundColor: "rgba(255, 255, 255, 0.3)" }} />
          <Text style={{
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: 14,
            fontFamily: "PlayfairDisplay-Regular",
            marginHorizontal: 16,
          }}>
            or search for a city
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: "rgba(255, 255, 255, 0.3)" }} />
        </View>

        {/* Search Input */}
        <View style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderRadius: 16,
          borderWidth: 1.5,
          borderColor: "rgba(255, 255, 255, 0.3)",
          paddingHorizontal: 20,
          paddingVertical: 16,
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 20,
        }}>
          <Search size={20} color="rgba(255, 255, 255, 0.7)" style={{ marginRight: 12 }} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for your city..."
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            style={{
              flex: 1,
              fontSize: 16,
              fontFamily: "PlayfairDisplay-Regular",
              color: "#FFFFFF",
            }}
          />
        </View>

        {/* Location Results */}
        <View style={{ gap: 12, marginBottom: 40 }}>
          {filteredLocations.slice(0, 8).map((location, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleLocationSelect(location)}
              style={{
                backgroundColor: selectedLocation === location 
                  ? "rgba(239, 62, 120, 0.2)" 
                  : "rgba(255, 255, 255, 0.08)",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: selectedLocation === location 
                  ? "#EF3E78" 
                  : "rgba(255, 255, 255, 0.2)",
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection: "row",
                alignItems: "center",
              }}
              activeOpacity={0.8}
            >
              <MapPin size={18} color="rgba(255, 255, 255, 0.7)" style={{ marginRight: 12 }} />
              <Text style={{
                fontSize: 15,
                fontFamily: "PlayfairDisplay-Regular",
                color: "#FFFFFF",
                flex: 1,
              }}>
                {location}
              </Text>
              {selectedLocation === location && (
                <View style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: "#EF3E78",
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                  <View style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#FFFFFF",
                  }} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={{ paddingHorizontal: 32, paddingBottom: 40 }}>
        <TouchableOpacity
          style={{
            borderRadius: 28,
            paddingVertical: 18,
            paddingHorizontal: 32,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#EF3E78",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isFormValid() ? 0.5 : 0.2,
            shadowRadius: 20,
            elevation: 12,
            width: "100%",
            minHeight: 56,
            opacity: isFormValid() ? 1 : 0.6,
          }}
          onPress={handleNext}
          disabled={!isFormValid()}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={isFormValid() ? ["#EF3E78", "#8D69F6"] : ["#666", "#999"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              borderRadius: 28,
            }}
          />
          <Text style={{
            color: "#FFFFFF",
            fontSize: 18,
            fontFamily: "PlayfairDisplay-SemiBold",
            fontWeight: "600",
            marginRight: 8,
            letterSpacing: 0.5,
            zIndex: 1,
          }}>
            Continue
          </Text>
          <ChevronRight size={24} color="#FFFFFF" strokeWidth={2.5} style={{ zIndex: 1 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}