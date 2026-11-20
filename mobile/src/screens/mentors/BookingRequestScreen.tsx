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
import { radii, spacing, typography, useThemedStyles, ColorPalette } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useMentorStore } from '../../store/mentorStore';
import {
  validateBookingTime,
  validateBookingTopic,
  validateBookingMessage,
} from '../../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingRequest'>;

export const BookingRequestScreen: React.FC<Props> = ({ route, navigation }) => {
  const { mentorId, mentorName, mentorRole } = route.params;
  const { styles, colors } = useThemedStyles(createStyles);

  const [preferredTime, setPreferredTime] = useState('Saturday 11:00 AM - 12:00 PM IST');
  const [topic, setTopic] = useState('Career Roadmap & Backend System Design');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ preferredTime?: string; topic?: string; message?: string }>({});

  const { requestBooking, isSubmittingBooking } = useMentorStore();

  const handleSubmit = async () => {
    const timeErr = validateBookingTime(preferredTime);
    const topicErr = validateBookingTopic(topic);
    const msgErr = validateBookingMessage(message);

    if (timeErr || topicErr || msgErr) {
      setErrors({
        preferredTime: timeErr || undefined,
        topic: topicErr || undefined,
        message: msgErr || undefined,
      });
      return;
    }

    setErrors({});
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
            onChangeText={(text) => {
              setPreferredTime(text);
              if (errors.preferredTime) setErrors((prev) => ({ ...prev, preferredTime: undefined }));
            }}
            placeholder="e.g. Saturday afternoon, Nov 14"
            placeholderTextColor={colors.placeholder}
            style={[styles.input, errors.preferredTime ? styles.inputError : null]}
          />
          {errors.preferredTime ? <Text style={styles.fieldError}>{errors.preferredTime}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Discussion Topic</Text>
          <Text style={styles.helper}>
            What specific engineering domain or career milestone do you want advice on?
          </Text>
          <TextInput
            value={topic}
            onChangeText={(text) => {
              setTopic(text);
              if (errors.topic) setErrors((prev) => ({ ...prev, topic: undefined }));
            }}
            placeholder="e.g. Preparing for Cloud Infrastructure SDE roles"
            placeholderTextColor={colors.placeholder}
            style={[styles.input, errors.topic ? styles.inputError : null]}
          />
          {errors.topic ? <Text style={styles.fieldError}>{errors.topic}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Note / Questions (Optional)</Text>
          <Text style={styles.helper}>
            Briefly share your current semester, skills, and what questions you want to discuss.
          </Text>
          <TextInput
            value={message}
            onChangeText={(text) => {
              setMessage(text);
              if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
            }}
            placeholder="Share details about your projects or what guidance you are seeking..."
            placeholderTextColor={colors.placeholder}
            multiline
            numberOfLines={4}
            style={[styles.input, styles.textArea, errors.message ? styles.inputError : null]}
          />
          {errors.message ? <Text style={styles.fieldError}>{errors.message}</Text> : null}
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

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
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
      minHeight: 100,
      textAlignVertical: 'top',
    },
    submitBtn: {
      marginTop: spacing[3],
    },
  });
