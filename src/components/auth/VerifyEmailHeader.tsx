import React from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import { Mail } from "lucide-react-native";
import { useAppTheme, makeStyles } from "@/src/theme";

const { width } = Dimensions.get("window");

interface Props {
  email?: string | null;
}

export default function VerifyEmailHeader({ email }: Props) {
  const theme = useAppTheme();
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <Image
          source={require("../../../assets/images/brand/logo-no-bg.webp")}
          style={styles.logo}
          resizeMode="contain"
          accessible
          accessibilityLabel="PinayMate logo"
        />
      </View>

      <View
        style={styles.iconWrap}
        accessible
        accessibilityRole="image"
        accessibilityLabel="Email verification step"
      >
        <Mail size={48} color="#EF3E78" strokeWidth={2} />
      </View>

      <Text style={styles.title}>Check your email</Text>

      <Text style={styles.body}>
        We sent a secure verification link to{"\n"}
        <Text style={styles.emailText}>{email ?? "your email address"}</Text>
        {"\n"}Tap the newest link to protect your profile setup.
      </Text>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
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
    backgroundColor: "rgba(239,62,120,0.15)",
    borderRadius: 50,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: "rgba(239,62,120,0.28)",
    shadowColor: "#EF3E78",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 18,
    elevation: 10,
  },
  title: {
    fontSize: Math.min(width * 0.08, 32),
    color: "#FFFFFF",
    marginBottom: 12,
    fontFamily: theme.fontFamilies.header.semiBold,
    textAlign: "center",
  },
  body: {
    fontSize: Math.min(width * 0.045, 18),
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 26,
    fontFamily: theme.fontFamilies.body.regular,
  },
  emailText: {
    color: "#FFFFFF",
    fontFamily: theme.fontFamilies.body.semiBold,
  },
}));
