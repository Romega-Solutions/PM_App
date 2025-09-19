import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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

// Use local images from your assets folder
const slides = [
  {
    title: "Find Your Perfect",
    highlight: "Filipino Soulmate 💜",
    description:
      "Join thousands who found lasting love through our AI-powered matching system. Authentic connections with verified Filipino singles worldwide.",
    image: require("../assets/couple1.png"),
    bg: "bg-gradient-to-br from-[#1a202c] via-[#2d1b3d] to-[#3d2952]",
    stats: [
      {
        label: "Success Rate",
        value: "97%",
        color: "bg-[#22c55e]",
        textColor: "text-white",
      },
      {
        label: "Love Stories",
        value: "2.5K+",
        color: "bg-[#F4376D]",
        textColor: "text-white",
      },
      {
        label: "Verified",
        value: "100%",
        color: "bg-[#3B82F6]",
        textColor: "text-white",
      },
    ],
  },
  {
    title: "SheerID Verified",
    highlight: "Authentic Profiles Only",
    description:
      "Every profile undergoes comprehensive verification including identity, income, and background checks. Connect with confidence knowing everyone is real.",
    image: require("../assets/couple1.png"),
    bg: "bg-gradient-to-br from-[#283040] via-[#3d2952] to-[#2d1b3d]",
    stats: [
      {
        label: "Identity Verified",
        value: "SheerID",
        color: "bg-[#16a34a]",
        textColor: "text-white",
      },
      {
        label: "Background Check",
        value: "✓",
        color: "bg-[#A855F7]",
        textColor: "text-white",
      },
    ],
  },
  {
    title: "AI-Powered Matching",
    highlight: "Your Perfect Match Awaits",
    description:
      "Our advanced algorithm analyzes 50+ compatibility factors to find your ideal partner. Real-time chat, video calls, and meaningful connections.",
    image: require("../assets/couple1.png"),
    bg: "bg-gradient-to-br from-[#2d1b3d] via-[#283040] to-[#1a202c]",
    stats: [
      {
        label: "Compatibility",
        value: "97%",
        color: "bg-[#4ade80]",
        textColor: "text-[#1a202c]",
      },
      {
        label: "Real-time Chat",
        value: "Live",
        color: "bg-[#C8B5E6]",
        textColor: "text-[#283040]",
      },
    ],
  },
];

