import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { radii, spacing, typography, useTheme } from '../../theme';

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
  const { colors } = useTheme();

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
            style={[
              styles.chip,
              {
                backgroundColor: isSelected ? colors.primarySoft : colors.surfaceMuted,
                borderColor: isSelected ? colors.primary : colors.border,
              },
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.label,
                { color: isSelected ? colors.primary : colors.textSecondary },
                isSelected && styles.labelSelected,
              ]}
            >
              {label}
            </Text>
            {count !== undefined && (
              <Text
                style={[
                  styles.count,
                  { color: isSelected ? colors.primary : colors.textMuted },
                ]}
              >
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
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
  labelSelected: {
    fontWeight: '600',
  },
  count: {
    ...typography.caption,
    marginLeft: spacing[1],
  },
});
