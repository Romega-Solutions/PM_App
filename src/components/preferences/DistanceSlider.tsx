import React from "react";
import { View, Text } from "react-native";
import Slider from "@react-native-community/slider";
import { useAppTheme, makeStyles } from "@/src/theme";

interface Props {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export default function DistanceSlider({ value, onChange, min = 10, max = 200, step = 10 }: Props) {
  const theme = useAppTheme();
  const styles = useStyles();

  const ACCENT_PINK = theme.colors.amihan?.[500] ?? "#EF3E78";

  return (
    <View style={styles.container}>
      <View style={styles.valueBox}>
        <Text style={styles.valueText}>{value} km</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={ACCENT_PINK}
        maximumTrackTintColor="rgba(255,255,255,0.2)"
        thumbTintColor={ACCENT_PINK}
      />
      <View style={styles.labels}>
        <Text style={styles.labelText}>{min}km</Text>
        <Text style={styles.labelText}>{max}km</Text>
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
  valueBox: {
    alignItems: "center",
    marginBottom: 12,
  },
  valueText: {
    fontSize: 24,
    fontFamily: theme.fontFamilies.body.bold,
    color: theme.colors.neutral.white,
  },
  slider: { width: "100%", height: 40 },
  labels: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  labelText: { fontSize: 13, color: "rgba(255,255,255,0.6)" },
}));
