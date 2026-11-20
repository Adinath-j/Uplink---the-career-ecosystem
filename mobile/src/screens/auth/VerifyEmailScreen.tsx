import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../types/navigation';
import { radii, spacing, typography, useThemedStyles, ColorPalette } from '../../theme';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { Icon } from '../../components/common/Icon';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyEmail'>;

const OTP_LENGTH = 6;
const COOLDOWN_SECONDS = 60;

export const VerifyEmailScreen: React.FC<Props> = ({ route, navigation }) => {
  const email = route.params?.email?.trim() || '';
  const insets = useSafeAreaInsets();
  const { styles, colors } = useThemedStyles(createStyles);

  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(COOLDOWN_SECONDS);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(true);

  const textInputRef = useRef<any>(null);
  const isVerifyingRef = useRef(false);

  const { verifyEmail, resendVerification, isLoading, error, clearError } = useAuthStore();

  useEffect(() => {
    // Focus OTP input immediately on mount so the keyboard appears automatically
    const focusTimer = setTimeout(() => {
      textInputRef.current?.focus();
    }, 250);
    return () => clearTimeout(focusTimer);
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const executeVerification = useCallback(
    async (codeToVerify?: string) => {
      const code = (codeToVerify ?? otp).trim();

      if (!email) {
        setLocalError('Missing email address. Please go back and sign in again.');
        return;
      }

      if (code.length < OTP_LENGTH) {
        setLocalError(`Please enter the complete ${OTP_LENGTH}-digit code.`);
        return;
      }

      if (isVerifyingRef.current || isLoading) {
        return;
      }

      isVerifyingRef.current = true;
      setLocalError(null);
      clearError();

      try {
        const result = await verifyEmail(email, code);
        if (result.success) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
          });
        } else {
          setOtp('');
          setTimeout(() => textInputRef.current?.focus(), 100);
        }
      } finally {
        isVerifyingRef.current = false;
      }
    },
    [otp, email, isLoading, clearError, verifyEmail, navigation]
  );

  const handleOtpChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
    setOtp(cleaned);
    setLocalError(null);
    clearError();

    if (cleaned.length === OTP_LENGTH) {
      void executeVerification(cleaned);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;

    if (!email) {
      setLocalError('Missing email address. Please go back and register or sign in again.');
      return;
    }

    setIsResending(true);
    setResendStatus(null);
    setLocalError(null);
    clearError();

    try {
      const res = await resendVerification(email);
      if (res.success) {
        setOtp('');
        setCountdown(COOLDOWN_SECONDS);
        setResendStatus('A new 6-digit verification code has been sent.');
        setTimeout(() => textInputRef.current?.focus(), 100);
      } else {
        setLocalError(res.error || 'Failed to resend code. Please wait and try again.');
      }
    } finally {
      setIsResending(false);
    }
  };

  const activeError = localError || error;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
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
            <Text style={styles.backText}>Sign In</Text>
          </TouchableOpacity>

          <View style={styles.brandContainer}>
            <Image
              source={require('../../../assets/brand/uplink-emblem.png')}
              style={styles.brandLogo}
              resizeMode="contain"
            />
            <Text style={styles.brandTitle}>UPLINK</Text>
            <Text style={styles.headerSubtitle}>Unified Campus Career Ecosystem</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Icon name="shield-check" size={28} color={colors.primary} />
            </View>

            <Text style={styles.cardTitle}>Verify Your Email</Text>
            <Text style={styles.cardDescription}>
              We've sent a 6-digit verification code to
            </Text>
            <Text style={styles.emailHighlight}>{email || 'your email'}</Text>

            {activeError && (
              <View style={styles.errorBanner}>
                <Icon name="help-circle" size={16} color={colors.danger} />
                <Text style={styles.errorText}>{activeError}</Text>
              </View>
            )}

            {resendStatus && (
              <View style={styles.successBanner}>
                <Icon name="check-circle" size={16} color={colors.success} />
                <Text style={styles.successText}>{resendStatus}</Text>
              </View>
            )}

            {/* OTP Input Container with full overlay TextInput for seamless keyboard triggers */}
            <View style={styles.otpInputWrapper}>
              <View style={styles.otpGrid} pointerEvents="none">
                {Array.from({ length: OTP_LENGTH }).map((_, index) => {
                  const digit = otp[index] || '';
                  const isFocused =
                    isInputFocused &&
                    (otp.length === index || (otp.length === OTP_LENGTH && index === OTP_LENGTH - 1));
                  return (
                    <View
                      key={index}
                      style={[
                        styles.otpBox,
                        isFocused ? styles.otpBoxActive : null,
                        digit ? styles.otpBoxFilled : null,
                        activeError ? styles.otpBoxError : null,
                      ]}
                    >
                      <Text style={styles.otpDigit}>{digit}</Text>
                    </View>
                  );
                })}
              </View>

              <TextInput
                ref={textInputRef}
                value={otp}
                onChangeText={handleOtpChange}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                maxLength={OTP_LENGTH}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                autoFocus={true}
                style={styles.overlayTextInput}
                caretHidden={true}
                cursorColor="transparent"
                selectionColor="transparent"
              />
            </View>

            <Text style={styles.expiryNotice}>Code expires in 10 minutes.</Text>

            <View style={styles.actionContainer}>
              <PrimaryButton
                label={isLoading ? 'Verifying...' : 'Verify Email'}
                onPress={() => void executeVerification()}
                isLoading={isLoading}
                disabled={isLoading || otp.length < OTP_LENGTH}
              />

              <View style={styles.resendRow}>
                <Text style={styles.resendPrompt}>Didn't receive code? </Text>
                {countdown > 0 ? (
                  <Text style={styles.countdownText}>
                    Resend in <Text style={styles.timerBold}>{countdown}s</Text>
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={() => void handleResend()}
                    disabled={isResending}
                    accessibilityRole="button"
                    accessibilityLabel="Resend verification code"
                  >
                    {isResending ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Text style={styles.resendBtnText}>Resend Code</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      paddingHorizontal: spacing[5],
      justifyContent: 'center',
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing[4],
      alignSelf: 'flex-start',
    },
    backText: {
      ...typography.labelLarge,
      color: colors.text,
      marginLeft: spacing[2],
    },
    brandContainer: {
      alignItems: 'center',
      marginBottom: spacing[6],
    },
    brandLogo: {
      width: 52,
      height: 52,
      marginBottom: spacing[2],
    },
    brandTitle: {
      ...typography.titleLarge,
      fontWeight: '800',
      color: colors.primary,
      letterSpacing: 2,
    },
    headerSubtitle: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginTop: 2,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radii.xl,
      padding: spacing[6],
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    iconCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary + '18',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing[4],
    },
    cardTitle: {
      ...typography.titleMedium,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing[2],
    },
    cardDescription: {
      ...typography.bodyMedium,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    emailHighlight: {
      ...typography.bodyMedium,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginTop: 2,
      marginBottom: spacing[4],
    },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.danger + '15',
      borderRadius: radii.md,
      padding: spacing[3],
      marginBottom: spacing[4],
      width: '100%',
      gap: spacing[2],
    },
    errorText: {
      ...typography.bodySmall,
      color: colors.danger,
      flex: 1,
    },
    successBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.success + '15',
      borderRadius: radii.md,
      padding: spacing[3],
      marginBottom: spacing[4],
      width: '100%',
      gap: spacing[2],
    },
    successText: {
      ...typography.bodySmall,
      color: colors.success,
      flex: 1,
    },
    otpInputWrapper: {
      position: 'relative',
      width: '100%',
      marginBottom: spacing[4],
      justifyContent: 'center',
    },
    otpGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      gap: spacing[2],
    },
    otpBox: {
      flex: 1,
      height: 54,
      borderRadius: radii.md,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.card || colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    otpBoxActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '08',
    },
    otpBoxFilled: {
      borderColor: colors.primary,
    },
    otpBoxError: {
      borderColor: colors.danger,
    },
    otpDigit: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    overlayTextInput: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%',
      opacity: 0.01,
      zIndex: 10,
      backgroundColor: 'transparent',
      color: 'transparent',
    },
    hiddenInput: {
      position: 'absolute',
      width: 1,
      height: 1,
      opacity: 0.01,
    },
    expiryNotice: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginBottom: spacing[5],
    },
    actionContainer: {
      width: '100%',
      gap: spacing[4],
    },
    resendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    resendPrompt: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
    countdownText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
    timerBold: {
      fontWeight: '700',
      color: colors.primary,
    },
    resendBtnText: {
      ...typography.bodySmall,
      fontWeight: '700',
      color: colors.primary,
    },
  });