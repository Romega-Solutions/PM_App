import { MessageCircle, Search } from "lucide-react-native";
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
    name: "Maria",
    image: require("../../assets/girl1.jpg"),
    isOnline: true,
  },
  {
    id: 2,
    name: "Angel",
    image: require("../../assets/girl2.jpg"),
    isOnline: true,
  },
  {
    id: 3,
    name: "Jessa",
    image: require("../../assets/girl3.jpg"),
    isOnline: true,
  },
  {
    id: 4,
    name: "Kim",
    image: require("../../assets/girl4.jpg"),
    isOnline: true,
  },
  {
    id: 5,
    name: "Liza",
    image: require("../../assets/girl5.jpg"),
    isOnline: true,
  },
];

const conversations = [
  {
    id: 1,
    name: "Maria",
    image: require("../../assets/girl1.jpg"),
    lastMessage: "Typing...",
    time: "15 min",
    unread: 1,
    isTyping: true,
  },
  {
    id: 2,
    name: "Angel",
    image: require("../../assets/girl2.jpg"),
    lastMessage: "You: Hey! What's up, long time...",
    time: "18 min",
    unread: 0,
    isTyping: false,
  },
  {
    id: 3,
    name: "Jessa",
    image: require("../../assets/girl3.jpg"),
    lastMessage: "👋",
    time: "24 min",
    unread: 2,
    isTyping: false,
  },
  {
    id: 4,
    name: "Kim",
    image: require("../../assets/girl4.jpg"),
    lastMessage: "You: Great! I will write later...",
    time: "32 min",
    unread: 0,
    isTyping: false,
  },
  {
    id: 5,
    name: "Liza",
    image: require("../../assets/girl5.jpg"),
    lastMessage: "You: Hi! How are you?",
    time: "33 min",
    unread: 0,
    isTyping: false,
  },
];

export default function Messages() {
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
            marginBottom: 20,
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
            Messages
          </Text>
          <TouchableOpacity>
            <MessageCircle size={28} color="#A855F7" />
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
            marginBottom: 8,
          }}
        >
          <Search
            size={20}
            color="rgba(255,255,255,0.5)"
            style={{ marginRight: 10 }}
          />
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
          contentContainerStyle={{ paddingHorizontal: 24 }}
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
                      user.name === "You" ? "#F4376D" : "rgba(168,85,247,0.3)",
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
                      borderColor: "#422057",
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
            paddingHorizontal: 24,
            marginBottom: 15,
          }}
        >
          Conversations
        </Text>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {conversations.map((conversation) => (
            <TouchableOpacity
              key={conversation.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 24,
                paddingVertical: 15,
                backgroundColor: "rgba(255,255,255,0.07)",
                marginBottom: 10,
                borderRadius: 18,
                borderWidth: 2,
                borderColor: "rgba(168, 85, 247, 0.13)",
              }}
              activeOpacity={0.85}
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
                    borderColor: "rgba(168,85,247,0.3)",
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
                      fontWeight: "700",
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
                        marginLeft: 6,
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
