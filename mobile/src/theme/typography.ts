import { TextStyle } from 'react-native';
import { colors } from './colors';

/**
 * UPLINK Design System - Typography Tokens
 * Source of truth: docs/DESIGN_SYSTEM.md
 */

export const typography: Record<string, TextStyle> = {
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.1,
    lineHeight: 20,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 20,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 18,
  },
  button: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
    lineHeight: 14,
  },
};
