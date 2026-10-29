import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors, radii, spacing, typography } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useMentorStore } from '../../store/mentorStore';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingRequest'>;

export const BookingRequestScreen: React.FC<Props> = ({ route, navigation }) => {
  const { mentorId, mentorName, mentorRole } = route.params;

  const [preferredTime, setPreferredTime] = useState('Saturday 11:00 AM - 12:00 PM IST');
  const [topic, setTopic] = useState('Career Roadmap & Backend System Design');
  const [message, setMessage] = useState('');

  const { requestBooking, isSubmittingBooking } = useMentorStore();

  const handleSubmit = async () => {
    if (!preferredTime.trim() || !topic.trim()) {
      Alert.alert('Required Fields', 'Please specify your preferred time and topic.');
      return;
    }

    const res = await requestBooking({
      mentorId,
      mentorName,
      mentorRole,
      preferredTime: preferredTime.trim(),
      topic: topic.trim(),
      message: message.trim(),
    });

    if (res.success) {
      Alert.alert(
        'Request Sent',
        `Your mentorship session request has been forwarded to ${mentorName}. You will receive a notice when confirmed.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert('Error', res.error || 'Failed to submit request.');
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Request Mentorship"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.mentorBanner}>
          <Text style={styles.mentorName}>{mentorName}</Text>
          <Text style={styles.mentorRole}>{mentorRole}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Preferred Time / Window</Text>
          <Text style={styles.helper}>
            Propose a convenient day and time based on the mentor's stated availability.
          </Text>
          <TextInput
            value={preferredTime}
            onChangeText={setPreferredTime}
            placeholder="e.g. Saturday afternoon, Nov 14"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Discussion Topic</Text>
          <Text style={styles.helper}>
            What specific engineering domain or career milestone do you want advice on?
          </Text>
          <TextInput
            value={topic}
            onChangeText={setTopic}
            placeholder="e.g. Preparing for Cloud Infrastructure SDE roles"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Note / Questions (Optional)</Text>
          <Text style={styles.helper}>
            Briefly share your current semester, skills, and what questions you want to discuss.
          </Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Share details about your projects or what guidance you are seeking..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            style={[styles.input, styles.textArea]}
          />
        </View>

        <PrimaryButton
          label="Submit Booking Request"
          onPress={handleSubmit}
          isLoading={isSubmittingBooking}
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
  mentorBanner: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  mentorName: {
    ...typography.cardTitle,
    color: colors.text,
  },
  mentorRole: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  field: {
    marginBottom: spacing[4],
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
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitBtn: {
    marginTop: spacing[3],
  },
});
