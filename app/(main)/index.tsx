import { LinearGradient } from "expo-linear-gradient";
import { Bell, Heart, MapPin, Settings, Star, X } from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  Image,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

// Sample user data (replace image paths with your assets)
const users = [
  {
    id: "1",
    name: "Maria",
    age: 25,
    location: "Manila, Philippines",
    image: require("../../assets/girl1.jpg"),
    verified: true,
    bio: "Love traveling and exploring new cultures. Looking for genuine connections.",
  },
  {
    id: "2",
    name: "Angel",
    age: 23,
    location: "Cebu City, Philippines",
    image: require("../../assets/girl2.jpg"),
    verified: true,
    bio: "Passionate about photography and adventure. Let's create memories together!",
  },
  {
    id: "3",
    name: "Jessa",
    age: 27,
    location: "Davao, Philippines",
    image: require("../../assets/girl3.jpg"),
    verified: false,
    bio: "Coffee lover and bookworm. Seeking someone who shares my love for deep conversations.",
  },
  {
    id: "4",
    name: "Kim",
    age: 24,
    location: "Quezon City, Philippines",
    image: require("../../assets/girl4.jpg"),
    verified: true,
    bio: "Fitness enthusiast and foodie. Balance is key in life and relationships.",
  },
  {
    id: "5",
    name: "Liza",
    age: 26,
    location: "Baguio, Philippines",
    image: require("../../assets/girl5.jpg"),
    verified: true,
    bio: "Artist and nature lover. Looking for someone to share beautiful moments with.",
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

      {/* Header */}
      <View
        style={{
          paddingTop: Platform.select({
            ios: height * 0.06,
            android: (StatusBar.currentHeight || 0) + 20,
          }),
          paddingHorizontal: 24,
          paddingBottom: 20,
          zIndex: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            style={{
              width: Platform.select({ ios: 44, android: 40 }),
              height: Platform.select({ ios: 44, android: 40 }),
              borderRadius: Platform.select({ ios: 22, android: 20 }),
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.2)",
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <Settings size={24} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>

          {/* App Logo/Title - Using HelloParis for UI elements */}
          <Text
            style={{
              fontSize: Platform.select({ ios: 28, android: 26 }),
              fontFamily: "HelloParis",
              fontWeight: "700",
              color: "#FFFFFF",
              letterSpacing: 0.5,
              textShadowColor: "rgba(0, 0, 0, 0.8)",
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 6,
            }}
          >
            PinayMate
          </Text>

          <TouchableOpacity
            style={{
              width: Platform.select({ ios: 44, android: 40 }),
              height: Platform.select({ ios: 44, android: 40 }),
              borderRadius: Platform.select({ ios: 22, android: 20 }),
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.2)",
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Bell size={24} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Card Area */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            width: width * 0.9,
            height: height * 0.65,
            backgroundColor: "rgba(255, 255, 255, 0.12)",
            borderRadius: 24,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: Platform.select({ ios: 0.3, android: 0.25 }),
            shadowRadius: 24,
            elevation: 15,
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.2)",
          }}
        >
          {/* Profile Image */}
          <View style={{ position: "relative", height: "70%" }}>
            <Image
              source={user.image}
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#222",
              }}
              resizeMode="cover"
            />

            {/* Verified Badge */}
            {user.verified && (
              <View
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  backgroundColor: "#22c55e",
                  borderRadius: Platform.select({ ios: 12, android: 10 }),
                  paddingHorizontal: Platform.select({ ios: 8, android: 7 }),
                  paddingVertical: Platform.select({ ios: 4, android: 3 }),
                  shadowColor: "#22c55e",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.6,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                {/* Verified badge - Using HelloParis for UI elements */}
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

            {/* Gradient Overlay */}
            <LinearGradient
              colors={["transparent", "rgba(0, 0, 0, 0.7)"]}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "40%",
              }}
            />
          </View>

          {/* Profile Info */}
          <View
            style={{
              padding: Platform.select({ ios: 24, android: 20 }),
              flex: 1,
              justifyContent: "space-between",
            }}
          >
            <View>
              {/* Name and Age - Using HelloParis for UI elements */}
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: Platform.select({ ios: 28, android: 26 }),
                  fontFamily: "HelloParis",
                  fontWeight: "700",
                  marginBottom: 8,
                  textShadowColor: "rgba(0, 0, 0, 0.5)",
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 4,
                }}
              >
                {user.name}, {user.age}
              </Text>

              {/* Location */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: Platform.select({ ios: 12, android: 10 }),
                }}
              >
                <MapPin size={16} color="#EF3E78" style={{ marginRight: 6 }} />
                {/* Location text - Using PlayfairDisplay for body text */}
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: Platform.select({ ios: 16, android: 15 }),
                    fontFamily: "PlayfairDisplay",
                    fontWeight: "500",
                  }}
                >
                  {user.location}
                </Text>
              </View>

              {/* Bio - Using PlayfairDisplay for body text */}
              <Text
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: Platform.select({ ios: 15, android: 14 }),
                  fontFamily: "PlayfairDisplay",
                  fontWeight: "400",
                  lineHeight: Platform.select({ ios: 22, android: 20 }),
                }}
              >
                {user.bio}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginTop: Platform.select({ ios: 40, android: 36 }),
            gap: Platform.select({ ios: 32, android: 28 }),
          }}
        >
          {/* Pass Button */}
          <TouchableOpacity
            style={{
              width: Platform.select({ ios: 64, android: 60 }),
              height: Platform.select({ ios: 64, android: 60 }),
              borderRadius: Platform.select({ ios: 32, android: 30 }),
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 2,
              borderColor: "rgba(255, 255, 255, 0.3)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 6,
            }}
            onPress={handlePrev}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Pass this profile"
          >
            <X
              size={Platform.select({ ios: 32, android: 30 })}
              color="#FFFFFF"
              strokeWidth={2.5}
            />
          </TouchableOpacity>

          {/* Like Button */}
          <TouchableOpacity
            style={{
              width: Platform.select({ ios: 80, android: 76 }),
              height: Platform.select({ ios: 80, android: 76 }),
              borderRadius: Platform.select({ ios: 40, android: 38 }),
              backgroundColor: "#EF3E78",
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#EF3E78",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.5,
              shadowRadius: 12,
              elevation: 10,
              borderWidth: 3,
              borderColor: "#FFFFFF",
            }}
            onPress={handleNext}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Like this profile"
          >
            <Heart
              size={Platform.select({ ios: 40, android: 38 })}
              color="#FFFFFF"
              fill="#FFFFFF"
              strokeWidth={2}
            />
          </TouchableOpacity>

          {/* Super Like Button */}
          <TouchableOpacity
            style={{
              width: Platform.select({ ios: 64, android: 60 }),
              height: Platform.select({ ios: 64, android: 60 }),
              borderRadius: Platform.select({ ios: 32, android: 30 }),
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 2,
              borderColor: "rgba(255, 255, 255, 0.3)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 6,
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Super like this profile"
          >
            <Star
              size={Platform.select({ ios: 32, android: 30 })}
              color="#FFD700"
              fill="#FFD700"
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Card Pagination Dots */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: Platform.select({ ios: 40, android: 32 }),
          gap: Platform.select({ ios: 8, android: 6 }),
        }}
      >
        {users.map((_, idx) => (
          <View
            key={idx}
            style={{
              width: currentIndex === idx ? 24 : 8,
              height: Platform.select({ ios: 8, android: 6 }),
              borderRadius: Platform.select({ ios: 4, android: 3 }),
              backgroundColor:
                currentIndex === idx ? "#EF3E78" : "rgba(255, 255, 255, 0.3)",
            }}
          />
        ))}
      </View>
    </View>
  );
}
