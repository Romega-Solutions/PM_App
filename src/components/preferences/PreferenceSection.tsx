import React from "react";
import { View, Text } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { useAppTheme, makeStyles } from "@/src/theme";

interface Props {
  Icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}

export default function PreferenceSection({ Icon, title, children }: Props) {
  const theme = useAppTheme();
  const styles = useStyles();

  const ACCENT_PINK = theme.colors.amihan?.[500] ?? "#EF3E78";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon size={20} color={ACCENT_PINK} strokeWidth={2.5} />
        <Text style={styles.title}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: { gap: 12 },
  header: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  title: {
    fontSize: 16,
    fontFamily: theme.fontFamilies.body.semiBold,
    color: theme.colors.neutral.white,
    letterSpacing: 0.3,
  },
}));
