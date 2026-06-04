import React from "react";
import { TouchableOpacity, View, Text, StyleSheet, Platform } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { colors, theme, useTheme, withAlpha } from "@/src/theme";

interface Props {
  Icon: LucideIcon;
  title: string;
  description: string;
  onPress: () => void;
}

export default function VerificationStep({ Icon, title, description, onPress }: Props) {
  const { colors: themeColors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={description}
      style={[
        styles.container,
        {
          backgroundColor: withAlpha(colors.neutral.white, 0.08),
          borderColor: withAlpha(themeColors.secondary, 0.25),
        },
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconBox,
            { backgroundColor: withAlpha(themeColors.secondary, 0.12) },
          ]}
        >
          <Icon size={20} color={themeColors.secondary} />
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <Text style={styles.desc}>{description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 16 : 14,
    minHeight: Platform.OS === "ios" ? 60 : 56,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  iconBox: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 12 },
  title: { flex: 1, fontSize: 16, color: colors.neutral.white, fontWeight: "600", fontFamily: theme.fontFamilies.body.semiBold },
  desc: { marginLeft: 50, fontSize: 14, color: withAlpha(colors.neutral.white, 0.85), lineHeight: 20, fontFamily: theme.fontFamilies.body.regular },
});
