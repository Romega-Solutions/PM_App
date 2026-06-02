const normalizeHex = (hex: string): string => {
  const raw = hex.replace("#", "").trim();

  if (/^[0-9A-Fa-f]{3}$/.test(raw)) {
    return raw
      .split("")
      .map((char) => char + char)
      .join("")
      .toUpperCase();
  }

  if (/^[0-9A-Fa-f]{6}$/.test(raw)) {
    return raw.toUpperCase();
  }

  throw new Error(`Expected a 3- or 6-digit hex color, received "${hex}"`);
};

export const withAlpha = (hex: string, alpha: number): string => {
  const normalizedAlpha = Math.min(1, Math.max(0, alpha));
  const alphaHex = Math.round(normalizedAlpha * 255)
    .toString(16)
    .padStart(2, "0")
    .toUpperCase();

  return `#${normalizeHex(hex)}${alphaHex}`;
};
