import React from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { X, Camera, ImagePlus } from "lucide-react-native";
import { theme } from "@/src/theme";

const { width } = Dimensions.get("window");
const ITEM_SIZE = Math.min(120, Math.floor((width - theme.spacing.lg * 2 - 12) / 3));

interface Props {
  photos: string[];
  onAdd: () => void;
  onTakePhoto?: () => void;
  onRemove: (uri: string) => void;
  canAdd?: boolean;
  disabled?: boolean;
  minimumPhotos?: number;
}

export default function PhotoPicker({
  photos,
  onAdd,
  onTakePhoto,
  onRemove,
  canAdd = true,
  disabled = false,
  minimumPhotos = 1,
}: Props) {
  const remainingRequired = Math.max(minimumPhotos - photos.length, 0);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.requirementCard,
          remainingRequired === 0 && styles.requirementCardComplete,
        ]}
        accessible
        accessibilityRole="text"
        accessibilityLabel={
          remainingRequired === 0
            ? "Profile photo requirement complete"
            : `${remainingRequired} profile photo required before continuing`
        }
      >
        <Camera
          size={18}
          color={
            remainingRequired === 0
              ? "#22C55E"
              : theme.colors.amihan?.[300] ?? "#EF3E78"
          }
        />
        <View style={styles.requirementCopy}>
          <Text style={styles.requirementTitle}>
            {remainingRequired === 0
              ? "Minimum photo added"
              : "At least 1 photo required"}
          </Text>
          <Text style={styles.requirementText}>
            Clear face photos help people recognize you and keep the community
            safer.
          </Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionButton, disabled && styles.disabled]}
          onPress={onAdd}
          activeOpacity={0.85}
          disabled={disabled || !canAdd}
          accessibilityRole="button"
          accessibilityLabel="Choose profile photo from library"
        >
          <ImagePlus size={18} color={theme.colors.dalisay[50]} />
          <Text style={styles.actionText}>Library</Text>
        </TouchableOpacity>

        {onTakePhoto ? (
          <TouchableOpacity
            style={[styles.actionButton, disabled && styles.disabled]}
            onPress={onTakePhoto}
            activeOpacity={0.85}
            disabled={disabled || !canAdd}
            accessibilityRole="button"
            accessibilityLabel="Take profile photo with camera"
          >
            <Camera size={18} color={theme.colors.dalisay[50]} />
            <Text style={styles.actionText}>Camera</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.grid}>
        {photos.length === 0 ? (
          <TouchableOpacity
            style={[styles.tile, styles.emptyTile, disabled && styles.disabled]}
            onPress={onAdd}
            activeOpacity={0.85}
            disabled={disabled || !canAdd}
            accessibilityRole="button"
            accessibilityLabel="Add your first required profile photo"
          >
            <Camera size={28} color={theme.colors.dalisay[50]} />
            <Text style={styles.addText}>Add first photo</Text>
          </TouchableOpacity>
        ) : null}

        {photos.map((uri, index) => (
          <View key={uri} style={styles.tile}>
            <Image source={{ uri }} style={styles.image} resizeMode="cover" />
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => onRemove(uri)}
              accessibilityRole="button"
              accessibilityLabel={`Remove profile photo ${index + 1}`}
              activeOpacity={0.8}
              disabled={disabled}
            >
              <X size={14} color={theme.colors.neutral.white} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <Text style={styles.hint}>Upload at least one clear photo. You can add up to 6 photos.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", gap: 12 },
  requirementCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "rgba(239,62,120,0.12)",
    borderWidth: 1,
    borderColor: "rgba(239,62,120,0.3)",
  },
  requirementCardComplete: {
    backgroundColor: "rgba(34,197,94,0.12)",
    borderColor: "rgba(34,197,94,0.32)",
  },
  requirementCopy: { flex: 1 },
  requirementTitle: {
    color: theme.colors.neutral.white,
    fontSize: 14,
    fontFamily: theme.fontFamilies.body.semiBold,
    marginBottom: 3,
  },
  requirementText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    lineHeight: 17,
  },
  actionsRow: { flexDirection: "row", gap: 10 },
  actionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionText: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
    fontFamily: theme.fontFamilies.body.semiBold,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.04)",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTile: {
    width: "100%",
    minHeight: 132,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.18)",
  },
  addText: {
    marginTop: 8,
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    fontFamily: theme.fontFamilies.body.semiBold,
  },
  image: { width: "100%", height: "100%" },
  removeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.45)",
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  hint: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    marginTop: 6,
  },
  disabled: { opacity: 0.5 },
});
