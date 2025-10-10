import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, StatusBar, Text, View } from "react-native";

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1800); // 1.8 seconds
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <View style={{ flex: 1, backgroundColor: "#340839" }}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#340839"
          translucent={false}
        />

        <LinearGradient
          colors={["#340839", "#8D69F6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Logo with Glow Effect */}
          <View
            style={{
              shadowColor: "#EF3E78",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 30,
              elevation: 15,
              marginBottom: 32,
            }}
          >
            <Image
              source={require("../assets/logo-no-bg.png")}
              style={{
                width: 140,
                height: 140,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
              }}
              resizeMode="contain"
            />
          </View>

          {/* App Name with Gradient Text Effect */}
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 42,
              fontFamily: "PlayfairDisplay-Bold",
              fontWeight: "800",
              letterSpacing: 1.5,
              textShadowColor: "rgba(239, 62, 120, 0.8)",
              textShadowOffset: { width: 0, height: 3 },
              textShadowRadius: 8,
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            PinayMate
          </Text>

          {/* Tagline */}
          <Text
            style={{
              color: "rgba(255, 255, 255, 0.85)",
              fontSize: 16,
              fontFamily: "PlayfairDisplay-Regular",
              letterSpacing: 0.8,
              textAlign: "center",
              marginBottom: 32,
              paddingHorizontal: 40,
              textShadowColor: "rgba(0, 0, 0, 0.3)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 3,
            }}
          >
            Elite Filipino Dating
          </Text>

          {/* Loading Indicator */}
          <ActivityIndicator
            size="large"
            color="#EF3E78"
            style={{
              transform: [{ scale: 1.2 }],
            }}
          />
        </LinearGradient>
      </View>
    );
  }

  // Redirect to welcome screen inside (auth) group
  return <Redirect href="/(auth)/welcome" />;
}
