/**
 * ProfileEditForm Component
 *
 * Form fields for editing profile information.
 * Includes first name, last name, occupation, education, and location.
 */

import React from "react";
import { Text, TextInput, View } from "react-native";
import { makeStyles } from "../../../theme/makeStyles";

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
  const styles = useStyles();
  return (
    <View style={styles.form}>
      <View
        style={styles.safetyStrip}
        accessible
        accessibilityLabel="Profile editing privacy note. These fields may help discovery when account visibility allows it. Do not add ID numbers, payment details, exact addresses, or private contact details."
      >
        <Text style={styles.safetyTitle}>Profile details for discovery</Text>
        <Text style={styles.safetyText}>
          Keep this public-facing. Do not add ID numbers, payment details,
          exact addresses, or private contact details.
        </Text>
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={onFirstNameChange}
          placeholder="Enter first name"
          placeholderTextColor="rgba(255,255,255,0.4)"
          accessibilityLabel="First name"
          accessibilityHint="Enter the first name shown on your profile"
          autoCapitalize="words"
          autoComplete="given-name"
          textContentType="givenName"
        />
        <Text style={styles.helperText}>
          Use the name you are comfortable showing on your profile.
        </Text>
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={onLastNameChange}
          placeholder="Enter last name"
          placeholderTextColor="rgba(255,255,255,0.4)"
          accessibilityLabel="Last name"
          accessibilityHint="Enter your last name for your account profile"
          autoCapitalize="words"
          autoComplete="family-name"
          textContentType="familyName"
        />
        <Text style={styles.helperText}>
          Avoid adding IDs, usernames, phone numbers, or payment handles here.
        </Text>
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Occupation</Text>
        <TextInput
          style={styles.input}
          value={occupation}
          onChangeText={onOccupationChange}
          placeholder="Enter occupation"
          placeholderTextColor="rgba(255,255,255,0.4)"
          accessibilityLabel="Occupation"
          accessibilityHint="Enter a short occupation or leave it blank"
          maxLength={60}
        />
        <Text style={styles.helperText}>
          Optional. Keep it broad enough for a dating profile.
        </Text>
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Education</Text>
        <TextInput
          style={styles.input}
          value={education}
          onChangeText={onEducationChange}
          placeholder="Enter education"
          placeholderTextColor="rgba(255,255,255,0.4)"
          accessibilityLabel="Education"
          accessibilityHint="Enter a short education detail or leave it blank"
          maxLength={60}
        />
        <Text style={styles.helperText}>
          Optional. Do not include student IDs or private records.
        </Text>
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={onLocationChange}
          placeholder="Enter location"
          placeholderTextColor="rgba(255,255,255,0.4)"
          accessibilityLabel="Location"
          accessibilityHint="Enter city or general area, not an exact home address"
          maxLength={80}
        />
        <Text style={styles.helperText}>
          City or general area only. Exact addresses do not belong in profiles.
        </Text>
      </View>
    </View>
  );
};

const useStyles = makeStyles((theme) => ({
  form: {
    gap: 20,
  },
  safetyStrip: {
    gap: 6,
    backgroundColor: "rgba(141, 105, 246, 0.12)",
    borderLeftWidth: 3,
    borderLeftColor: "rgba(141, 105, 246, 0.86)",
    paddingLeft: 14,
    paddingVertical: 12,
  },
  safetyTitle: {
    color: theme.semanticColors.text,
    fontSize: 14,
    fontFamily: "DMSans-SemiBold",
    lineHeight: 20,
  },
  safetyText: {
    color: "rgba(255,255,255,0.74)",
    fontSize: 13,
    fontFamily: "DMSans-Regular",
    lineHeight: 19,
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
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(168, 85, 247, 0.13)",
    padding: 16,
    color: theme.semanticColors.text,
    fontSize: 16,
    fontFamily: "DMSans-Regular",
    minHeight: 52,
  },
  helperText: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 12,
    fontFamily: "DMSans-Regular",
    lineHeight: 18,
  },
}));
