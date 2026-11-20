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
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../types/navigation';
import { radii, spacing, typography, useThemedStyles, ColorPalette } from '../../theme';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { Icon } from '../../components/common/Icon';
import { useAuthStore } from '../../store/authStore';
import { validateEmail, validatePassword } from '../../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

export const SignInScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { styles, colors } = useThemedStyles(createStyles);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { signIn, isLoading, error, enterDemoStudentMode } = useAuthStore();

  const handleSignIn = async () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password, false);

    if (emailError || passwordError) {
      setErrors({
        email: emailError || undefined,
        password: passwordError || undefined,
      });
      return;
    }

    setErrors({});
    const success = await signIn({ email: email.trim(), password });
    const authState = useAuthStore.getState();
    if (authState.requiresVerification) {
      navigation.navigate('VerifyEmail', { email: authState.unverifiedEmail || email.trim() });
    } else if (success) {
      navigation.replace('MainTabs', { screen: 'Home' });
    }
  };

  const handleDemoSignIn = async () => {
    await enterDemoStudentMode();
    navigation.replace('MainTabs', { screen: 'Home' });
  };

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
          <View style={styles.brandContainer}>
          <Image
            source={require('../../../assets/brand/uplink-emblem.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <Text style={styles.brandTitle}>UPLINK</Text>
          <Text style={styles.headerSubtitle}>Unified Campus Career Ecosystem</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Student Sign In</Text>
          <Text style={styles.formDescription}>
            Enter your credentials to access opportunities, Q&A, and mentorship.
          </Text>

          {error && (
            <View style={styles.errorBanner}>
              <Icon name="help-circle" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Campus Email</Text>
            <View style={[styles.inputContainer, errors.email ? styles.inputContainerError : null]}>
              <Icon name="user" size={18} color={errors.email ? colors.danger : colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                placeholder="student@campus.edu"
                placeholderTextColor={colors.placeholder}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.textInput}
              />
            </View>
            {errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}
          </View>

          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>Password</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                accessibilityRole="button"
                accessibilityLabel="Forgot password"
              >
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.inputContainer, errors.password ? styles.inputContainerError : null]}>
              <Icon name="award" size={18} color={errors.password ? colors.danger : colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                placeholder="Enter password"
                placeholderTextColor={colors.placeholder}
                secureTextEntry={!showPassword}
                style={styles.textInput}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.showPasswordText}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles.fieldError}>{errors.password}</Text> : null}
          </View>

          <PrimaryButton
            label="Sign In"
            onPress={handleSignIn}
            isLoading={isLoading}
            size="lg"
            style={styles.signInButton}
          />

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Quick Demo Student Sign-In */}
          <SecondaryButton
            label="Continue with Demo Student Account"
            onPress={handleDemoSignIn}
            size="md"
            icon="check-circle"
            style={styles.demoButton}
          />
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('SignUp')}
            accessibilityRole="button"
            accessibilityLabel="Create account"
          >
            <Text style={styles.signUpLink}> Create Student Profile</Text>
          </TouchableOpacity>
        </View>
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
    keyboardContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      paddingHorizontal: spacing[4],
      justifyContent: 'center',
      flexGrow: 1,
    },
    brandContainer: {
      alignItems: 'center',
      marginBottom: spacing[6],
    },
    brandLogo: {
      width: 68,
      height: 68,
      marginBottom: spacing[2],
    },
    brandTitle: {
      ...typography.screenTitle,
      fontSize: 28,
      fontWeight: '800',
      color: colors.primary,
      letterSpacing: 1.5,
    },
    headerSubtitle: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginTop: 2,
    },
    formCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.lg,
      padding: spacing[5],
    },
    formTitle: {
      ...typography.screenTitle,
      fontSize: 18,
      color: colors.text,
      marginBottom: 4,
    },
    formDescription: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginBottom: spacing[4],
      lineHeight: 18,
    },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.dangerSoft,
      borderWidth: 1,
      borderColor: isDark ? colors.danger : '#FECACA',
      borderRadius: radii.sm,
      padding: spacing[3],
      marginBottom: spacing[3],
      gap: spacing[2],
    },
    errorText: {
      ...typography.caption,
      color: colors.danger,
      flex: 1,
    },
    fieldGroup: {
      marginBottom: spacing[4],
    },
    labelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    fieldLabel: {
      ...typography.label,
      color: colors.text,
      marginBottom: spacing[1],
    },
    forgotPasswordText: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '500',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.md,
      paddingHorizontal: spacing[3],
      height: 44,
    },
    inputContainerError: {
      borderColor: colors.danger,
      borderWidth: 1.5,
    },
    fieldError: {
      ...typography.caption,
      color: colors.danger,
      marginTop: 4,
      marginLeft: 2,
    },
    inputIcon: {
      marginRight: spacing[2],
    },
    textInput: {
      flex: 1,
      ...typography.body,
      paddingVertical: 0,
      color: colors.text,
    },
    showPasswordText: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '600',
    },
    signInButton: {
      marginTop: spacing[2],
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: spacing[4],
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      ...typography.caption,
      color: colors.textMuted,
      paddingHorizontal: spacing[3],
    },
    demoButton: {
      backgroundColor: colors.surfaceMuted,
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: spacing[6],
    },
    footerText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
    signUpLink: {
      ...typography.bodySmall,
      color: colors.primary,
      fontWeight: '600',
    },
  });
