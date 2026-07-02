/**
 * EditProfileHeader Component
 *
 * Header for the edit profile screen with back button, title, and save action.
 * Shows loading indicator when saving profile updates.
 */

import { ArrowLeft, Save } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { makeStyles } from "../../../theme/makeStyles";
import { useAppTheme } from "../../../theme/ThemeContext";

interface EditProfileHeaderProps {
  onBack: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export const EditProfileHeader: React.FC<EditProfileHeaderProps> = ({
  onBack,
  onSave,
  isSaving,
}) => {
  const styles = useStyles();
  const theme = useAppTheme();
  return (
    <>
      {Platform.OS !== "web" && (
        <View style={{ height: 44, backgroundColor: theme.semanticColors.background }} />
      )}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.iconBtn}
          activeOpacity={0.78}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back to profile"
          accessibilityHint="Leaves edit profile without saving new changes"
        >
          <ArrowLeft size={24} color={theme.semanticColors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity
          onPress={onSave}
          disabled={isSaving}
          style={[styles.iconBtn, isSaving && styles.disabledBtn]}
          activeOpacity={0.78}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={isSaving ? "Saving profile" : "Save profile"}
          accessibilityHint="Saves profile fields for discovery when account visibility allows it"
          accessibilityState={{ disabled: isSaving, busy: isSaving }}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={theme.semanticColors.primary} />
          ) : (
            <Save size={24} color={theme.semanticColors.primary} />
          )}
        </TouchableOpacity>
      </View>
    </>
  );
};

const useStyles = makeStyles((theme) => ({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  iconBtn: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledBtn: {
    opacity: 0.64,
  },
  title: {
    fontSize: 20,
    color: theme.semanticColors.text,
    fontFamily: "DMSans-Bold",
  },
}));
