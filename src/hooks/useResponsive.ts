import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const designWidth = Math.min(Math.max(width, 320), 430);

    /**
     * Linearly scales the size based on the screen width relative to a base width of 375 (iPhone X/11 Pro).
     */
    const scale = (size: number) => (designWidth / 375) * size;

    /**
     * Linearly scales the size but dampened by a factor (default 0.5) to avoid over-scaling on larger devices like tablets.
     */
    const moderateScale = (size: number, factor = 0.5) =>
      size + (scale(size) - size) * factor;

    return { scale, moderateScale, screenWidth: width, screenHeight: height };
  }, [width, height]);
}
