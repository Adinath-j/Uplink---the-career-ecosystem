import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Question } from '../../types/models';
import { colors, radii, spacing, typography } from '../../theme';
import { SameDoubtButton } from './SameDoubtButton';
import { Icon } from '../common/Icon';
import { useQAStore } from '../../store/qaStore';

interface QuestionListItemProps {
  question: Question;
  onPress: () => void;
  style?: ViewStyle;
}

export const QuestionListItem: React.FC<QuestionListItemProps> = ({
  question,
  onPress,
  style,
}) => {
  const { toggleSameDoubt } = useQAStore();

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return dateStr;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Question: ${question.title}`}
      style={[styles.container, style]}
    >
      <View style={styles.authorRow}>
        <Text style={styles.authorName}>{question.authorName}</Text>
        <Text style={styles.authorContext}>• {question.authorAcademicContext}</Text>
        <Text style={styles.timestamp}>• {formatTimestamp(question.createdAt)}</Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {question.title}
      </Text>

      <Text style={styles.preview} numberOfLines={2}>
        {question.description}
      </Text>

      <View style={styles.topicsRow}>
        {question.topicTags.map((tag) => (
          <View key={tag} style={styles.topicBadge}>
            <Text style={styles.topicText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actionsRow}>
        <SameDoubtButton
          count={question.sameDoubtCount}
          hasUserMarked={question.hasUserMarkedSameDoubt}
          onPress={() => toggleSameDoubt(question.id)}
        />

        <View style={styles.answerCount}>
          <Icon name="help-circle" size={14} color={colors.textSecondary} />
          <Text style={styles.answerCountText}>
            {question.answerCount} {question.answerCount === 1 ? 'answer' : 'answers'}
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
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[1],
    flexWrap: 'wrap',
    gap: 4,
  },
  authorName: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text,
  },
  authorContext: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  timestamp: {
    ...typography.caption,
    color: colors.textMuted,
  },
  title: {
    ...typography.cardTitle,
    color: colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  preview: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing[2],
    lineHeight: 18,
  },
  topicsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing[2],
  },
  topicBadge: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topicText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[1],
  },
  answerCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  answerCountText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
