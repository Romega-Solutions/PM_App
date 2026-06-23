/**
 * MatchModal Component
 *
 * SOLID: Single Responsibility - Shows match celebration
 * DRY: Reusable match notification
 * KISS: Simple match display with action
 */

import { LinearGradient } from "expo-linear-gradient";
import { Heart, MessageCircle, ShieldCheck } from "lucide-react-native";
import React from "react";
import { StyleSheet, 
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { makeStyles } from "@/src/theme/makeStyles";

const { width, height } = Dimensions.get("window");

// Brand Colors
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
  const theme = useAppTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();

  if (!matchedProfile) return null;

  const profileImage = matchedProfile.photos?.[0]
    ? { uri: matchedProfile.photos[0] }
    : null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onKeepSwiping}
      accessibilityViewIsModal
    >
      <View
        style={[
          styles.matchModalContainer,
          {
            paddingTop: Math.max(insets.top + 24, 32),
            paddingBottom: Math.max(insets.bottom + 24, 32),
          },
        ]}
      >
        <LinearGradient
          colors={["rgba(15, 8, 20, 0.95)", "rgba(45, 27, 53, 0.95)"]}
          style={StyleSheet.absoluteFill}
        />

        <ScrollView
          contentContainerStyle={styles.matchScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Match Content */}
          <View style={styles.matchContent}>
            {/* Hearts Animation */}
            <View
              style={styles.heartsContainer}
              accessible={false}
              importantForAccessibility="no"
            >
              <Heart
                size={80}
                color={theme.semanticColors.primary}
                fill={theme.semanticColors.primary}
                strokeWidth={2}
              />
            </View>

            {/* Match Text */}
            <Text style={styles.matchTitle}>It's a Match!</Text>
            <Text style={styles.matchSubtitle}>
              You and {matchedProfile.first_name} liked each other. Open the
              match and start respectfully when you are ready.
            </Text>

            <View
              style={styles.safetyNote}
              accessible
              accessibilityLabel="Safety note. Keep chats in PinayMate until you feel comfortable, and do not rush into sharing private details."
            >
              <ShieldCheck size={16} color={theme.semanticColors.secondary} strokeWidth={2.4} />
              <Text style={styles.safetyNoteText}>
                Keep chats in PinayMate until you feel comfortable. Do not rush
                into sharing private details.
              </Text>
            </View>

            {/* Profile Image */}
            <View style={styles.matchImageContainer}>
              {profileImage ? (
                <Image
                  source={profileImage}
                  style={styles.matchImage}
                  accessible
                  accessibilityLabel={`${matchedProfile.first_name}'s profile photo`}
                />
              ) : (
                <View
                  style={[styles.matchImage, styles.matchImagePlaceholder]}
                  accessible
                  accessibilityLabel={`${matchedProfile.first_name} has not added a profile photo yet`}
                >
                  <Text style={styles.matchImagePlaceholderText}>No photo</Text>
                </View>
              )}
            </View>

            {/* Actions */}
            <View style={styles.matchActions}>
              <TouchableOpacity
                style={[styles.matchBtn, styles.sendMessageBtn]}
                onPress={onSendMessage}
                activeOpacity={0.86}
                accessibilityRole="button"
                accessibilityLabel={`Open ${matchedProfile.first_name} in matches`}
                accessibilityHint="Takes you to your matches. Messaging may depend on account state."
              >
                <MessageCircle size={20} color={theme.colors.neutral.white} strokeWidth={2.5} />
                <Text style={styles.sendMessageBtnText}>Open Match</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.matchBtn, styles.keepSwipingBtn]}
                onPress={onKeepSwiping}
                activeOpacity={0.78}
                accessibilityRole="button"
                accessibilityLabel="Keep swiping"
                accessibilityHint="Closes this match and returns to discover"
              >
                <Text style={styles.keepSwipingBtnText}>Keep Swiping</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const useStyles = makeStyles((theme) => ({
  matchModalContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  matchScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  matchContent: {
    alignItems: "center",
    gap: 16,
    maxWidth: width - 48,
  },

  // Hearts
  heartsContainer: {
    marginBottom: 8,
  },

  // Text
  matchTitle: {
    fontSize: 42,
    fontFamily: "Lora-Bold",
    color: theme.semanticColors.primary,
    letterSpacing: 1,
  },
  matchSubtitle: {
    fontSize: 18,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    lineHeight: 26,
  },
  safetyNote: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(141, 105, 246, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(141, 105, 246, 0.24)",
  },
  safetyNoteText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "DMSans-Medium",
    color: "rgba(255, 255, 255, 0.78)",
    lineHeight: 18,
  },

  // Image
  matchImageContainer: {
    width: Math.min(180, width * 0.46, height * 0.24),
    height: Math.min(180, width * 0.46, height * 0.24),
    borderRadius: 90,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: theme.semanticColors.primary,
    marginVertical: 10,
  },
  matchImage: {
    width: "100%",
    height: "100%",
  },
  matchImagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  matchImagePlaceholderText: {
    color: theme.colors.neutral.white,
    fontSize: 16,
    fontWeight: "700",
  },

  // Actions
  matchActions: {
    width: "100%",
    gap: 12,
    marginTop: 10,
  },
  matchBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    minHeight: 56,
    borderRadius: 16,
    gap: 8,
  },
  sendMessageBtn: {
    backgroundColor: theme.semanticColors.primary,
    ...Platform.select({
      ios: {
        shadowColor: theme.semanticColors.primary,
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
    color: theme.colors.neutral.white,
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
}));
