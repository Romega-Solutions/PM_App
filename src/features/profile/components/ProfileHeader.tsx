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
import { useTheme, withAlpha } from "@/src/theme";
import { MapPin, Sparkles, User } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

/**
 * Props for ProfileHeader component
 */
export interface ProfileHeaderProps {
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName: string;
  /** User's age */
  age: number;
  /** User type (filipina or foreigner) */
  userType: UserType;
  /** User's location */
  location: string;
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
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const formatUserType = (type: UserType): string => {
    return type === "filipina" ? "Filipina" : "Foreigner";
  };

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarWrap}>
        {photoUri && photoUri.startsWith("http") ? (
          <Image
            source={{ uri: photoUri }}
            style={styles.avatar}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <User size={48} color={colors.primary} strokeWidth={2} />
          </View>
        )}
      </View>

      {/* Name */}
      <Text style={styles.name}>
        {firstName} {lastName}
      </Text>

      {/* Age and User Type */}
      <View style={styles.infoRow}>
        <Text style={styles.infoText}>{age} years old</Text>
        <View style={styles.infoDot} />
        <Text style={styles.infoText}>{formatUserType(userType)}</Text>
      </View>

      {/* Location */}
      <View style={styles.locationRow}>
        <MapPin size={16} color={colors.primary} strokeWidth={2.5} />
        <Text style={styles.locationText}>{location}</Text>
      </View>

      {/* Verification Badge */}
      {isVerified ? (
        <View style={styles.verifiedPill}>
          <Sparkles size={12} color={colors.onStatus} strokeWidth={2.5} />
          <Text style={styles.verifiedText}>VERIFIED</Text>
        </View>
      ) : (
        <View style={styles.unverifiedPill}>
          <Text style={styles.unverifiedText}>NOT VERIFIED</Text>
        </View>
      )}
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
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
    borderColor: colors.secondary,
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
    backgroundColor: withAlpha(colors.secondary, 0.14),
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    color: colors.onPrimary,
    fontSize: 28,
    fontFamily: "DMSans-Bold",
    letterSpacing: 0,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  infoText: {
    color: withAlpha(colors.onPrimary, 0.85),
    fontSize: 14,
    fontFamily: "DMSans-Medium",
  },
  infoDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.secondary,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  locationText: {
    color: withAlpha(colors.onPrimary, 0.9),
    fontSize: 15,
    fontFamily: "DMSans-Medium",
    letterSpacing: 0,
  },
  verifiedPill: {
    marginTop: 12,
    backgroundColor: colors.success,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 2,
    borderColor: colors.onStatus,
  },
  verifiedText: {
    fontSize: 10,
    fontFamily: "DMSans-Bold",
    color: colors.onStatus,
    letterSpacing: 1,
  },
  unverifiedPill: {
    marginTop: 12,
    backgroundColor: withAlpha(colors.warning, 0.2),
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: colors.warning,
  },
  unverifiedText: {
    fontSize: 10,
    fontFamily: "DMSans-Bold",
    color: colors.warning,
    letterSpacing: 1,
  },
});
