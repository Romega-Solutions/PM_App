import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { useAppTheme, makeStyles } from "@/src/theme";

interface Props {
  minAge: number;
  maxAge: number;
  onChange: (values: number[]) => void;
  min?: number;
  max?: number;
}

export default function AgeRangeSlider({ minAge, maxAge, onChange, min = 18, max = 70 }: Props) {
  const theme = useAppTheme();
  const styles = useStyles();

  const ACCENT_PINK = theme.colors.amihan?.[500] ?? "#EF3E78";

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

      <View style={styles.sliderWrap}>
        <MultiSlider
          values={[minAge, maxAge]}
          min={min}
          max={max}
          step={1}
          onValuesChange={onChange}
          selectedStyle={{ backgroundColor: ACCENT_PINK }}
          unselectedStyle={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          markerStyle={{ backgroundColor: ACCENT_PINK, height: 24, width: 24 }}
          pressedMarkerStyle={{ backgroundColor: ACCENT_PINK, height: 28, width: 28 }}
          sliderLength={280}
          containerStyle={{ alignSelf: "center" }}
        />
      </View>

      <View style={styles.labels}>
        <Text style={styles.labelText}>{min}</Text>
        <Text style={styles.labelText}>{max}</Text>
      </View>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
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
  sliderWrap: { marginVertical: 10 },
  labels: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  labelText: { fontSize: 13, color: "rgba(255,255,255,0.6)" },
}));