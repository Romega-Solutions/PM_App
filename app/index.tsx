import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1800); // 1.8s
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
          style={styles.gradient}
        >
          <View style={styles.logoWrap}>
            <Image
              source={require("../assets/logo-no-bg.png")}
              style={{ width: 140, height: 140 }}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.brandText}>PinayMate</Text>

          <Text style={styles.tagline}>Elite Filipino Dating</Text>

          <ActivityIndicator
            size="large"
            color="#EF3E78"
            style={{ transform: [{ scale: 1.15 }] }}
          />
        </LinearGradient>
      </View>
    );
  }

  return <Redirect href="/(auth)/welcome" />;
}

const styles = StyleSheet.create({
  gradient: { flex: 1, justifyContent: "center", alignItems: "center" },
  logoWrap: {
    shadowColor: "#EF3E78",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 15,
    marginBottom: 28,
  },
  // Use the exact loaded font key below
  brandText: {
    color: "#FFFFFF",
    fontSize: 40,
    fontFamily: "HelloParis-Bold", // <- use exact key registered in _layout.tsx
    letterSpacing: 1.2,
    textShadowColor: "rgba(239, 62, 120, 0.85)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
    marginBottom: 18,
    textAlign: "center",
  },
  // Tagline uses Lora regular (exact key is "Lora")
  tagline: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 15,
    fontFamily: "Lora",
    fontWeight: "500", // this uses the Lora-Medium file you loaded
    letterSpacing: 0.6,
    textAlign: "center",
    marginBottom: 28,
    paddingHorizontal: 40,
  },
});
