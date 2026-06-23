import React from "react";
import { TouchableOpacity, View, Text, Platform } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { useAppTheme } from "../../theme/ThemeContext";
import { makeStyles } from "../../theme/makeStyles";

interface Props {
  Icon: LucideIcon;
  title: string;
  description: string;
  onPress: () => void;
}

export default function VerificationStep({ Icon, title, description, onPress }: Props) {
  const theme = useAppTheme();
  const styles = useStyles();
  
  const ACCENT_PURPLE = theme.semanticColors.secondary;
  const ICON_BG = "rgba(141,105,246,0.12)"; // keeping alpha for now or use theme with opacity

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} accessibilityRole="button" style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: ICON_BG }]}>
          <Icon size={20} color={ACCENT_PURPLE} />
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <Text style={styles.desc}>{description}</Text>
    </TouchableOpacity>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: "rgba(255,255,255,0.08)", // or theme.semanticColors.surface with opacity
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(141,105,246,0.25)",
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 16 : 14,
    minHeight: Platform.OS === "ios" ? 60 : 56,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  iconBox: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 12 },
  title: { flex: 1, fontSize: 16, color: "#FFFFFF", fontWeight: "600" }, // Assuming dark bg here
  desc: { marginLeft: 50, fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 20 },
}));
