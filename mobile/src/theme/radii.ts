/**
 * UPLINK Design System - Border Radii Tokens
 * Source of truth: docs/DESIGN_SYSTEM.md
 */

export const radii = {
  none: 0,
  sm: 6,      // Small chips, subtle inputs
  md: 8,      // Standard inputs, buttons, chips
  lg: 10,     // Cards, list containers
  xl: 14,     // Modals, sheets
  full: 9999, // Circular avatars, pills where appropriate
} as const;

export type RadiusToken = keyof typeof radii;
