import React from "react";
import { View, Text, Image, Dimensions } from "react-native";
import { CheckCircle } from "lucide-react-native";
import { makeStyles } from "@/src/theme";

const { width } = Dimensions.get("window");

interface Props {
  title?: string;
  subtitle?: string;
}

export default function VerificationSuccessHeader({
  title = "Verified Successfully!",
  subtitle = "Great! Your email is verified. Let's set up your profile now.",
}: Props) {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <Image
          source={require("@/assets/images/brand/logo-no-bg.webp")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.iconWrap}>
        <CheckCircle size={48} color="#22c55e" strokeWidth={2} />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: { alignItems: "center", marginBottom: 36, paddingHorizontal: 20 },
  logoWrap: { width: 150, height: 150, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  logo: { width: 140, height: 140 },
  iconWrap: {
    backgroundColor: "rgba(34,197,94,0.12)",
    borderRadius: 48,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.24)",
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: Math.min(width * 0.08, 32),
    color: "#FFFFFF",
    marginBottom: 12,
    fontFamily: theme.fontFamilies.header.semiBold,
    textAlign: "center",
  },
  subtitle: {
    fontSize: Math.min(width * 0.045, 18),
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 26,
    fontFamily: theme.fontFamilies.body.regular,
  },
}));
