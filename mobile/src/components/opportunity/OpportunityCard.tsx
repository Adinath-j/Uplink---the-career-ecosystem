import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Opportunity } from '../../types/models';
import { colors, radii, spacing, typography } from '../../theme';
import { StatusBadge } from '../common/StatusBadge';
import { Icon } from '../common/Icon';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onPress: () => void;
  style?: ViewStyle;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Featured: ${opportunity.title}`}
      style={[styles.card, style]}
    >
      <View style={styles.headerRow}>
        <StatusBadge label={opportunity.type} variant="primary" />
        <Text style={styles.workMode}>{opportunity.workMode}</Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {opportunity.title}
      </Text>

      <Text style={styles.org} numberOfLines={1}>
        {opportunity.organization}
      </Text>

      <View style={styles.footer}>
        <View style={styles.skillsRow}>
          {opportunity.requiredSkills.slice(0, 2).map((skill) => (
            <View key={skill} style={styles.skillPill}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
          {opportunity.requiredSkills.length > 2 && (
            <Text style={styles.moreSkillsText}>
              +{opportunity.requiredSkills.length - 2}
            </Text>
          )}
        </View>

        <Icon name="chevron-right" size={16} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 260,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing[3],
    marginRight: spacing[3],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  workMode: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  title: {
    ...typography.cardTitle,
    color: colors.text,
    marginBottom: 2,
    minHeight: 40,
  },
  org: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing[3],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  skillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  skillPill: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  skillText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
  },
  moreSkillsText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
  },
});
