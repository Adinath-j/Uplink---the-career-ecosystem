/**
 * UPLINK Design System - Color Tokens
 * Source of truth: docs/DESIGN_SYSTEM.md
 */

export const colors = {
  primary: '#135BEC',
  primaryPressed: '#104BC2',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceMuted: '#F7F9FC',
  text: '#111827',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E5E7EB',
  borderLight: '#F1F5F9',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  info: '#2563EB',

  // Subtle tints for badges and highlights
  primarySoft: '#EFF6FF',
  successSoft: '#F0FDF4',
  warningSoft: '#FFFBEB',
  dangerSoft: '#FEF2F2',
  infoSoft: '#EFF6FF',
} as const;

export type ColorToken = keyof typeof colors;
