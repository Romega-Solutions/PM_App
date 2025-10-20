export const fontFamilies = {
  // Logo / Brand
  logo: {
    extraLight: 'HelloParis-ExtraLight',
    light: 'HelloParis-Light',
    regular: 'HelloParis-Regular',
    medium: 'HelloParis-Medium',
    bold: 'HelloParis-Bold',
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

export const lineHeights = {
  tight: 1.1,
  normal: 1.5,
  relaxed: 1.75,
} as const;

// Pre-defined text styles
export const textStyles = {
  // Logo
  logo: {
    fontFamily: fontFamilies.logo.bold,
    fontSize: fontSizes['3xl'],
    letterSpacing: 0.6,
  },
  
  // Headers
  h1: {
    fontFamily: fontFamilies.header.bold,
    fontSize: fontSizes['4xl'],
    lineHeight: lineHeights.tight,
  },
  h2: {
    fontFamily: fontFamilies.header.semiBold,
    fontSize: fontSizes['3xl'],
    lineHeight: lineHeights.tight,
  },
  h3: {
    fontFamily: fontFamilies.header.semiBold,
    fontSize: fontSizes['2xl'],
    lineHeight: lineHeights.tight,
  },
  
  // Body
  body: {
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.normal,
  },
  bodyBold: {
    fontFamily: fontFamilies.body.bold,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.normal,
  },
  caption: {
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.normal,
  },
} as const;