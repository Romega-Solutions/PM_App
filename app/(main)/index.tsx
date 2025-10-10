import { Bell, Heart, Settings, Star, X } from "lucide-react-native";
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

// Sample user data (replace image paths with your assets)
const users = [
  {
    id: "1",
    name: "Maria",
    age: 25,
    location: "Manila, Philippines",
    image: require("../../assets/girl1.jpg"),
  },
  {
    id: "2",
    name: "Angel",
    age: 23,
    location: "Cebu City, Philippines",
    image: require("../../assets/girl2.jpg"),
  },
  {
    id: "3",
    name: "Jessa",
    age: 27,
    location: "Davao, Philippines",
    image: require("../../assets/girl3.jpg"),
  },
  {
    id: "4",
    name: "Kim",
    age: 24,
    location: "Quezon City, Philippines",
    image: require("../../assets/girl4.jpg"),
  },
  {
    id: "5",
    name: "Liza",
    age: 26,
    location: "Baguio, Philippines",
    image: require("../../assets/girl5.jpg"),
  },
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % users.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + users.length) % users.length);
  };

  const user = users[currentIndex];

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
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TouchableOpacity>
            <Settings size={28} color="#A855F7" />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: isSmallDevice ? 22 : 28,
              fontWeight: "800",
              color: "#F4376D",
              letterSpacing: 1,
              textShadowColor: "rgba(168, 85, 247, 0.7)",
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 4,
            }}
          >
            PinayMate
          </Text>
          <TouchableOpacity>
            <Bell size={28} color="#A855F7" />
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
            width: width * 0.88,
            height: height * 0.62,
            backgroundColor: "rgba(255,255,255,0.08)",
            borderRadius: 28,
            overflow: "hidden",
            shadowColor: "#A855F7",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 12,
            borderWidth: 2,
            borderColor: "rgba(244, 55, 109, 0.18)",
          }}
        >
          <Image
            source={user.image}
            style={{
              width: "100%",
              height: "68%",
              backgroundColor: "#222",
            }}
            resizeMode="cover"
          />
          <View style={{ padding: 24, flex: 1, justifyContent: "center" }}>
            <Text
              style={{
                color: "#fff",
                fontSize: 28,
                fontWeight: "800",
                marginBottom: 6,
                textShadowColor: "rgba(168, 85, 247, 0.7)",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              }}
            >
              {user.name}, {user.age}
            </Text>
            <Text
              style={{
                color: "#A855F7",
                fontSize: 16,
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              📍 {user.location}
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: 15,
                fontWeight: "400",
              }}
            >
              Verified Filipino. Looking for genuine connections.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            marginTop: 36,
            width: "80%",
            gap: 24,
          }}
        >
          <TouchableOpacity
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: "rgba(168,85,247,0.12)",
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 2,
              borderColor: "rgba(168,85,247,0.18)",
            }}
            onPress={handlePrev}
            accessibilityLabel="Pass"
          >
            <X size={32} color="#A855F7" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              width: 74,
              height: 74,
              borderRadius: 37,
              backgroundColor: "#F4376D",
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#F4376D",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 8,
              borderWidth: 3,
              borderColor: "#fff",
            }}
            onPress={handleNext}
            accessibilityLabel="Like"
          >
            <Heart size={36} color="#fff" fill="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: "rgba(244,55,109,0.12)",
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 2,
              borderColor: "rgba(244,55,109,0.18)",
            }}
            accessibilityLabel="Super Like"
          >
            <Star size={32} color="#F4376D" fill="#A855F7" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Card Pagination Dots */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 32,
          gap: 8,
        }}
      >
        {users.map((_, idx) => (
          <View
            key={idx}
            style={{
              width: currentIndex === idx ? 18 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor:
                currentIndex === idx ? "#F4376D" : "rgba(255,255,255,0.25)",
              marginHorizontal: 2,
              transition: "width 0.2s",
            }}
          />
        ))}
      </View>
    </View>
  );
}
