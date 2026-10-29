import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii, spacing, typography } from '../../theme';
import { Icon } from '../common/Icon';

interface SameDoubtButtonProps {
  count: number;
  hasUserMarked: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export const SameDoubtButton: React.FC<SameDoubtButtonProps> = ({
  count,
  hasUserMarked,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`I have the same doubt, currently ${count} students`}
      accessibilityState={{ selected: hasUserMarked }}
      style={[styles.button, hasUserMarked && styles.buttonActive, style]}
    >
      <Icon
        name="help-circle"
        size={14}
        color={hasUserMarked ? colors.primary : colors.textSecondary}
      />
      <Text style={[styles.text, hasUserMarked && styles.textActive]}>
        Same Doubt {count > 0 ? `(${count})` : ''}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[1] + 1,
    paddingHorizontal: spacing[2] + 2,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  buttonActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  text: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  textActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
