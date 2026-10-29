import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { Mentor } from '../../types/models';
import { colors, radii, spacing, typography } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { Avatar } from '../../components/common/Avatar';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { Icon } from '../../components/common/Icon';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { mentorService } from '../../services/mentorService';

type Props = NativeStackScreenProps<RootStackParamList, 'MentorDetail'>;

export const MentorDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { mentorId } = route.params;
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMentor = async () => {
      setIsLoading(true);
      const res = await mentorService.getMentorById(mentorId);
      if (res.success && res.data) {
        setMentor(res.data);
      } else {
        setError(res.error || 'Failed to load mentor details.');
      }
      setIsLoading(false);
    };

    fetchMentor();
  }, [mentorId]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Mentor" onBackPress={() => navigation.goBack()} />
        <LoadingState message="Loading profile..." />
      </View>
    );
  }

  if (error || !mentor) {
    return (
      <View style={styles.container}>
        <AppHeader title="Mentor" onBackPress={() => navigation.goBack()} />
        <ErrorState message={error || 'Mentor not found'} onRetry={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="Mentor Profile"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Mentor Header Card */}
        <View style={styles.profileHeader}>
          <Avatar name={mentor.name} imageUrl={mentor.avatar} size={72} />
          <Text style={styles.name}>{mentor.name}</Text>
          <Text style={styles.designation}>{mentor.designation}</Text>
          <Text style={styles.org}>
            {mentor.organization} • {mentor.yearsOfExperience} years industry experience
          </Text>

          {mentor.isAvailable ? (
            <View style={styles.availBadge}>
              <View style={styles.greenDot} />
              <Text style={styles.availText}>Open for Student Guidance</Text>
            </View>
          ) : (
            <View style={[styles.availBadge, styles.busyBadge]}>
              <Text style={styles.busyText}>Currently at Capacity</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>About the Mentor</Text>
          <Text style={styles.bodyText}>{mentor.bio}</Text>
        </View>

        {/* Availability Window */}
        {mentor.availableDays && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Available Windows</Text>
            <View style={styles.availBox}>
              <Icon name="calendar" size={16} color={colors.primary} />
              <Text style={styles.availWindowText}>{mentor.availableDays}</Text>
            </View>
          </View>
        )}

        {/* Focus Domains */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Focus Domains</Text>
          <View style={styles.tagWrap}>
            {mentor.domains.map((dom) => (
              <View key={dom} style={styles.domainBadge}>
                <Text style={styles.domainText}>{dom}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Technical Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Skills & Expertise</Text>
          <View style={styles.tagWrap}>
            {mentor.skills.map((skill) => (
              <View key={skill} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Booking Action Bar */}
      <View style={styles.footerBar}>
        <PrimaryButton
          label="Request Mentorship Session"
          size="lg"
          disabled={!mentor.isAvailable}
          onPress={() =>
            navigation.navigate('BookingRequest', {
              mentorId: mentor.id,
              mentorName: mentor.name,
              mentorRole: `${mentor.designation} @ ${mentor.organization}`,
            })
          }
        />
      </View>
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
    paddingBottom: spacing[12],
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  name: {
    ...typography.screenTitle,
    fontSize: 20,
    marginTop: spacing[3],
    marginBottom: 2,
  },
  designation: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  org: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing[3],
  },
  availBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.successSoft,
    paddingHorizontal: spacing[3],
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  availText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  busyBadge: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
  },
  busyText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing[4],
  },
  section: {
    marginBottom: spacing[4],
  },
  sectionHeading: {
    ...typography.sectionTitle,
    fontSize: 15,
    marginBottom: spacing[2],
  },
  bodyText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  availBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.surfaceMuted,
    padding: spacing[3],
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  availWindowText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  domainBadge: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: radii.sm,
    paddingHorizontal: spacing[3],
    paddingVertical: 4,
  },
  domainText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  skillBadge: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing[3],
    paddingVertical: 4,
  },
  skillText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  footerBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing[3],
  },
});
