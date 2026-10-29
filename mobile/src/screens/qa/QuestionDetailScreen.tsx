import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { Question } from '../../types/models';
import { colors, radii, spacing, typography } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { SameDoubtButton } from '../../components/qa/SameDoubtButton';
import { Icon } from '../../components/common/Icon';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { qaService } from '../../services/qaService';
import { useQAStore } from '../../store/qaStore';

type Props = NativeStackScreenProps<RootStackParamList, 'QuestionDetail'>;

export const QuestionDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { questionId } = route.params;
  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    activeQuestionAnswers,
    isLoadingAnswers,
    fetchAnswers,
    postAnswer,
    toggleSameDoubt,
    toggleHelpfulAnswer,
  } = useQAStore();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const res = await qaService.getQuestionById(questionId);
      if (res.success && res.data) {
        setQuestion(res.data);
        await fetchAnswers(questionId);
      } else {
        setError(res.error || 'Question could not be loaded.');
      }
      setIsLoading(false);
    };

    loadData();
  }, [fetchAnswers, questionId]);

  const answers = activeQuestionAnswers[questionId] || [];

  const handlePostAnswer = async () => {
    if (!answerText.trim()) return;

    setIsSubmitting(true);
    const success = await postAnswer(questionId, answerText.trim());
    setIsSubmitting(false);

    if (success) {
      setAnswerText('');
      // update local question count
      if (question) {
        setQuestion({
          ...question,
          answerCount: question.answerCount + 1,
          isUnanswered: false,
        });
      }
    } else {
      Alert.alert('Error', 'Unable to submit answer. Please try again.');
    }
  };

  const handleToggleDoubt = async () => {
    if (!question) return;
    await toggleSameDoubt(question.id);
    const nextState = !question.hasUserMarkedSameDoubt;
    setQuestion({
      ...question,
      hasUserMarkedSameDoubt: nextState,
      sameDoubtCount: nextState
        ? question.sameDoubtCount + 1
        : Math.max(0, question.sameDoubtCount - 1),
    });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Question" onBackPress={() => navigation.goBack()} />
        <LoadingState message="Loading question and answers..." />
      </View>
    );
  }

  if (error || !question) {
    return (
      <View style={styles.container}>
        <AppHeader title="Question" onBackPress={() => navigation.goBack()} />
        <ErrorState message={error || 'Question not found'} onRetry={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <AppHeader
        title="Question Details"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Question Header & Body */}
        <View style={styles.questionSection}>
          <View style={styles.authorRow}>
            <Text style={styles.authorName}>{question.authorName}</Text>
            <Text style={styles.authorContext}>• {question.authorAcademicContext}</Text>
          </View>

          <Text style={styles.questionTitle}>{question.title}</Text>
          <Text style={styles.questionDesc}>{question.description}</Text>

          <View style={styles.topicsRow}>
            {question.topicTags.map((tag) => (
              <View key={tag} style={styles.topicBadge}>
                <Text style={styles.topicText}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actionRow}>
            <SameDoubtButton
              count={question.sameDoubtCount}
              hasUserMarked={question.hasUserMarkedSameDoubt}
              onPress={handleToggleDoubt}
            />
            <Text style={styles.answerCountBadge}>
              {question.answerCount} {question.answerCount === 1 ? 'Answer' : 'Answers'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Answers List */}
        <View style={styles.answersSection}>
          <Text style={styles.answersHeader}>Answers ({answers.length})</Text>

          {isLoadingAnswers ? (
            <LoadingState message="Loading responses..." />
          ) : answers.length === 0 ? (
            <View style={styles.noAnswersBox}>
              <Text style={styles.noAnswersTitle}>No answers yet</Text>
              <Text style={styles.noAnswersText}>
                Be the first to provide technical insight or a structured solution.
              </Text>
            </View>
          ) : (
            answers.map((ans) => (
              <View key={ans.id} style={styles.answerItem}>
                <View style={styles.ansHeader}>
                  <View style={styles.ansAuthorCol}>
                    <Text style={styles.ansAuthorName}>{ans.authorName}</Text>
                    <Text style={styles.ansAuthorRole}>{ans.authorRole}</Text>
                  </View>

                  {ans.isAccepted && (
                    <View style={styles.acceptedBadge}>
                      <Icon name="check-circle" size={13} color={colors.success} />
                      <Text style={styles.acceptedText}>Accepted Solution</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.ansContent}>{ans.content}</Text>

                <View style={styles.ansFooter}>
                  <TouchableOpacity
                    onPress={() => toggleHelpfulAnswer(question.id, ans.id)}
                    style={[
                      styles.helpfulBtn,
                      ans.hasUserMarkedHelpful && styles.helpfulBtnActive,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Mark answer as helpful"
                  >
                    <Icon
                      name="thumbs-up"
                      size={13}
                      color={ans.hasUserMarkedHelpful ? colors.primary : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.helpfulText,
                        ans.hasUserMarkedHelpful && styles.helpfulTextActive,
                      ]}
                    >
                      Helpful {ans.helpfulCount > 0 ? `(${ans.helpfulCount})` : ''}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Answer Composer Footer */}
      <View style={styles.composerBar}>
        <TextInput
          value={answerText}
          onChangeText={setAnswerText}
          placeholder="Write your answer..."
          placeholderTextColor={colors.textMuted}
          multiline
          style={styles.composerInput}
        />
        <TouchableOpacity
          onPress={handlePostAnswer}
          disabled={!answerText.trim() || isSubmitting}
          style={[
            styles.sendBtn,
            (!answerText.trim() || isSubmitting) && styles.sendBtnDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Post Answer"
        >
          <Text style={styles.sendBtnText}>Post</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing[4],
  },
  questionSection: {
    padding: spacing[4],
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing[1],
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
  questionTitle: {
    ...typography.screenTitle,
    fontSize: 18,
    marginBottom: spacing[2],
    lineHeight: 24,
  },
  questionDesc: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing[3],
  },
  topicsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing[3],
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
    color: colors.textSecondary,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  answerCountBadge: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  divider: {
    height: 8,
    backgroundColor: colors.surfaceMuted,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  answersSection: {
    padding: spacing[4],
  },
  answersHeader: {
    ...typography.sectionTitle,
    marginBottom: spacing[3],
  },
  noAnswersBox: {
    padding: spacing[6],
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noAnswersTitle: {
    ...typography.cardTitle,
    marginBottom: 4,
  },
  noAnswersText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  answerItem: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing[3],
    marginBottom: spacing[3],
  },
  ansHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  ansAuthorCol: {
    flex: 1,
  },
  ansAuthorName: {
    ...typography.label,
    color: colors.text,
  },
  ansAuthorRole: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  acceptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.successSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  acceptedText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
    fontSize: 10,
  },
  ansContent: {
    ...typography.body,
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing[2],
  },
  ansFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  helpfulBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  helpfulBtnActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  helpfulText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  helpfulTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  composerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing[2],
  },
  composerInput: {
    flex: 1,
    ...typography.body,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    maxHeight: 90,
    color: colors.text,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radii.md,
    justifyContent: 'center',
    height: 40,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendBtnText: {
    ...typography.button,
    color: '#FFFFFF',
  },
});
