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
import { Icon } from '../../components/common/Icon';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institution, setInstitution] = useState('');
  const [department, setDepartment] = useState('Computer Science and Engineering');
  const [gradYear, setGradYear] = useState('2027');

  const { signUp, isLoading, error } = useAuthStore();

  const handleSignUp = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      return;
    }

    const success = await signUp({
      fullName,
      email,
      password,
      institution,
      department,
      graduationYear: parseInt(gradYear, 10) || 2027,
    });

    if (success) {
      navigation.replace('MainTabs', { screen: 'Home' });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingTop: insets.top + spacing[4], paddingBottom: insets.bottom + spacing[4] },
        ]}
        keyboardShouldPersistTaps="handled"
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

        <Text style={styles.title}>Create Student Account</Text>
        <Text style={styles.subtitle}>
          Set up your academic profile to connect with verified campus opportunities.
        </Text>

        {error && (
          <View style={styles.errorBanner}>
            <Icon name="help-circle" size={16} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="e.g. Aditya Verma"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
        </View>

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

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Minimum 8 characters"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Institution / College</Text>
          <TextInput
            value={institution}
            onChangeText={setInstitution}
            placeholder="College Name"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Department</Text>
            <TextInput
              value={department}
              onChangeText={setDepartment}
              placeholder="e.g. CSE"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          </View>

          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Graduation Year</Text>
            <TextInput
              value={gradYear}
              onChangeText={setGradYear}
              placeholder="2027"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              style={styles.input}
            />
          </View>
        </View>

        <PrimaryButton
          label="Register & Continue"
          onPress={handleSignUp}
          isLoading={isLoading}
          size="lg"
          style={styles.submitBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingHorizontal: spacing[4],
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing[3],
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
    marginBottom: spacing[4],
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
  field: {
    marginBottom: spacing[3],
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
  row: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  halfField: {
    flex: 1,
  },
  submitBtn: {
    marginTop: spacing[4],
  },
});

