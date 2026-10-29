import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { Opportunity } from '../../types/models';
import { colors, radii, spacing, typography } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { Icon } from '../../components/common/Icon';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { opportunityService } from '../../services/opportunityService';
import { useOpportunityStore } from '../../store/opportunityStore';
import { usePreferencesStore } from '../../store/preferencesStore';

type Props = NativeStackScreenProps<RootStackParamList, 'OpportunityDetail'>;

export const OpportunityDetailScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { opportunityId } = route.params;
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);

  const { applyInternal, isApplying } = useOpportunityStore();
  const { isBookmarked, toggleBookmark } = usePreferencesStore();

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      const res = await opportunityService.getOpportunityById(opportunityId);
      if (res.success && res.data) {
        setOpportunity(res.data);
      } else {
        setError(res.error || 'Failed to load opportunity details.');
      }
      setIsLoading(false);
    };

    fetchDetail();
  }, [opportunityId]);

  const handleApply = async () => {
    if (!opportunity) return;

    if (opportunity.applicationMethod === 'EXTERNAL') {
      if (opportunity.externalUrl) {
        Alert.alert(
          'External Application',
          'You will be redirected to the external organization portal to submit your application.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Link',
              onPress: () => Linking.openURL(opportunity.externalUrl!),
            },
          ]
        );
      }
      return;
    }

    const res = await applyInternal(opportunity.id);
    if (res.success) {
      setHasApplied(true);
      Alert.alert(
        'Application Submitted',
        'Your profile has been forwarded to the reviewing committee. You can track progress in My Applications.',
        [
          { text: 'OK' },
          {
            text: 'View Applications',
            onPress: () => navigation.navigate('MyApplications'),
          },
        ]
      );
    } else {
      Alert.alert('Error', res.error || 'Could not submit application.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Opportunity" onBackPress={() => navigation.goBack()} />
        <LoadingState message="Loading details..." />
      </View>
    );
  }

  if (error || !opportunity) {
    return (
      <View style={styles.container}>
        <AppHeader title="Opportunity" onBackPress={() => navigation.goBack()} />
        <ErrorState message={error || 'Not found'} onRetry={() => navigation.goBack()} />
      </View>
    );
  }

  const bookmarked = isBookmarked(opportunity.id);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Opportunity Details"
        onBackPress={() => navigation.goBack()}
        rightAction={
          <SecondaryButton
            label={bookmarked ? 'Saved' : 'Save'}
            icon={bookmarked ? 'bookmark-fill' : 'bookmark'}
            size="sm"
            onPress={() => toggleBookmark(opportunity.id)}
          />
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.metaTop}>
          <StatusBadge label={opportunity.type} variant="neutral" />
          <Text style={styles.metaWorkMode}>• {opportunity.workMode}</Text>
          {opportunity.isVerified && (
            <View style={styles.verifiedTag}>
              <Icon name="check-circle" size={14} color={colors.primary} />
              <Text style={styles.verifiedText}>Verified Opportunity</Text>
            </View>
          )}
        </View>

        <Text style={styles.title}>{opportunity.title}</Text>
        <Text style={styles.orgName}>{opportunity.organization}</Text>

        <View style={styles.quickSpecs}>
          <View style={styles.specItem}>
            <Icon name="map-pin" size={16} color={colors.textSecondary} />
            <Text style={styles.specText}>{opportunity.location}</Text>
          </View>

          {opportunity.stipendOrSalary && (
            <View style={styles.specItem}>
              <Icon name="award" size={16} color={colors.textSecondary} />
              <Text style={styles.specText}>{opportunity.stipendOrSalary}</Text>
            </View>
          )}

          <View style={styles.specItem}>
            <Icon name="clock" size={16} color={colors.textSecondary} />
            <Text style={styles.specText}>Deadline: {opportunity.deadline}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>About the Opportunity</Text>
          <Text style={styles.bodyText}>{opportunity.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Eligibility</Text>
          <Text style={styles.bodyText}>{opportunity.eligibility}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Required Skills & Technologies</Text>
          <View style={styles.skillsWrapper}>
            {opportunity.requiredSkills.map((skill) => (
              <View key={skill} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Application Method</Text>
          <Text style={styles.bodyText}>
            {opportunity.applicationMethod === 'INTERNAL'
              ? 'In-app application managed directly through UPLINK. Your verified profile information is shared with recruiters upon submission.'
              : 'External application portal. Verification is maintained by the hosting organization.'}
          </Text>
        </View>
      </ScrollView>

      {/* Floating Bottom Bar */}
      <View style={styles.bottomBar}>
        <PrimaryButton
          label={
            hasApplied
              ? 'Application Submitted'
              : opportunity.applicationMethod === 'EXTERNAL'
              ? 'Apply via External Site'
              : 'Apply with Student Profile'
          }
          icon={opportunity.applicationMethod === 'EXTERNAL' ? 'external-link' : 'check'}
          onPress={handleApply}
          isLoading={isApplying}
          disabled={hasApplied}
          size="lg"
          style={styles.applyBtn}
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
  metaTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  metaWorkMode: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: spacing[1],
  },
  verifiedText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    ...typography.screenTitle,
    fontSize: 20,
    marginBottom: 4,
  },
  orgName: {
    ...typography.sectionTitle,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing[4],
  },
  quickSpecs: {
    gap: spacing[2],
    backgroundColor: colors.surfaceMuted,
    padding: spacing[3],
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  specText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing[5],
  },
  section: {
    marginBottom: spacing[5],
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
  skillsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  skillBadge: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  skillText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
  },
  bottomBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing[3],
  },
  applyBtn: {
    width: '100%',
  },
});
