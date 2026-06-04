/**
 * ProfileEditForm Component
 * 
 * Form fields for editing profile information.
 * Includes first name, last name, occupation, education, and location.
 */

import { useTheme, withAlpha } from "@/src/theme";
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface ProfileEditFormProps {
  firstName: string;
  lastName: string;
  occupation: string;
  education: string;
  location: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onOccupationChange: (value: string) => void;
  onEducationChange: (value: string) => void;
  onLocationChange: (value: string) => void;
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  firstName,
  lastName,
  occupation,
  education,
  location,
  onFirstNameChange,
  onLastNameChange,
  onOccupationChange,
  onEducationChange,
  onLocationChange,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.form}>
      <View style={styles.fieldWrap}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={onFirstNameChange}
          placeholder="Enter first name"
          placeholderTextColor={withAlpha(colors.onPrimary, 0.42)}
        />
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={onLastNameChange}
          placeholder="Enter last name"
          placeholderTextColor={withAlpha(colors.onPrimary, 0.42)}
        />
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Occupation</Text>
        <TextInput
          style={styles.input}
          value={occupation}
          onChangeText={onOccupationChange}
          placeholder="Enter occupation"
          placeholderTextColor={withAlpha(colors.onPrimary, 0.42)}
        />
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Education</Text>
        <TextInput
          style={styles.input}
          value={education}
          onChangeText={onEducationChange}
          placeholder="Enter education"
          placeholderTextColor={withAlpha(colors.onPrimary, 0.42)}
        />
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={onLocationChange}
          placeholder="Enter location"
          placeholderTextColor={withAlpha(colors.onPrimary, 0.42)}
        />
      </View>
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
  form: {
    gap: 20,
  },
  fieldWrap: {
    gap: 8,
  },
  label: {
    color: withAlpha(colors.onPrimary, 0.9),
    fontSize: 14,
    fontFamily: "DMSans-SemiBold",
  },
  input: {
    backgroundColor: colors.brandSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.brandBorder,
    padding: 16,
    color: colors.onPrimary,
    fontSize: 16,
    fontFamily: "DMSans-Regular",
  },
});
