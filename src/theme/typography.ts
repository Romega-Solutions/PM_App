export const fontFamilies = {
  // Brand wordmark. The primary mark is the SVG/PNG logo (assets/logo*); text
  // wordmarks use the display serif (Lora). HelloParis was dropped — 2-font system.
  logo: {
    regular: 'Lora-Regular',
    medium: 'Lora-Medium',
    bold: 'Lora-Bold',
  },

  // Headers (Lora)
  header: {
    regular: 'Lora-Regular',
    italic: 'Lora-Italic',
    medium: 'Lora-Medium',
    mediumItalic: 'Lora-MediumItalic',
    semiBold: 'Lora-SemiBold',
    semiBoldItalic: 'Lora-SemiBoldItalic',
    bold: 'Lora-Bold',
    boldItalic: 'Lora-BoldItalic',
  },

  // Body / UI (DM Sans)
  body: {
    thin: 'DMSans-Thin',
    extraLight: 'DMSans-ExtraLight',
    light: 'DMSans-Light',
    regular: 'DMSans-Regular',
    medium: 'DMSans-Medium',
    semiBold: 'DMSans-SemiBold',
    bold: 'DMSans-Bold',
    extraBold: 'DMSans-ExtraBold',
    black: 'DMSans-Black',
  },
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

/**
 * Line-height RATIOS (relative). Do NOT pass these to a React Native `lineHeight`
 * style — RN reads `lineHeight` as absolute points, so `1.1` collapses the line box.
 * Use `lineHeightFor(size, ratio)` to get the absolute value (see textStyles below).
 */
export const lineHeights = {
  tight: 1.1,
  normal: 1.5,
  relaxed: 1.75,
} as const;

/** Convert a font size + ratio into an absolute line height (points) for RN. */
export const lineHeightFor = (size: number, ratio: number): number => Math.round(size * ratio);

// Pre-defined text styles. `lineHeight` is ABSOLUTE (points), per RN semantics.
export const textStyles = {
  // Logo
  logo: {
    fontFamily: fontFamilies.logo.bold,
    fontSize: fontSizes['3xl'],
    lineHeight: lineHeightFor(fontSizes['3xl'], 1.1),
    letterSpacing: 0.6,
  },

  // Headers
  h1: {
    fontFamily: fontFamilies.header.bold,
    fontSize: fontSizes['4xl'],
    lineHeight: lineHeightFor(fontSizes['4xl'], 1.1),
  },
  h2: {
    fontFamily: fontFamilies.header.semiBold,
    fontSize: fontSizes['3xl'],
    lineHeight: lineHeightFor(fontSizes['3xl'], 1.15),
  },
  h3: {
    fontFamily: fontFamilies.header.semiBold,
    fontSize: fontSizes['2xl'],
    lineHeight: lineHeightFor(fontSizes['2xl'], 1.2),
  },
  h4: {
    fontFamily: fontFamilies.header.semiBold,
    fontSize: fontSizes.xl,
    lineHeight: lineHeightFor(fontSizes.xl, 1.25),
  },
  h5: {
    fontFamily: fontFamilies.header.medium,
    fontSize: fontSizes.lg,
    lineHeight: lineHeightFor(fontSizes.lg, 1.3),
  },

  // Body
  bodyLarge: {
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.lg,
    lineHeight: lineHeightFor(fontSizes.lg, 1.5),
  },
  body: {
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.base,
    lineHeight: lineHeightFor(fontSizes.base, 1.5),
  },
  bodyBold: {
    fontFamily: fontFamilies.body.bold,
    fontSize: fontSizes.base,
    lineHeight: lineHeightFor(fontSizes.base, 1.5),
  },
  bodySmall: {
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.sm,
    lineHeight: lineHeightFor(fontSizes.sm, 1.5),
  },
  caption: {
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.sm,
    lineHeight: lineHeightFor(fontSizes.sm, 1.5),
  },

  // UI / controls
  button: {
    fontFamily: fontFamilies.body.semiBold,
    fontSize: fontSizes.base,
    lineHeight: lineHeightFor(fontSizes.base, 1.25),
    letterSpacing: 0.3,
  },
  label: {
    fontFamily: fontFamilies.body.medium,
    fontSize: fontSizes.sm,
    lineHeight: lineHeightFor(fontSizes.sm, 1.3),
    letterSpacing: 0.3,
  },
  input: {
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.base,
    lineHeight: lineHeightFor(fontSizes.base, 1.4),
  },
  overline: {
    fontFamily: fontFamilies.body.semiBold,
    fontSize: fontSizes.xs,
    lineHeight: lineHeightFor(fontSizes.xs, 1.4),
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
} as const;
