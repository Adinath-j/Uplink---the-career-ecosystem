import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors, radii, spacing, typography } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { Icon } from '../../components/common/Icon';
import { useAssessmentStore } from '../../store/assessmentStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Quiz'>;

export const QuizScreen: React.FC<Props> = ({ route, navigation }) => {
  const { assessmentId, title } = route.params;

  const {
    currentAssessment,
    isLoadingDetail,
    isSubmitting,
    latestResult,
    error,
    fetchAssessmentDetail,
    submitAnswers,
    clearResult,
  } = useAssessmentStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    clearResult();
    fetchAssessmentDetail(assessmentId);
  }, [assessmentId, fetchAssessmentDetail, clearResult]);

  const questions = useMemo(() => {
    return currentAssessment?.questions || [];
  }, [currentAssessment]);

  const currentQ = questions[currentIndex];

  const parsedOptions = useMemo(() => {
    if (!currentQ?.optionsJson) {
      return ['Option A', 'Option B', 'Option C', 'Option D'];
    }
    try {
      return JSON.parse(currentQ.optionsJson);
    } catch {
      return ['Option A', 'Option B', 'Option C', 'Option D'];
    }
  }, [currentQ]);

  const handleSelectOption = (option: string) => {
    if (!currentQ) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: option,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleSubmit = async () => {
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < questions.length) {
      Alert.alert(
        'Incomplete Assessment',
        `You have answered ${answeredCount} of ${questions.length} questions. Submit anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Submit',
            onPress: () => submitAnswers(assessmentId, selectedAnswers),
          },
        ]
      );
    } else {
      await submitAnswers(assessmentId, selectedAnswers);
    }
  };

  if (isLoadingDetail || (!currentAssessment && !error)) {
    return (
      <View style={styles.container}>
        <AppHeader title={title || 'Assessment'} onBackPress={() => navigation.goBack()} />
        <LoadingState message="Loading questions..." />
      </View>
    );
  }

  if (error || !currentAssessment) {
    return (
      <View style={styles.container}>
        <AppHeader title={title || 'Assessment'} onBackPress={() => navigation.goBack()} />
        <ErrorState
          message={error || 'Assessment not found'}
          onRetry={() => fetchAssessmentDetail(assessmentId)}
        />
      </View>
    );
  }

  // --- RESULT VIEW ---
  if (latestResult) {
    return (
      <View style={styles.container}>
        <AppHeader
          title="Assessment Result"
          onBackPress={() => navigation.goBack()}
        />
        <ScrollView contentContainerStyle={styles.resultContainer}>
          <View style={styles.resultCard}>
            <View
              style={[
                styles.resultIconWrap,
                { backgroundColor: latestResult.passed ? '#DCFCE7' : '#FEF3C7' },
              ]}
            >
              <Icon
                name={latestResult.passed ? 'check-circle' : 'award'}
                size={48}
                color={latestResult.passed ? '#16A34A' : '#D97706'}
              />
            </View>

            <Text style={styles.resultTitle}>
              {latestResult.passed ? 'Assessment Passed!' : 'Assessment Completed'}
            </Text>

            <Text style={styles.resultSub}>
              {latestResult.assessmentTitle || title || 'Skill Test'}
            </Text>

            <View style={styles.scoreRow}>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreNumber}>{latestResult.score}</Text>
                <Text style={styles.scoreLabel}>Score</Text>
              </View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreBox}>
                <Text style={styles.scoreNumber}>{latestResult.percentage}%</Text>
                <Text style={styles.scoreLabel}>Accuracy</Text>
              </View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreBox}>
                <Text style={styles.scoreNumber}>{latestResult.totalMarks}</Text>
                <Text style={styles.scoreLabel}>Total Marks</Text>
              </View>
            </View>

            <StatusBadge
              label={latestResult.passed ? 'VERIFIED SKILL' : 'NEEDS PRACTICE'}
              variant={latestResult.passed ? 'success' : 'warning'}
            />
          </View>

          <PrimaryButton
            label="Return to Assessments"
            onPress={() => navigation.goBack()}
            style={{ marginTop: spacing[6] }}
          />
        </ScrollView>
      </View>
    );
  }

  // --- QUIZ VIEW ---
  const currentAnswer = currentQ ? selectedAnswers[currentQ.id] : undefined;

  return (
    <View style={styles.container}>
      <AppHeader
        title={title || 'Skill Assessment'}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress header */}
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            Question {currentIndex + 1} of {questions.length}
          </Text>
          <Text style={styles.pointsText}>+{currentQ?.points || 5} pts</Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
              },
            ]}
          />
        </View>

        {/* Question card */}
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>
            {currentQ?.questionText || 'Question statement'}
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsList}>
          {parsedOptions.map((opt: string, idx: number) => {
            const isSelected = currentAnswer === opt;
            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                ]}
                activeOpacity={0.7}
                onPress={() => handleSelectOption(opt)}
              >
                <View
                  style={[
                    styles.radioCircle,
                    isSelected && styles.radioCircleSelected,
                  ]}
                >
                  {isSelected ? <View style={styles.radioDot} /> : null}
                </View>
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer controls */}
      <View style={styles.footer}>
        {currentIndex > 0 ? (
          <SecondaryButton
            label="Previous"
            onPress={handlePrev}
            style={{ flex: 1, marginRight: spacing[2] }}
          />
        ) : null}

        {currentIndex < questions.length - 1 ? (
          <PrimaryButton
            label="Next Question"
            onPress={handleNext}
            style={{ flex: 1 }}
          />
        ) : (
          <PrimaryButton
            label={isSubmitting ? 'Submitting...' : 'Submit Assessment'}
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={{ flex: 1 }}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing[4],
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  progressText: {
    ...typography.label,
    color: colors.primary,
    fontSize: 13,
  },
  pointsText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: spacing[4],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  questionCard: {
    backgroundColor: colors.surface,
    padding: spacing[4],
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing[4],
  },
  questionText: {
    ...typography.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    fontWeight: '500',
  },
  optionsList: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#EFF6FF',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  optionText: {
    ...typography.body,
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  optionTextSelected: {
    fontWeight: '600',
    color: colors.primary,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing[4],
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resultContainer: {
    padding: spacing[5],
    alignItems: 'center',
  },
  resultCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing[6],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  resultTitle: {
    ...typography.screenTitle,
    fontSize: 20,
    color: colors.text,
    marginBottom: 4,
  },
  resultSub: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing[4],
    textAlign: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: spacing[3],
    marginVertical: spacing[3],
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
  },
  scoreBox: {
    alignItems: 'center',
  },
  scoreNumber: {
    ...typography.screenTitle,
    fontSize: 20,
    color: colors.primary,
  },
  scoreLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  scoreDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
  },
});
