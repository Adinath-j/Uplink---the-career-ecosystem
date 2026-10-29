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
import { useProfileStore } from '../../store/profileStore';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { profile, updateProfile, isLoading } = useProfileStore();

  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [department, setDepartment] = useState(profile?.department || '');
  const [gradYear, setGradYear] = useState(String(profile?.graduationYear || '2027'));
  const [cgpa, setCgpa] = useState(profile?.cgpa || '');
  const [skillsText, setSkillsText] = useState(profile?.skills.join(', ') || '');

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Full name is required.');
      return;
    }

    const updatedSkills = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const success = await updateProfile({
      fullName: fullName.trim(),
      bio: bio.trim(),
      department: department.trim(),
      graduationYear: parseInt(gradYear, 10) || 2027,
      cgpa: cgpa.trim(),
      skills: updatedSkills,
    });

    if (success) {
      Alert.alert('Profile Saved', 'Your professional information has been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Error', 'Unable to update profile. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Edit Profile"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.field}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Professional Bio</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Brief introduction of your engineering interests..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            style={[styles.input, styles.textArea]}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Department</Text>
          <TextInput
            value={department}
            onChangeText={setDepartment}
            style={styles.input}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Graduation Year</Text>
            <TextInput
              value={gradYear}
              onChangeText={setGradYear}
              keyboardType="number-pad"
              style={styles.input}
            />
          </View>

          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>CGPA</Text>
            <TextInput
              value={cgpa}
              onChangeText={setCgpa}
              placeholder="e.g. 8.84"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
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

        <PrimaryButton
          label="Save Changes"
          onPress={handleSave}
          isLoading={isLoading}
          size="lg"
          style={styles.saveBtn}
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
    marginBottom: spacing[1],
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
});
