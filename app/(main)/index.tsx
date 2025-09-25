import React from "react";
import {
  Dimensions,
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");
const isSmallDevice = width < 375;

export default function Home() {
  return (
    <View style={{ flex: 1, backgroundColor: "#1a202c" }}>
      <StatusBar barStyle="light-content" backgroundColor="#1a202c" />

      {/* Header */}
      <View
        style={{
          paddingTop: (StatusBar.currentHeight || 44) + 10,
          paddingHorizontal: 20,
          paddingBottom: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TouchableOpacity>
            <Text style={{ fontSize: 24, color: "#fff" }}>⚙️</Text>
          </TouchableOpacity>
          <Text
            style={{
              fontSize: isSmallDevice ? 20 : 24,
              fontWeight: "bold",
              color: "#F4376D",
            }}
          >
            pinaymate
          </Text>
          <TouchableOpacity>
            <Text style={{ fontSize: 24, color: "#fff" }}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Card Area */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
        }}
      >
        <View
          style={{
            width: width * 0.85,
            height: height * 0.6,
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: 20,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <Image
            source={require("../../assets/couple1.png")}
            style={{ width: "100%", height: "70%" }}
            resizeMode="cover"
          />
          <View style={{ padding: 20 }}>
            <Text
              style={{
                color: "#fff",
                fontSize: 24,
                fontWeight: "bold",
                marginBottom: 5,
              }}
            >
              Maria, 25
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: 16,
              }}
            >
              📍 Manila, Philippines
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            marginTop: 40,
            width: "80%",
          }}
        >
          <TouchableOpacity
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: "rgba(255,255,255,0.1)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 24 }}>❌</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: "#F4376D",
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#F4376D",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text style={{ fontSize: 28 }}>💜</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: "rgba(255,255,255,0.1)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 24 }}>⭐</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
