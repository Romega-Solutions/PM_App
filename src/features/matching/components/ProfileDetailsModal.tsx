/**
 * ProfileDetailsModal Component
 *
 * SOLID Principles:
 * - Single Responsibility: Displays detailed profile information
 * - Open/Closed: Extensible through props
 *
 * DRY: Reusable modal for profile details
 * KISS: Clear section-based layout
 *
 * @filesize ~350 lines (under 500 limit)
 */

import { theme, useTheme, withAlpha } from "@/src/theme";
import { LinearGradient } from "expo-linear-gradient";
import {
    ChevronDown,
    ChevronUp,
    GraduationCap,
    Languages,
    MapPin,
    Ruler,
    Sparkles,
    Users,
    X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
    Dimensions,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import type { ProfileCardData } from "./ProfileCard";

const { height } = Dimensions.get("window");

export interface ProfileDetailsModalProps {
  visible: boolean;
  profile: ProfileCardData | null;
  onClose: () => void;
  panHandlers?: any;
}

export const ProfileDetailsModal: React.FC<ProfileDetailsModalProps> = ({
  visible,
  profile,
  onClose,
  panHandlers,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [expandedSections, setExpandedSections] = useState({
    lookingFor: false,
    moreAbout: false,
  });

  if (!profile) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer} {...panHandlers}>
        <LinearGradient
          colors={[
            colors.brandBackground,
            withAlpha(colors.secondaryDark, 0.32),
            withAlpha(colors.primaryDark, 0.24),
            colors.brandBackground,
          ]}
          locations={[0, 0.3, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close profile details"
          hitSlop={theme.hitSlop.sm}
        >
          <X
            size={theme.iconSizes.navigation}
            color={colors.onPrimary}
            strokeWidth={theme.strokeWidths.emphasis}
          />
        </TouchableOpacity>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.modalScrollView}
          contentContainerStyle={styles.modalScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Image */}
          <View style={styles.modalImageContainer}>
            <Image
              source={profile.image}
              style={styles.modalImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={["transparent", colors.brandScrim]}
              style={styles.modalImageGradient}
            />

            {/* Verified Badge */}
            {profile.verified && (
              <View style={styles.modalVerifiedBadge}>
                <Sparkles
                  size={theme.iconSizes.metadata}
                  color={colors.onStatus}
                  strokeWidth={theme.strokeWidths.emphasis}
                />
              </View>
            )}
          </View>

          {/* Profile Info */}
          <View style={styles.modalContent}>
            {/* Name & Age */}
            <Text style={styles.modalName}>
              {profile.name}, {profile.age}
            </Text>

            {/* Location & Distance */}
            <View style={styles.modalLocationContainer}>
              <View style={styles.modalLocationRow}>
                <MapPin
                  size={theme.iconSizes.inline}
                  color={colors.primary}
                  strokeWidth={theme.strokeWidths.emphasis}
                />
                <Text style={styles.modalLocationText}>{profile.location}</Text>
              </View>
              <View style={styles.distanceRow}>
                <View style={styles.distanceDot} />
                <Text style={styles.modalDistanceText}>{profile.distance}</Text>
              </View>
            </View>

            {/* Interests Section */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Interests</Text>
              <View style={styles.modalInterestsContainer}>
                {profile.interests.map((interest, idx) => (
                  <View key={idx} style={styles.modalInterestTag}>
                    <Text style={styles.modalInterestText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* About Section */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>About</Text>
              <Text style={styles.modalBioText}>{profile.bio}</Text>
            </View>

            {/* Looking For Section */}
            <TouchableOpacity
              style={styles.modalSection}
              onPress={() =>
                setExpandedSections((prev) => ({
                  ...prev,
                  lookingFor: !prev.lookingFor,
                }))
              }
              activeOpacity={0.7}
            >
              <View style={styles.expandableHeader}>
                <Text style={styles.modalSectionTitle}>Looking For</Text>
                {expandedSections.lookingFor ? (
                  <ChevronUp
                    size={theme.iconSizes.inline}
                    color={colors.secondary}
                    strokeWidth={theme.strokeWidths.emphasis}
                  />
                ) : (
                  <ChevronDown
                    size={theme.iconSizes.inline}
                    color={colors.secondary}
                    strokeWidth={theme.strokeWidths.emphasis}
                  />
                )}
              </View>
              {expandedSections.lookingFor && (
                <Text style={styles.modalSubText}>
                  Genuine connections, meaningful conversations, and someone to
                  share adventures with.
                </Text>
              )}
            </TouchableOpacity>

            {/* More About Section */}
            <TouchableOpacity
              style={styles.modalSection}
              onPress={() =>
                setExpandedSections((prev) => ({
                  ...prev,
                  moreAbout: !prev.moreAbout,
                }))
              }
              activeOpacity={0.7}
            >
              <View style={styles.expandableHeader}>
                <Text style={styles.modalSectionTitle}>
                  More About {profile.name}
                </Text>
                {expandedSections.moreAbout ? (
                  <ChevronUp
                    size={theme.iconSizes.inline}
                    color={colors.secondary}
                    strokeWidth={theme.strokeWidths.emphasis}
                  />
                ) : (
                  <ChevronDown
                    size={theme.iconSizes.inline}
                    color={colors.secondary}
                    strokeWidth={theme.strokeWidths.emphasis}
                  />
                )}
              </View>

              {expandedSections.moreAbout && (
                <View style={styles.modalPillsContainer}>
                  <View style={styles.modalPill}>
                    <Ruler
                      size={theme.iconSizes.metadata}
                      color={colors.secondary}
                      strokeWidth={theme.strokeWidths.default}
                    />
                    <Text style={styles.modalPillText}>5&apos;6&quot;</Text>
                  </View>
                  <View style={styles.modalPill}>
                    <GraduationCap
                      size={theme.iconSizes.metadata}
                      color={colors.secondary}
                      strokeWidth={theme.strokeWidths.default}
                    />
                    <Text style={styles.modalPillText}>Bachelor&apos;s</Text>
                  </View>
                  <View style={styles.modalPill}>
                    <Languages
                      size={theme.iconSizes.metadata}
                      color={colors.secondary}
                      strokeWidth={theme.strokeWidths.default}
                    />
                    <Text style={styles.modalPillText}>English, Tagalog</Text>
                  </View>
                  <View style={styles.modalPill}>
                    <Users
                      size={theme.iconSizes.metadata}
                      color={colors.secondary}
                      strokeWidth={theme.strokeWidths.default}
                    />
                    <Text style={styles.modalPillText}>
                      Looking for Relationship
                    </Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: colors.brandBackground,
  },
  closeBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 20,
    right: 20,
    zIndex: 100,
    width: theme.componentSizes.iconButton,
    height: theme.componentSizes.iconButton,
    borderRadius: theme.borderRadius.full,
    backgroundColor: colors.brandScrim,
    alignItems: "center",
    justifyContent: "center",
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    paddingBottom: 40,
  },

  // Image
  modalImageContainer: {
    width: "100%",
    height: height * 0.5,
    position: "relative",
  },
  modalImage: {
    width: "100%",
    height: "100%",
  },
  modalImageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "30%",
  },
  modalVerifiedBadge: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 20,
    left: 20,
    backgroundColor: colors.success,
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  // Content
  modalContent: {
    padding: 24,
    gap: 24,
  },
  modalName: {
    fontSize: Platform.OS === "ios" ? 34 : 32,
    fontFamily: "Lora-Bold",
    color: colors.onPrimary,
    letterSpacing: 0,
  },

  // Location
  modalLocationContainer: {
    gap: 8,
  },
  modalLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalLocationText: {
    fontSize: 18,
    fontFamily: "DMSans-Medium",
    color: withAlpha(colors.onPrimary, 0.9),
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 26,
  },
  distanceDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: withAlpha(colors.onPrimary, 0.5),
  },
  modalDistanceText: {
    fontSize: 15,
    fontFamily: "DMSans-Regular",
    color: withAlpha(colors.onPrimary, 0.7),
  },

  // Sections
  modalSection: {
    gap: 12,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontFamily: "DMSans-Bold",
    color: colors.onPrimary,
    letterSpacing: 0,
  },
  modalBioText: {
    fontSize: 16,
    fontFamily: "DMSans-Regular",
    color: withAlpha(colors.onPrimary, 0.85),
    lineHeight: 24,
  },
  modalSubText: {
    fontSize: 15,
    fontFamily: "DMSans-Regular",
    color: withAlpha(colors.onPrimary, 0.75),
    lineHeight: 22,
    marginTop: 8,
  },

  // Expandable
  expandableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // Interests
  modalInterestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  modalInterestTag: {
    backgroundColor: withAlpha(colors.secondary, 0.15),
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: withAlpha(colors.secondary, 0.3),
  },
  modalInterestText: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    color: colors.secondary,
  },

  // Pills
  modalPillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  modalPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: withAlpha(colors.secondary, 0.12),
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: withAlpha(colors.secondary, 0.25),
  },
  modalPillText: {
    fontSize: 13,
    fontFamily: "DMSans-Medium",
    color: withAlpha(colors.onPrimary, 0.85),
  },
});
