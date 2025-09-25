import React from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const isSmallDevice = width < 375;

const activeUsers = [
  {
    id: 1,
    name: "You",
    image: require("../../assets/couple1.png"),
    isOnline: true,
  },
  {
    id: 2,
    name: "Jacob",
    image: require("../../assets/couple1.png"),
    isOnline: true,
  },
  {
    id: 3,
    name: "Martin",
    image: require("../../assets/couple1.png"),
    isOnline: true,
  },
  {
    id: 4,
    name: "John",
    image: require("../../assets/couple1.png"),
    isOnline: true,
  },
];

const conversations = [
  {
    id: 1,
    name: "Jacob",
    image: require("../../assets/couple1.png"),
    lastMessage: "Typing...",
    time: "15 min",
    unread: 1,
    isTyping: true,
  },
  {
    id: 2,
    name: "Martin",
    image: require("../../assets/couple1.png"),
    lastMessage: "You: Hey! What's up, long time...",
    time: "18 min",
    unread: 0,
    isTyping: false,
  },
  {
    id: 3,
    name: "JCharley",
    image: require("../../assets/couple1.png"),
    lastMessage: "👋",
    time: "24 min",
    unread: 2,
    isTyping: false,
  },
  {
    id: 4,
    name: "Harry",
    image: require("../../assets/couple1.png"),
    lastMessage: "You: Great! I will write later...",
    time: "32 min",
    unread: 0,
    isTyping: false,
  },
  {
    id: 5,
    name: "George",
    image: require("../../assets/couple1.png"),
    lastMessage: "You: Hi! How are you?",
    time: "33 min",
    unread: 0,
    isTyping: false,
  },
];

export default function Messages() {
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
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: isSmallDevice ? 28 : 32,
              fontWeight: "bold",
              color: "#fff",
            }}
          >
            Messages
          </Text>
          <TouchableOpacity>
            <Text style={{ fontSize: 24, color: "#fff" }}>#</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: 25,
            paddingHorizontal: 20,
            paddingVertical: 12,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "rgba(255,255,255,0.5)", marginRight: 10 }}>
            🔍
          </Text>
          <TextInput
            placeholder="Search"
            placeholderTextColor="rgba(255,255,255,0.5)"
            style={{
              flex: 1,
              color: "#fff",
              fontSize: 16,
            }}
          />
        </View>
      </View>

      {/* Active Users */}
      <View style={{ marginBottom: 20 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {activeUsers.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={{
                alignItems: "center",
                marginRight: 20,
              }}
            >
              <View style={{ position: "relative" }}>
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    overflow: "hidden",
                    borderWidth: 3,
                    borderColor:
                      user.name === "You" ? "#F4376D" : "rgba(255,255,255,0.3)",
                  }}
                >
                  <Image
                    source={user.image}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                </View>
                {user.isOnline && (
                  <View
                    style={{
                      position: "absolute",
                      bottom: 2,
                      right: 2,
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      backgroundColor: "#4ade80",
                      borderWidth: 2,
                      borderColor: "#1a202c",
                    }}
                  />
                )}
              </View>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 12,
                  marginTop: 8,
                  fontWeight: "500",
                }}
              >
                {user.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Messages Section */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: "#fff",
            fontSize: 18,
            fontWeight: "bold",
            paddingHorizontal: 20,
            marginBottom: 15,
          }}
        >
          Messages
        </Text>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {conversations.map((conversation) => (
            <TouchableOpacity
              key={conversation.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 20,
                paddingVertical: 15,
              }}
            >
              {/* Profile Image */}
              <View style={{ position: "relative", marginRight: 15 }}>
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    overflow: "hidden",
                    borderWidth: 2,
                    borderColor: "rgba(255,255,255,0.3)",
                  }}
                >
                  <Image
                    source={conversation.image}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                </View>
              </View>

              {/* Message Info */}
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 5,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    {conversation.name}
                  </Text>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.5)",
                      fontSize: 12,
                    }}
                  >
                    {conversation.time}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: conversation.isTyping
                        ? "#F4376D"
                        : "rgba(255,255,255,0.7)",
                      fontSize: 14,
                      flex: 1,
                      marginRight: 10,
                    }}
                    numberOfLines={1}
                  >
                    {conversation.lastMessage}
                  </Text>

                  {conversation.unread > 0 && (
                    <View
                      style={{
                        backgroundColor: "#F4376D",
                        borderRadius: 10,
                        minWidth: 20,
                        height: 20,
                        justifyContent: "center",
                        alignItems: "center",
                        paddingHorizontal: 6,
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: "bold",
                        }}
                      >
                        {conversation.unread}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
