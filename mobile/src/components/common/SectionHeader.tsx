import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Icon } from './Icon';

interface SectionHeaderProps {
  title: string;
  onActionPress?: () => void;
  actionLabel?: string;
  style?: ViewStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  onActionPress,
  actionLabel,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {onActionPress && (
        <TouchableOpacity
          onPress={onActionPress}
          activeOpacity={0.7}
          style={styles.action}
          accessibilityRole="button"
          accessibilityLabel={actionLabel || 'See all'}
        >
          <Text style={styles.actionText}>{actionLabel || 'See all'}</Text>
          <Icon name="chevron-right" size={16} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  title: {
    ...typography.sectionTitle,
    color: colors.text,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[1],
  },
  actionText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 2,
  },
});
