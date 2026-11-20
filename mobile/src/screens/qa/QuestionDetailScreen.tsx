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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../types/navigation';
import { Question } from '../../types/models';
import { radii, spacing, typography, useThemedStyles, ColorPalette } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { SameDoubtButton } from '../../components/qa/SameDoubtButton';
import { Icon } from '../../components/common/Icon';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { qaService } from '../../services/qaService';
import { useQAStore } from '../../store/qaStore';
import { useAuthStore } from '../../store/authStore';
import { validateAnswerContent } from '../../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'QuestionDetail'>;

export const QuestionDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { questionId } = route.params;
  const insets = useSafeAreaInsets();
  const { styles, colors } = useThemedStyles(createStyles);
  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUser = useAuthStore((state) => state.user);
  const isQuestionAuthor =
    !!currentUser?.id &&
    !!question?.authorId &&
    (currentUser.id === question.authorId || currentUser.fullName === question.authorName);

  const {
    activeQuestionAnswers,
    isLoadingAnswers,
    fetchAnswers,
    postAnswer,
    toggleSameDoubt,
    toggleHelpfulAnswer,
    acceptAnswer,
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
    const err = validateAnswerContent(answerText);
    if (err) {
      Alert.alert('Validation Error', err);
      return;
    }

    setIsSubmitting(true);
    const success = await postAnswer(questionId, answerText.trim());
    setIsSubmitting(false);

    if (success) {
      setAnswerText('');
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
        <AppHeader title="Discussion" onBackPress={() => navigation.goBack()} />
        <LoadingState message="Loading question and verified answers..." />
      </View>
    );
  }

  if (error || !question) {
    return (
      <View style={styles.container}>
        <AppHeader title="Discussion" onBackPress={() => navigation.goBack()} />
        <ErrorState
          message={error || 'Question not found'}
          onRetry={() => navigation.goBack()}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <AppHeader
        title="Discussion"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Question Card */}
        <View style={styles.questionCard}>
          <View style={styles.authorRow}>
            <View>
              <Text style={styles.authorName}>{question.authorName}</Text>
              <Text style={styles.authorContext}>{question.authorAcademicContext}</Text>
            </View>
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

          <View style={styles.metaRow}>
            <SameDoubtButton
              count={question.sameDoubtCount}
              hasUserMarked={question.hasUserMarkedSameDoubt}
              onPress={handleToggleDoubt}
            />
            <Text style={styles.answersLabel}>
              {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
            </Text>
          </View>
        </View>

        {/* Answers Section Header */}
        <View style={styles.answersSection}>
          <Text style={styles.sectionTitle}>Peer & Mentor Answers</Text>

          {isLoadingAnswers && answers.length === 0 ? (
            <LoadingState message="Fetching answers..." />
          ) : answers.length === 0 ? (
            <View style={styles.emptyAnswers}>
              <Text style={styles.emptyAnswersText}>
                No answers posted yet. Share your experience or code solution below.
              </Text>
            </View>
          ) : (
            answers.map((ans) => (
              <View
                key={ans.id}
                style={[
                  styles.answerCard,
                  ans.isAccepted && styles.acceptedAnswerCard,
                ]}
              >
                <View style={styles.ansHeader}>
                  <View style={styles.ansAuthorCol}>
                    <Text style={styles.ansAuthorName}>{ans.authorName}</Text>
                    <Text style={styles.ansAuthorRole}>
                      {ans.authorRole}
                    </Text>
                  </View>

                  {ans.isAccepted ? (
                    <View style={styles.acceptedBadge}>
                      <Icon name="check-circle" size={14} color={colors.success} />
                      <Text style={styles.acceptedText}>Accepted Solution</Text>
                    </View>
                  ) : isQuestionAuthor ? (
                    <TouchableOpacity
                      onPress={() => acceptAnswer(questionId, ans.id)}
                      style={styles.acceptButton}
                      accessibilityRole="button"
                      accessibilityLabel="Mark answer as accepted"
                    >
                      <Icon name="check" size={12} color={colors.primary} />
                      <Text style={styles.acceptButtonText}>Accept Answer</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                <Text style={styles.ansContent}>{ans.content}</Text>

                <View style={styles.ansFooter}>
                  <TouchableOpacity
                    onPress={() => toggleHelpfulAnswer(questionId, ans.id)}
                    style={[
                      styles.helpfulBtn,
                      ans.hasUserMarkedHelpful && styles.helpfulBtnActive,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Vote answer as helpful"
                  >
                    <Icon
                      name="thumbs-up"
                      size={14}
                      color={ans.hasUserMarkedHelpful ? colors.primary : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.helpfulText,
                        ans.hasUserMarkedHelpful && styles.helpfulTextActive,
                      ]}
                    >
                      Helpful ({ans.helpfulCount})
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Sticky Answer Composer Bar */}
      <View
        style={[
          styles.composerBar,
          { paddingBottom: Math.max(insets.bottom, spacing[2]) },
        ]}
      >
        <TextInput
          value={answerText}
          onChangeText={setAnswerText}
          placeholder="Write your answer or explanation..."
          placeholderTextColor={colors.placeholder}
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
          accessibilityLabel="Post answer"
        >
          <Text style={styles.sendBtnText}>{isSubmitting ? '...' : 'Post'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingBottom: spacing[4],
    },
    questionCard: {
      backgroundColor: colors.surface,
      padding: spacing[4],
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    authorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing[2],
    },
    authorName: {
      ...typography.label,
      color: colors.text,
      fontSize: 14,
    },
    authorContext: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    questionTitle: {
      ...typography.screenTitle,
      color: colors.text,
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
      paddingVertical: 3,
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
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: spacing[2],
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },
    answersLabel: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    answersSection: {
      padding: spacing[4],
    },
    sectionTitle: {
      ...typography.sectionTitle,
      color: colors.text,
      fontSize: 15,
      marginBottom: spacing[3],
    },
    emptyAnswers: {
      backgroundColor: colors.surfaceMuted,
      padding: spacing[4],
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    emptyAnswersText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    answerCard: {
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing[3],
      marginBottom: spacing[3],
    },
    acceptedAnswerCard: {
      borderColor: colors.success,
      backgroundColor: colors.surfaceElevated,
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
    acceptButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: radii.sm,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: colors.surface,
    },
    acceptButtonText: {
      ...typography.caption,
      color: colors.primary,
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
      backgroundColor: colors.inputBg,
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
