/**
 * UPLINK Design System - Color Tokens
 * Supports strongly-typed Light and Dark palettes.
 */

export interface ColorPalette {
  primary: string;
  primaryPressed: string;
  primarySoft: string;
  background: string;
  surface: string;
  surfaceMuted: string;
  surfaceElevated: string;
  card: string;
  text: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  border: string;
  borderLight: string;
  divider: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;
  badgeBg: string;
  badgeText: string;
  bubbleSent: string;
  bubbleSentText: string;
  bubbleReceived: string;
  bubbleReceivedText: string;
  inputBg: string;
  inputBorder: string;
  placeholder: string;
}

export const lightColors: ColorPalette = {
  primary: '#2563EB',
  primaryPressed: '#1D4ED8',
  primarySoft: '#EFF6FF',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  surfaceElevated: '#FFFFFF',
  card: '#FFFFFF',
  text: '#0F172A',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  textInverse: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  divider: '#F1F5F9',
  success: '#16A34A',
  successSoft: '#F0FDF4',
  warning: '#D97706',
  warningSoft: '#FFFBEB',
  danger: '#DC2626',
  dangerSoft: '#FEF2F2',
  info: '#2563EB',
  infoSoft: '#EFF6FF',
  badgeBg: '#F1F5F9',
  badgeText: '#475569',
  bubbleSent: '#2563EB',
  bubbleSentText: '#FFFFFF',
  bubbleReceived: '#F1F5F9',
  bubbleReceivedText: '#0F172A',
  inputBg: '#FFFFFF',
  inputBorder: '#E2E8F0',
  placeholder: '#94A3B8',
};

export const darkColors: ColorPalette = {
  primary: '#3B82F6',
  primaryPressed: '#2563EB',
  primarySoft: '#1E3A8A',
  background: '#090D16',
  surface: '#111827',
  surfaceMuted: '#1E293B',
  surfaceElevated: '#1E293B',
  card: '#131B2E',
  text: '#F8FAFC',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#090D16',
  border: '#1E293B',
  borderLight: '#1F2937',
  divider: '#1E293B',
  success: '#22C55E',
  successSoft: '#064E3B',
  warning: '#F59E0B',
  warningSoft: '#78350F',
  danger: '#EF4444',
  dangerSoft: '#7F1D1D',
  info: '#38BDF8',
  infoSoft: '#082F49',
  badgeBg: '#1E293B',
  badgeText: '#94A3B8',
  bubbleSent: '#3B82F6',
  bubbleSentText: '#FFFFFF',
  bubbleReceived: '#1E293B',
  bubbleReceivedText: '#F8FAFC',
  inputBg: '#111827',
  inputBorder: '#1E293B',
  placeholder: '#64748B',
};

// Static default export for backward compatibility
export const colors: ColorPalette = lightColors;

export type ColorToken = keyof ColorPalette;
