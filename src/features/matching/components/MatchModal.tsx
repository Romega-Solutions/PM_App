/**
 * MatchModal Component
 *
 * SOLID: Single Responsibility - Shows match celebration
 * DRY: Reusable match notification
 * KISS: Simple match display with action
 */

import { useTheme, withAlpha } from "@/src/theme";
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
  const { colors } = useTheme();
  const styles = createStyles(colors);

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
          colors={[
            withAlpha(colors.brandBackground, 0.96),
            withAlpha(colors.primaryDark, 0.9),
          ]}
          style={StyleSheet.absoluteFill}
        />

        {/* Match Content */}
        <View style={styles.matchContent}>
          {/* Hearts Animation */}
          <View style={styles.heartsContainer}>
            <Heart
              size={80}
              color={colors.primary}
              fill={colors.primary}
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
              <MessageCircle size={20} color={colors.onPrimary} strokeWidth={2.5} />
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

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
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
    color: colors.primary,
    letterSpacing: 0,
  },
  matchSubtitle: {
    fontSize: 18,
    fontFamily: "DMSans-Regular",
    color: withAlpha(colors.onPrimary, 0.85),
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
    borderColor: colors.primary,
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
    backgroundColor: colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
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
    color: colors.onPrimary,
    letterSpacing: 0,
  },
  keepSwipingBtn: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: withAlpha(colors.onPrimary, 0.2),
  },
  keepSwipingBtnText: {
    fontSize: 16,
    fontFamily: "DMSans-SemiBold",
    color: withAlpha(colors.onPrimary, 0.8),
  },
});
