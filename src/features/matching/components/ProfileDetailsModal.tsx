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

const { width, height } = Dimensions.get("window");

// Brand Colors
const BRAND_BG = "#0F0814";
const ACCENT_PURPLE = "#8D69F6";
const ACCENT_PINK = "#EF3E78";
const WHITE = "#FFFFFF";

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
          colors={[BRAND_BG, "#1A0F1F", "#2D1B35", BRAND_BG]}
          locations={[0, 0.3, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close profile details"
        >
          <X size={24} color={WHITE} strokeWidth={2.5} />
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
              colors={["transparent", "rgba(0, 0, 0, 0.6)"]}
              style={styles.modalImageGradient}
            />

            {/* Verified Badge */}
            {profile.verified && (
              <View style={styles.modalVerifiedBadge}>
                <Sparkles size={16} color={WHITE} strokeWidth={2.5} />
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
                <MapPin size={18} color={ACCENT_PINK} strokeWidth={2.5} />
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
                    size={18}
                    color={ACCENT_PURPLE}
                    strokeWidth={2.5}
                  />
                ) : (
                  <ChevronDown
                    size={18}
                    color={ACCENT_PURPLE}
                    strokeWidth={2.5}
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
                    size={18}
                    color={ACCENT_PURPLE}
                    strokeWidth={2.5}
                  />
                ) : (
                  <ChevronDown
                    size={18}
                    color={ACCENT_PURPLE}
                    strokeWidth={2.5}
                  />
                )}
              </View>

              {expandedSections.moreAbout && (
                <View style={styles.modalPillsContainer}>
                  <View style={styles.modalPill}>
                    <Ruler size={14} color={ACCENT_PURPLE} strokeWidth={2} />
                    <Text style={styles.modalPillText}>5'6"</Text>
                  </View>
                  <View style={styles.modalPill}>
                    <GraduationCap
                      size={14}
                      color={ACCENT_PURPLE}
                      strokeWidth={2}
                    />
                    <Text style={styles.modalPillText}>Bachelor's</Text>
                  </View>
                  <View style={styles.modalPill}>
                    <Languages
                      size={14}
                      color={ACCENT_PURPLE}
                      strokeWidth={2}
                    />
                    <Text style={styles.modalPillText}>English, Tagalog</Text>
                  </View>
                  <View style={styles.modalPill}>
                    <Users size={14} color={ACCENT_PURPLE} strokeWidth={2} />
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

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: BRAND_BG,
  },
  closeBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 20,
    right: 20,
    zIndex: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
    backgroundColor: "#10B981",
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
    color: WHITE,
    letterSpacing: 0.5,
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
    color: "rgba(255, 255, 255, 0.9)",
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
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  modalDistanceText: {
    fontSize: 15,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.7)",
  },

  // Sections
  modalSection: {
    gap: 12,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontFamily: "DMSans-Bold",
    color: WHITE,
    letterSpacing: 0.3,
  },
  modalBioText: {
    fontSize: 16,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: 24,
  },
  modalSubText: {
    fontSize: 15,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.75)",
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
    backgroundColor: "rgba(141, 105, 246, 0.15)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(141, 105, 246, 0.3)",
  },
  modalInterestText: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    color: ACCENT_PURPLE,
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
    backgroundColor: "rgba(141, 105, 246, 0.12)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(141, 105, 246, 0.25)",
  },
  modalPillText: {
    fontSize: 13,
    fontFamily: "DMSans-Medium",
    color: "rgba(255, 255, 255, 0.85)",
  },
});
