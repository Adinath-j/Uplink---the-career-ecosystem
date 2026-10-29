import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, radii, spacing, typography } from '../../theme';
import { Icon } from './Icon';

interface SearchFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  onFilterPress?: () => void;
  hasActiveFilters?: boolean;
  style?: ViewStyle;
}

export const SearchField: React.FC<SearchFieldProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  onClear,
  onFilterPress,
  hasActiveFilters = false,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Icon name="search" size={18} color={colors.textSecondary} style={styles.searchIcon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            onChangeText('');
            onClear?.();
          }}
          accessibilityLabel="Clear search input"
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.actionBtn}
        >
          <Icon name="close" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
      {onFilterPress && (
        <TouchableOpacity
          onPress={onFilterPress}
          accessibilityLabel="Open filters"
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={[styles.actionBtn, hasActiveFilters && styles.activeFilterBtn]}
        >
          <Icon
            name="filter"
            size={18}
            color={hasActiveFilters ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing[3],
    height: 44,
  },
  searchIcon: {
    marginRight: spacing[2],
  },
  input: {
    flex: 1,
    ...typography.body,
    paddingVertical: 0,
    color: colors.text,
  },
  actionBtn: {
    padding: spacing[1],
    marginLeft: spacing[1],
  },
  activeFilterBtn: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.sm,
  },
});
