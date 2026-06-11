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
  Briefcase,
  ChevronDown,
  ChevronUp,
  Flag,
  GraduationCap,
  Languages,
  MapPin,
  Ruler,
  Sparkles,
  type LucideIcon,
  UserRound,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ProfileCardData } from "./ProfileCard";

const { height } = Dimensions.get("window");

// Brand Colors
const BRAND_BG = "#0F0814";
const ACCENT_PURPLE = "#8D69F6";
const ACCENT_PINK = "#EF3E78";
const WHITE = "#FFFFFF";

export interface ProfileDetailsModalProps {
  visible: boolean;
  profile: ProfileCardData | null;
  onClose: () => void;
  onReport?: () => void;
  panHandlers?: any;
}

export const ProfileDetailsModal: React.FC<ProfileDetailsModalProps> = ({
  visible,
  profile,
  onClose,
  onReport,
  panHandlers,
}) => {
  const insets = useSafeAreaInsets();
  const [expandedSections, setExpandedSections] = useState({
    lookingFor: false,
    moreAbout: false,
  });

  if (!profile) return null;

  const detailPills = [
    profile.heightCm
      ? {
          icon: Ruler,
          label: `${profile.heightCm} cm`,
        }
      : null,
    profile.education
      ? {
          icon: GraduationCap,
          label: profile.education,
        }
      : null,
    profile.occupation
      ? {
          icon: Briefcase,
          label: profile.occupation,
        }
      : null,
    profile.languages?.length
      ? {
          icon: Languages,
          label: profile.languages.join(", "),
        }
      : null,
    profile.relationshipGoal
      ? {
          icon: Users,
          label: profile.relationshipGoal,
        }
      : null,
    profile.bodyType
      ? {
          icon: Sparkles,
          label: profile.bodyType,
        }
      : null,
  ].filter(
    (
      detail,
    ): detail is {
      icon: LucideIcon;
      label: string;
    } => Boolean(detail),
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View style={styles.modalContainer} {...panHandlers}>
        <LinearGradient
          colors={[BRAND_BG, "#1A0F1F", "#2D1B35", BRAND_BG]}
          locations={[0, 0.3, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Close Button */}
        <TouchableOpacity
          style={[styles.closeBtn, { top: insets.top + 12 }]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close profile details"
          accessibilityHint="Returns to the discover card"
        >
          <X size={24} color={WHITE} strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.modalScrollView}
          contentContainerStyle={[
            styles.modalScrollContent,
            { paddingBottom: Math.max(insets.bottom + 40, 56) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Image */}
          <View style={styles.modalImageContainer}>
            {profile.image ? (
              <Image
                source={profile.image}
                style={styles.modalImage}
                resizeMode="cover"
                accessible
                accessibilityLabel={`${profile.name}'s profile photo`}
              />
            ) : (
              <View
                style={styles.modalImageFallback}
                accessible
                accessibilityLabel={`${profile.name} has no profile photo`}
              >
                <UserRound size={64} color="rgba(255,255,255,0.72)" />
                <Text style={styles.modalImageFallbackText}>
                  No profile photo yet
                </Text>
              </View>
            )}
            <LinearGradient
              colors={["transparent", "rgba(0, 0, 0, 0.6)"]}
              style={styles.modalImageGradient}
            />

            {/* Verified Badge */}
            {profile.verified && (
              <View
                style={[styles.modalVerifiedBadge, { top: insets.top + 12 }]}
                accessible
                accessibilityLabel="Verified profile"
              >
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
              style={[styles.modalSection, styles.expandableSection]}
              onPress={() =>
                setExpandedSections((prev) => ({
                  ...prev,
                  lookingFor: !prev.lookingFor,
                }))
              }
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Looking for"
              accessibilityHint={
                expandedSections.lookingFor
                  ? "Collapses this profile section"
                  : "Expands this profile section"
              }
              accessibilityState={{ expanded: expandedSections.lookingFor }}
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
                  {profile.relationshipGoal ||
                    "This member has not added relationship goals yet."}
                </Text>
              )}
            </TouchableOpacity>

            {/* More About Section */}
            <TouchableOpacity
              style={[styles.modalSection, styles.expandableSection]}
              onPress={() =>
                setExpandedSections((prev) => ({
                  ...prev,
                  moreAbout: !prev.moreAbout,
                }))
              }
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`More about ${profile.name}`}
              accessibilityHint={
                expandedSections.moreAbout
                  ? "Collapses this profile section"
                  : "Expands this profile section"
              }
              accessibilityState={{ expanded: expandedSections.moreAbout }}
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
                detailPills.length > 0 ? (
                  <View style={styles.modalPillsContainer}>
                    {detailPills.map(({ icon: Icon, label }) => (
                      <View key={label} style={styles.modalPill}>
                        <Icon
                          size={14}
                          color={ACCENT_PURPLE}
                          strokeWidth={2}
                        />
                        <Text style={styles.modalPillText}>{label}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.modalSubText}>
                    No extra profile details yet.
                  </Text>
                )
              )}
            </TouchableOpacity>

            {onReport ? (
              <View style={styles.safetyPanel}>
                <View style={styles.safetyCopy}>
                  <Text style={styles.safetyTitle}>
                    Something feels off?
                  </Text>
                  <Text style={styles.safetyText}>
                    Report or block this profile privately before continuing.
                    Support reviews safety concerns without telling the member
                    who reported them.
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.reportButton}
                  onPress={onReport}
                  activeOpacity={0.84}
                  accessibilityRole="button"
                  accessibilityLabel={`Report or block ${profile.name}`}
                  accessibilityHint="Opens the private report form for this profile"
                >
                  <Flag size={18} color={WHITE} strokeWidth={2.4} />
                  <Text style={styles.reportButtonText}>Report or block</Text>
                </TouchableOpacity>
              </View>
            ) : null}
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
    right: 20,
    zIndex: 100,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    flexGrow: 1,
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
  modalImageFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.07)",
  },
  modalImageFallbackText: {
    marginTop: 12,
    color: "rgba(255, 255, 255, 0.78)",
    fontSize: 15,
    fontFamily: "DMSans-Bold",
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
  expandableSection: {
    minHeight: 44,
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
    minHeight: 44,
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
  safetyPanel: {
    gap: 14,
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(239, 62, 120, 0.28)",
    backgroundColor: "rgba(239, 62, 120, 0.12)",
  },
  safetyCopy: {
    gap: 6,
  },
  safetyTitle: {
    fontSize: 16,
    fontFamily: "DMSans-Bold",
    color: WHITE,
  },
  safetyText: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.76)",
    lineHeight: 20,
  },
  reportButton: {
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: ACCENT_PINK,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  reportButtonText: {
    fontSize: 15,
    fontFamily: "DMSans-Bold",
    color: WHITE,
  },
});
