import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Opportunity } from '../../types/models';
import { colors, spacing, typography } from '../../theme';
import { Icon } from '../common/Icon';
import { StatusBadge } from '../common/StatusBadge';
import { usePreferencesStore } from '../../store/preferencesStore';

interface OpportunityListItemProps {
  opportunity: Opportunity;
  onPress: () => void;
  style?: ViewStyle;
}

export const OpportunityListItem: React.FC<OpportunityListItemProps> = ({
  opportunity,
  onPress,
  style,
}) => {
  const { isBookmarked, toggleBookmark } = usePreferencesStore();
  const bookmarked = isBookmarked(opportunity.id);

  const formatDeadline = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${opportunity.title} at ${opportunity.organization}`}
      style={[styles.container, style]}
    >
      <View style={styles.topRow}>
        <View style={styles.badgeGroup}>
          <StatusBadge label={opportunity.type} variant="neutral" />
          <Text style={styles.workModeText}>• {opportunity.workMode}</Text>
          {opportunity.isVerified && (
            <View style={styles.verifiedTag}>
              <Icon name="check-circle" size={13} color={colors.primary} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={() => toggleBookmark(opportunity.id)}
          accessibilityRole="button"
          accessibilityLabel={bookmarked ? 'Remove bookmark' : 'Bookmark opportunity'}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.bookmarkBtn}
        >
          <Icon
            name={bookmarked ? 'bookmark-fill' : 'bookmark'}
            size={18}
            color={bookmarked ? colors.primary : colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {opportunity.title}
      </Text>

      <Text style={styles.organization} numberOfLines={1}>
        {opportunity.organization} • {opportunity.location}
      </Text>

      <View style={styles.footerRow}>
        {opportunity.stipendOrSalary ? (
          <Text style={styles.compensation} numberOfLines={1}>
            {opportunity.stipendOrSalary}
          </Text>
        ) : (
          <View />
        )}

        <View style={styles.deadlineContainer}>
          <Icon name="clock" size={13} color={colors.textMuted} />
          <Text style={styles.deadlineText}>
            Deadline: {formatDeadline(opportunity.deadline)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[1],
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  workModeText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: spacing[1],
  },
  verifiedText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  bookmarkBtn: {
    padding: spacing[1],
  },
  title: {
    ...typography.cardTitle,
    color: colors.text,
    marginBottom: 2,
  },
  organization: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing[2],
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compensation: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.primary,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deadlineText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
