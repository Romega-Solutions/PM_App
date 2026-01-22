/**
 * ProfileEditForm Component
 *
 * Form fields for editing profile information.
 * Includes first name, last name, occupation, education, and location.
 */

import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

const WHITE = "#FFFFFF";
const SURFACE_STRONG = "rgba(255, 255, 255, 0.08)";
const TILE_BORDER = "rgba(168, 85, 247, 0.13)";

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
  return (
    <View style={styles.form}>
      <View style={styles.fieldWrap}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={onFirstNameChange}
          placeholder="Enter first name"
          placeholderTextColor="rgba(255,255,255,0.4)"
        />
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={onLastNameChange}
          placeholder="Enter last name"
          placeholderTextColor="rgba(255,255,255,0.4)"
        />
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Occupation</Text>
        <TextInput
          style={styles.input}
          value={occupation}
          onChangeText={onOccupationChange}
          placeholder="Enter occupation"
          placeholderTextColor="rgba(255,255,255,0.4)"
        />
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Education</Text>
        <TextInput
          style={styles.input}
          value={education}
          onChangeText={onEducationChange}
          placeholder="Enter education"
          placeholderTextColor="rgba(255,255,255,0.4)"
        />
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={onLocationChange}
          placeholder="Enter location"
          placeholderTextColor="rgba(255,255,255,0.4)"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    gap: 20,
  },
  fieldWrap: {
    gap: 8,
  },
  label: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontFamily: "DMSans-SemiBold",
  },
  input: {
    backgroundColor: SURFACE_STRONG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: TILE_BORDER,
    padding: 16,
    color: WHITE,
    fontSize: 16,
    fontFamily: "DMSans-Regular",
  },
});
