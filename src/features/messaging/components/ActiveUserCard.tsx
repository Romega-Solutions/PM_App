/**
 * ActiveUserCard Component
 *
 * Displays an active/online user in the horizontal scroll list.
 * Shows user avatar with online status indicator.
 *
 * SOLID Principles:
 * - Single Responsibility: Only renders active user card UI
 * - Open/Closed: Extensible via props, closed for modification
 * - Liskov Substitution: Can be used anywhere a user card is needed
 * - Interface Segregation: Only requires minimal user data
 * - Dependency Inversion: Depends on props interface, not concrete implementations
 *
 * @module features/messaging/components
 */

import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Brand Colors
const ACCENT_PURPLE = "#8D69F6";
const ONLINE_GREEN = "#10B981";
const TEXT_SECONDARY = "rgba(255,255,255,0.75)";

/**
 * Props for ActiveUserCard component
 */
export interface ActiveUserCardProps {
  /** User ID */
  id: string;
  /** User display name */
  name: string;
  /** User profile image URL */
  image: string | null;
  /** Whether user is currently online */
  isOnline: boolean;
  /** Callback when card is pressed */
  onPress: (userId: string) => void;
}

/**
 * ActiveUserCard Component
 *
 * Renders a user card in the active users horizontal list.
 * Displays avatar with online indicator and user name.
 */
export const ActiveUserCard: React.FC<ActiveUserCardProps> = ({
  id,
  name,
  image,
  isOnline,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel={`Chat with ${name}`}
      onPress={() => onPress(id)}
    >
      <View style={styles.imageContainer}>
        <View style={styles.imageWrap}>
          {image ? (
            <Image
              source={{ uri: image }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderAvatar}>
              <Text style={styles.placeholderText}>
                {name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        {isOnline && <View style={styles.onlineBadge} />}
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginRight: 16,
    width: 66,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 6,
  },
  imageWrap: {
    width: 66,
    height: 66,
    borderRadius: 33,
    padding: 3,
    backgroundColor: `${ACCENT_PURPLE}22`,
    borderWidth: 2,
    borderColor: `${ACCENT_PURPLE}40`,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
  },
  placeholderAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    backgroundColor: `${ACCENT_PURPLE}33`,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 24,
    fontFamily: "DMSans-Bold",
    color: ACCENT_PURPLE,
  },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: ONLINE_GREEN,
    borderWidth: 2.5,
    borderColor: "#0F0814",
  },
  name: {
    fontSize: 12,
    fontFamily: "DMSans-Medium",
    color: TEXT_SECONDARY,
    textAlign: "center",
  },
});
