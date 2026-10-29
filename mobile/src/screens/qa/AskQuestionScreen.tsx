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
import { colors, radii, spacing, typography } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useQAStore } from '../../store/qaStore';

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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { askQuestion } = useQAStore();

  const toggleTopic = (topic: string) => {
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
    if (!title.trim() || !description.trim()) {
      Alert.alert('Validation Error', 'Please provide both a title and description.');
      return;
    }

    if (selectedTopics.length === 0) {
      Alert.alert('Topic Required', 'Please select at least one topic tag.');
      return;
    }

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
            onChangeText={setTitle}
            placeholder="e.g. How to handle database migrations in Spring Boot without downtime?"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Detailed Description</Text>
          <Text style={styles.helper}>
            Include background context, what you have already attempted, and expected results.
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your technical problem or question in detail..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={6}
            style={[styles.input, styles.textArea]}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Topic Tags (Select up to 5)</Text>
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

const styles = StyleSheet.create({
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
    marginBottom: 2,
  },
  helper: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing[2],
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    color: colors.text,
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
