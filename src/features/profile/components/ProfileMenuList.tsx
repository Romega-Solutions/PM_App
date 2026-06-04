/**
 * ProfileMenuList Component
 *
 * Displays list of profile settings menu items and logout button.
 *
 * SOLID Principles:
 * - Single Responsibility: Only renders menu list UI
 * - Open/Closed: Extensible via props, closed for modification
 * - Liskov Substitution: Can be used in any menu context
 * - Interface Segregation: Only requires menu items and handlers
 * - Dependency Inversion: Depends on props interface
 *
 * @module features/profile/components
 */

import { useTheme, withAlpha } from "@/src/theme";
import {
    Bell,
    ChevronRight,
    Edit,
    HelpCircle,
    Info,
    Lock,
    LogOut,
    SlidersHorizontal,
    type LucideIcon,
} from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

/**
 * Menu item interface
 */
export interface MenuItem {
  /** Menu item title */
  title: string;
  /** Menu item icon */
  icon: LucideIcon;
  /** Route to navigate to */
  route: string;
}

/**
 * Props for ProfileMenuList component
 */
export interface ProfileMenuListProps {
  /** Array of menu items */
  items: MenuItem[];
  /** Callback when menu item is pressed */
  onItemPress: (route: string) => void;
  /** Callback when logout is pressed */
  onLogout: () => void;
}

/**
 * ProfileMenuList Component
 *
 * Renders a list of profile settings menu items with logout button.
 */
export const ProfileMenuList: React.FC<ProfileMenuListProps> = ({
  items,
  onItemPress,
  onLogout,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      {/* Menu Items */}
      {items.map((item, idx) => {
        const Icon = item.icon;

        return (
          <TouchableOpacity
            key={idx}
            style={styles.listItem}
            activeOpacity={0.75}
            onPress={() => onItemPress(item.route)}
            accessibilityRole="button"
            accessibilityLabel={item.title}
          >
            <View style={styles.iconContainer}>
              <Icon size={22} color={colors.secondary} />
            </View>
            <Text style={styles.listItemText}>{item.title}</Text>
            <ChevronRight size={20} color={colors.secondary} />
          </TouchableOpacity>
        );
      })}

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={onLogout}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Logout"
      >
        <LogOut size={20} color={colors.primary} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * Helper function to create default menu items
 */
export const getDefaultMenuItems = (): MenuItem[] => [
  {
    title: "Edit Profile",
    icon: Edit,
    route: "/(main)/profile-settings/edit",
  },
  {
    title: "Preferences",
    icon: SlidersHorizontal,
    route: "/(main)/profile-settings/preferences",
  },
  {
    title: "Privacy",
    icon: Lock,
    route: "/(main)/profile-settings/privacy",
  },
  {
    title: "Notifications",
    icon: Bell,
    route: "/(main)/profile-settings/notifications",
  },
  {
    title: "Help & Support",
    icon: HelpCircle,
    route: "/(main)/profile-settings/help",
  },
  {
    title: "About",
    icon: Info,
    route: "/(main)/profile-settings/about",
  },
];

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
  container: {
    paddingHorizontal: 24,
  },
  listItem: {
    backgroundColor: colors.brandSurface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.brandBorder,
  },
  iconContainer: {
    marginRight: 16,
  },
  listItemText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontFamily: "DMSans-SemiBold",
    letterSpacing: 0,
    flex: 1,
  },
  logoutBtn: {
    backgroundColor: withAlpha(colors.primary, 0.12),
    borderRadius: 18,
    padding: 18,
    marginTop: 8,
    marginBottom: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.primary,
    gap: 10,
  },
  logoutText: {
    color: colors.primary,
    fontSize: 16,
    fontFamily: "DMSans-Bold",
    marginLeft: 8,
  },
});
