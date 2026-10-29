import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors, radii, spacing, typography } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { Avatar } from '../../components/common/Avatar';
import { ProfileSection } from '../../components/profile/ProfileSection';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { Icon } from '../../components/common/Icon';
import { LoadingState } from '../../components/common/LoadingState';
import { useProfileStore } from '../../store/profileStore';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<RootStackParamList, 'MyProfile'>;

export const MyProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { profile, isLoading, fetchProfile } = useProfileStore();
  const { signOut } = useAuthStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of UPLINK?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          navigation.replace('SignIn');
        },
      },
    ]);
  };

  if (isLoading || !profile) {
    return (
      <View style={styles.container}>
        <AppHeader title="Profile" onBackPress={() => navigation.goBack()} />
        <LoadingState message="Loading your profile..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="Student Profile"
        onBackPress={() => navigation.goBack()}
        rightAction={
          <SecondaryButton
            label="Edit"
            icon="edit"
            size="sm"
            onPress={() => navigation.navigate('EditProfile')}
          />
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card Header */}
        <View style={styles.headerCard}>
          <Avatar
            name={profile.fullName}
            imageUrl={profile.avatarUrl}
            size={68}
          />

          <View style={styles.headerInfo}>
            <Text style={styles.name}>{profile.fullName}</Text>
            <Text style={styles.institution}>{profile.institution}</Text>
            <Text style={styles.department}>
              {profile.program} • {profile.department}
            </Text>
            <Text style={styles.gradYear}>
              Class of {profile.graduationYear}
            </Text>
          </View>
        </View>

        {profile.bio && (
          <View style={styles.bioBox}>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        )}

        {/* Quick Nav Row */}
        <View style={styles.quickNavRow}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => navigation.navigate('MyApplications')}
            accessibilityRole="button"
            accessibilityLabel="My applications"
          >
            <Icon name="briefcase" size={18} color={colors.primary} />
            <Text style={styles.navBtnText}>My Applications</Text>
          </TouchableOpacity>

        </View>

        {/* Academic Information */}
        <ProfileSection title="Academic Information">
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Program:</Text>
              <Text style={styles.infoVal}>{profile.program}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Department:</Text>
              <Text style={styles.infoVal}>{profile.department}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Graduation Year:</Text>
              <Text style={styles.infoVal}>{profile.graduationYear}</Text>
            </View>
            {profile.cgpa && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Academic Standing:</Text>
                <Text style={styles.infoVal}>{profile.cgpa}</Text>
              </View>
            )}
          </View>
        </ProfileSection>

        {/* Skills */}
        <ProfileSection
          title="Skills"
          actionLabel="Edit Skills"
          onActionPress={() => navigation.navigate('EditProfile')}
        >
          <View style={styles.skillsWrapper}>
            {profile.skills.map((skill) => (
              <View key={skill} style={styles.skillPill}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </ProfileSection>

        {/* Projects */}
        <ProfileSection title="Projects">
          {profile.projects.map((proj) => (
            <View key={proj.id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>{proj.title}</Text>
              <Text style={styles.itemDesc}>{proj.description}</Text>
              <View style={styles.techRow}>
                {proj.technologies.map((tech) => (
                  <View key={tech} style={styles.techChip}>
                    <Text style={styles.techText}>{tech}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ProfileSection>

        {/* Experience */}
        <ProfileSection title="Experience & Internships">
          {profile.experience.map((exp) => (
            <View key={exp.id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>{exp.role}</Text>
              <Text style={styles.itemSub}>
                {exp.organization} • {exp.duration}
              </Text>
              <Text style={styles.itemDesc}>{exp.description}</Text>
            </View>
          ))}
        </ProfileSection>

        {/* Certifications */}
        <ProfileSection title="Certifications">
          {profile.certifications.map((cert) => (
            <View key={cert.id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>{cert.name}</Text>
              <Text style={styles.itemSub}>
                {cert.issuingOrganization} • Issued {cert.issueDate}
              </Text>
            </View>
          ))}
        </ProfileSection>

        {/* Achievements */}
        <ProfileSection title="Honors & Achievements">
          {profile.achievements.map((ach, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>{ach}</Text>
            </View>
          ))}
        </ProfileSection>

        {/* Sign Out Button */}
        <View style={styles.signOutBox}>
          <SecondaryButton
            label="Sign Out"
            onPress={handleSignOut}
            size="md"
          />
        </View>
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
    paddingBottom: spacing[8],
  },
  headerCard: {
    flexDirection: 'row',
    padding: spacing[4],
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerInfo: {
    marginLeft: spacing[4],
    flex: 1,
  },
  name: {
    ...typography.screenTitle,
    fontSize: 18,
    marginBottom: 2,
  },
  institution: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
  },
  department: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  gradYear: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  bioBox: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bioText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  quickNavRow: {
    flexDirection: 'row',
    padding: spacing[3],
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    justifyContent: 'space-around',
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
  },
  navBtnText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text,
  },
  infoGrid: {
    gap: spacing[2],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  infoLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  infoVal: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text,
  },
  skillsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  skillPill: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing[3],
    paddingVertical: 4,
  },
  skillText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
  },
  itemCard: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing[3],
    marginBottom: spacing[2],
  },
  itemTitle: {
    ...typography.cardTitle,
    fontSize: 14,
    color: colors.text,
    marginBottom: 2,
  },
  itemSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing[1],
  },
  itemDesc: {
    ...typography.caption,
    color: colors.text,
    lineHeight: 16,
  },
  techRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: spacing[2],
  },
  techChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  techText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  bulletDot: {
    ...typography.body,
    color: colors.primary,
    marginRight: spacing[2],
  },
  bulletText: {
    ...typography.bodySmall,
    color: colors.text,
    flex: 1,
  },
  signOutBox: {
    padding: spacing[4],
    marginTop: spacing[2],
  },
});
