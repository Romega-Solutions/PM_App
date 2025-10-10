import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ChevronRight, Eye, Heart, MapPin, User } from "lucide-react-native";
import React from "react";
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

  // ...rest of the existing code remains the same...
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
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Header */}
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          {/* Completion Animation */}
          <View
            style={{
              backgroundColor: "rgba(34, 197, 94, 0.15)",
              borderRadius: 60,
              padding: 24,
              marginBottom: 32,
              borderWidth: 3,
              borderColor: "rgba(34, 197, 94, 0.4)",
              shadowColor: "#22c55e",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 20,
              elevation: 15,
            }}
          >
            <Heart size={48} color="#22c55e" fill="#22c55e" />
          </View>

          <Text
            style={{
              fontSize: Math.min(width * 0.08, 34),
              fontFamily: "PlayfairDisplay-Bold",
              color: "#FFFFFF",
              textAlign: "center",
              marginBottom: 12,
              textShadowColor: "rgba(0, 0, 0, 0.8)",
              textShadowOffset: { width: 0, height: 3 },
              textShadowRadius: 10,
            }}
          >
            Welcome to PinayMate!
          </Text>

          <Text
            style={{
              fontSize: 16,
              fontFamily: "PlayfairDisplay-Regular",
              color: "rgba(255, 255, 255, 0.9)",
              textAlign: "center",
              lineHeight: 24,
              paddingHorizontal: 20,
            }}
          >
            Your profile is complete! Here's what we know about you:
          </Text>
        </View>

        {/* Profile Summary Card */}
        <View
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.12)",
            borderRadius: 20,
            padding: 24,
            marginBottom: 32,
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.2)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          {/* Profile Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: "rgba(255, 255, 255, 0.2)",
            }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: "rgba(239, 62, 120, 0.2)",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
                borderWidth: 2,
                borderColor: "#EF3E78",
              }}
            >
              <User size={28} color="#EF3E78" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 22,
                  fontFamily: "PlayfairDisplay-Bold",
                  color: "#FFFFFF",
                  marginBottom: 4,
                }}
              >
                {userData.firstName} {userData.lastName}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "PlayfairDisplay-Regular",
                    color: "rgba(255, 255, 255, 0.8)",
                  }}
                >
                  {userData.age} years old
                </Text>
                {userData.verified && (
                  <View
                    style={{
                      backgroundColor: "#22c55e",
                      borderRadius: 8,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      marginLeft: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontFamily: "PlayfairDisplay-SemiBold",
                        color: "#FFFFFF",
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
          <View style={{ gap: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MapPin
                size={18}
                color="#EF3E78"
                style={{ marginRight: 12, width: 20 }}
              />
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "PlayfairDisplay-Regular",
                  color: "rgba(255, 255, 255, 0.9)",
                  flex: 1,
                }}
              >
                {userData.location}
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Heart
                size={18}
                color="#EF3E78"
                style={{ marginRight: 12, width: 20 }}
              />
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "PlayfairDisplay-Regular",
                  color: "rgba(255, 255, 255, 0.9)",
                  flex: 1,
                }}
              >
                Looking for {userData.interestedIn.toLowerCase()} •{" "}
                {userData.relationship}
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Eye
                size={18}
                color="#EF3E78"
                style={{ marginRight: 12, width: 20 }}
              />
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "PlayfairDisplay-Regular",
                  color: "rgba(255, 255, 255, 0.9)",
                  flex: 1,
                }}
              >
                {userData.photos} photos uploaded
              </Text>
            </View>
          </View>
        </View>

        {/* Success Message */}
        <View
          style={{
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            borderRadius: 16,
            padding: 20,
            marginBottom: 32,
            borderWidth: 1,
            borderColor: "rgba(34, 197, 94, 0.3)",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontFamily: "PlayfairDisplay-SemiBold",
              color: "#FFFFFF",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            🎉 Profile Complete!
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "PlayfairDisplay-Regular",
              color: "rgba(255, 255, 255, 0.8)",
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            You're all set to start connecting with amazing Filipino singles
            worldwide!
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={{ paddingHorizontal: 32, paddingBottom: 40, gap: 16 }}>
        {/* Start Dating - Primary CTA */}
        <TouchableOpacity
          style={{
            borderRadius: 28,
            paddingVertical: 20,
            paddingHorizontal: 32,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#EF3E78",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.6,
            shadowRadius: 25,
            elevation: 15,
            width: "100%",
            minHeight: 60,
          }}
          onPress={handleStartDating}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#EF3E78", "#8D69F6"]}
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
          <Heart
            size={22}
            color="#FFFFFF"
            fill="#FFFFFF"
            style={{ marginRight: 8, zIndex: 1 }}
          />
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 19,
              fontFamily: "PlayfairDisplay-Bold",
              fontWeight: "700",
              marginRight: 8,
              letterSpacing: 0.5,
              zIndex: 1,
            }}
          >
            Start Dating
          </Text>
          <ChevronRight
            size={24}
            color="#FFFFFF"
            strokeWidth={2.5}
            style={{ zIndex: 1 }}
          />
        </TouchableOpacity>

        {/* Explore App - Secondary CTA */}
        <TouchableOpacity
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.12)",
            borderRadius: 28,
            paddingVertical: 18,
            paddingHorizontal: 32,
            borderWidth: 1.5,
            borderColor: "rgba(255, 255, 255, 0.3)",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            minHeight: 56,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 6,
          }}
          onPress={handleExploreApp}
          activeOpacity={0.8}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 18,
              fontFamily: "PlayfairDisplay-SemiBold",
              fontWeight: "600",
              letterSpacing: 0.5,
            }}
          >
            Explore the App First
          </Text>
        </TouchableOpacity>

        {/* Stats Preview */}
        <Text
          style={{
            fontSize: 13,
            fontFamily: "PlayfairDisplay-Regular",
            color: "rgba(255, 255, 255, 0.6)",
            textAlign: "center",
            marginTop: 16,
            lineHeight: 18,
          }}
        >
          Join 50,000+ verified Filipino singles{"\n"}
          Ready to find meaningful connections
        </Text>
      </View>
    </View>
  );
}