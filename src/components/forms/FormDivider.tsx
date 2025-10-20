import { theme, colors } from "@/src/theme";
import React from "react";
import { Dimensions, Platform, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get("window");
const scale = (size: number) => (width / 375) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

interface FormDividerProps {
  text?: string;
}

export default function FormDivider({ text = "Or continue with" }: FormDividerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.text}>{text}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: theme.spacing.lg,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: `${colors.neutral.white}26`, // 15% opacity
  },
  text: {
    color: `${colors.neutral.white}99`, // 60% opacity
    marginHorizontal: theme.spacing.md,
    fontSize: moderateScale(13),
    fontFamily: theme.fontFamilies.header.medium,
    letterSpacing: Platform.select({ ios: 0.3, android: 0.2, web: 0.3 }),
  },
});