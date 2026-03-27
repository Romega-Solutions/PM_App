import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Camera, FileText, CheckCircle, Clock, XCircle } from "lucide-react-native";

type Status = "pending" | "processing" | "verified" | "rejected";

interface Props {
  type: "selfie" | "document";
  status: Status;
  title: string;
  description: string;
}

export default function VerificationProcessingCard({ type, status, title, description }: Props) {
  const statusMeta = (() => {
    switch (status) {
      case "verified":
        return { color: "#22C55E", text: "Verified", Icon: CheckCircle };
      case "processing":
        return { color: "#F59E0B", text: "Processing", Icon: Clock };
      case "rejected":
        return { color: "#EF4444", text: "Needs review", Icon: XCircle };
      default:
        return { color: "#EF3E78", text: "Pending", Icon: type === "selfie" ? Camera : FileText };
    }
  })();

  const { Icon } = statusMeta;

  return (
    <View style={[styles.container, { borderColor: statusMeta.color }]}>
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: `${statusMeta.color}20` }]}>
          <Icon size={20} color={statusMeta.color} />
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={[styles.pill, { borderColor: statusMeta.color }]}>
          <View style={[styles.dot, { backgroundColor: statusMeta.color }]} />
          <Text style={[styles.pillText, { color: statusMeta.color }]}>{statusMeta.text}</Text>
        </View>
      </View>
      <Text style={styles.desc}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 16 : 14,
    minHeight: Platform.OS === "ios" ? 60 : 56,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  iconBox: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 12 },
  title: { flex: 1, fontSize: 16, color: "#FFF", fontWeight: "600" },
  pill: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, marginLeft: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  pillText: { fontWeight: "600", fontSize: 12 },
  desc: { marginLeft: 50, fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 20 },
});