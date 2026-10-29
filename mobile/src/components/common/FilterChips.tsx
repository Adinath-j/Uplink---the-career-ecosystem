import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, radii, spacing, typography } from '../../theme';

interface FilterChipItem<T extends string> {
  id: T;
  label: string;
  count?: number;
}

interface FilterChipsProps<T extends string> {
  items: (FilterChipItem<T> | T)[];
  selectedId: T;
  onSelect: (id: T) => void;
  style?: ViewStyle;
}

export function FilterChips<T extends string>({
  items,
  selectedId,
  onSelect,
  style,
}: FilterChipsProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContent, style]}
    >
      {items.map((item) => {
        const id = typeof item === 'string' ? item : item.id;
        const label = typeof item === 'string' ? item : item.label;
        const count = typeof item === 'object' ? item.count : undefined;
        const isSelected = selectedId === id;

        return (
          <TouchableOpacity
            key={id}
            onPress={() => onSelect(id)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            style={[styles.chip, isSelected && styles.chipSelected]}
            activeOpacity={0.7}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {label}
            </Text>
            {count !== undefined && (
              <Text style={[styles.count, isSelected && styles.countSelected]}>
                {count}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  chip: {
    paddingVertical: spacing[1] + 2,
    paddingHorizontal: spacing[3],
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  labelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  count: {
    ...typography.caption,
    color: colors.textMuted,
    marginLeft: spacing[1],
  },
  countSelected: {
    color: colors.primary,
  },
});
