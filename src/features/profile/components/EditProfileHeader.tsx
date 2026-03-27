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
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const BRAND_BG = "#0F0814";
const ACCENT_PINK = "#EF3E78";
const WHITE = "#FFFFFF";

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
  return (
    <>
      {Platform.OS === "ios" && (
        <View style={{ height: 44, backgroundColor: BRAND_BG }} />
      )}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={24} color={WHITE} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity onPress={onSave} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color={ACCENT_PINK} />
          ) : (
            <Save size={24} color={ACCENT_PINK} />
          )}
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    color: WHITE,
    fontFamily: "DMSans-Bold",
  },
});
