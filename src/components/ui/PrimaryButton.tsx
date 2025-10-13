// src/components/ui/PrimaryButton.tsx
import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  DimensionValue,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  showChevron?: boolean;
  disabled?: boolean;
  loading?: boolean;
  width?: DimensionValue;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function PrimaryButton({
  title,
  onPress,
  showChevron = true,
  disabled = false,
  loading = false,
  width = "100%",
  accessibilityLabel,
  accessibilityHint,
}: PrimaryButtonProps) {
  const BUTTON_HEIGHT = Platform.select({ ios: 56, android: 52 });
  const BORDER_RADIUS = Platform.select({ ios: 28, android: 26 });
  const FONT_SIZE = Platform.select({ ios: 18, android: 17 });

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={{
        borderRadius: BORDER_RADIUS,
        height: BUTTON_HEIGHT,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#EF3E78",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: Platform.select({ ios: 0.5, android: 0.4 }) as number,
        shadowRadius: 20,
        elevation: 12,
        width,
        overflow: "hidden",
        opacity: isDisabled ? 0.6 : 1,
      }}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={isDisabled}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
    >
      <LinearGradient
        colors={["#EF3E78", "#8D69F6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
      />

      {/* Content row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 16,
        }}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : null}

        <Text
          style={{
            color: "#FFFFFF",
            fontSize: FONT_SIZE,
            fontFamily: "DMSans-SemiBold", // Body/UI font per mapping
            marginRight: showChevron && !loading ? 4 : 0,
            letterSpacing: Platform.select({ ios: 0.5, android: 0.3 }),
            textShadowColor: "rgba(0, 0, 0, 0.3)",
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 3,
          }}
        >
          {loading ? "Loading..." : title}
        </Text>

        {showChevron && !loading ? (
          <ChevronRight size={24} color="#FFFFFF" strokeWidth={2.5} />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
