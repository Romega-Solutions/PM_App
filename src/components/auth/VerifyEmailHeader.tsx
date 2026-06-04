import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Mail } from "lucide-react-native";
import { colors, theme, useTheme, withAlpha } from "@/src/theme";

interface Props {
  email?: string | null;
}

export default function VerifyEmailHeader({ email }: Props) {
  const { colors: themeColors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <Image
          source={require("../../../assets/logo-no-bg.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: withAlpha(themeColors.primary, 0.15),
            borderColor: withAlpha(themeColors.primary, 0.28),
            shadowColor: themeColors.primary,
          },
        ]}
      >
        <Mail size={48} color={themeColors.primary} strokeWidth={2} />
      </View>

      <Text style={styles.title}>Check Your Email</Text>

      <Text style={[styles.body, { color: withAlpha(colors.neutral.white, 0.9) }]}>
        We sent a verification link to{"\n"}
        <Text style={[styles.emailText, { color: colors.neutral.white }]}>
          {email ?? "your email address"}
        </Text>
        {"\n"}Tap the link to verify your account.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", marginBottom: 36, paddingHorizontal: 20 },
  logoWrap: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  logo: { width: 120, height: 120 },
  iconWrap: {
    borderRadius: 50,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 18,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    color: colors.neutral.white,
    marginBottom: 12,
    fontFamily: theme.fontFamilies.header.semiBold,
    textAlign: "center",
  },
  body: {
    fontSize: 17,
    textAlign: "center",
    lineHeight: 26,
    fontFamily: theme.fontFamilies.body.regular,
  },
  emailText: {
    fontFamily: theme.fontFamilies.body.semiBold,
  },
});
