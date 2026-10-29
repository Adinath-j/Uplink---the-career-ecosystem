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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../types/navigation';
import { colors, radii, spacing, typography } from '../../theme';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { Icon } from '../../components/common/Icon';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

export const SignInScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { signIn, isLoading, error, enterDemoStudentMode } = useAuthStore();

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      return;
    }
    const success = await signIn({ email, password });
    if (success) {
      navigation.replace('MainTabs', { screen: 'Home' });
    }
  };

  const handleDemoSignIn = async () => {
    await enterDemoStudentMode();
    navigation.replace('MainTabs', { screen: 'Home' });
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingTop: insets.top + spacing[6], paddingBottom: insets.bottom + spacing[4] },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brandContainer}>
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
            <View style={styles.inputContainer}>
              <Icon name="user" size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="student@campus.edu"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.textInput}
              />
            </View>
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
            <View style={styles.inputContainer}>
              <Icon name="award" size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor={colors.textMuted}
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
  );
};

const styles = StyleSheet.create({
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
    borderColor: '#FECACA',
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
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing[3],
    height: 44,
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

