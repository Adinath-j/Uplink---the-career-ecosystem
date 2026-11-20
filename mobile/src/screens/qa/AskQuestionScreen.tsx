import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { QATopic } from '../../types/models';
import { radii, spacing, typography, useThemedStyles, ColorPalette } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useQAStore } from '../../store/qaStore';
import {
  validateQuestionTitle,
  validateQuestionDescription,
  validateQuestionTopics,
} from '../../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'AskQuestion'>;

const AVAILABLE_TOPICS: QATopic[] = [
  'DSA',
  'Web Development',
  'AI/ML',
  'Placements',
  'Academics',
  'Project Help',
  'Resume',
  'System Design',
  'DevOps',
];

export const AskQuestionScreen: React.FC<Props> = ({ navigation }) => {
  const { styles, colors } = useThemedStyles(createStyles);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ title?: string; description?: string; topics?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { askQuestion } = useQAStore();

  const toggleTopic = (topic: string) => {
    if (errors.topics) {
      setErrors((prev) => ({ ...prev, topics: undefined }));
    }
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
    } else {
      if (selectedTopics.length >= 5) {
        Alert.alert('Tag Limit', 'You can select up to 5 topic tags per question.');
        return;
      }
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handlePost = async () => {
    const titleErr = validateQuestionTitle(title);
    const descErr = validateQuestionDescription(description);
    const topicsErr = validateQuestionTopics(selectedTopics);

    if (titleErr || descErr || topicsErr) {
      setErrors({
        title: titleErr || undefined,
        description: descErr || undefined,
        topics: topicsErr || undefined,
      });
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    const success = await askQuestion({
      title: title.trim(),
      description: description.trim(),
      topicTags: selectedTopics,
    });
    setIsSubmitting(false);

    if (success) {
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Unable to post question. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Ask Question"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.field}>
          <Text style={styles.label}>Question Title</Text>
          <Text style={styles.helper}>
            Be specific and imagine you are asking a colleague or professor.
          </Text>
          <TextInput
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            placeholder="e.g. How to handle database migrations in Spring Boot without downtime?"
            placeholderTextColor={colors.placeholder}
            style={[styles.input, errors.title ? styles.inputError : null]}
          />
          {errors.title ? <Text style={styles.fieldError}>{errors.title}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Detailed Description</Text>
          <Text style={styles.helper}>
            Include background context, what you have already attempted, and expected results.
          </Text>
          <TextInput
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
            }}
            placeholder="Describe your technical problem or question in detail..."
            placeholderTextColor={colors.placeholder}
            multiline
            numberOfLines={6}
            style={[styles.input, styles.textArea, errors.description ? styles.inputError : null]}
          />
          {errors.description ? <Text style={styles.fieldError}>{errors.description}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Topic Tags (Select up to 5)</Text>
          {errors.topics ? <Text style={[styles.fieldError, { marginBottom: spacing[2] }]}>{errors.topics}</Text> : null}
          <View style={styles.topicsGrid}>
            {AVAILABLE_TOPICS.map((topic) => {
              const isSelected = selectedTopics.includes(topic);
              return (
                <TouchableOpacity
                  key={topic}
                  onPress={() => toggleTopic(topic)}
                  style={[
                    styles.topicChip,
                    isSelected && styles.topicChipSelected,
                  ]}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                >
                  <Text
                    style={[
                      styles.topicText,
                      isSelected && styles.topicTextSelected,
                    ]}
                  >
                    {topic}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <PrimaryButton
          label="Post Question"
          onPress={handlePost}
          isLoading={isSubmitting}
          size="lg"
          style={styles.submitBtn}
        />
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing[4],
    },
    field: {
      marginBottom: spacing[5],
    },
    label: {
      ...typography.label,
      color: colors.text,
      marginBottom: 2,
    },
    helper: {
      ...typography.caption,
      color: colors.textSecondary,
      marginBottom: spacing[2],
    },
    input: {
      ...typography.body,
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.md,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
      color: colors.text,
    },
    inputError: {
      borderColor: colors.danger,
      borderWidth: 1.5,
    },
    fieldError: {
      ...typography.caption,
      color: colors.danger,
      marginTop: 4,
      marginLeft: 2,
    },
    textArea: {
      minHeight: 120,
      textAlignVertical: 'top',
    },
    topicsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing[2],
    },
    topicChip: {
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.sm,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[1],
    },
    topicChipSelected: {
      backgroundColor: colors.primarySoft,
      borderColor: colors.primary,
    },
    topicText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    topicTextSelected: {
      color: colors.primary,
      fontWeight: '600',
    },
    submitBtn: {
      marginTop: spacing[2],
    },
  });
