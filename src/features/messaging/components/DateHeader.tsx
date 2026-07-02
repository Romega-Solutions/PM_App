import React from "react";
import { StyleSheet, Text, View } from "react-native";

const TEXT_MUTED = "rgba(255,255,255,0.5)";

interface DateHeaderProps {
  date: string;
}

function formatDateHeader(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const messageDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  if (messageDate.getTime() === today.getTime()) return "Today";
  if (messageDate.getTime() === yesterday.getTime()) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export const DateHeader: React.FC<DateHeaderProps> = ({ date }) => (
  <View style={styles.container}>
    <Text style={styles.text}>{formatDateHeader(date)}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 12,
  },
  text: {
    fontSize: 11,
    fontFamily: "DMSans-Medium",
    color: TEXT_MUTED,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
});
