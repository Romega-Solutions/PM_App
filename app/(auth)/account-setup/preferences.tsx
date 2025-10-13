import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Calendar, Heart, MapPin, Users } from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PrimaryButton from "../../../src/components/ui/PrimaryButton";

const { width, height } = Dimensions.get("window");

export default function Preferences() {
  const router = useRouter();
  const [preferences, setPreferences] = useState({
    interestedIn: "",
    ageRange: [22, 35],
    maxDistance: 50,
    relationship: "",
  });

  const genderOptions = ["Women", "Men", "Everyone"];
  const relationshipOptions = [
    "Long-term relationship",
    "Marriage",
    "Casual dating",
    "Friendship",
    "Not sure yet",
  ];

  const distanceOptions = [10, 25, 50, 100, 200];

  const updatePreference = (key: string, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const isFormValid = () => {
    return preferences.interestedIn !== "" && preferences.relationship !== "";
  };

  const handleNext = () => {
    if (isFormValid()) {
      router.push("/(auth)/account-setup/verification-upload");
    }
  };

  const renderOptionButton = (
    option: string,
    selectedValue: string,
    onPress: () => void,
    icon?: React.ReactNode
  ) => (
    <TouchableOpacity
      key={option}
      onPress={onPress}
      style={{
        backgroundColor:
          selectedValue === option
            ? "rgba(239, 62, 120, 0.15)"
            : "rgba(255, 255, 255, 0.08)",
        borderRadius: 16,
        borderWidth: 2,
        borderColor:
          selectedValue === option ? "#EF3E78" : "rgba(141, 105, 246, 0.25)",
        paddingHorizontal: 18,
        paddingVertical: Platform.select({ ios: 18, android: 16 }),
        flexDirection: "row",
        alignItems: "center",
        minHeight: Platform.select({ ios: 56, android: 52 }),
      }}
      activeOpacity={0.8}
      accessible={true}
      accessibilityRole="radio"
      accessibilityState={{ selected: selectedValue === option }}
      accessibilityLabel={`Select ${option}`}
    >
      {icon && <View style={{ marginRight: 12 }}>{icon}</View>}
      {/* Option text - Using PlayfairDisplay for body text */}
      <Text
        style={{
          fontSize: 16,
          fontFamily: "PlayfairDisplay",
          fontWeight: "400",
          color: "#FFFFFF",
          flex: 1,
        }}
      >
        {option}
      </Text>
      {selectedValue === option && (
        <View
          style={{
            width: Platform.select({ ios: 20, android: 18 }),
            height: Platform.select({ ios: 20, android: 18 }),
            borderRadius: Platform.select({ ios: 10, android: 9 }),
            backgroundColor: "#EF3E78",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: Platform.select({ ios: 8, android: 7 }),
              height: Platform.select({ ios: 8, android: 7 }),
              borderRadius: Platform.select({ ios: 4, android: 3.5 }),
              backgroundColor: "#FFFFFF",
            }}
          />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderSectionHeader = (icon: React.ReactNode, title: string) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: Platform.select({ ios: 16, android: 14 }),
      }}
    >
      {icon}
      {/* Section title - Using HelloParis for UI elements */}
      <Text
        style={{
          fontSize: Platform.select({ ios: 18, android: 17 }),
          fontFamily: "HelloParis",
          fontWeight: "600",
          color: "#FFFFFF",
          marginLeft: 8,
          textShadowColor: "rgba(0, 0, 0, 0.5)",
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 3,
          letterSpacing: 0.3,
        }}
      >
        {title}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

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
            android: height * 0.06,
          }),
          paddingBottom: Platform.select({ ios: 40, android: 32 }),
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          {/* Progress Indicator */}
          <View
            style={{
              flexDirection: "row",
              marginBottom: 32,
              gap: Platform.select({ ios: 8, android: 6 }),
            }}
          >
            {[1, 2, 3, 4, 5].map((step, index) => (
              <View
                key={step}
                style={{
                  width: index === 3 ? 24 : 8,
                  height: Platform.select({ ios: 8, android: 6 }),
                  borderRadius: Platform.select({ ios: 4, android: 3 }),
                  backgroundColor:
                    index <= 3 ? "#EF3E78" : "rgba(255, 255, 255, 0.3)",
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
            Your preferences
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
            }}
          >
            Help us find your perfect match
          </Text>
        </View>

        {/* Form Sections */}
        <View style={{ gap: Platform.select({ ios: 32, android: 28 }) }}>
          {/* Interested In */}
          <View>
            {renderSectionHeader(
              <Heart size={20} color="#EF3E78" />,
              "I'm interested in"
            )}
            <View style={{ gap: Platform.select({ ios: 12, android: 10 }) }}>
              {genderOptions.map((option) =>
                renderOptionButton(
                  option,
                  preferences.interestedIn,
                  () => updatePreference("interestedIn", option),
                  <Users size={20} color="rgba(239, 62, 120, 0.7)" />
                )
              )}
            </View>
          </View>

          {/* Age Range */}
          <View>
            {renderSectionHeader(
              <Calendar size={20} color="#EF3E78" />,
              `Age range: ${preferences.ageRange[0]} - ${preferences.ageRange[1]}`
            )}
            <View
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: 16,
                padding: Platform.select({ ios: 20, android: 18 }),
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.2)",
              }}
            >
              {/* Placeholder text - Using PlayfairDisplay for body text */}
              <Text
                style={{
                  fontSize: Platform.select({ ios: 14, android: 13 }),
                  fontFamily: "PlayfairDisplay",
                  fontWeight: "400",
                  color: "rgba(255, 255, 255, 0.7)",
                  textAlign: "center",
                }}
              >
                Age range slider would be implemented here
              </Text>
            </View>
          </View>

          {/* Distance */}
          <View>
            {renderSectionHeader(
              <MapPin size={20} color="#EF3E78" />,
              "Maximum distance"
            )}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
            >
              <View
                style={{
                  flexDirection: "row",
                  gap: Platform.select({ ios: 12, android: 10 }),
                }}
              >
                {distanceOptions.map((distance) => (
                  <TouchableOpacity
                    key={distance}
                    onPress={() => updatePreference("maxDistance", distance)}
                    style={{
                      backgroundColor:
                        preferences.maxDistance === distance
                          ? "rgba(239, 62, 120, 0.15)"
                          : "rgba(255, 255, 255, 0.08)",
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor:
                        preferences.maxDistance === distance
                          ? "#EF3E78"
                          : "rgba(141, 105, 246, 0.25)",
                      paddingHorizontal: 16,
                      paddingVertical: Platform.select({
                        ios: 12,
                        android: 10,
                      }),
                      minWidth: 70,
                      alignItems: "center",
                    }}
                    activeOpacity={0.8}
                    accessible={true}
                    accessibilityRole="radio"
                    accessibilityState={{
                      selected: preferences.maxDistance === distance,
                    }}
                    accessibilityLabel={`Select ${distance} kilometers`}
                  >
                    {/* Distance label - Using HelloParis for UI elements */}
                    <Text
                      style={{
                        fontSize: Platform.select({ ios: 14, android: 13 }),
                        fontFamily: "HelloParis",
                        fontWeight: "600",
                        color: "#FFFFFF",
                      }}
                    >
                      {distance}km
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Relationship Type */}
          <View>
            {renderSectionHeader(
              <Heart size={20} color="#EF3E78" />,
              "Looking for"
            )}
            <View style={{ gap: Platform.select({ ios: 12, android: 10 }) }}>
              {relationshipOptions.map((option) =>
                renderOptionButton(option, preferences.relationship, () =>
                  updatePreference("relationship", option)
                )
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button - Using PrimaryButton */}
      <View
        style={{
          paddingHorizontal: 32,
          paddingBottom: Platform.select({ ios: 40, android: 32 }),
        }}
      >
        <PrimaryButton
          title="Continue"
          onPress={handleNext}
          disabled={!isFormValid()}
          accessibilityLabel="Continue to verification upload"
          accessibilityHint="Proceeds to identity verification step"
        />
      </View>
    </View>
  );
}
