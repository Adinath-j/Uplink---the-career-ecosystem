import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, radii, spacing, typography } from '../../theme';
import { Icon, IconName } from './Icon';

interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  label,
  onPress,
  isLoading = false,
  disabled = false,
  icon,
  style,
  labelStyle,
  size = 'md',
}) => {
  const isDisabled = disabled || isLoading;

  const sizeStyle =
    size === 'sm'
      ? styles.sizeSm
      : size === 'lg'
      ? styles.sizeLg
      : styles.sizeMd;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.button,
        sizeStyle,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={colors.text} />
      ) : (
        <>
          {icon && (
            <Icon
              name={icon}
              size={18}
              color={colors.text}
              style={styles.icon}
            />
          )}
          <Text style={[styles.label, labelStyle]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeSm: {
    paddingVertical: spacing[1] + 2,
    paddingHorizontal: spacing[3],
  },
  sizeMd: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    minHeight: 44,
  },
  sizeLg: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    minHeight: 48,
  },
  label: {
    ...typography.button,
    color: colors.text,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    marginRight: spacing[2],
  },
});
