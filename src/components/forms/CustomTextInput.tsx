// src/components/forms/CustomTextInput.tsx
import { LucideIcon } from "lucide-react-native";
import React, { useState } from "react";
import {
  KeyboardTypeOptions,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextInputFocusEventData,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface CustomTextInputProps
  extends Omit<
    TextInputProps,
    "keyboardType" | "autoCapitalize" | "autoComplete"
  > {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  LeftIcon?: LucideIcon;
  RightIcon?: LucideIcon;
  onRightIconPress?: () => void;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoComplete?:
    | "additional-name"
    | "address-line1"
    | "address-line2"
    | "birthdate-day"
    | "birthdate-full"
    | "birthdate-month"
    | "birthdate-year"
    | "cc-csc"
    | "cc-exp"
    | "cc-exp-day"
    | "cc-exp-month"
    | "cc-exp-year"
    | "cc-number"
    | "country"
    | "current-password"
    | "email"
    | "family-name"
    | "given-name"
    | "honorific-prefix"
    | "honorific-suffix"
    | "name"
    | "name-family"
    | "name-given"
    | "name-middle"
    | "name-middle-initial"
    | "name-prefix"
    | "name-suffix"
    | "new-password"
    | "nickname"
    | "one-time-code"
    | "organization"
    | "organization-title"
    | "password"
    | "password-new"
    | "postal-code"
    | "street-address"
    | "tel"
    | "username"
    | "off";
  error?: string;

  // Optional style overrides
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  errorStyle?: TextStyle;
}

export default function CustomTextInput({
  label,
  value,
  onChangeText,
  placeholder,
  LeftIcon,
  RightIcon,
  onRightIconPress,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  autoComplete,
  error,
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  onFocus,
  onBlur,
  ...props
}: CustomTextInputProps) {
  const [focused, setFocused] = useState(false);
  const hasValue = !!value?.length;

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setFocused(false);
    onBlur?.(e);
  };

  const borderColor = error
    ? "#D52C4D"
    : focused
      ? "#EF3E78"
      : hasValue
        ? "rgba(239, 62, 120, 0.5)"
        : "rgba(141, 105, 246, 0.25)";

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label - body font by default */}
      {label ? <Text style={[styles.label, labelStyle]}>{label}</Text> : null}

      {/* Input container */}
      <View style={{ position: "relative" }}>
        <TextInput
          style={[
            styles.input,
            {
              paddingLeft: LeftIcon ? 52 : 18,
              paddingRight: RightIcon ? 52 : 18,
              borderColor,
            },
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor="rgba(141, 105, 246, 0.9)"
          {...props}
        />

        {/* Left icon */}
        {LeftIcon ? (
          <View style={styles.leftIconWrap}>
            <LeftIcon
              size={20}
              color="rgba(239, 62, 120, 0.7)"
              strokeWidth={2}
            />
          </View>
        ) : null}

        {/* Right icon */}
        {RightIcon ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconWrap}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Toggle input option"
          >
            <RightIcon
              size={20}
              color="rgba(255, 255, 255, 0.7)"
              strokeWidth={2}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Error text - body font */}
      {error ? <Text style={[styles.error, errorStyle]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  // Body/UI font for labels
  label: {
    fontSize: 15,
    color: "#FFFFFF",
    marginBottom: 10,
    letterSpacing: 0.3,
    fontFamily: "DMSans-SemiBold",
  },
  // Input text uses body font
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    paddingVertical: Platform.select({ ios: 18, android: 16 }),
    fontSize: 16,
    color: "#FFFFFF",
    borderWidth: 2,
    minHeight: Platform.select({ ios: 56, android: 52 }),
    fontFamily: "DMSans-Regular",
  },
  leftIconWrap: {
    position: "absolute",
    left: 18,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  rightIconWrap: {
    position: "absolute",
    right: 18,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
  },
  error: {
    fontSize: 13,
    color: "#D52C4D",
    marginTop: 6,
    marginLeft: 4,
    fontFamily: "DMSans-Regular",
  },
});
