/**
 * MatchModal Component
 *
 * SOLID: Single Responsibility - Shows match celebration
 * DRY: Reusable match notification
 * KISS: Simple match display with action
 */

import { LinearGradient } from "expo-linear-gradient";
import { Heart, MessageCircle } from "lucide-react-native";
import React from "react";
import {
    Dimensions,
    Image,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

// Brand Colors
const ACCENT_PINK = "#EF3E78";
const WHITE = "#FFFFFF";

export interface MatchedProfile {
  id: string;
  first_name: string;
  photos?: string[];
}

export interface MatchModalProps {
  visible: boolean;
  matchedProfile: MatchedProfile | null;
  onKeepSwiping: () => void;
  onSendMessage: () => void;
}

export const MatchModal: React.FC<MatchModalProps> = ({
  visible,
  matchedProfile,
  onKeepSwiping,
  onSendMessage,
}) => {
  if (!matchedProfile) return null;

  const profileImage = matchedProfile.photos?.[0]
    ? { uri: matchedProfile.photos[0] }
    : require("@/assets/girls/ai1.jpg");

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onKeepSwiping}
    >
      <View style={styles.matchModalContainer}>
        <LinearGradient
          colors={["rgba(15, 8, 20, 0.95)", "rgba(45, 27, 53, 0.95)"]}
          style={StyleSheet.absoluteFill}
        />

        {/* Match Content */}
        <View style={styles.matchContent}>
          {/* Hearts Animation */}
          <View style={styles.heartsContainer}>
            <Heart
              size={80}
              color={ACCENT_PINK}
              fill={ACCENT_PINK}
              strokeWidth={2}
            />
          </View>

          {/* Match Text */}
          <Text style={styles.matchTitle}>It&apos;s a Match!</Text>
          <Text style={styles.matchSubtitle}>
            You and {matchedProfile.first_name} liked each other
          </Text>

          {/* Profile Image */}
          <View style={styles.matchImageContainer}>
            <Image source={profileImage} style={styles.matchImage} />
          </View>

          {/* Actions */}
          <View style={styles.matchActions}>
            <TouchableOpacity
              style={[styles.matchBtn, styles.sendMessageBtn]}
              onPress={onSendMessage}
              accessibilityRole="button"
              accessibilityLabel="Send message"
            >
              <MessageCircle size={20} color={WHITE} strokeWidth={2.5} />
              <Text style={styles.sendMessageBtnText}>Send Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.matchBtn, styles.keepSwipingBtn]}
              onPress={onKeepSwiping}
              accessibilityRole="button"
              accessibilityLabel="Keep swiping"
            >
              <Text style={styles.keepSwipingBtnText}>Keep Swiping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  matchModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  matchContent: {
    alignItems: "center",
    gap: 20,
    maxWidth: width - 48,
  },

  // Hearts
  heartsContainer: {
    marginBottom: 20,
  },

  // Text
  matchTitle: {
    fontSize: 42,
    fontFamily: "Lora-Bold",
    color: ACCENT_PINK,
    letterSpacing: 1,
  },
  matchSubtitle: {
    fontSize: 18,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    lineHeight: 26,
  },

  // Image
  matchImageContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: ACCENT_PINK,
    marginVertical: 20,
  },
  matchImage: {
    width: "100%",
    height: "100%",
  },

  // Actions
  matchActions: {
    width: "100%",
    gap: 12,
    marginTop: 20,
  },
  matchBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  sendMessageBtn: {
    backgroundColor: ACCENT_PINK,
    ...Platform.select({
      ios: {
        shadowColor: ACCENT_PINK,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  sendMessageBtnText: {
    fontSize: 17,
    fontFamily: "DMSans-Bold",
    color: WHITE,
    letterSpacing: 0.5,
  },
  keepSwipingBtn: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  keepSwipingBtnText: {
    fontSize: 16,
    fontFamily: "DMSans-SemiBold",
    color: "rgba(255, 255, 255, 0.8)",
  },
});
