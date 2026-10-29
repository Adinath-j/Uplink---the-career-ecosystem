import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii, spacing, typography } from '../../theme';

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
  const getColors = () => {
    switch (variant) {
      case 'primary':
        return { bg: colors.primarySoft, text: colors.primary, border: '#BFDBFE' };
      case 'success':
        return { bg: colors.successSoft, text: colors.success, border: '#BBF7D0' };
      case 'warning':
        return { bg: colors.warningSoft, text: colors.warning, border: '#FDE68A' };
      case 'danger':
        return { bg: colors.dangerSoft, text: colors.danger, border: '#FECACA' };
      case 'neutral':
      default:
        return { bg: colors.surfaceMuted, text: colors.textSecondary, border: colors.border };
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
