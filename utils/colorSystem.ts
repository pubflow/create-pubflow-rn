/**
 * Professional Color System for Aula PML
 * Based on Material Design 3 and modern UI/UX principles
 * Generates a complete color palette from a base color
 */

// Utility functions for color manipulation
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Generate color variations
function generateColorVariations(baseColor: string) {
  const [h, s, l] = hexToHsl(baseColor);
  
  return {
    // Primary variations
    50: hslToHex(h, Math.max(s - 40, 10), Math.min(l + 45, 95)),
    100: hslToHex(h, Math.max(s - 30, 15), Math.min(l + 35, 90)),
    200: hslToHex(h, Math.max(s - 20, 20), Math.min(l + 25, 85)),
    300: hslToHex(h, Math.max(s - 10, 25), Math.min(l + 15, 80)),
    400: hslToHex(h, s, Math.min(l + 5, 75)),
    500: baseColor, // Base color
    600: hslToHex(h, Math.min(s + 5, 100), Math.max(l - 5, 25)),
    700: hslToHex(h, Math.min(s + 10, 100), Math.max(l - 15, 20)),
    800: hslToHex(h, Math.min(s + 15, 100), Math.max(l - 25, 15)),
    900: hslToHex(h, Math.min(s + 20, 100), Math.max(l - 35, 10)),
    950: hslToHex(h, Math.min(s + 25, 100), Math.max(l - 45, 5)),
  };
}

// Get the main color from environment or fallback
const getMainColor = (): string => {
  return process.env.EXPO_PUBLIC_MAIN_COLOR || '#c30000';
};

// Generate the complete color system
const mainColor = getMainColor();
const primaryVariations = generateColorVariations(mainColor);

// Professional color system following Material Design 3 principles
export const ColorSystem = {
  // Primary brand colors
  primary: {
    ...primaryVariations,
    DEFAULT: primaryVariations[500],
    light: primaryVariations[400],
    dark: primaryVariations[600],
  },

  // Secondary colors (complementary)
  secondary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
    DEFAULT: '#0ea5e9',
  },

  // Neutral colors for backgrounds and text
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
    DEFAULT: '#737373',
  },

  // Semantic colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
    DEFAULT: '#22c55e',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
    DEFAULT: '#f59e0b',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
    DEFAULT: '#ef4444',
  },

  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
    DEFAULT: '#3b82f6',
  },

  // Surface colors for cards, modals, etc.
  surface: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    elevated: '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.5)',
    glass: 'rgba(255, 255, 255, 0.1)',
  },

  // Text colors
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    tertiary: '#94a3b8',
    inverse: '#ffffff',
    disabled: '#cbd5e1',
    placeholder: '#94a3b8',
  },

  // Border colors
  border: {
    primary: '#e2e8f0',
    secondary: '#cbd5e1',
    focus: primaryVariations[500],
    error: '#ef4444',
    success: '#22c55e',
  },

  // Shadow colors
  shadow: {
    sm: 'rgba(0, 0, 0, 0.05)',
    md: 'rgba(0, 0, 0, 0.1)',
    lg: 'rgba(0, 0, 0, 0.15)',
    xl: 'rgba(0, 0, 0, 0.2)',
    primary: `${primaryVariations[500]}20`, // 20% opacity
  },
};

// Utility functions for common color operations
export const ColorUtils = {
  // Get color with opacity
  withOpacity: (color: string, opacity: number): string => {
    const opacityHex = Math.round(opacity * 255).toString(16).padStart(2, '0');
    return `${color}${opacityHex}`;
  },

  // Get contrasting text color
  getContrastText: (backgroundColor: string): string => {
    const [, , l] = hexToHsl(backgroundColor);
    return l > 50 ? ColorSystem.text.primary : ColorSystem.text.inverse;
  },

  // Generate gradient
  gradient: (from: string, to: string, direction: string = 'to right'): string => {
    return `linear-gradient(${direction}, ${from}, ${to})`;
  },

  // Get elevation shadow
  getElevation: (level: 1 | 2 | 3 | 4 | 5): string => {
    const shadows = {
      1: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
      2: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
      3: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
      4: '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)',
      5: '0 19px 38px rgba(0, 0, 0, 0.30), 0 15px 12px rgba(0, 0, 0, 0.22)',
    };
    return shadows[level];
  },
};

// Export the main color for backward compatibility
export const MAIN_COLOR = mainColor;

// Export commonly used colors for quick access
export const COLORS = {
  primary: ColorSystem.primary.DEFAULT,
  primaryLight: ColorSystem.primary.light,
  primaryDark: ColorSystem.primary.dark,
  secondary: ColorSystem.secondary.DEFAULT,
  success: ColorSystem.success.DEFAULT,
  warning: ColorSystem.warning.DEFAULT,
  error: ColorSystem.error.DEFAULT,
  info: ColorSystem.info.DEFAULT,
  background: ColorSystem.surface.primary,
  surface: ColorSystem.surface.secondary,
  textPrimary: ColorSystem.text.primary,
  textSecondary: ColorSystem.text.secondary,
  textTertiary: ColorSystem.text.tertiary,
  textInverse: ColorSystem.text.inverse,
  border: ColorSystem.border.primary,
  white: ColorSystem.surface.primary,
};
