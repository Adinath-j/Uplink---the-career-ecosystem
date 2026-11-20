import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { radii, spacing, typography } from '../../theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';
import { ColorPalette } from '../../theme/colors';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { Avatar } from '../../components/common/Avatar';
import { Icon } from '../../components/common/Icon';
import { useProfileStore } from '../../store/profileStore';
import {
  validateFullName,
  validateDepartment,
  validateGraduationYear,
  validateCgpa,
  validateBio,
  validateUrl,
} from '../../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

const PRESET_AVATARS = [
  { label: 'Avatar 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
  { label: 'Avatar 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
  { label: 'Avatar 3', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
  { label: 'Avatar 4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
];

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { profile, updateProfile, isLoading, isActionLoading } = useProfileStore();

  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [department, setDepartment] = useState(profile?.department || '');
  const [gradYear, setGradYear] = useState(String(profile?.graduationYear || '2027'));
  const initialCgpa = profile?.cgpa
    ? profile.cgpa.replace(/\s*\/\s*10(\.0)?/g, '').trim()
    : '';
  const [cgpa, setCgpa] = useState(initialCgpa);
  const [skillsText, setSkillsText] = useState(profile?.skills?.join(', ') || '');
  const [achievementsText, setAchievementsText] = useState(
    (profile?.achievements || []).join('\n')
  );
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [avatarModalError, setAvatarModalError] = useState<string | null>(null);

  const handleSave = async () => {
    const nameErr = validateFullName(fullName);
    const deptErr = validateDepartment(department);
    const gradErr = validateGraduationYear(gradYear);
    const cgpaErr = validateCgpa(cgpa);
    const bioErr = validateBio(bio);

    if (nameErr || deptErr || gradErr || cgpaErr || bioErr) {
      setErrors({
        fullName: nameErr || undefined,
        department: deptErr || undefined,
        gradYear: gradErr || undefined,
        cgpa: cgpaErr || undefined,
        bio: bioErr || undefined,
      });
      Alert.alert('Validation Error', 'Please correct the highlighted fields before saving.');
      return;
    }

    setErrors({});

    const updatedSkills = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const updatedAchievements = achievementsText
      .split('\n')
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const success = await updateProfile({
      fullName: fullName.trim(),
      bio: bio.trim(),
      department: department.trim(),
      graduationYear: parseInt(gradYear, 10) || 2027,
      cgpa: cgpa.trim(),
      skills: updatedSkills,
      achievements: updatedAchievements,
      avatarUrl: avatarUrl.trim() || undefined,
    });

    if (success) {
      Alert.alert('Profile Saved', 'Your professional information and avatar have been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Error', 'Unable to update profile. Please try again.');
    }
  };

  const handleApplyCustomAvatar = () => {
    const urlErr = validateUrl(customAvatarInput, 'Avatar URL', true);
    if (urlErr) {
      setAvatarModalError(urlErr);
      return;
    }
    setAvatarModalError(null);
    setAvatarUrl(customAvatarInput.trim());
    setCustomAvatarInput('');
    setIsAvatarModalOpen(false);
  };

  const handleSelectPreset = (url: string) => {
    setAvatarUrl(url);
    setIsAvatarModalOpen(false);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Edit Profile"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar Photo Section */}
        <View style={styles.avatarSection}>
          <Avatar
            name={fullName || 'User'}
            imageUrl={avatarUrl}
            size={76}
          />
          <View style={styles.avatarMeta}>
            <Text style={styles.avatarTitle}>Profile Picture</Text>
            <Text style={styles.avatarSubtitle}>Hosted on Cloudinary CDN</Text>
            <TouchableOpacity
              style={styles.changeAvatarBtn}
              onPress={() => setIsAvatarModalOpen(true)}
              activeOpacity={0.7}
            >
              <Icon name="edit" size={13} color={colors.primary} />
              <Text style={styles.changeAvatarBtnText}>Change Photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
            }}
            style={[styles.input, errors.fullName ? styles.inputError : null]}
          />
          {errors.fullName ? <Text style={styles.fieldError}>{errors.fullName}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Professional Bio</Text>
          <TextInput
            value={bio}
            onChangeText={(text) => {
              setBio(text);
              if (errors.bio) setErrors((prev) => ({ ...prev, bio: undefined }));
            }}
            placeholder="Brief introduction of your engineering interests..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            style={[styles.input, styles.textArea, errors.bio ? styles.inputError : null]}
          />
          {errors.bio ? <Text style={styles.fieldError}>{errors.bio}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Department</Text>
          <TextInput
            value={department}
            onChangeText={(text) => {
              setDepartment(text);
              if (errors.department) setErrors((prev) => ({ ...prev, department: undefined }));
            }}
            style={[styles.input, errors.department ? styles.inputError : null]}
          />
          {errors.department ? <Text style={styles.fieldError}>{errors.department}</Text> : null}
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Graduation Year</Text>
            <TextInput
              value={gradYear}
              onChangeText={(text) => {
                setGradYear(text);
                if (errors.gradYear) setErrors((prev) => ({ ...prev, gradYear: undefined }));
              }}
              keyboardType="number-pad"
              style={[styles.input, errors.gradYear ? styles.inputError : null]}
            />
            {errors.gradYear ? <Text style={styles.fieldError}>{errors.gradYear}</Text> : null}
          </View>

          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>CGPA</Text>
            <TextInput
              value={cgpa}
              onChangeText={(text) => {
                setCgpa(text);
                if (errors.cgpa) setErrors((prev) => ({ ...prev, cgpa: undefined }));
              }}
              placeholder="e.g. 8.84"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, errors.cgpa ? styles.inputError : null]}
            />
            {errors.cgpa ? <Text style={styles.fieldError}>{errors.cgpa}</Text> : null}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Skills (Comma-separated)</Text>
          <Text style={styles.helper}>
            Separate skills with commas (e.g. Java, Spring Boot, React Native, SQL)
          </Text>
          <TextInput
            value={skillsText}
            onChangeText={setSkillsText}
            multiline
            style={[styles.input, styles.textArea]}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Honors & Achievements (One per line)</Text>
          <Text style={styles.helper}>
            Format: Title: Description (e.g. Hackathon Winner: 1st Place)
          </Text>
          <TextInput
            value={achievementsText}
            onChangeText={setAchievementsText}
            placeholder="Hackathon Winner: 1st place in smart campus category"
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            style={[styles.input, styles.textArea]}
          />
        </View>

        <PrimaryButton
          label="Save Changes"
          onPress={handleSave}
          isLoading={isLoading || isActionLoading}
          size="lg"
          style={styles.saveBtn}
        />
      </ScrollView>

      {/* Avatar Change Modal */}
      <Modal
        visible={isAvatarModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAvatarModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Profile Photo</Text>
              <TouchableOpacity onPress={() => setIsAvatarModalOpen(false)}>
                <Icon name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Select a professional preset or enter a direct image URL:
            </Text>

            {/* Presets Grid */}
            <View style={styles.presetGrid}>
              {PRESET_AVATARS.map((p, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.presetItem}
                  onPress={() => handleSelectPreset(p.url)}
                  activeOpacity={0.7}
                >
                  <Avatar name={`P ${idx + 1}`} imageUrl={p.url} size={48} />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { marginTop: spacing[3] }]}>Or Image URL</Text>
            <TextInput
              style={[styles.input, avatarModalError ? styles.inputError : null]}
              value={customAvatarInput}
              onChangeText={(text) => {
                setCustomAvatarInput(text);
                if (avatarModalError) setAvatarModalError(null);
              }}
              placeholder="https://... image link"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {avatarModalError ? <Text style={styles.fieldError}>{avatarModalError}</Text> : null}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalApplyBtn}
                onPress={handleApplyCustomAvatar}
                activeOpacity={0.8}
              >
                <Text style={styles.modalApplyBtnText}>Use Image URL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    avatarSection: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: spacing[3],
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing[4],
    },
    avatarMeta: {
      flex: 1,
      marginLeft: spacing[3],
    },
    avatarTitle: {
      ...typography.label,
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    avatarSubtitle: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: 2,
    },
    changeAvatarBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 6,
      alignSelf: 'flex-start',
      backgroundColor: colors.primarySoft,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: radii.full,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    changeAvatarBtnText: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '600',
      fontSize: 12,
    },
    field: {
      marginBottom: spacing[4],
    },
    label: {
      ...typography.label,
      marginBottom: 2,
      color: colors.textPrimary,
    },
    helper: {
      ...typography.caption,
      color: colors.textSecondary,
      marginBottom: spacing[1],
    },
    input: {
      ...typography.body,
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.md,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
      color: colors.textPrimary,
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
      minHeight: 80,
      textAlignVertical: 'top',
    },
    row: {
      flexDirection: 'row',
      gap: spacing[3],
    },
    halfField: {
      flex: 1,
    },
    saveBtn: {
      marginTop: spacing[3],
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing[4],
    },
    modalCard: {
      width: '100%',
      maxWidth: 380,
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      padding: spacing[4],
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    modalTitle: {
      ...typography.h3,
      fontSize: 17,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    modalSubtitle: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: spacing[2],
      marginBottom: spacing[3],
    },
    presetGrid: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginVertical: spacing[2],
    },
    presetItem: {
      padding: 3,
      borderRadius: 999,
      borderWidth: 2,
      borderColor: colors.border,
    },
    modalActions: {
      marginTop: spacing[3],
    },
    modalApplyBtn: {
      backgroundColor: colors.primary,
      paddingVertical: spacing[2],
      borderRadius: radii.md,
      alignItems: 'center',
    },
    modalApplyBtnText: {
      ...typography.label,
      color: '#FFFFFF',
      fontWeight: '700',
    },
  });
