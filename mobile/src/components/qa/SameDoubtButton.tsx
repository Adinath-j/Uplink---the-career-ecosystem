import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { radii, spacing, typography, useTheme } from '../../theme';
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
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`I have the same doubt, currently ${count} students`}
      accessibilityState={{ selected: hasUserMarked }}
      style={[
        styles.button,
        {
          backgroundColor: hasUserMarked ? colors.primarySoft : colors.surfaceMuted,
          borderColor: hasUserMarked ? colors.primary : colors.border,
        },
        style,
      ]}
    >
      <Icon
        name="help-circle"
        size={14}
        color={hasUserMarked ? colors.primary : colors.textSecondary}
      />
      <Text
        style={[
          styles.text,
          { color: hasUserMarked ? colors.primary : colors.textSecondary },
          hasUserMarked && styles.textActive,
        ]}
      >
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
    borderWidth: 1,
    gap: 4,
  },
  text: {
    ...typography.caption,
    fontWeight: '500',
  },
  textActive: {
    fontWeight: '600',
  },
});
