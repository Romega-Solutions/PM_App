import { Heart } from "lucide-react-native";
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

const { width } = Dimensions.get("window");
const isSmallDevice = width < 375;

// Use the same images as in index.tsx
const matches = [
  {
    id: 1,
    name: "Maria",
    age: 25,
    image: require("../../assets/girl1.jpg"),
    location: "Manila",
  },
  {
    id: 2,
    name: "Angel",
    age: 23,
    image: require("../../assets/girl2.jpg"),
    location: "Cebu City",
  },
  {
    id: 3,
    name: "Jessa",
    age: 27,
    image: require("../../assets/girl3.jpg"),
    location: "Davao",
  },
  {
    id: 4,
    name: "Kim",
    age: 24,
    image: require("../../assets/girl4.jpg"),
    location: "Quezon City",
  },
  {
    id: 5,
    name: "Liza",
    age: 26,
    image: require("../../assets/girl5.jpg"),
    location: "Baguio",
  },
];

export default function Likes() {
  return (
    <View style={{ flex: 1, backgroundColor: "#422057" }}>
      <StatusBar barStyle="light-content" backgroundColor="#422057" />

      {/* Header */}
      <View
        style={{
          paddingTop: (StatusBar.currentHeight || 44) + 10,
          paddingHorizontal: 24,
          paddingBottom: 20,
        }}
      >
        <Text
          style={{
            fontSize: isSmallDevice ? 28 : 32,
            fontWeight: "800",
            color: "#F4376D",
            letterSpacing: 1,
            textShadowColor: "rgba(168, 85, 247, 0.7)",
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4,
          }}
        >
          Your Matches
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: "rgba(255,255,255,0.8)",
            marginTop: 5,
          }}
        >
          {matches.length} beautiful matches waiting for you
        </Text>
      </View>

      {/* Matches Grid */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            paddingHorizontal: 12,
            justifyContent: "space-between",
          }}
        >
          {matches.map((match) => (
            <TouchableOpacity
              key={match.id}
              style={{
                width: (width - 40) / 2,
                marginBottom: 22,
                backgroundColor: "rgba(255,255,255,0.08)",
                borderRadius: 22,
                overflow: "hidden",
                borderWidth: 2,
                borderColor: "rgba(244, 55, 109, 0.13)",
              }}
              activeOpacity={0.88}
            >
              <Image
                source={match.image}
                style={{
                  width: "100%",
                  height: 200,
                  backgroundColor: "#222",
                }}
                resizeMode="cover"
              />
              <View style={{ padding: 16 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 19,
                      fontWeight: "800",
                      marginRight: 6,
                      textShadowColor: "rgba(168, 85, 247, 0.7)",
                      textShadowOffset: { width: 0, height: 2 },
                      textShadowRadius: 4,
                    }}
                  >
                    {match.name}, {match.age}
                  </Text>
                  <Heart size={16} color="#F4376D" fill="#F4376D" />
                </View>
                <Text
                  style={{
                    color: "#A855F7",
                    fontSize: 15,
                    fontWeight: "600",
                    marginBottom: 2,
                  }}
                >
                  📍 {match.location}
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 13,
                  }}
                >
                  Verified Filipino
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
