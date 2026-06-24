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

import {
  Bell,
  ChevronRight,
  Edit,
  HelpCircle,
  Info,
  Lock,
  LogOut,
  SlidersHorizontal,
} from "lucide-react-native";
import type { Href } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { makeStyles } from "../../../theme/makeStyles";
import { useAppTheme, AppTheme } from "../../../theme/ThemeContext";

// Brand Colors
const ACCENT_PURPLE = "#8D69F6";
const ACCENT_PINK = "#EF3E78";
const WHITE = "#FFFFFF";
const SURFACE_STRONG = "rgba(255, 255, 255, 0.08)";
const TILE_BORDER = "rgba(168, 85, 247, 0.13)";
const DANGER_BG = "rgba(239, 62, 120, 0.12)";

/**
 * Menu item interface
 */
export interface MenuItem {
  /** Menu item title */
  title: string;
  /** Screen reader hint for the action */
  hint: string;
  /** Menu item icon */
  icon: React.ReactNode;
  /** Route to navigate to */
  route: Href;
}

/**
 * Props for ProfileMenuList component
 */
export interface ProfileMenuListProps {
  /** Array of menu items */
  items: MenuItem[];
  /** Callback when menu item is pressed */
  onItemPress: (route: Href) => void;
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
  const styles = useStyles();
  const theme = useAppTheme();
  return (
    <View style={styles.container}>
      {/* Menu Items */}
      {items.map((item) => (
        <TouchableOpacity
          key={item.title}
          style={styles.listItem}
          activeOpacity={0.75}
          onPress={() => onItemPress(item.route)}
          accessibilityRole="button"
          accessibilityLabel={item.title}
          accessibilityHint={item.hint}
        >
          <View style={styles.iconContainer}>{item.icon}</View>
          <Text style={styles.listItemText}>{item.title}</Text>
          <ChevronRight size={20} color={theme.semanticColors.secondary} />
        </TouchableOpacity>
      ))}

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={onLogout}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Log out"
        accessibilityHint="Signs out of this account on this device"
      >
        <LogOut size={20} color={theme.semanticColors.primary} />
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * Helper function to create default menu items
 */
export const getDefaultMenuItems = (theme: AppTheme): MenuItem[] => [
  {
    title: "Edit Profile",
    hint: "Opens your profile details for review and editing",
    icon: <Edit size={22} color={theme.semanticColors.secondary} />,
    route: "/(main)/profile-settings/edit",
  },
  {
    title: "Preferences",
    hint: "Opens your match preference settings",
    icon: <SlidersHorizontal size={22} color={theme.semanticColors.secondary} />,
    route: "/(main)/profile-settings/preferences",
  },
  {
    title: "Privacy",
    hint: "Opens privacy controls for your profile and activity",
    icon: <Lock size={22} color={theme.semanticColors.secondary} />,
    route: "/(main)/profile-settings/privacy",
  },
  {
    title: "Notifications",
    hint: "Opens notification settings",
    icon: <Bell size={22} color={theme.semanticColors.secondary} />,
    route: "/(main)/profile-settings/notifications",
  },
  {
    title: "Help & Safety",
    hint: "Opens help and safety information",
    icon: <HelpCircle size={22} color={theme.semanticColors.secondary} />,
    route: "/(main)/profile-settings/help",
  },
  {
    title: "About",
    hint: "Opens app information",
    icon: <Info size={22} color={theme.semanticColors.secondary} />,
    route: "/(main)/profile-settings/about",
  },
];

const useStyles = makeStyles((theme) => ({
  container: {
    paddingHorizontal: 24,
  },
  listItem: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 18,
    minHeight: 56,
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(168, 85, 247, 0.13)",
  },
  iconContainer: {
    marginRight: 16,
  },
  listItemText: {
    color: theme.semanticColors.text,
    fontSize: 16,
    fontFamily: "DMSans-SemiBold",
    letterSpacing: 0.2,
    flex: 1,
  },
  logoutBtn: {
    backgroundColor: "rgba(239, 62, 120, 0.12)",
    borderRadius: 18,
    minHeight: 56,
    padding: 18,
    marginTop: 8,
    marginBottom: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: theme.semanticColors.primary,
    gap: 10,
  },
  logoutText: {
    color: theme.semanticColors.primary,
    fontSize: 16,
    fontFamily: "DMSans-Bold",
    marginLeft: 8,
  },
}));
