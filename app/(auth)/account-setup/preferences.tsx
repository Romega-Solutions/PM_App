import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ChevronRight, Heart, Users, Calendar, MapPin } from "lucide-react-native";
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
    "Not sure yet"
  ];

  const distanceOptions = [10, 25, 50, 100, 200];

  const updatePreference = (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const isFormValid = () => {
    return preferences.interestedIn !== "" && preferences.relationship !== "";
  };

  const handleNext = () => {
    if (isFormValid()) {
      router.push("/(auth)/account-setup/verification-upload");
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
                  width: index === 3 ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: index <= 3 ? "#EF3E78" : "rgba(255, 255, 255, 0.3)",
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
            Your preferences
          </Text>

          <Text
            style={{
              fontSize: 16,
              fontFamily: "PlayfairDisplay-Regular",
              color: "rgba(255, 255, 255, 0.8)",
              textAlign: "center",
              lineHeight: 24,
            }}
          >
            Help us find your perfect match
          </Text>
        </View>

        {/* Form Sections */}
        <View style={{ gap: 32 }}>
          {/* Interested In */}
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <Heart size={20} color="#EF3E78" style={{ marginRight: 8 }} />
              <Text style={{
                fontSize: 18,
                fontFamily: "PlayfairDisplay-SemiBold",
                color: "#FFFFFF",
                textShadowColor: "rgba(0, 0, 0, 0.5)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}>
                I'm interested in
              </Text>
            </View>
            <View style={{ gap: 12 }}>
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => updatePreference("interestedIn", option)}
                  style={{
                    backgroundColor: preferences.interestedIn === option 
                      ? "rgba(239, 62, 120, 0.2)" 
                      : "rgba(255, 255, 255, 0.1)",
                    borderRadius: 16,
                    borderWidth: 1.5,
                    borderColor: preferences.interestedIn === option 
                      ? "#EF3E78" 
                      : "rgba(255, 255, 255, 0.3)",
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                  activeOpacity={0.8}
                >
                  <Users size={20} color="rgba(255, 255, 255, 0.7)" style={{ marginRight: 12 }} />
                  <Text style={{
                    fontSize: 16,
                    fontFamily: "PlayfairDisplay-Regular",
                    color: "#FFFFFF",
                    flex: 1,
                  }}>
                    {option}
                  </Text>
                  {preferences.interestedIn === option && (
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
              ))}
            </View>
          </View>

          {/* Age Range */}
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <Calendar size={20} color="#EF3E78" style={{ marginRight: 8 }} />
              <Text style={{
                fontSize: 18,
                fontFamily: "PlayfairDisplay-SemiBold",
                color: "#FFFFFF",
                textShadowColor: "rgba(0, 0, 0, 0.5)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}>
                Age range: {preferences.ageRange[0]} - {preferences.ageRange[1]}
              </Text>
            </View>
            <View style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.3)",
            }}>
              <Text style={{
                fontSize: 14,
                fontFamily: "PlayfairDisplay-Regular",
                color: "rgba(255, 255, 255, 0.7)",
                textAlign: "center",
              }}>
                Age range slider would be implemented here
              </Text>
            </View>
          </View>

          {/* Distance */}
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <MapPin size={20} color="#EF3E78" style={{ marginRight: 8 }} />
              <Text style={{
                fontSize: 18,
                fontFamily: "PlayfairDisplay-SemiBold",
                color: "#FFFFFF",
                textShadowColor: "rgba(0, 0, 0, 0.5)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}>
                Maximum distance
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ gap: 12 }}>
              <View style={{ flexDirection: "row", gap: 12, paddingRight: 20 }}>
                {distanceOptions.map((distance) => (
                  <TouchableOpacity
                    key={distance}
                    onPress={() => updatePreference("maxDistance", distance)}
                    style={{
                      backgroundColor: preferences.maxDistance === distance 
                        ? "rgba(239, 62, 120, 0.2)" 
                        : "rgba(255, 255, 255, 0.1)",
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: preferences.maxDistance === distance 
                        ? "#EF3E78" 
                        : "rgba(255, 255, 255, 0.3)",
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      minWidth: 70,
                      alignItems: "center",
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={{
                      fontSize: 14,
                      fontFamily: "PlayfairDisplay-SemiBold",
                      color: "#FFFFFF",
                    }}>
                      {distance}km
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Relationship Type */}
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <Heart size={20} color="#EF3E78" style={{ marginRight: 8 }} />
              <Text style={{
                fontSize: 18,
                fontFamily: "PlayfairDisplay-SemiBold",
                color: "#FFFFFF",
                textShadowColor: "rgba(0, 0, 0, 0.5)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}>
                Looking for
              </Text>
            </View>
            <View style={{ gap: 12 }}>
              {relationshipOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => updatePreference("relationship", option)}
                  style={{
                    backgroundColor: preferences.relationship === option 
                      ? "rgba(239, 62, 120, 0.2)" 
                      : "rgba(255, 255, 255, 0.1)",
                    borderRadius: 16,
                    borderWidth: 1.5,
                    borderColor: preferences.relationship === option 
                      ? "#EF3E78" 
                      : "rgba(255, 255, 255, 0.3)",
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{
                    fontSize: 16,
                    fontFamily: "PlayfairDisplay-Regular",
                    color: "#FFFFFF",
                    flex: 1,
                  }}>
                    {option}
                  </Text>
                  {preferences.relationship === option && (
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
              ))}
            </View>
          </View>
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