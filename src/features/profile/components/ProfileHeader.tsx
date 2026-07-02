/**
 * ProfileHeader Component
 *
 * Displays user profile header with avatar, name, location, and verification status.
 *
 * SOLID Principles:
 * - Single Responsibility: Only renders profile header UI
 * - Open/Closed: Extensible via props, closed for modification
 * - Liskov Substitution: Can be used anywhere a profile header is needed
 * - Interface Segregation: Only requires minimal profile data
 * - Dependency Inversion: Depends on props interface, not implementations
 *
 * @module features/profile/components
 */

import { UserType } from "@/src/features/auth/api/authApi";
import { MapPin, Sparkles, User } from "lucide-react-native";
import React from "react";
import { Image, Text, View } from "react-native";
import { makeStyles } from "../../../theme/makeStyles";
import { useAppTheme } from "../../../theme/ThemeContext";

/**
 * Props for ProfileHeader component
 */
export interface ProfileHeaderProps {
  /** User's first name */
  firstName: string | null;
  /** User's last name */
  lastName: string | null;
  /** User's age */
  age: number | null;
  /** User type (filipina or foreigner) */
  userType: UserType | null;
  /** User's location */
  location: string | null;
  /** Profile photo URI */
  photoUri: string | null;
  /** Whether user is verified */
  isVerified: boolean;
}

/**
 * ProfileHeader Component
 *
 * Renders user profile information in a visually appealing header.
 */
export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  firstName,
  lastName,
  age,
  userType,
  location,
  photoUri,
  isVerified,
}) => {
  const styles = useStyles();
  const theme = useAppTheme();
  const formatUserType = (type: UserType | null): string | null => {
    if (!type) return null;
    return type === "filipina" ? "Filipina" : "Foreigner";
  };
  const displayName = [firstName, lastName].filter(Boolean).join(" ");
  const userTypeLabel = formatUserType(userType);
  const hasProfileDetails = age !== null || userTypeLabel !== null;

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarWrap}>
        {photoUri && photoUri.startsWith("http") ? (
          <Image
            source={{ uri: photoUri }}
            style={styles.avatar}
            resizeMode="cover"
            accessibilityLabel="Profile photo"
          />
        ) : (
          <View
            style={styles.avatarPlaceholder}
            accessible
            accessibilityLabel="No profile photo added"
          >
            <User size={48} color={theme.semanticColors.primary} strokeWidth={2} />
          </View>
        )}
      </View>

      {/* Name */}
      <Text style={styles.name}>{displayName || "Complete your profile"}</Text>

      {/* Age and User Type */}
      {hasProfileDetails ? (
        <View style={styles.infoRow}>
          {age !== null && <Text style={styles.infoText}>{age} years old</Text>}
          {age !== null && userTypeLabel !== null && (
            <View style={styles.infoDot} />
          )}
          {userTypeLabel !== null && (
            <Text style={styles.infoText}>{userTypeLabel}</Text>
          )}
        </View>
      ) : (
        <Text style={styles.infoText}>Profile details not added yet</Text>
      )}

      {/* Location */}
      <View style={styles.locationRow}>
        <MapPin size={16} color={theme.semanticColors.primary} strokeWidth={2.5} />
        <Text style={styles.locationText}>
          {location || "Location not added yet"}
        </Text>
      </View>

      {/* Verification Badge */}
      {isVerified ? (
        <View style={styles.verifiedPill}>
          <Sparkles size={12} color={theme.semanticColors.text} strokeWidth={2.5} />
          <Text style={styles.verifiedText}>VERIFIED PROFILE</Text>
        </View>
      ) : (
        <View style={styles.unverifiedPill}>
          <Text style={styles.unverifiedText}>VERIFICATION NOT COMPLETED</Text>
        </View>
      )}
    </View>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  avatarWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: theme.semanticColors.secondary,
    padding: 4,
    marginBottom: 16,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 56,
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 56,
    backgroundColor: "rgba(141, 105, 246, 0.13)",
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    color: theme.semanticColors.text,
    fontSize: 28,
    fontFamily: "DMSans-Bold",
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  infoText: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    textAlign: "center",
  },
  infoDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.semanticColors.secondary,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  locationText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 15,
    fontFamily: "DMSans-Medium",
    letterSpacing: 0.2,
    textAlign: "center",
    flexShrink: 1,
  },
  verifiedPill: {
    marginTop: 12,
    backgroundColor: theme.semanticColors.success,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 2,
    borderColor: theme.colors.neutral.white,
  },
  verifiedText: {
    fontSize: 10,
    fontFamily: "DMSans-Bold",
    color: theme.semanticColors.text,
    letterSpacing: 1,
  },
  unverifiedPill: {
    marginTop: 12,
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: theme.semanticColors.warning,
  },
  unverifiedText: {
    fontSize: 10,
    fontFamily: "DMSans-Bold",
    color: theme.semanticColors.warning,
    letterSpacing: 1,
  },
}));
