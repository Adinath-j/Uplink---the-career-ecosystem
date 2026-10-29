/**
 * UPLINK Unified Theme
 */

import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radii } from './radii';

export const theme = {
  colors,
  typography,
  spacing,
  radii,
} as const;

export type Theme = typeof theme;

export { colors, typography, spacing, radii };
