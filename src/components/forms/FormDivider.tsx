import { theme, useTheme, withAlpha } from "@/src/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface FormDividerProps {
  text?: string;
}

export default function FormDivider({ text = "Or continue with" }: FormDividerProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.line, { backgroundColor: colors.brandBorder }]} />
      <Text style={[styles.text, { color: withAlpha(colors.onPrimary, 0.66) }]}>
        {text}
      </Text>
      <View style={[styles.line, { backgroundColor: colors.brandBorder }]} />
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
  },
  text: {
    ...theme.textStyles.caption,
    marginHorizontal: theme.spacing.md,
  },
});
