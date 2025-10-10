import { LucideIcon } from "lucide-react-native";
import React from "react";
import {
  KeyboardTypeOptions,
  Platform,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

/**
 * CustomTextInput Component Props Interface
 */
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
}

/**
 * CustomTextInput Component
 * A reusable text input with icon support and consistent styling
 *
 * Best practices applied:
 * - Touch target: 44-48px (iOS/Android guidelines)
 * - Icon size: 20-24px
 * - Font size: 16px (prevents zoom on iOS)
 * - Padding: 16px horizontal, 12-14px vertical
 */
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
  ...props
}: CustomTextInputProps) {
  const hasValue = value && value.length > 0;

  return (
    <View style={{ marginBottom: 20 }}>
      {/* Label - Using Hello Paris for UI labels */}
      {label && (
        <Text
          style={{
            fontSize: 15,
            fontFamily: "HelloParis",
            fontWeight: "500",
            color: "#FFFFFF",
            marginBottom: 10,
            letterSpacing: 0.3,
          }}
        >
          {label}
        </Text>
      )}

      {/* Input Container */}
      <View style={{ position: "relative" }}>
        <TextInput
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            borderRadius: 16,
            paddingVertical: Platform.select({ ios: 18, android: 16 }),
            paddingLeft: LeftIcon ? 52 : 18,
            paddingRight: RightIcon ? 52 : 18,
            fontSize: 16,
            fontFamily: "PlayfairDisplay",
            fontWeight: "400",
            color: "#FFFFFF",
            borderWidth: 2,
            borderColor: error
              ? "#D52C4D" // error.600
              : hasValue
                ? "rgba(239, 62, 120, 0.5)" // amihan.500 with opacity
                : "rgba(141, 105, 246, 0.25)", // dalisay.500 with opacity
            minHeight: Platform.select({ ios: 56, android: 52 }),
          }}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          {...props}
        />

        {/* Left Icon */}
        {LeftIcon && (
          <View
            style={{
              position: "absolute",
              left: 18,
              top: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <LeftIcon
              size={20}
              color="rgba(239, 62, 120, 0.7)"
              strokeWidth={2}
            />
          </View>
        )}

        {/* Right Icon/Button */}
        {RightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={{
              position: "absolute",
              right: 18,
              top: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
              padding: 4,
            }}
            accessible={true}
            accessibilityRole="button"
          >
            <RightIcon
              size={20}
              color="rgba(255, 255, 255, 0.6)"
              strokeWidth={2}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <Text
          style={{
            fontSize: 13,
            fontFamily: "PlayfairDisplay",
            fontWeight: "400",
            color: "#D52C4D",
            marginTop: 6,
            marginLeft: 4,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
