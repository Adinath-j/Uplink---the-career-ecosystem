import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../types/navigation';
import { colors, radii, spacing, typography } from '../../theme';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { Icon } from '../../components/common/Icon';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (email.trim()) {
      setIsSubmitted(true);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + spacing[4], paddingBottom: insets.bottom + spacing[4] },
      ]}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity
          onPress={() => navigation.navigate('SignIn')}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Back to Sign In"
        >
          <Icon name="arrow-left" size={20} color={colors.text} />
          <Text style={styles.backText}>Back to Sign In</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Password Recovery</Text>
        <Text style={styles.subtitle}>
          Enter your registered campus email address. We will verify your identity with your institution.
        </Text>

        {isSubmitted ? (
          <View style={styles.successCard}>
            <Icon name="check-circle" size={32} color={colors.success} />
            <Text style={styles.successTitle}>Recovery Request Sent</Text>
            <Text style={styles.successDesc}>
              If an active account exists for {email}, password reset instructions have been forwarded to your campus inbox.
            </Text>
            <PrimaryButton
              label="Return to Sign In"
              onPress={() => navigation.navigate('SignIn')}
              style={styles.returnBtn}
            />
          </View>
        ) : (
          <View style={styles.formCard}>
            <View style={styles.field}>
              <Text style={styles.label}>Campus Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="student@campus.edu"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <PrimaryButton
              label="Send Recovery Link"
              onPress={handleSubmit}
              disabled={!email.trim()}
              size="lg"
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing[4],
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing[4],
    paddingVertical: spacing[1],
  },
  backText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
  },
  title: {
    ...typography.screenTitle,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing[5],
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: colors.surface,
  },
  field: {
    marginBottom: spacing[4],
  },
  label: {
    ...typography.label,
    marginBottom: spacing[1],
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing[3],
    height: 44,
    color: colors.text,
  },
  successCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[6],
    alignItems: 'center',
  },
  successTitle: {
    ...typography.cardTitle,
    marginTop: spacing[3],
    marginBottom: spacing[2],
  },
  successDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing[4],
  },
  returnBtn: {
    width: '100%',
  },
});
