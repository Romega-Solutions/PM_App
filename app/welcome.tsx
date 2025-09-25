import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");
const isSmallDevice = width < 375;

export default function Welcome() {
  const router = useRouter();

  return (
    <View className="flex-1" style={{ backgroundColor: "#1a202c" }}>
      <StatusBar barStyle="light-content" backgroundColor="#1a202c" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Skip Button */}
        <TouchableOpacity
          onPress={() => router.push("/signup")}
          className="absolute top-12 right-6 z-10 px-4 py-2 rounded-full bg-white/10"
          style={{
            marginTop: StatusBar.currentHeight || 44,
          }}
          accessibilityLabel="Skip to sign up"
          accessibilityRole="button"
        >
          <Text className="text-white text-sm font-medium">Skip</Text>
        </TouchableOpacity>

        {/* Main Content */}
        <View
          className="flex-1 justify-center items-center px-6"
          style={{ paddingTop: (StatusBar.currentHeight || 44) + 60 }}
        >
          {/* Profile Photos Section */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: isSmallDevice ? 40 : 60,
              width: "100%",
            }}
          >
            {/* Left Profile Photo */}
            <View
              style={{
                borderRadius: 20,
                overflow: "hidden",
                width: isSmallDevice ? 120 : 140,
                height: isSmallDevice ? 160 : 180,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
                marginRight: 15,
              }}
            >
              <Image
                source={require("../assets/couple1.png")}
                style={{
                  width: "100%",
                  height: "100%",
                }}
                resizeMode="cover"
                accessibilityLabel="Profile photo"
              />
            </View>

            {/* Heart Icon */}
            <View
              style={{
                backgroundColor: "#F4376D",
                borderRadius: 25,
                width: 50,
                height: 50,
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#F4376D",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 8,
                zIndex: 10,
              }}
            >
              <Text style={{ fontSize: 24, color: "white" }}>💜</Text>
            </View>

            {/* Right Profile Photo */}
            <View
              style={{
                borderRadius: 20,
                overflow: "hidden",
                width: isSmallDevice ? 120 : 140,
                height: isSmallDevice ? 160 : 180,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
                marginLeft: 15,
              }}
            >
              <Image
                source={require("../assets/couple1.png")}
                style={{
                  width: "100%",
                  height: "100%",
                }}
                resizeMode="cover"
                accessibilityLabel="Profile photo"
              />
            </View>
          </View>

          {/* Match Text */}
          <View style={{ alignItems: "center", marginBottom: isSmallDevice ? 20 : 30 }}>
            <Text
              style={{
                fontSize: isSmallDevice ? 48 : 56,
                fontWeight: "bold",
                color: "#fff",
                textAlign: "center",
                marginBottom: 10,
                fontFamily: "serif",
              }}
            >
              pinaymate
            </Text>
            <Text
              style={{
                fontSize: isSmallDevice ? 16 : 18,
                color: "#fff",
                opacity: 0.8,
                textAlign: "center",
                lineHeight: isSmallDevice ? 22 : 26,
              }}
            >
              You have 24 hours to take a first step{"\n"}with new partner
            </Text>
          </View>

          {/* Keep Swiping Text */}
          <View style={{ marginBottom: isSmallDevice ? 40 : 60 }}>
            <TouchableOpacity
              style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.3)",
                borderRadius: 20,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: isSmallDevice ? 14 : 16,
                  fontWeight: "500",
                  opacity: 0.9,
                }}
              >
                KEEP SWIPING
              </Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={{ width: "100%", paddingHorizontal: 20 }}>
            {/* Sign Up Button */}
            <TouchableOpacity
              style={{
                backgroundColor: "#F4376D",
                borderRadius: 25,
                paddingVertical: isSmallDevice ? 16 : 18,
                shadowColor: "#F4376D",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
                marginBottom: 15,
              }}
              onPress={() => router.push("/signup")}
              accessibilityLabel="Start your love journey - Sign up"
              accessibilityRole="button"
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: isSmallDevice ? 16 : 18,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Start Your Love Journey
              </Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              style={{
                borderWidth: 2,
                borderColor: "#F4376D",
                borderRadius: 25,
                backgroundColor: "rgba(255,255,255,0.05)",
                paddingVertical: isSmallDevice ? 16 : 18,
                marginBottom: 20,
              }}
              onPress={() => router.push("/signin")}
              accessibilityLabel="Sign in to existing account"
              accessibilityRole="button"
            >
              <Text
                style={{
                  color: "#F4376D",
                  fontSize: isSmallDevice ? 16 : 18,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </View>

          {/* Trust Indicators */}
          <View style={{ alignItems: "center", paddingTop: 20, paddingBottom: 32 }}>
            <Text
              style={{
                color: "#fff",
                textAlign: "center",
                opacity: 0.6,
                fontSize: isSmallDevice ? 12 : 14,
                lineHeight: isSmallDevice ? 16 : 18,
              }}
            >
              <Text style={{ color: "#4ade80" }}>🛡️ Trusted & Verified</Text>
              {" • "}
              <Text style={{ color: "#F4376D" }}>97% Success Rate</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
              