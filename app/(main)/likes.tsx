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

const matches = [
  {
    id: 1,
    name: "Maria",
    age: 25,
    image: require("../../assets/couple1.png"),
    location: "Manila",
  },
  {
    id: 2,
    name: "Anna",
    age: 23,
    image: require("../../assets/couple1.png"),
    location: "Cebu",
  },
  {
    id: 3,
    name: "Sofia",
    age: 27,
    image: require("../../assets/couple1.png"),
    location: "Davao",
  },
  {
    id: 4,
    name: "Carmen",
    age: 24,
    image: require("../../assets/couple1.png"),
    location: "Iloilo",
  },
];

export default function Likes() {
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
        <Text
          style={{
            fontSize: isSmallDevice ? 28 : 32,
            fontWeight: "bold",
            color: "#fff",
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
            paddingHorizontal: 15,
            justifyContent: "space-between",
          }}
        >
          {matches.map((match) => (
            <TouchableOpacity
              key={match.id}
              style={{
                width: (width - 40) / 2,
                marginBottom: 20,
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: 15,
                overflow: "hidden",
              }}
            >
              <Image
                source={match.image}
                style={{
                  width: "100%",
                  height: 200,
                }}
                resizeMode="cover"
              />
              <View style={{ padding: 15 }}>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 18,
                    fontWeight: "bold",
                    marginBottom: 5,
                  }}
                >
                  {match.name}, {match.age}
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 14,
                  }}
                >
                  📍 {match.location}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
