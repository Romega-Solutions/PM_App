export const touchTargets = {
  ios: 44,
  android: 48,
  material: 48,
} as const;

export const hitSlop = {
  sm: { top: 8, right: 8, bottom: 8, left: 8 },
  md: { top: 12, right: 12, bottom: 12, left: 12 },
  lg: { top: 16, right: 16, bottom: 16, left: 16 },
} as const;

export const componentSizes = {
  compactControl: 44,
  iconButton: 48,
  button: 56,
  input: 56,
  tabIconPillWidth: 56,
  tabIconPillHeight: 40,
  settingsRowMinHeight: 64,
} as const;

export const strokeWidths = {
  subtle: 1.75,
  default: 2,
  emphasis: 2.5,
  selected: 3,
} as const;

export const motion = {
  fast: 150,
  standard: 220,
  expressive: 280,
} as const;

export const interaction = {
  touchTargets,
  hitSlop,
  componentSizes,
  strokeWidths,
  motion,
} as const;
