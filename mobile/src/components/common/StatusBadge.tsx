import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { radii, spacing, typography, useTheme } from '../../theme';

export type StatusVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral';

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'default',
  style,
}) => {
  const { colors, isDark } = useTheme();

  const getColors = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: colors.primarySoft,
          text: colors.primary,
          border: isDark ? 'rgba(59, 130, 246, 0.4)' : '#BFDBFE',
        };
      case 'success':
        return {
          bg: colors.successSoft,
          text: colors.success,
          border: isDark ? 'rgba(34, 197, 94, 0.4)' : '#BBF7D0',
        };
      case 'warning':
        return {
          bg: colors.warningSoft,
          text: colors.warning,
          border: isDark ? 'rgba(245, 158, 11, 0.4)' : '#FDE68A',
        };
      case 'danger':
        return {
          bg: colors.dangerSoft,
          text: colors.danger,
          border: isDark ? 'rgba(239, 68, 68, 0.4)' : '#FECACA',
        };
      case 'neutral':
      default:
        return {
          bg: colors.badgeBg,
          text: colors.badgeText,
          border: colors.border,
        };
    }
  };

  const scheme = getColors();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: scheme.bg,
          borderColor: scheme.border,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: scheme.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 2,
    paddingHorizontal: spacing[2],
    borderRadius: radii.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.caption,
    fontWeight: '600',
  },
});
