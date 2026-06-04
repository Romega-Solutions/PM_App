import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { CheckCircle } from "lucide-react-native";
import { colors, theme, useTheme, withAlpha } from "@/src/theme";

interface Props {
  title?: string;
  subtitle?: string;
}

export default function VerificationSuccessHeader({
  title = "Verified Successfully!",
  subtitle = "Great! Your email is verified. Let's set up your profile now.",
}: Props) {
  const { colors: themeColors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <Image
          source={require("@/assets/logo-no-bg.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: withAlpha(themeColors.success, 0.12),
            borderColor: withAlpha(themeColors.success, 0.24),
            shadowColor: themeColors.success,
          },
        ]}
      >
        <CheckCircle size={48} color={themeColors.success} strokeWidth={2} />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.subtitle, { color: withAlpha(colors.neutral.white, 0.9) }]}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", marginBottom: 36, paddingHorizontal: 20 },
  logoWrap: { width: 150, height: 150, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  logo: { width: 140, height: 140 },
  iconWrap: {
    borderRadius: 48,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    color: colors.neutral.white,
    marginBottom: 12,
    fontFamily: theme.fontFamilies.header.semiBold,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 17,
    textAlign: "center",
    lineHeight: 26,
    fontFamily: theme.fontFamilies.body.regular,
  },
});
