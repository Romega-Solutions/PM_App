/**
 * EditProfileHeader Component
 * 
 * Header for the edit profile screen with back button, title, and save action.
 * Shows loading indicator when saving profile updates.
 */

import { useTheme, withAlpha } from "@/src/theme";
import { ArrowLeft, Save } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface EditProfileHeaderProps {
  onBack: () => void;
  onSave: () => void;
  isSaving: boolean;
  hasChanges: boolean;
}

export const EditProfileHeader: React.FC<EditProfileHeaderProps> = ({
  onBack,
  onSave,
  isSaving,
  hasChanges,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors);

  return (
    <>
      {insets.top > 0 && (
        <View style={{ height: insets.top, backgroundColor: colors.brandBackground }} />
      )}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.headerButton}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back to profile"
        >
          <ArrowLeft size={24} color={colors.onPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity
          onPress={onSave}
          disabled={isSaving}
          style={styles.headerButton}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={
            hasChanges ? "Save profile changes" : "No profile changes to save"
          }
          accessibilityState={{ disabled: isSaving, busy: isSaving }}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Save
              size={24}
              color={hasChanges ? colors.primary : withAlpha(colors.onPrimary, 0.42)}
            />
          )}
        </TouchableOpacity>
      </View>
    </>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  title: {
    fontSize: 20,
    color: colors.onPrimary,
    fontFamily: "DMSans-Bold",
  },
});
