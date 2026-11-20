/**
 * UPLINK Unified Theme
 */

import { colors, lightColors, darkColors } from './colors';
import type { ColorPalette, ColorToken } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radii } from './radii';
import { ThemeProvider, useTheme, useThemedStyles, THEME_STORAGE_KEY } from './ThemeContext';
import type { ThemeMode } from './ThemeContext';

export const theme = {
  colors,
  typography,
  spacing,
  radii,
} as const;

export type Theme = typeof theme;

export {
  colors,
  lightColors,
  darkColors,
  typography,
  spacing,
  radii,
  ThemeProvider,
  useTheme,
  useThemedStyles,
  THEME_STORAGE_KEY,
};

export type { ColorPalette, ColorToken, ThemeMode };
