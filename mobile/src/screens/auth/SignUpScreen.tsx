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
import { Icon } from '../../components/common/Icon';
import { useAuthStore } from '../../store/authStore';
import {
  validateFullName,
  validateEmail,
  validatePassword,
  validateInstitution,
  validateDepartment,
  validateGraduationYear,
} from '../../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { styles, colors } = useThemedStyles(createStyles);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institution, setInstitution] = useState('');
  const [department, setDepartment] = useState('Computer Science and Engineering');
  const [gradYear, setGradYear] = useState('2027');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const { signUp, isLoading, error } = useAuthStore();

  const handleSignUp = async () => {
    const nameErr = validateFullName(fullName);
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password, true);
    const instErr = validateInstitution(institution);
    const deptErr = validateDepartment(department);
    const gradErr = validateGraduationYear(gradYear);

    if (nameErr || emailErr || passErr || instErr || deptErr || gradErr) {
      setErrors({
        fullName: nameErr || undefined,
        email: emailErr || undefined,
        password: passErr || undefined,
        institution: instErr || undefined,
        department: deptErr || undefined,
        gradYear: gradErr || undefined,
      });
      return;
    }

    setErrors({});
    const success = await signUp({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
      institution: institution.trim(),
      department: department.trim(),
      graduationYear: parseInt(gradYear.trim(), 10) || 2027,
    });

    const authState = useAuthStore.getState();
    if (authState.requiresVerification) {
      navigation.navigate('VerifyEmail', { email: authState.unverifiedEmail || email.trim() });
    } else if (success) {
      navigation.replace('MainTabs', { screen: 'Home' });
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
            styles.scrollContainer,
            {
              paddingTop: spacing[3],
              paddingBottom: Math.max(insets.bottom, 24) + 60,
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

        <Image
          source={require('../../../assets/brand/uplink-emblem.png')}
          style={styles.brandLogo}
          resizeMode="contain"
        />

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
            onChangeText={(text) => {
              setFullName(text);
              if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
            }}
            placeholder="e.g. Aditya Verma"
            placeholderTextColor={colors.placeholder}
            style={[styles.input, errors.fullName ? styles.inputError : null]}
          />
          {errors.fullName ? <Text style={styles.fieldError}>{errors.fullName}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Campus Email</Text>
          <TextInput
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            placeholder="aditya@campus.edu"
            placeholderTextColor={colors.placeholder}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[styles.input, errors.email ? styles.inputError : null]}
          />
          {errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            placeholder="Choose strong password (min 8 chars, 1 upper, 1 lower, 1 digit)"
            placeholderTextColor={colors.placeholder}
            secureTextEntry
            style={[styles.input, errors.password ? styles.inputError : null]}
          />
          {errors.password ? <Text style={styles.fieldError}>{errors.password}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Institution / College</Text>
          <TextInput
            value={institution}
            onChangeText={(text) => {
              setInstitution(text);
              if (errors.institution) setErrors((prev) => ({ ...prev, institution: undefined }));
            }}
            placeholder="e.g. National Institute of Technology"
            placeholderTextColor={colors.placeholder}
            style={[styles.input, errors.institution ? styles.inputError : null]}
          />
          {errors.institution ? <Text style={styles.fieldError}>{errors.institution}</Text> : null}
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Department</Text>
            <TextInput
              value={department}
              onChangeText={(text) => {
                setDepartment(text);
                if (errors.department) setErrors((prev) => ({ ...prev, department: undefined }));
              }}
              placeholder="e.g. CSE"
              placeholderTextColor={colors.placeholder}
              style={[styles.input, errors.department ? styles.inputError : null]}
            />
            {errors.department ? <Text style={styles.fieldError}>{errors.department}</Text> : null}
          </View>

          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Graduation Year</Text>
            <TextInput
              value={gradYear}
              onChangeText={(text) => {
                setGradYear(text);
                if (errors.gradYear) setErrors((prev) => ({ ...prev, gradYear: undefined }));
              }}
              placeholder="2027"
              placeholderTextColor={colors.placeholder}
              keyboardType="numeric"
              style={[styles.input, errors.gradYear ? styles.inputError : null]}
            />
            {errors.gradYear ? <Text style={styles.fieldError}>{errors.gradYear}</Text> : null}
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
    scrollContainer: {
      paddingHorizontal: spacing[4],
      flexGrow: 1,
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: spacing[4],
      alignSelf: 'flex-start',
    },
    backText: {
      ...typography.bodySmall,
      color: colors.text,
      fontWeight: '600',
    },
    brandLogo: {
      width: 48,
      height: 48,
      marginBottom: spacing[2],
    },
    title: {
      ...typography.screenTitle,
      color: colors.text,
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
    field: {
      marginBottom: spacing[3],
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
