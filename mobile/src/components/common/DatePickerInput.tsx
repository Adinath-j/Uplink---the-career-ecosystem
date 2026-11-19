import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors, radii, spacing } from '../../theme';
import { Icon } from './Icon';
import { formatFriendlyDate } from './CalendarDatePickerModal';

interface DatePickerInputProps {
  label?: string;
  value?: string; // ISO "YYYY-MM-DD"
  placeholder?: string;
  disabled?: boolean;
  onPress: () => void;
  onClear?: () => void;
  style?: StyleProp<ViewStyle>;
  error?: string;
}

export const DatePickerInput: React.FC<DatePickerInputProps> = ({
  label,
  value,
  placeholder = 'Select date...',
  disabled = false,
  onPress,
  onClear,
  style,
  error,
}) => {
  const handlePress = () => {
    Keyboard.dismiss();
    if (!disabled) {
      onPress();
    }
  };

  const displayText = value ? formatFriendlyDate(value) : '';

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
        style={[
          styles.field,
          !displayText && styles.fieldPlaceholder,
          error ? styles.fieldError : undefined,
          disabled ? styles.fieldDisabled : undefined,
        ]}
      >
        <View style={styles.leftContent}>
          <Icon
            name="calendar"
            size={18}
            color={displayText ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              styles.text,
              !displayText ? styles.placeholderText : styles.valueText,
            ]}
            numberOfLines={1}
          >
            {displayText || placeholder}
          </Text>
        </View>

        {Boolean(value && onClear && !disabled) && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onClear?.();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.clearBtn}
          >
            <Icon name="close" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing[1],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: radii.sm,
    paddingHorizontal: spacing[3],
    height: 48,
  },
  fieldPlaceholder: {
    borderColor: '#E2E8F0',
  },
  fieldError: {
    borderColor: colors.danger,
  },
  fieldDisabled: {
    opacity: 0.6,
    backgroundColor: '#F1F5F9',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
  placeholderText: {
    color: colors.textMuted,
  },
  valueText: {
    color: colors.text,
    fontWeight: '600',
  },
  clearBtn: {
    padding: 4,
  },
  errorText: {
    fontSize: 11,
    color: colors.danger,
    marginTop: 4,
  },
});
