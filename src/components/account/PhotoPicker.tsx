import React from "react";
import { View, Image, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { X, Camera } from "lucide-react-native";
import { colors, theme, useTheme, withAlpha } from "@/src/theme";

const { width } = Dimensions.get("window");
const ITEM_SIZE = Math.min(120, Math.floor((width - theme.spacing.lg * 2 - 12) / 3));

interface Props {
  photos: string[];
  onAdd: () => void;
  onRemove: (uri: string) => void;
  canAdd?: boolean;
}

export default function PhotoPicker({ photos, onAdd, onRemove, canAdd = true }: Props) {
  const { colors: themeColors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {/* Add button as first tile */}
        {canAdd && (
          <TouchableOpacity
            style={[
              styles.tile,
              styles.addTile,
              {
                backgroundColor: withAlpha(colors.neutral.white, 0.04),
                borderColor: withAlpha(colors.neutral.white, 0.08),
              },
            ]}
            onPress={onAdd}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Add profile photo"
            accessibilityHint="Opens your photo library to upload a profile photo"
          >
            <Camera size={28} color={themeColors.onPrimary} />
            <Text style={styles.addText}>Add</Text>
          </TouchableOpacity>
        )}

        {photos.map((uri, index) => (
          <View
            key={uri}
            style={[
              styles.tile,
              { backgroundColor: withAlpha(colors.neutral.white, 0.04) },
            ]}
          >
            <Image
              source={{ uri }}
              style={styles.image}
              resizeMode="cover"
              accessible
              accessibilityLabel={`Profile photo ${index + 1}`}
            />
            <TouchableOpacity
              style={[
                styles.removeBtn,
                { backgroundColor: withAlpha(colors.neutral.black, 0.55) },
              ]}
              onPress={() => onRemove(uri)}
              accessibilityRole="button"
              accessibilityLabel={`Remove profile photo ${index + 1}`}
              accessibilityHint="Removes this photo from your profile"
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              activeOpacity={0.8}
            >
              <X size={14} color={colors.neutral.white} />
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
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  addTile: {
    borderWidth: 1,
  },
  addText: {
    marginTop: 8,
    color: withAlpha(colors.neutral.white, 0.9),
    fontSize: 12,
  },
  image: { width: "100%", height: "100%" },
  removeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  hint: {
    color: withAlpha(colors.neutral.white, 0.65),
    fontSize: 13,
    marginTop: 6,
  },
});
