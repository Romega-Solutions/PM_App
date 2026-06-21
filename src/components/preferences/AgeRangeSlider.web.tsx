import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "@/src/theme";

interface Props {
  minAge: number;
  maxAge: number;
  onChange: (values: number[]) => void;
  min?: number;
  max?: number;
}

export default function AgeRangeSlider({ minAge, maxAge, onChange, min = 18, max = 70 }: Props) {
  const ACCENT_PINK = theme.colors.amihan?.[500] ?? "#EF3E78";

  // For web, a simple native multi-thumb slider is complex without heavy libraries.
  // We'll provide two native HTML range inputs side-by-side or stacked, 
  // styled with Tailwind/CSS, or simple native DOM elements wrapped in View.

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (val <= maxAge) {
      onChange([val, maxAge]);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (val >= minAge) {
      onChange([minAge, val]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.valueRow}>
        <View style={styles.valueBox}>
          <Text style={styles.label}>Min Age</Text>
          <Text style={styles.value}>{minAge}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.valueBox}>
          <Text style={styles.label}>Max Age</Text>
          <Text style={styles.value}>{maxAge}</Text>
        </View>
      </View>

      <View style={styles.slidersContainer}>
        {/* We use standard HTML input type="range" on web */}
        <View style={styles.sliderWrapper}>
          <Text style={styles.sliderLabel}>Min: {minAge}</Text>
          <input 
            type="range" 
            min={min} 
            max={max} 
            value={minAge} 
            onChange={handleMinChange}
            style={{ width: "100%", accentColor: ACCENT_PINK, cursor: "pointer" }}
          />
        </View>
        <View style={styles.sliderWrapper}>
          <Text style={styles.sliderLabel}>Max: {maxAge}</Text>
          <input 
            type="range" 
            min={min} 
            max={max} 
            value={maxAge} 
            onChange={handleMaxChange}
            style={{ width: "100%", accentColor: ACCENT_PINK, cursor: "pointer" }}
          />
        </View>
      </View>

      <View style={styles.labels}>
        <Text style={styles.labelText}>{min}</Text>
        <Text style={styles.labelText}>{max}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  valueRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  valueBox: { flex: 1, alignItems: "center" },
  label: { fontSize: 13, color: "rgba(255,255,255,0.75)", marginBottom: 6, fontFamily: theme.fontFamilies.body.medium },
  value: { fontSize: 26, color: theme.colors.neutral.white, fontFamily: theme.fontFamilies.body.bold },
  divider: { width: 1, height: 40, backgroundColor: "rgba(255,255,255,0.15)" },
  slidersContainer: { marginVertical: 10, gap: 12 },
  sliderWrapper: { flexDirection: "row", alignItems: "center", gap: 12 },
  sliderLabel: { color: "rgba(255,255,255,0.8)", width: 60, fontSize: 14, fontFamily: theme.fontFamilies.body.medium },
  labels: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  labelText: { fontSize: 13, color: "rgba(255,255,255,0.6)" },
});
