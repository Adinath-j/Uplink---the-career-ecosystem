import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { radii, spacing, typography } from '../../theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';
import { ColorPalette } from '../../theme/colors';
import { AppHeader } from '../../components/common/AppHeader';
import { Avatar } from '../../components/common/Avatar';
import { ProfileSection } from '../../components/profile/ProfileSection';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { Icon } from '../../components/common/Icon';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { CalendarDatePickerModal } from '../../components/common/CalendarDatePickerModal';
import { DatePickerInput } from '../../components/common/DatePickerInput';
import { useProfileStore } from '../../store/profileStore';
import { useAuthStore } from '../../store/authStore';
import { Project, Experience, Certification } from '../../types/models';
import {
  validateSkillName,
  validateSkillCategory,
  validateProjectTitle,
  validateProjectDescription,
  validateUrl,
  validateExperienceRole,
  validateExperienceCompany,
  validateDateOrder,
  validateCertificationName,
  validateCertificationIssuer,
} from '../../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'MyProfile'>;

type ModalType = 'SKILL' | 'PROJECT' | 'EXPERIENCE' | 'CERTIFICATION' | null;

export const MyProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const {
    profile,
    isLoading,
    isActionLoading,
    error,
    fetchProfile,
    addSkill,
    deleteSkill,
    addProject,
    updateProject,
    deleteProject,
    addExperience,
    updateExperience,
    deleteExperience,
    addCertification,
    updateCertification,
    deleteCertification,
  } = useProfileStore();

  const { user, signOut } = useAuthStore();

  // Active Modal State
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Skill Form State
  const [skillName, setSkillName] = useState('');
  const [skillProficiency, setSkillProficiency] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'>('INTERMEDIATE');
  const [skillCategory, setSkillCategory] = useState('Technical');

  // Project Form State
  const [projTitle, setProjTitle] = useState('');
  const [projDescription, setProjDescription] = useState('');
  const [projTechStack, setProjTechStack] = useState('');
  const [projGithubUrl, setProjGithubUrl] = useState('');
  const [projLiveUrl, setProjLiveUrl] = useState('');

  // Experience Form State
  const [expTitle, setExpTitle] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expLocation, setExpLocation] = useState('');
  const [expStartDate, setExpStartDate] = useState('');
  const [expEndDate, setExpEndDate] = useState('');
  const [expIsCurrent, setExpIsCurrent] = useState(false);
  const [expDescription, setExpDescription] = useState('');

  // Certification Form State
  const [certName, setCertName] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [certIssueDate, setCertIssueDate] = useState('');
  const [certCredentialUrl, setCertCredentialUrl] = useState('');

  // Calendar Picker Modal State
  const [calendarConfig, setCalendarConfig] = useState<{
    visible: boolean;
    title: string;
    value: string;
    allowClear?: boolean;
    onConfirm: (dateStr: string) => void;
    onClear?: () => void;
  }>({
    visible: false,
    title: 'Select Date',
    value: '',
    onConfirm: () => {},
  });

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

  // ---------------------------------------------------------------------------
  // Skill Handlers
  // ---------------------------------------------------------------------------
  const openAddSkillModal = () => {
    setSkillName('');
    setSkillProficiency('INTERMEDIATE');
    setSkillCategory('Technical');
    setActiveModal('SKILL');
  };

  const handleSaveSkill = async () => {
    const nameErr = validateSkillName(skillName);
    const catErr = validateSkillCategory(skillCategory);

    if (nameErr || catErr) {
      Alert.alert('Validation Error', nameErr || catErr || 'Invalid skill details.');
      return;
    }

    const success = await addSkill({
      skillName: skillName.trim(),
      proficiency: skillProficiency,
      category: skillCategory.trim() || 'Technical',
    });
    if (success) {
      setActiveModal(null);
    } else {
      Alert.alert('Error', 'Unable to save skill to your profile.');
    }
  };

  const confirmDeleteSkill = (name: string) => {
    Alert.alert(
      'Remove Skill',
      `Are you sure you want to remove "${name}" from your profile?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteSkill(name);
            if (!success) {
              Alert.alert('Error', 'Unable to remove skill.');
            }
          },
        },
      ]
    );
  };

  // ---------------------------------------------------------------------------
  // Project Handlers
  // ---------------------------------------------------------------------------
  const openAddProjectModal = () => {
    setEditingId(null);
    setProjTitle('');
    setProjDescription('');
    setProjTechStack('');
    setProjGithubUrl('');
    setProjLiveUrl('');
    setActiveModal('PROJECT');
  };

  const openEditProjectModal = (proj: Project) => {
    setEditingId(proj.id);
    setProjTitle(proj.title);
    setProjDescription(proj.description || '');
    setProjTechStack((proj.technologies || []).join(', '));
    setProjGithubUrl(proj.githubUrl || (proj.link?.includes('github') ? proj.link : ''));
    setProjLiveUrl(proj.liveUrl || (!proj.link?.includes('github') ? proj.link || '' : ''));
    setActiveModal('PROJECT');
  };

  const handleSaveProject = async () => {
    const titleErr = validateProjectTitle(projTitle);
    const descErr = validateProjectDescription(projDescription);
    const githubErr = validateUrl(projGithubUrl, 'GitHub URL', false);
    const liveErr = validateUrl(projLiveUrl, 'Live Demo URL', false);

    if (titleErr || descErr || githubErr || liveErr) {
      Alert.alert(
        'Validation Error',
        titleErr || descErr || githubErr || liveErr || 'Invalid project details.'
      );
      return;
    }

    const payload = {
      title: projTitle.trim(),
      description: projDescription.trim(),
      techStack: projTechStack.trim(),
      githubUrl: projGithubUrl.trim() || undefined,
      liveUrl: projLiveUrl.trim() || undefined,
    };

    let success = false;
    if (editingId) {
      success = await updateProject(editingId, payload);
    } else {
      success = await addProject(payload);
    }

    if (success) {
      setActiveModal(null);
    } else {
      Alert.alert('Error', 'Unable to save project details.');
    }
  };

  const confirmDeleteProject = (id: string, title: string) => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteProject(id);
            if (!success) {
              Alert.alert('Error', 'Unable to delete project.');
            }
          },
        },
      ]
    );
  };

  // ---------------------------------------------------------------------------
  // Experience Handlers
  // ---------------------------------------------------------------------------
  const openAddExperienceModal = () => {
    setEditingId(null);
    setExpTitle('');
    setExpCompany('');
    setExpLocation('');
    setExpStartDate('');
    setExpEndDate('');
    setExpIsCurrent(false);
    setExpDescription('');
    setActiveModal('EXPERIENCE');
  };

  const openEditExperienceModal = (exp: Experience) => {
    setEditingId(exp.id);
    setExpTitle(exp.role);
    setExpCompany(exp.organization);
    setExpLocation(exp.location || '');
    setExpStartDate(exp.startDate || '');
    setExpEndDate(exp.endDate || '');
    setExpIsCurrent(!exp.endDate || exp.duration?.toLowerCase().includes('present'));
    setExpDescription(exp.description || '');
    setActiveModal('EXPERIENCE');
  };

  const handleSaveExperience = async () => {
    const roleErr = validateExperienceRole(expTitle);
    const compErr = validateExperienceCompany(expCompany);

    if (roleErr || compErr) {
      Alert.alert('Validation Error', roleErr || compErr || 'Role and company are required.');
      return;
    }

    const formattedStartDate = expStartDate.trim() || new Date().toISOString().split('T')[0];
    const formattedEndDate = expIsCurrent ? undefined : (expEndDate.trim() || undefined);

    const dateErr = validateDateOrder(formattedStartDate, formattedEndDate);
    if (dateErr) {
      Alert.alert('Validation Error', dateErr);
      return;
    }

    const payload = {
      title: expTitle.trim(),
      company: expCompany.trim(),
      location: expLocation.trim() || undefined,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      description: expDescription.trim() || undefined,
    };

    let success = false;
    if (editingId) {
      success = await updateExperience(editingId, payload);
    } else {
      success = await addExperience(payload);
    }

    if (success) {
      setActiveModal(null);
    } else {
      Alert.alert('Error', 'Unable to save experience record.');
    }
  };

  const confirmDeleteExperience = (id: string, role: string) => {
    Alert.alert(
      'Delete Experience',
      `Are you sure you want to delete "${role}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteExperience(id);
            if (!success) {
              Alert.alert('Error', 'Unable to delete experience record.');
            }
          },
        },
      ]
    );
  };

  // ---------------------------------------------------------------------------
  // Certification Handlers
  // ---------------------------------------------------------------------------
  const openAddCertificationModal = () => {
    setEditingId(null);
    setCertName('');
    setCertIssuer('');
    setCertIssueDate('');
    setCertCredentialUrl('');
    setActiveModal('CERTIFICATION');
  };

  const openEditCertificationModal = (cert: Certification) => {
    setEditingId(cert.id);
    setCertName(cert.name);
    setCertIssuer(cert.issuingOrganization);
    setCertIssueDate(cert.issueDate || '');
    setCertCredentialUrl(cert.credentialUrl || '');
    setActiveModal('CERTIFICATION');
  };

  const handleSaveCertification = async () => {
    const nameErr = validateCertificationName(certName);
    const issuerErr = validateCertificationIssuer(certIssuer);
    const credErr = validateUrl(certCredentialUrl, 'Credential URL', false);

    if (nameErr || issuerErr || credErr) {
      Alert.alert(
        'Validation Error',
        nameErr || issuerErr || credErr || 'Invalid certification details.'
      );
      return;
    }

    const payload = {
      name: certName.trim(),
      title: certName.trim(),
      issuingOrg: certIssuer.trim(),
      issuer: certIssuer.trim(),
      issueDate: certIssueDate.trim() || new Date().toISOString().split('T')[0],
      credentialUrl: certCredentialUrl.trim() || undefined,
    };

    let success = false;
    if (editingId) {
      success = await updateCertification(editingId, payload);
    } else {
      success = await addCertification(payload);
    }

    if (success) {
      setActiveModal(null);
    } else {
      Alert.alert('Error', 'Unable to save certification.');
    }
  };

  const confirmDeleteCertification = (id: string, name: string) => {
    Alert.alert(
      'Delete Certification',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteCertification(id);
            if (!success) {
              Alert.alert('Error', 'Unable to delete certification.');
            }
          },
        },
      ]
    );
  };

  if (isLoading && !profile) {
    return (
      <View style={styles.container}>
        <AppHeader title="Profile" onBackPress={() => navigation.goBack()} />
        <LoadingState message="Loading your profile..." />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <AppHeader title="Profile" onBackPress={() => navigation.goBack()} />
        <ErrorState message={error || 'Unable to load profile.'} onRetry={fetchProfile} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="Student Profile"
        onBackPress={() => navigation.goBack()}
        rightAction={
          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => navigation.navigate('Settings')}
              accessibilityRole="button"
              accessibilityLabel="Open settings"
            >
              <Icon name="settings" size={20} color={colors.textPrimary} />
            </TouchableOpacity>

            <SecondaryButton
              label="Edit"
              icon="edit"
              size="sm"
              onPress={() => navigation.navigate('EditProfile')}
            />
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card Header */}
        <View style={styles.headerCard}>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.8}
            accessibilityLabel="Edit profile picture"
          >
            <Avatar
              name={profile.fullName}
              imageUrl={profile.avatarUrl}
              size={68}
            />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.name}>{profile.fullName}</Text>
            </View>
            <Text style={styles.institution}>{profile.institution}</Text>
            <Text style={styles.department}>
              {profile.program} • {profile.department}
            </Text>
            <Text style={styles.gradYear}>
              Class of {profile.graduationYear}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <Text style={{ ...typography.bodySmall, color: colors.textSecondary }}>
                {user?.email || profile.email || ''}
              </Text>
              {(user?.isVerified ?? profile.isVerified) ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.success + '1A', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12 }}>
                  <Icon name="check-circle" size={12} color={colors.success} />
                  <Text style={{ fontSize: 11, fontWeight: '600', color: colors.success }}>Verified</Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => (user?.email || profile.email) && navigation.navigate('VerifyEmail', { email: user?.email || profile.email || '' })}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.warning + '1A', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12 }}
                  activeOpacity={0.7}
                >
                  <Icon name="shield-check" size={12} color={colors.warning} />
                  <Text style={{ fontSize: 11, fontWeight: '600', color: colors.warning }}>Verify Now &rarr;</Text>
                </TouchableOpacity>
              )}
            </View>
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
            <Icon name="briefcase" size={16} color={colors.primary} />
            <Text style={styles.navBtnText}>Applications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => navigation.navigate('ResumeBuilder')}
            accessibilityRole="button"
            accessibilityLabel="Resume studio"
          >
            <Icon name="file-text" size={16} color={colors.primary} />
            <Text style={styles.navBtnText}>Resume Studio</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => navigation.navigate('VerificationUpload')}
            accessibilityRole="button"
            accessibilityLabel="Institutional verification"
          >
            <Icon name="shield-check" size={16} color={colors.primary} />
            <Text style={styles.navBtnText}>Get Verified</Text>
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

        {/* ------------------------------------------------------------------ */}
        {/* Skills Section with Add / Delete */}
        {/* ------------------------------------------------------------------ */}
        <ProfileSection
          title="Skills"
          actionLabel="+ Add Skill"
          onActionPress={openAddSkillModal}
        >
          {profile.skills.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No skills added yet.</Text>
              <TouchableOpacity style={styles.emptyAddBtn} onPress={openAddSkillModal}>
                <Icon name="plus" size={14} color={colors.primary} />
                <Text style={styles.emptyAddText}>Add Your Skills</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.skillsWrapper}>
              {profile.skills.map((skill) => (
                <View key={skill} style={styles.skillPill}>
                  <Text style={styles.skillText}>{skill}</Text>
                  <TouchableOpacity
                    style={styles.skillDeleteBtn}
                    onPress={() => confirmDeleteSkill(skill)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${skill}`}
                  >
                    <Icon name="close" size={12} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.testLinkRow}
            onPress={() => navigation.navigate('AssessmentList')}
          >
            <Icon name="check-square" size={14} color={colors.primary} />
            <Text style={styles.testLinkText}>Validate Skills via Quiz Assessment &rarr;</Text>
          </TouchableOpacity>
        </ProfileSection>

        {/* ------------------------------------------------------------------ */}
        {/* Projects Section with Add, Edit, Delete */}
        {/* ------------------------------------------------------------------ */}
        <ProfileSection
          title="Projects"
          actionLabel="+ Add Project"
          onActionPress={openAddProjectModal}
        >
          {profile.projects.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No projects showcased yet.</Text>
              <TouchableOpacity style={styles.emptyAddBtn} onPress={openAddProjectModal}>
                <Icon name="plus" size={14} color={colors.primary} />
                <Text style={styles.emptyAddText}>Add First Project</Text>
              </TouchableOpacity>
            </View>
          ) : (
            profile.projects.map((proj) => (
              <View key={proj.id} style={styles.itemCard}>
                <View style={styles.itemHeaderRow}>
                  <Text style={styles.itemTitle}>{proj.title}</Text>
                  <View style={styles.actionIconRow}>
                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() => openEditProjectModal(proj)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityLabel="Edit project"
                    >
                      <Icon name="edit" size={15} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() => confirmDeleteProject(proj.id, proj.title)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityLabel="Delete project"
                    >
                      <Icon name="trash" size={15} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>

                {proj.description ? (
                  <Text style={styles.itemDesc}>{proj.description}</Text>
                ) : null}

                {proj.technologies && proj.technologies.length > 0 && (
                  <View style={styles.techRow}>
                    {proj.technologies.map((tech) => (
                      <View key={tech} style={styles.techChip}>
                        <Text style={styles.techText}>{tech}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {(proj.githubUrl || proj.liveUrl || proj.link) ? (
                  <View style={styles.linkRow}>
                    <Icon name="external-link" size={12} color={colors.primary} />
                    <Text style={styles.linkText} numberOfLines={1}>
                      {proj.liveUrl || proj.githubUrl || proj.link}
                    </Text>
                  </View>
                ) : null}
              </View>
            ))
          )}
        </ProfileSection>

        {/* ------------------------------------------------------------------ */}
        {/* Experience Section with Add, Edit, Delete */}
        {/* ------------------------------------------------------------------ */}
        <ProfileSection
          title="Experience & Internships"
          actionLabel="+ Add Experience"
          onActionPress={openAddExperienceModal}
        >
          {profile.experience.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No experience records documented yet.</Text>
              <TouchableOpacity style={styles.emptyAddBtn} onPress={openAddExperienceModal}>
                <Icon name="plus" size={14} color={colors.primary} />
                <Text style={styles.emptyAddText}>Add Experience</Text>
              </TouchableOpacity>
            </View>
          ) : (
            profile.experience.map((exp) => (
              <View key={exp.id} style={styles.itemCard}>
                <View style={styles.itemHeaderRow}>
                  <Text style={styles.itemTitle}>{exp.role}</Text>
                  <View style={styles.actionIconRow}>
                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() => openEditExperienceModal(exp)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityLabel="Edit experience"
                    >
                      <Icon name="edit" size={15} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() => confirmDeleteExperience(exp.id, exp.role)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityLabel="Delete experience"
                    >
                      <Icon name="trash" size={15} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.itemSub}>
                  {exp.organization}
                  {exp.location ? ` • ${exp.location}` : ''} • {exp.duration}
                </Text>

                {exp.description ? (
                  <Text style={styles.itemDesc}>{exp.description}</Text>
                ) : null}
              </View>
            ))
          )}
        </ProfileSection>

        {/* ------------------------------------------------------------------ */}
        {/* Certifications Section with Add, Edit, Delete */}
        {/* ------------------------------------------------------------------ */}
        <ProfileSection
          title="Certifications"
          actionLabel="+ Add Certification"
          onActionPress={openAddCertificationModal}
        >
          {profile.certifications.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No certifications listed yet.</Text>
              <TouchableOpacity style={styles.emptyAddBtn} onPress={openAddCertificationModal}>
                <Icon name="plus" size={14} color={colors.primary} />
                <Text style={styles.emptyAddText}>Add Certification</Text>
              </TouchableOpacity>
            </View>
          ) : (
            profile.certifications.map((cert) => (
              <View key={cert.id} style={styles.itemCard}>
                <View style={styles.itemHeaderRow}>
                  <Text style={styles.itemTitle}>{cert.name}</Text>
                  <View style={styles.actionIconRow}>
                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() => openEditCertificationModal(cert)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityLabel="Edit certification"
                    >
                      <Icon name="edit" size={15} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() => confirmDeleteCertification(cert.id, cert.name)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityLabel="Delete certification"
                    >
                      <Icon name="trash" size={15} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.itemSub}>
                  {cert.issuingOrganization}
                  {cert.issueDate ? ` • Issued ${cert.issueDate}` : ''}
                </Text>

                {cert.credentialUrl ? (
                  <View style={styles.linkRow}>
                    <Icon name="external-link" size={12} color={colors.primary} />
                    <Text style={styles.linkText} numberOfLines={1}>
                      {cert.credentialUrl}
                    </Text>
                  </View>
                ) : null}
              </View>
            ))
          )}
        </ProfileSection>

        {/* Honors & Achievements */}
        {profile.achievements && profile.achievements.length > 0 && (
          <ProfileSection title="Honors & Achievements">
            {profile.achievements.map((ach, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{ach}</Text>
              </View>
            ))}
          </ProfileSection>
        )}


        {/* Sign Out Button */}
        <View style={styles.signOutBox}>
          <SecondaryButton
            label="Sign Out"
            onPress={handleSignOut}
            size="md"
          />
        </View>
      </ScrollView>

      {/* ================================================================== */}
      {/* 1. Add Skill Modal */}
      {/* ================================================================== */}
      <Modal
        visible={activeModal === 'SKILL'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              Keyboard.dismiss();
              setActiveModal(null);
            }}
            style={styles.modalDismissArea}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Skill</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Icon name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              contentContainerStyle={styles.modalScrollContent}
              style={{ flexShrink: 1 }}
            >
              <Text style={styles.fieldLabel}>Skill Name *</Text>
              <TextInput
                style={styles.input}
                value={skillName}
                onChangeText={setSkillName}
                placeholder="e.g. React Native, TypeScript, Spring Boot"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Proficiency Level</Text>
              <View style={styles.levelRow}>
                {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as const).map((lvl) => (
                  <TouchableOpacity
                    key={lvl}
                    style={[
                      styles.levelPill,
                      skillProficiency === lvl && styles.levelPillActive,
                    ]}
                    onPress={() => setSkillProficiency(lvl)}
                  >
                    <Text
                      style={[
                        styles.levelPillText,
                        skillProficiency === lvl && styles.levelPillTextActive,
                      ]}
                    >
                      {lvl.slice(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Category</Text>
              <TextInput
                style={styles.input}
                value={skillCategory}
                onChangeText={setSkillCategory}
                placeholder="Technical, Cloud, Design, Soft Skills"
                placeholderTextColor={colors.textMuted}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <SecondaryButton
                label="Cancel"
                onPress={() => setActiveModal(null)}
                style={{ flex: 1 }}
              />
              <PrimaryButton
                label={isActionLoading ? 'Saving...' : 'Add Skill'}
                onPress={handleSaveSkill}
                disabled={isActionLoading}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ================================================================== */}
      {/* 2. Add / Edit Project Modal */}
      {/* ================================================================== */}
      <Modal
        visible={activeModal === 'PROJECT'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              Keyboard.dismiss();
              setActiveModal(null);
            }}
            style={styles.modalDismissArea}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? 'Edit Project' : 'Add Project'}
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Icon name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              contentContainerStyle={styles.modalScrollContent}
              style={{ flexShrink: 1 }}
            >
              <Text style={styles.fieldLabel}>Project Title *</Text>
              <TextInput
                style={styles.input}
                value={projTitle}
                onChangeText={setProjTitle}
                placeholder="e.g. Distributed Task Scheduler"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={projDescription}
                onChangeText={setProjDescription}
                placeholder="Overview of features, architecture, and personal contributions..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.fieldLabel}>Tech Stack (comma-separated)</Text>
              <TextInput
                style={styles.input}
                value={projTechStack}
                onChangeText={setProjTechStack}
                placeholder="React Native, Spring Boot, PostgreSQL, Kafka"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.fieldLabel}>GitHub Repository URL</Text>
              <TextInput
                style={styles.input}
                value={projGithubUrl}
                onChangeText={setProjGithubUrl}
                placeholder="https://github.com/username/project"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
              />

              <Text style={styles.fieldLabel}>Live Demo / Website URL</Text>
              <TextInput
                style={styles.input}
                value={projLiveUrl}
                onChangeText={setProjLiveUrl}
                placeholder="https://myproject.app"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <SecondaryButton
                label="Cancel"
                onPress={() => setActiveModal(null)}
                style={{ flex: 1 }}
              />
              <PrimaryButton
                label={isActionLoading ? 'Saving...' : editingId ? 'Update' : 'Save'}
                onPress={handleSaveProject}
                disabled={isActionLoading}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ================================================================== */}
      {/* 3. Add / Edit Experience Modal */}
      {/* ================================================================== */}
      <Modal
        visible={activeModal === 'EXPERIENCE'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              Keyboard.dismiss();
              setActiveModal(null);
            }}
            style={styles.modalDismissArea}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? 'Edit Experience' : 'Add Experience'}
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Icon name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              contentContainerStyle={styles.modalScrollContent}
              style={{ flexShrink: 1 }}
            >
              <Text style={styles.fieldLabel}>Role / Job Title *</Text>
              <TextInput
                style={styles.input}
                value={expTitle}
                onChangeText={setExpTitle}
                placeholder="e.g. Software Engineering Intern"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Company / Organization *</Text>
              <TextInput
                style={styles.input}
                value={expCompany}
                onChangeText={setExpCompany}
                placeholder="e.g. Google Cloud, Razorpay, Campus Labs"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Location</Text>
              <TextInput
                style={styles.input}
                value={expLocation}
                onChangeText={setExpLocation}
                placeholder="e.g. Bengaluru, India or Remote"
                placeholderTextColor={colors.textMuted}
              />

              {/* Start Date - Interactive Calendar Picker */}
              <DatePickerInput
                label="Start Date *"
                value={expStartDate}
                placeholder="Select start date"
                onPress={() => {
                  setCalendarConfig({
                    visible: true,
                    title: 'Select Start Date',
                    value: expStartDate,
                    allowClear: false,
                    onConfirm: (dateStr) => setExpStartDate(dateStr),
                  });
                }}
              />

              <View style={styles.switchInlineRow}>
                <Text style={styles.switchLabel}>Currently Working Here</Text>
                <Switch
                  value={expIsCurrent}
                  onValueChange={setExpIsCurrent}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* End Date - Interactive Calendar Picker */}
              {!expIsCurrent && (
                <DatePickerInput
                  label="End Date"
                  value={expEndDate}
                  placeholder="Select end date"
                  onPress={() => {
                    setCalendarConfig({
                      visible: true,
                      title: 'Select End Date',
                      value: expEndDate,
                      allowClear: true,
                      onConfirm: (dateStr) => setExpEndDate(dateStr),
                      onClear: () => setExpEndDate(''),
                    });
                  }}
                  onClear={() => setExpEndDate('')}
                />
              )}

              <Text style={styles.fieldLabel}>Description & Contributions</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={expDescription}
                onChangeText={setExpDescription}
                placeholder="Key accomplishments, technologies utilized, systems designed..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <SecondaryButton
                label="Cancel"
                onPress={() => setActiveModal(null)}
                style={{ flex: 1 }}
              />
              <PrimaryButton
                label={isActionLoading ? 'Saving...' : editingId ? 'Update' : 'Save'}
                onPress={handleSaveExperience}
                disabled={isActionLoading}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ================================================================== */}
      {/* 4. Add / Edit Certification Modal */}
      {/* ================================================================== */}
      <Modal
        visible={activeModal === 'CERTIFICATION'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              Keyboard.dismiss();
              setActiveModal(null);
            }}
            style={styles.modalDismissArea}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? 'Edit Certification' : 'Add Certification'}
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Icon name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              contentContainerStyle={styles.modalScrollContent}
              style={{ flexShrink: 1 }}
            >
              <Text style={styles.fieldLabel}>Certification Name *</Text>
              <TextInput
                style={styles.input}
                value={certName}
                onChangeText={setCertName}
                placeholder="e.g. AWS Certified Solutions Architect"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Issuing Organization *</Text>
              <TextInput
                style={styles.input}
                value={certIssuer}
                onChangeText={setCertIssuer}
                placeholder="e.g. Amazon Web Services, Google Cloud"
                placeholderTextColor={colors.textMuted}
              />

              {/* Issue Date - Interactive Calendar Picker */}
              <DatePickerInput
                label="Issue Date"
                value={certIssueDate}
                placeholder="Select issue date"
                onPress={() => {
                  setCalendarConfig({
                    visible: true,
                    title: 'Select Issue Date',
                    value: certIssueDate,
                    allowClear: true,
                    onConfirm: (dateStr) => setCertIssueDate(dateStr),
                    onClear: () => setCertIssueDate(''),
                  });
                }}
                onClear={() => setCertIssueDate('')}
              />

              <Text style={styles.fieldLabel}>Credential URL / Verification Link</Text>
              <TextInput
                style={styles.input}
                value={certCredentialUrl}
                onChangeText={setCertCredentialUrl}
                placeholder="https://www.credly.com/badges/..."
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <SecondaryButton
                label="Cancel"
                onPress={() => setActiveModal(null)}
                style={{ flex: 1 }}
              />
              <PrimaryButton
                label={isActionLoading ? 'Saving...' : editingId ? 'Update' : 'Save'}
                onPress={handleSaveCertification}
                disabled={isActionLoading}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Global Calendar Date Picker Modal */}
      <CalendarDatePickerModal
        visible={calendarConfig.visible}
        title={calendarConfig.title}
        value={calendarConfig.value}
        allowClear={calendarConfig.allowClear}
        onConfirm={calendarConfig.onConfirm}
        onClear={calendarConfig.onClear}
        onClose={() => setCalendarConfig((prev) => ({ ...prev, visible: false }))}
      />
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
      paddingBottom: spacing[8],
    },
    headerRightActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    headerIconBtn: {
      padding: 6,
      borderRadius: radii.sm,
      backgroundColor: colors.surfaceElevated,
    },
    headerCard: {
      flexDirection: 'row',
      padding: spacing[4],
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    headerInfo: {
      marginLeft: spacing[4],
      flex: 1,
    },
    name: {
      ...typography.screenTitle,
      fontSize: 18,
      marginBottom: 2,
      color: colors.textPrimary,
    },
    institution: {
      ...typography.bodySmall,
      color: colors.textPrimary,
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
      backgroundColor: colors.surfaceElevated,
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
      paddingVertical: 6,
      paddingHorizontal: 8,
    },
    navBtnText: {
      ...typography.caption,
      fontWeight: '600',
      color: colors.primary,
    },
    infoGrid: {
      gap: spacing[2],
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 4,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
    },
    infoLabel: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
    infoVal: {
      ...typography.bodySmall,
      color: colors.textPrimary,
      fontWeight: '500',
    },
    skillsWrapper: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing[2],
    },
    skillPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
      borderRadius: radii.full,
    },
    skillText: {
      ...typography.bodySmall,
      color: colors.textPrimary,
      fontWeight: '500',
    },
    skillDeleteBtn: {
      padding: 2,
      marginLeft: 2,
    },
    emptyCard: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing[4],
      backgroundColor: colors.surfaceElevated,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
    },
    emptyText: {
      ...typography.caption,
      color: colors.textSecondary,
      marginBottom: spacing[2],
    },
    emptyAddBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: radii.sm,
      backgroundColor: colors.primarySoft,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    emptyAddText: {
      ...typography.caption,
      fontWeight: '600',
      color: colors.primary,
    },
    testLinkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: spacing[3],
      paddingTop: spacing[2],
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    testLinkText: {
      ...typography.caption,
      fontWeight: '600',
      color: colors.primary,
    },
    itemCard: {
      backgroundColor: colors.surface,
      padding: spacing[3],
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing[3],
    },
    itemHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    itemTitle: {
      ...typography.cardTitle,
      fontSize: 15,
      flex: 1,
      color: colors.textPrimary,
    },
    actionIconRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginLeft: spacing[2],
    },
    iconBtn: {
      padding: 4,
      borderRadius: radii.sm,
      backgroundColor: colors.surfaceElevated,
    },
    itemSub: {
      ...typography.caption,
      color: colors.textSecondary,
      marginBottom: 6,
    },
    itemDesc: {
      ...typography.bodySmall,
      color: colors.textMuted,
      lineHeight: 18,
      marginTop: 2,
    },
    techRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
      marginTop: spacing[2],
    },
    techChip: {
      backgroundColor: colors.surfaceElevated,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: radii.sm,
    },
    techText: {
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: spacing[2],
    },
    linkText: {
      fontSize: 11,
      color: colors.primary,
      flex: 1,
    },
    bulletRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing[2],
      marginBottom: spacing[2],
    },
    bulletDot: {
      color: colors.primary,
      fontSize: 14,
      lineHeight: 18,
    },
    bulletText: {
      ...typography.bodySmall,
      color: colors.textPrimary,
      flex: 1,
      lineHeight: 18,
    },
    settingsNavBox: {
      marginHorizontal: spacing[4],
      marginTop: spacing[4],
    },
    settingsRowBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing[3],
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    settingsRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
    },
    settingsIconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    settingsRowTitle: {
      ...typography.body,
      fontWeight: '600',
      color: colors.textPrimary,
      fontSize: 14,
    },
    settingsRowSubtitle: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    signOutBox: {
      marginTop: spacing[4],
      paddingHorizontal: spacing[4],
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    modalDismissArea: {
      flex: 1,
    },
    modalCard: {
      maxHeight: Platform.OS === 'ios' ? '88%' : '90%',
      width: '100%',
      backgroundColor: colors.surface,
      borderTopLeftRadius: radii.xl,
      borderTopRightRadius: radii.xl,
      paddingHorizontal: spacing[5],
      paddingTop: spacing[5],
      paddingBottom: Platform.OS === 'ios' ? spacing[6] : spacing[4],
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 10,
    },
    modalScrollContent: {
      paddingBottom: spacing[4],
      flexGrow: 0,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing[4],
      paddingBottom: spacing[2],
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      ...typography.h3,
      fontSize: 18,
      color: colors.textPrimary,
    },
    fieldLabel: {
      ...typography.caption,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 6,
      marginTop: spacing[2],
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.sm,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[3],
      fontSize: 14,
      color: colors.textPrimary,
      backgroundColor: colors.inputBg,
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    levelRow: {
      flexDirection: 'row',
      gap: spacing[2],
    },
    levelPill: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      borderRadius: radii.sm,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
    },
    levelPillActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    levelPillText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    levelPillTextActive: {
      color: '#FFFFFF',
    },
    switchInlineRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: spacing[2],
      paddingVertical: 4,
    },
    switchLabel: {
      ...typography.bodySmall,
      fontWeight: '500',
      color: colors.textPrimary,
    },
    modalActions: {
      flexDirection: 'row',
      gap: spacing[3],
      marginTop: spacing[4],
      paddingTop: spacing[3],
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
  });
