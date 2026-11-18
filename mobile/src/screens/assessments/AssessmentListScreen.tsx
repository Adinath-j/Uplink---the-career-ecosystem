import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors, radii, spacing, typography } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Icon } from '../../components/common/Icon';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { useAssessmentStore } from '../../store/assessmentStore';
import { BackendAssessment } from '../../services/assessmentService';

type Props = NativeStackScreenProps<RootStackParamList, 'AssessmentList'>;

export const AssessmentListScreen: React.FC<Props> = ({ navigation }) => {
  const {
    assessments,
    myAttempts,
    isLoadingAssessments,
    error,
    fetchAssessments,
    fetchMyAttempts,
  } = useAssessmentStore();

  useEffect(() => {
    fetchAssessments();
    fetchMyAttempts();
  }, [fetchAssessments, fetchMyAttempts]);

  const onRefresh = useCallback(async () => {
    await Promise.all([fetchAssessments(), fetchMyAttempts()]);
  }, [fetchAssessments, fetchMyAttempts]);

  const renderAssessmentItem = ({ item }: { item: BackendAssessment }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate('Quiz', {
            assessmentId: item.id,
            title: item.title,
          })
        }
      >
        <View style={styles.cardHeader}>
          <StatusBadge
            label={item.category || 'Technical Skill'}
            variant="primary"
          />
          <View style={styles.durationRow}>
            <Icon name="clock" size={14} color={colors.textSecondary} />
            <Text style={styles.durationText}>
              {item.durationMinutes || 20} mins
            </Text>
          </View>
        </View>

        <Text style={styles.cardTitle}>{item.title}</Text>
        {item.description ? (
          <Text style={styles.cardDesc} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        <View style={styles.cardFooter}>
          <Text style={styles.questionsInfo}>
            {item.questions ? item.questions.length : 4} Questions • Automated Scoring
          </Text>
          <View style={styles.startRow}>
            <Text style={styles.startText}>Start Test</Text>
            <Icon name="chevron-right" size={16} color={colors.primary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Skill Assessments"
        onBackPress={() => navigation.goBack()}
      />

      {isLoadingAssessments && assessments.length === 0 ? (
        <LoadingState message="Loading skill assessments..." />
      ) : error && assessments.length === 0 ? (
        <ErrorState message={error} onRetry={fetchAssessments} />
      ) : assessments.length === 0 ? (
        <EmptyState
          title="No Active Assessments"
          description="Assessments will appear here once published by college admins and recruiters."
          icon="award"
          actionLabel="Refresh Assessments"
          onActionPress={fetchAssessments}
        />
      ) : (
        <FlatList
          data={assessments}
          keyExtractor={(item) => item.id}
          renderItem={renderAssessmentItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoadingAssessments}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            myAttempts.length > 0 ? (
              <View style={styles.attemptsSection}>
                <Text style={styles.sectionTitle}>Recent Attempts</Text>
                {myAttempts.slice(0, 2).map((att) => (
                  <View key={att.id} style={styles.attemptCard}>
                    <Text style={styles.attemptTitle}>
                      {att.assessment?.title || 'Skill Test'}
                    </Text>
                    <View style={styles.scoreRow}>
                      <Text style={styles.scoreText}>
                        Score: {att.score}/{att.totalMarks} ({att.percentage}%)
                      </Text>
                      <StatusBadge
                        label={att.passed ? 'PASSED' : 'RETRY'}
                        variant={att.passed ? 'success' : 'warning'}
                      />
                    </View>
                  </View>
                ))}
                <Text style={[styles.sectionTitle, { marginTop: spacing[3] }]}>
                  Available Tests
                </Text>
              </View>
            ) : undefined
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  attemptsSection: {
    marginBottom: spacing[3],
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing[2],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  attemptCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing[2],
  },
  attemptTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  cardTitle: {
    ...typography.cardTitle,
    color: colors.text,
    fontSize: 16,
    marginBottom: 4,
  },
  cardDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing[3],
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  questionsInfo: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  startRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  startText: {
    ...typography.label,
    color: colors.primary,
    fontSize: 13,
  },
});
