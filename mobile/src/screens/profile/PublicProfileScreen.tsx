import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { Avatar } from '../../components/common/Avatar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Icon } from '../../components/common/Icon';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { typography, spacing, radii } from '../../theme';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';
import { ColorPalette } from '../../theme/colors';
import { StudentProfile } from '../../types/models';
import { profileService } from '../../services/profileService';
import { useMessagingStore } from '../../store/messagingStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type PublicProfileRouteProp = RouteProp<RootStackParamList, 'PublicProfile'>;

export const PublicProfileScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PublicProfileRouteProp>();
  const { userId, fullName: initialName } = route.params;

  const { getOrCreateConversation } = useMessagingStore();

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStartingChat, setIsStartingChat] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setError(null);
      const res = await profileService.getUserPortfolio(userId);
      if (res.success && res.data) {
        setProfile(res.data);
      } else {
        setProfile(null);
        setError(res.error || 'This user has not set up a public portfolio yet.');
      }
    } catch (err: any) {
      setProfile(null);
      setError(err.message || 'Failed to load public profile');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchProfile();
  };

  // Step 3: Wire Message Initiation Flow
  const handleMessagePress = async () => {
    if (isStartingChat) return;
    setIsStartingChat(true);

    try {
      const convo = await getOrCreateConversation(userId);
      const targetName = profile?.fullName || initialName || 'Peer';

      if (convo && convo.id) {
        navigation.navigate('Chat', {
          conversationId: convo.id,
          title: targetName,
        });
      } else {
        Alert.alert(
          'Unable to Message',
          'Could not initiate conversation with this user on the server.'
        );
      }
    } catch {
      Alert.alert(
        'Unable to Message',
        'Could not initiate chat at this time. Please try again.'
      );
    } finally {
      setIsStartingChat(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader
          title={initialName || 'Public Profile'}
          onBackPress={() => navigation.goBack()}
        />
        <LoadingState message="Loading candidate portfolio..." />
      </View>
    );
  }

  if (error && !profile) {
    return (
      <View style={styles.container}>
        <AppHeader
          title={initialName || 'Public Profile'}
          onBackPress={() => navigation.goBack()}
        />
        <ErrorState message={error} onRetry={fetchProfile} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title={profile?.fullName || initialName || 'Candidate Profile'}
        onBackPress={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            style={styles.headerChatBtn}
            onPress={handleMessagePress}
            activeOpacity={0.7}
          >
            <Icon name="message-square" size={18} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Profile Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <Avatar
              name={profile?.fullName || 'Student'}
              imageUrl={profile?.avatarUrl}
              size={72}
            />
            <View style={styles.heroInfo}>
              <View style={styles.nameHeaderRow}>
                <Text style={styles.fullNameText}>{profile?.fullName}</Text>
              </View>
              <Text style={styles.institutionText}>{profile?.institution}</Text>
              <Text style={styles.departmentText}>
                {profile?.program} • {profile?.department}
              </Text>
              <Text style={styles.gradText}>Class of {profile?.graduationYear}</Text>
            </View>
          </View>

          {profile?.bio ? (
            <View style={styles.bioContainer}>
              <Text style={styles.bioText}>{profile.bio}</Text>
            </View>
          ) : null}

          {/* Prominent Message Action Button */}
          <TouchableOpacity
            style={[styles.primaryMessageBtn, isStartingChat && styles.primaryMessageBtnDisabled]}
            onPress={handleMessagePress}
            disabled={isStartingChat}
            activeOpacity={0.7}
          >
            {isStartingChat ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Icon name="message-square" size={18} color="#FFFFFF" />
                <Text style={styles.primaryMessageBtnText}>
                  Message {profile?.fullName?.split(' ')[0] || 'Peer'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Academic Details Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Academic Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Program:</Text>
            <Text style={styles.infoVal}>{profile?.program}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Department:</Text>
            <Text style={styles.infoVal}>{profile?.department}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Graduation Year:</Text>
            <Text style={styles.infoVal}>{profile?.graduationYear}</Text>
          </View>
          {profile?.cgpa && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Academic Standing:</Text>
              <Text style={styles.infoVal}>{profile.cgpa}</Text>
            </View>
          )}
        </View>

        {/* Skills Section */}
        {profile?.skills && profile.skills.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Skills & Competencies</Text>
            <View style={styles.skillsWrapper}>
              {profile.skills.map((skill, idx) => (
                <View key={idx} style={styles.skillPill}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Highlighted Projects */}
        {profile?.projects && profile.projects.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Featured Projects</Text>
            {profile.projects.map((proj) => (
              <View key={proj.id} style={styles.projectItem}>
                <Text style={styles.itemTitle}>{proj.title}</Text>
                <Text style={styles.itemDesc}>{proj.description}</Text>
                {proj.technologies && proj.technologies.length > 0 && (
                  <View style={styles.techWrapper}>
                    {proj.technologies.map((t, idx) => (
                      <View key={idx} style={styles.techTag}>
                        <Text style={styles.techTagText}>{t}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Experience */}
        {profile?.experience && profile.experience.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Experience & Internships</Text>
            {profile.experience.map((exp) => (
              <View key={exp.id} style={styles.projectItem}>
                <Text style={styles.itemTitle}>{exp.role}</Text>
                <Text style={styles.itemSub}>
                  {exp.organization} • {exp.duration}
                </Text>
                {exp.description ? (
                  <Text style={styles.itemDesc}>{exp.description}</Text>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {profile?.certifications && profile.certifications.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Certifications & Licenses</Text>
            {profile.certifications.map((cert) => (
              <View key={cert.id} style={styles.projectItem}>
                <Text style={styles.itemTitle}>{cert.name}</Text>
                <Text style={styles.itemSub}>
                  {cert.issuingOrganization} {cert.issueDate ? `• ${cert.issueDate}` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerChatBtn: {
      padding: spacing[1],
    },
    scrollContent: {
      padding: spacing[4],
      paddingBottom: spacing[8],
    },
    heroCard: {
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      padding: spacing[4],
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing[4],
    },
    heroTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[4],
    },
    heroInfo: {
      flex: 1,
    },
    nameHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 2,
    },
    fullNameText: {
      ...typography.screenTitle,
      fontSize: 18,
      color: colors.textPrimary,
    },
    institutionText: {
      ...typography.bodySmall,
      color: colors.textPrimary,
      fontWeight: '500',
    },
    departmentText: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: 2,
    },
    gradText: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: 2,
    },
    bioContainer: {
      marginTop: spacing[3],
      paddingTop: spacing[3],
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    bioText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    primaryMessageBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing[2],
      backgroundColor: colors.primary,
      borderRadius: radii.md,
      paddingVertical: spacing[3],
      marginTop: spacing[4],
    },
    primaryMessageBtnDisabled: {
      opacity: 0.7,
    },
    primaryMessageBtnText: {
      ...typography.label,
      fontSize: 14,
      color: '#FFFFFF',
      fontWeight: '700',
    },
    sectionCard: {
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      padding: spacing[4],
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing[3],
    },
    sectionTitle: {
      ...typography.h3,
      fontSize: 15,
      color: colors.textPrimary,
      marginBottom: spacing[3],
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 3,
    },
    infoLabel: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
    infoVal: {
      ...typography.bodySmall,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    skillsWrapper: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing[2],
    },
    skillPill: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: radii.full,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    skillText: {
      ...typography.caption,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    projectItem: {
      paddingVertical: spacing[2],
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    itemTitle: {
      ...typography.label,
      fontSize: 14,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    itemSub: {
      ...typography.caption,
      color: colors.primary,
      marginVertical: 2,
      fontWeight: '600',
    },
    itemDesc: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      lineHeight: 18,
      marginTop: 2,
    },
    techWrapper: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
      marginTop: 6,
    },
    techTag: {
      backgroundColor: colors.primarySoft,
      borderRadius: radii.sm,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    techTagText: {
      fontSize: 10,
      color: colors.primary,
      fontWeight: '600',
    },
  });
