import { MessageCircle } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const ACCENT_PURPLE = "#8D69F6";
const WHITE = "#FFFFFF";

interface EmptyChatStateProps {
  userName: string;
}

export const EmptyChatState: React.FC<EmptyChatStateProps> = ({ userName }) => (
  <View style={styles.container}>
    <View style={styles.iconContainer}>
      <MessageCircle size={48} color={ACCENT_PURPLE} strokeWidth={1.5} />
    </View>
    <Text style={styles.title}>Say hi to {userName}!</Text>
    <Text style={styles.subtitle}>
      Send a message to start the conversation
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(141, 105, 246, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(141, 105, 246, 0.25)",
  },
  title: {
    fontSize: 20,
    fontFamily: "Lora-Bold",
    color: WHITE,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.65)",
    textAlign: "center",
    letterSpacing: 0.2,
  },
});
