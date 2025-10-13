import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Eye, Heart, MapPin, Sparkles, User } from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import PrimaryButton from "../../../src/components/ui/PrimaryButton";
import SecondaryButton from "../../../src/components/ui/SecondaryButton";

const { width, height } = Dimensions.get("window");

export default function WelcomeComplete() {
  const router = useRouter();

  // Sample user data - in real app this would come from previous steps/database
  const userData = {
    firstName: "Maria",
    lastName: "Santos",
    age: 26,
    location: "Manila, Philippines",
    interestedIn: "Men",
    relationship: "Long-term relationship",
    photos: 4,
    verified: true,
  };

  const handleStartDating = () => {
    // Navigate to main app (dating flow)
    router.replace("/(main)");
  };

  const handleExploreApp = () => {
    // Navigate to main app (exploration mode)
    router.replace("/(main)");
  };

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
        {/* Logo Header */}
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <View
            style={{
              width: 120,
              height: 120,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 24,
              shadowColor: "#EF3E78",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.7,
              shadowRadius: 30,
              elevation: 15,
            }}
          >
            <Image
              source={require("../../../assets/logo-no-bg.png")}
              style={{ width: 120, height: 120 }}
              resizeMode="contain"
            />
          </View>

          {/* Welcome Message */}
          <View style={{ alignItems: "center", marginBottom: 16 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Sparkles
                size={24}
                color="#FFD700"
                fill="#FFD700"
                style={{ marginRight: 8 }}
              />
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
                  textShadowColor: "rgba(0, 0, 0, 0.8)",
                  textShadowOffset: { width: 0, height: 3 },
                  textShadowRadius: 10,
                  letterSpacing: Platform.select({
                    ios: -0.5,
                    android: -0.3,
                  }),
                }}
              >
                Welcome, {userData.firstName}!
              </Text>
              <Sparkles
                size={24}
                color="#FFD700"
                fill="#FFD700"
                style={{ marginLeft: 8 }}
              />
            </View>

            <Text
              style={{
                fontSize: Platform.select({ ios: 16, android: 15 }),
                fontFamily: "PlayfairDisplay",
                fontWeight: "400",
                color: "rgba(255, 255, 255, 0.9)",
                textAlign: "center",
                lineHeight: Platform.select({ ios: 24, android: 22 }),
                paddingHorizontal: 20,
              }}
            >
              Your profile is complete and ready to shine!
            </Text>
          </View>
        </View>

        {/* Profile Summary Card */}
        <View
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            borderRadius: 24,
            padding: Platform.select({ ios: 28, android: 24 }),
            marginBottom: Platform.select({ ios: 24, android: 20 }),
            borderWidth: 1.5,
            borderColor: "rgba(255, 255, 255, 0.25)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: Platform.select({ ios: 0.3, android: 0.25 }),
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          {/* Profile Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: Platform.select({ ios: 24, android: 20 }),
              paddingBottom: Platform.select({ ios: 20, android: 18 }),
              borderBottomWidth: 1,
              borderBottomColor: "rgba(255, 255, 255, 0.25)",
            }}
          >
            <View
              style={{
                width: Platform.select({ ios: 70, android: 66 }),
                height: Platform.select({ ios: 70, android: 66 }),
                borderRadius: Platform.select({ ios: 35, android: 33 }),
                backgroundColor: "rgba(239, 62, 120, 0.25)",
                justifyContent: "center",
                alignItems: "center",
                marginRight: Platform.select({ ios: 18, android: 16 }),
                borderWidth: 3,
                borderColor: "#EF3E78",
                shadowColor: "#EF3E78",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.5,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <User
                size={Platform.select({ ios: 32, android: 30 })}
                color="#EF3E78"
                strokeWidth={2.5}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: Platform.select({ ios: 24, android: 22 }),
                  fontFamily: "HelloParis",
                  fontWeight: "700",
                  color: "#FFFFFF",
                  marginBottom: 6,
                  textShadowColor: "rgba(0, 0, 0, 0.5)",
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 4,
                }}
              >
                {userData.firstName} {userData.lastName}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: Platform.select({ ios: 16, android: 15 }),
                    fontFamily: "PlayfairDisplay",
                    fontWeight: "400",
                    color: "rgba(255, 255, 255, 0.85)",
                  }}
                >
                  {userData.age} years old
                </Text>
                {userData.verified && (
                  <View
                    style={{
                      backgroundColor: "#22c55e",
                      borderRadius: Platform.select({ ios: 10, android: 9 }),
                      paddingHorizontal: Platform.select({
                        ios: 8,
                        android: 7,
                      }),
                      paddingVertical: Platform.select({ ios: 3, android: 2 }),
                      marginLeft: Platform.select({ ios: 10, android: 9 }),
                      shadowColor: "#22c55e",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.5,
                      shadowRadius: 6,
                      elevation: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: Platform.select({ ios: 11, android: 10 }),
                        fontFamily: "HelloParis",
                        fontWeight: "700",
                        color: "#FFFFFF",
                        letterSpacing: 0.5,
                      }}
                    >
                      VERIFIED
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Profile Details */}
          <View style={{ gap: Platform.select({ ios: 18, android: 16 }) }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                padding: Platform.select({ ios: 14, android: 12 }),
                borderRadius: 12,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "rgba(239, 62, 120, 0.2)",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <MapPin size={18} color="#EF3E78" strokeWidth={2.5} />
              </View>
              <Text
                style={{
                  fontSize: Platform.select({ ios: 15, android: 14 }),
                  fontFamily: "PlayfairDisplay",
                  fontWeight: "500",
                  color: "rgba(255, 255, 255, 0.95)",
                  flex: 1,
                }}
              >
                {userData.location}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                padding: Platform.select({ ios: 14, android: 12 }),
                borderRadius: 12,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "rgba(239, 62, 120, 0.2)",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <Heart size={18} color="#EF3E78" strokeWidth={2.5} />
              </View>
              <Text
                style={{
                  fontSize: Platform.select({ ios: 15, android: 14 }),
                  fontFamily: "PlayfairDisplay",
                  fontWeight: "500",
                  color: "rgba(255, 255, 255, 0.95)",
                  flex: 1,
                }}
              >
                Looking for {userData.interestedIn.toLowerCase()} •{" "}
                {userData.relationship}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                padding: Platform.select({ ios: 14, android: 12 }),
                borderRadius: 12,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "rgba(239, 62, 120, 0.2)",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <Eye size={18} color="#EF3E78" strokeWidth={2.5} />
              </View>
              <Text
                style={{
                  fontSize: Platform.select({ ios: 15, android: 14 }),
                  fontFamily: "PlayfairDisplay",
                  fontWeight: "500",
                  color: "rgba(255, 255, 255, 0.95)",
                  flex: 1,
                }}
              >
                {userData.photos} photos uploaded
              </Text>
            </View>
          </View>
        </View>

        {/* Success Message Banner */}
        <View
          style={{
            backgroundColor: "rgba(34, 197, 94, 0.15)",
            borderRadius: 18,
            padding: Platform.select({ ios: 20, android: 18 }),
            marginBottom: Platform.select({ ios: 28, android: 24 }),
            borderWidth: 1.5,
            borderColor: "rgba(34, 197, 94, 0.4)",
            shadowColor: "#22c55e",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <Text
            style={{
              fontSize: Platform.select({ ios: 17, android: 16 }),
              fontFamily: "HelloParis",
              fontWeight: "700",
              color: "#FFFFFF",
              textAlign: "center",
              marginBottom: Platform.select({ ios: 8, android: 7 }),
              textShadowColor: "rgba(0, 0, 0, 0.4)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 3,
            }}
          >
            🎉 Profile Complete!
          </Text>
          <Text
            style={{
              fontSize: Platform.select({ ios: 14, android: 13 }),
              fontFamily: "PlayfairDisplay",
              fontWeight: "400",
              color: "rgba(255, 255, 255, 0.9)",
              textAlign: "center",
              lineHeight: Platform.select({ ios: 21, android: 19 }),
            }}
          >
            You're all set to start connecting with amazing Filipino singles
            worldwide!
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View
        style={{
          paddingHorizontal: 32,
          paddingBottom: Platform.select({ ios: 40, android: 32 }),
          gap: Platform.select({ ios: 16, android: 14 }),
          backgroundColor: "rgba(52, 8, 57, 0.6)",
          paddingTop: Platform.select({ ios: 24, android: 20 }),
          borderTopWidth: 1,
          borderTopColor: "rgba(255, 255, 255, 0.1)",
        }}
      >
        <PrimaryButton
          title="Start Dating"
          onPress={handleStartDating}
          accessibilityLabel="Start dating on PinayMate"
          accessibilityHint="Begin browsing and matching with other users"
          icon={<Heart size={20} color="#FFFFFF" fill="#FFFFFF" />}
        />

        <SecondaryButton
          title="Explore the App First"
          variant="white"
          onPress={handleExploreApp}
          accessibilityLabel="Explore app features first"
          accessibilityHint="Browse the app without starting to match"
        />

        <Text
          style={{
            fontSize: Platform.select({ ios: 13, android: 12 }),
            fontFamily: "PlayfairDisplay",
            fontWeight: "400",
            color: "rgba(255, 255, 255, 0.7)",
            textAlign: "center",
            marginTop: Platform.select({ ios: 12, android: 10 }),
            lineHeight: Platform.select({ ios: 18, android: 16 }),
          }}
        >
          Join 50,000+ verified Filipino singles{"\n"}
          Ready to find meaningful connections
        </Text>
      </View>
    </View>
  );
}
