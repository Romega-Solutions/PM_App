import { lightColors, darkColors, getSemanticColors } from '../colors';
import { withAlpha } from '../colorUtils';
import { textStyles, lineHeightFor } from '../typography';

// ── WCAG 2.x relative-contrast helpers ───────────────────────────────────────
const srgb = (c: number) => {
  const x = c / 255;
  return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
};
const luminance = (hex: string) => {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
};
const contrast = (fg: string, bg: string) => {
  const a = luminance(fg);
  const b = luminance(bg);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
};

describe('theme color tokens', () => {
  it('light and dark expose exactly the same semantic keys', () => {
    expect(Object.keys(darkColors).sort()).toEqual(Object.keys(lightColors).sort());
  });

  it('getSemanticColors selects the right palette', () => {
    expect(getSemanticColors('light')).toBe(lightColors);
    expect(getSemanticColors('dark')).toBe(darkColors);
  });

  it.each([
    ['light', lightColors],
    ['dark', darkColors],
  ] as const)('%s palette meets WCAG contrast floors', (_scheme, c) => {
    // Body text — AA normal (4.5:1), comfortably AAA here
    expect(contrast(c.text, c.background)).toBeGreaterThanOrEqual(7);
    // Secondary text on surface — AA normal
    expect(contrast(c.textSecondary, c.surface)).toBeGreaterThanOrEqual(4.5);
    // Tertiary/placeholder on surface — UI minimum (3:1)
    expect(contrast(c.textTertiary, c.surface)).toBeGreaterThanOrEqual(3);
    // Interactive border edge on surface — WCAG 1.4.11 non-text (3:1)
    expect(contrast(c.borderStrong, c.surface)).toBeGreaterThanOrEqual(3);
    // Label on a primary fill — large/UI minimum (3:1)
    expect(contrast(c.onPrimary, c.primary)).toBeGreaterThanOrEqual(3);
  });
});

describe('theme color utilities', () => {
  it('appends a clamped alpha channel to 6-digit hex colors', () => {
    expect(withAlpha('#EF3E78', 0)).toBe('#EF3E7800');
    expect(withAlpha('#EF3E78', 0.5)).toBe('#EF3E7880');
    expect(withAlpha('#EF3E78', 1)).toBe('#EF3E78FF');
    expect(withAlpha('#EF3E78', -1)).toBe('#EF3E7800');
    expect(withAlpha('#EF3E78', 2)).toBe('#EF3E78FF');
  });

  it('expands 3-digit hex colors before appending alpha', () => {
    expect(withAlpha('#F3A', 0.25)).toBe('#FF33AA40');
  });
});

describe('theme typography', () => {
  it('lineHeightFor returns absolute points (not a ratio)', () => {
    expect(lineHeightFor(36, 1.1)).toBe(40);
    expect(lineHeightFor(16, 1.5)).toBe(24);
  });

  it('every text style has an absolute lineHeight ≥ its fontSize (RN-safe)', () => {
    for (const style of Object.values(textStyles)) {
      const s = style as { fontSize: number; lineHeight: number };
      expect(s.lineHeight).toBeGreaterThanOrEqual(s.fontSize); // guards the unitless-ratio bug
      expect(s.lineHeight).toBeGreaterThan(3); // a ratio like 1.1 would fail this
    }
  });
});
