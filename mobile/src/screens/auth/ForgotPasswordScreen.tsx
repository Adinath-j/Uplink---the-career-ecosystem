import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../types/navigation';
import { radii, spacing, typography, useThemedStyles, ColorPalette } from '../../theme';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { Icon } from '../../components/common/Icon';
import { authService } from '../../services/authService';
import { validateEmail } from '../../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { styles, colors } = useThemedStyles(createStyles);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }
    setEmailError(null);
    setIsLoading(true);
    setError(null);

    try {
      const res = await authService.forgotPassword(email.trim());
      if (res.success) {
        setIsSubmitted(true);
      } else {
        setError(res.error || 'Unable to process recovery request. Please try again.');
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: spacing[3],
              paddingBottom: Math.max(insets.bottom, 24) + 40,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
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

        {error && (
          <View style={styles.errorBanner}>
            <Icon name="help-circle" size={16} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

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
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError(null);
                }}
                placeholder="student@campus.edu"
                placeholderTextColor={colors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, emailError ? styles.inputError : null]}
              />
              {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
            </View>

            <PrimaryButton
              label={isLoading ? 'Sending...' : 'Send Recovery Link'}
              onPress={handleSubmit}
              disabled={isLoading}
              size="lg"
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
  );
};

const createStyles = (colors: ColorPalette, isDark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      paddingHorizontal: spacing[4],
      flexGrow: 1,
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: spacing[4],
      paddingVertical: spacing[1],
    },
    backText: {
      ...typography.bodySmall,
      color: colors.text,
      fontWeight: '600',
    },
    title: {
      ...typography.screenTitle,
      color: colors.text,
      marginBottom: 4,
    },
    subtitle: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginBottom: spacing[5],
      lineHeight: 18,
    },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
      backgroundColor: colors.dangerSoft,
      padding: spacing[3],
      borderRadius: radii.md,
      marginBottom: spacing[4],
      borderWidth: 1,
      borderColor: isDark ? colors.danger : colors.dangerSoft,
    },
    errorText: {
      ...typography.bodySmall,
      color: colors.danger,
      flex: 1,
    },
    formCard: {
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing[4],
    },
    field: {
      marginBottom: spacing[4],
    },
    label: {
      ...typography.label,
      color: colors.text,
      marginBottom: spacing[1],
    },
    input: {
      ...typography.body,
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.md,
      paddingHorizontal: spacing[3],
      height: 44,
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
    successCard: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing[6],
      alignItems: 'center',
    },
    successTitle: {
      ...typography.cardTitle,
      color: colors.text,
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