export default function Welcome() {
  const [index, setIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setIndex((i) => (i + 1) % slides.length);

  const slide = slides[index];

  return (
    <View className="flex-1" style={{ backgroundColor: "#1a202c" }}>
      <StatusBar barStyle="light-content" backgroundColor="#1a202c" />

      <ScrollView
        className={`flex-1`}
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
          className="flex-1 px-6"
          style={{ paddingTop: (StatusBar.currentHeight || 44) + 60 }}
        >
          {/* Header Section */}
          <View className="flex-1 justify-center" style={{ minHeight: "60%" }}>
            {/* Title */}
            <View style={{ marginBottom: isSmallDevice ? 24 : 32 }}>
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "bold",
                  lineHeight: isSmallDevice ? 38 : 44,
                  marginBottom: 8,
                  fontSize: isSmallDevice ? 28 : 32,
                }}
              >
                {slide.title}
              </Text>
              <Text
                style={{
                  color: "#F4376D",
                  fontWeight: "bold",
                  lineHeight: isSmallDevice ? 38 : 44,
                  marginBottom: 16,
                  fontSize: isSmallDevice ? 28 : 32,
                }}
              >
                {slide.highlight}
              </Text>
              <Text
                style={{
                  color: "#fff",
                  opacity: 0.9,
                  fontWeight: "500",
                  fontSize: isSmallDevice ? 16 : 18,
                  lineHeight: isSmallDevice ? 22 : 26,
                }}
              >
                {slide.description}
              </Text>
            </View>

            {/* Stats Cards */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: isSmallDevice ? 24 : 32,
                width: "100%",
              }}
            >
              {slide.stats.map((stat, i) => (
                <View
                  key={i}
                  style={{
                    backgroundColor: stat.color
                      .replace("bg[", "")
                      .replace("]", ""),
                    borderRadius: 18,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                    minWidth: 90,
                    maxWidth: width * 0.28,
                    flex: 1,
                  }}
                >
                  <Text
                    style={{
                      color: stat.textColor
                        .replace("text[", "")
                        .replace("]", ""),
                      fontWeight: "bold",
                      marginBottom: 4,
                      fontSize: isSmallDevice ? 18 : 22,
                    }}
                  >
                    {stat.value}
                  </Text>
                  <Text
                    style={{
                      color: stat.textColor
                        .replace("text[", "")
                        .replace("]", ""),
                      fontWeight: "500",
                      opacity: 0.9,
                      fontSize: isSmallDevice ? 12 : 14,
                    }}
                  >
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Image */}
            <View
              style={{
                alignItems: "center",
                marginBottom: isSmallDevice ? 24 : 32,
              }}
            >
              <View
                style={{
                  borderRadius: 24,
                  overflow: "hidden",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                  elevation: 16,
                  width: isSmallDevice ? width * 0.75 : width * 0.8,
                  height: isSmallDevice ? width * 0.75 : width * 0.8,
                  maxWidth: 300,
                  maxHeight: 300,
                }}
              >
                <Image
                  source={slide.image}
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                  resizeMode="cover"
                  accessibilityLabel="Beautiful Filipina woman"
                />
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View
            style={{ marginBottom: isSmallDevice ? 16 : 24, paddingBottom: 20 }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: "#F4376D",
                borderRadius: 18,
                shadowColor: "#F4376D",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
                paddingVertical: isSmallDevice ? 14 : 16,
                paddingHorizontal: 32,
                marginBottom: 12,
              }}
              onPress={() => router.push("/signup")}
              accessibilityLabel="Sign up to find your Filipino love"
              accessibilityRole="button"
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "bold",
                  textAlign: "center",
                  fontSize: isSmallDevice ? 16 : 18,
                }}
              >
                Start Your Love Journey
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                borderWidth: 2,
                borderColor: "#F4376D",
                borderRadius: 18,
                backgroundColor: "rgba(255,255,255,0.05)",
                paddingVertical: isSmallDevice ? 14 : 16,
                paddingHorizontal: 32,
              }}
              onPress={() => router.push("/signin")}
              accessibilityLabel="Sign in to existing account"
              accessibilityRole="button"
            >
              <Text
                style={{
                  color: "#F4376D",
                  fontWeight: "bold",
                  textAlign: "center",
                  fontSize: isSmallDevice ? 16 : 18,
                }}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </View>

          {/* Slide Indicators */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            {slides.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setIndex(i)}
                style={{
                  height: 8,
                  borderRadius: 4,
                  marginHorizontal: 4,
                  width: i === index ? 32 : 8,
                  backgroundColor:
                    i === index ? "#F4376D" : "rgba(255,255,255,0.3)",
                  transitionProperty: "width",
                  transitionDuration: "300ms",
                }}
                accessibilityLabel={`Go to slide ${i + 1}`}
                accessibilityRole="button"
              />
            ))}
          </View>

          {/* Trust Indicators */}
          <View style={{ alignItems: "center", paddingBottom: 32 }}>
            <Text
              style={{
                color: "#fff",
                textAlign: "center",
                opacity: 0.8,
                lineHeight: isSmallDevice ? 16 : 18,
                fontSize: isSmallDevice ? 12 : 14,
              }}
            >
              <Text style={{ color: "#4ade80" }}>🛡️ Trusted by 50K+ users</Text>
              {" • "}
              <Text style={{ color: "#3B82F6" }}>SheerID Verified</Text>
              {" • "}
              <Text style={{ color: "#F4376D" }}>97% Success Rate</Text>
            </Text>
          </View>
        </View>

        {/* Tap to advance gesture area */}
        <TouchableOpacity
          onPress={nextSlide}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -1,
          }}
          accessibilityLabel="Tap to view next slide"
          accessibilityRole="button"
        />
      </ScrollView>
    </View>
  );
}
