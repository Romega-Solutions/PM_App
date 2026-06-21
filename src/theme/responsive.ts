import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

/**
 * Linearly scales the size based on the screen width relative to a base width of 375 (iPhone X/11 Pro).
 */
export const scale = (size: number) => (width / 375) * size;

/**
 * Linearly scales the size but dampened by a factor (default 0.5) to avoid over-scaling on larger devices like tablets.
 */
export const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;
