import React from "react";
import { View, Image, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { X, Camera } from "lucide-react-native";
import { useAppTheme, makeStyles } from "@/src/theme";

const { width } = Dimensions.get("window");

interface Props {
  photos: string[];
  onAdd: () => void;
  onRemove: (uri: string) => void;
  canAdd?: boolean;
}

export default function PhotoPicker({ photos, onAdd, onRemove, canAdd = true }: Props) {
  const theme = useAppTheme();
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {/* Add button as first tile */}
        {canAdd && (
          <TouchableOpacity style={[styles.tile, styles.addTile]} onPress={onAdd} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Add photo">
            <Camera size={28} color={theme.colors.dalisay[50]} />
            <Text style={styles.addText}>Add</Text>
          </TouchableOpacity>
        )}

        {photos.map((uri) => (
          <View key={uri} style={styles.tile}>
            <Image source={{ uri }} style={styles.image} resizeMode="cover" />
            <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(uri)} accessibilityRole="button" accessibilityLabel="Remove photo" activeOpacity={0.8}>
              <X size={14} color={theme.colors.neutral.white} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <Text style={styles.hint}>Upload at least one clear photo. You can add up to 6 photos.</Text>
    </View>
  );
}

const useStyles = makeStyles((theme) => {
  const ITEM_SIZE = Math.min(120, Math.floor((width - theme.spacing.lg * 2 - 12) / 3));

  return {
    container: { width: "100%", gap: 12 },
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
    addTile: {
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.06)",
    },
    addText: {
      marginTop: 8,
      color: "rgba(255,255,255,0.9)",
      fontSize: 12,
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
  };
});