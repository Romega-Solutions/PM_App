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
import { StyleSheet, 
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  GestureResponderHandlers,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ProfileCardData } from "./ProfileCard";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { makeStyles } from "@/src/theme/makeStyles";

const { height } = Dimensions.get("window");

// Brand Colors
export interface ProfileDetailsModalProps {
  visible: boolean;
  profile: ProfileCardData | null;
  onClose: () => void;
  onReport?: () => void;
  panHandlers?: GestureResponderHandlers;
}

export const ProfileDetailsModal: React.FC<ProfileDetailsModalProps> = ({
  visible,
  profile,
  onClose,
  onReport,
  panHandlers,
}) => {
  const theme = useAppTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const [expandedSections, setExpandedSections] = useState({
    lookingFor: false,
    moreAbout: false,
  });

  if (!profile) return null;

  const galleryImages = profile.galleryImages?.filter(Boolean) ?? [];
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
      <View style={[styles.modalContainer, { touchAction: "none" } as any]} {...panHandlers}>
        <View style={styles.modalFrame}>
          <LinearGradient
            colors={[theme.semanticColors.background, theme.semanticColors.surface, theme.colors.dalisay[900], theme.semanticColors.background]}
            locations={[0, 0.3, 0.7, 1]}
            style={StyleSheet.absoluteFill}
          />

          {/* Close Button */}
          <TouchableOpacity
            style={[styles.closeBtn, { top: Platform.OS === "web" ? 12 : insets.top + 12 }]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close profile details"
            accessibilityHint="Returns to the discover card"
          >
            <X size={24} color={theme.colors.neutral.white} strokeWidth={2.5} />
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
                  style={[styles.modalVerifiedBadge, { top: Platform.OS === "web" ? 12 : insets.top + 12 }]}
                  accessible
                  accessibilityLabel="Verified profile"
                >
                  <Sparkles size={16} color={theme.colors.neutral.white} strokeWidth={2.5} />
                </View>
              )}
            </View>

            {profile.isSeedProfile && galleryImages.length > 1 ? (
              <View style={styles.gallerySection}>
                <Text style={styles.modalSectionTitle}>Photo Set</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.galleryList}
                  accessibilityLabel={`${profile.name}'s demo photo poses`}
                >
                  {galleryImages.map((image, index) => (
                    <Image
                      key={`${profile.id}-pose-${index}`}
                      source={image}
                      style={styles.galleryImage}
                      resizeMode="cover"
                      accessible
                      accessibilityLabel={`${profile.name} demo pose ${index + 1}`}
                    />
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {/* Profile Info */}
            <View style={styles.modalContent}>
            {/* Name & Age */}
            <Text style={styles.modalName}>
              {profile.name}, {profile.age}
            </Text>

            {/* Location & Distance */}
            <View style={styles.modalLocationContainer}>
              <View style={styles.modalLocationRow}>
                <MapPin size={18} color={theme.semanticColors.primary} strokeWidth={2.5} />
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
              <View style={styles.modalInterestsList}>
                {profile.interests.map((interest, idx) => (
                  <View key={`${interest}-${idx}`} style={styles.modalInterestItem}>
                    <View style={styles.modalInterestDot} />
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

            {profile.isSeedProfile &&
            (profile.modelBiography || profile.modelPersonality) ? (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Demo Persona</Text>
                {profile.modelBiography ? (
                  <Text style={styles.modalBioText}>
                    {profile.modelBiography}
                  </Text>
                ) : null}
                {profile.modelPersonality ? (
                  <Text style={styles.modalSubText}>
                    {profile.modelPersonality}
                  </Text>
                ) : null}
              </View>
            ) : null}

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
                    color={theme.semanticColors.secondary}
                    strokeWidth={2.5}
                  />
                ) : (
                  <ChevronDown
                    size={18}
                    color={theme.semanticColors.secondary}
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
                    color={theme.semanticColors.secondary}
                    strokeWidth={2.5}
                  />
                ) : (
                  <ChevronDown
                    size={18}
                    color={theme.semanticColors.secondary}
                    strokeWidth={2.5}
                  />
                )}
              </View>

              {expandedSections.moreAbout && (
                detailPills.length > 0 ? (
                  <View style={styles.modalDetailsList}>
                    {detailPills.map(({ icon: Icon, label }) => (
                      <View key={label} style={styles.modalDetailRow}>
                        <Icon
                          size={14}
                          color={theme.semanticColors.secondary}
                          strokeWidth={2}
                        />
                        <Text style={styles.modalDetailText}>{label}</Text>
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
                <View style={styles.safetyRule} />
                <View style={styles.safetyContent}>
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
                    <Flag size={18} color={theme.semanticColors.primary} strokeWidth={2.4} />
                    <Text style={styles.reportButtonText}>Report or block</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const useStyles = makeStyles((theme) => ({
  modalContainer: {
    flex: 1,
    backgroundColor: theme.semanticColors.background,
    ...Platform.select({
      web: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingVertical: 20,
      },
    }),
  },
  modalFrame: {
    flex: 1,
    width: "100%",
    backgroundColor: theme.semanticColors.background,
    overflow: "hidden",
    ...Platform.select({
      web: {
        maxWidth: 520,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.14)",
      },
    }),
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
    height: Platform.OS === "web" ? Math.min(height * 0.42, 340) : height * 0.5,
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
  gallerySection: {
    paddingTop: 14,
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  galleryList: {
    gap: 10,
    paddingTop: 10,
    paddingRight: 8,
  },
  galleryImage: {
    width: 82,
    height: 106,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    backgroundColor: theme.semanticColors.surface,
  },
  modalVerifiedBadge: {
    position: "absolute",
    left: 20,
    backgroundColor: theme.semanticColors.success,
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
    color: theme.colors.neutral.white,
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
    color: theme.colors.neutral.white,
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
  modalInterestsList: {
    gap: 10,
  },
  modalInterestItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  modalInterestDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.semanticColors.secondary,
  },
  modalInterestText: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    color: "rgba(255, 255, 255, 0.84)",
    lineHeight: 20,
  },

  // Details
  modalDetailsList: {
    gap: 11,
    marginTop: 12,
  },
  modalDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  modalDetailText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "DMSans-Medium",
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: 19,
  },
  safetyPanel: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 14,
  },
  safetyRule: {
    width: 2,
    borderRadius: 1,
    backgroundColor: "rgba(239, 62, 120, 0.72)",
  },
  safetyContent: {
    flex: 1,
    gap: 14,
  },
  safetyCopy: {
    gap: 6,
  },
  safetyTitle: {
    fontSize: 16,
    fontFamily: "DMSans-Bold",
    color: theme.colors.neutral.white,
  },
  safetyText: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.76)",
    lineHeight: 20,
  },
  reportButton: {
    minHeight: 44,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  reportButtonText: {
    fontSize: 15,
    fontFamily: "DMSans-Bold",
    color: theme.semanticColors.primary,
  },
}));
