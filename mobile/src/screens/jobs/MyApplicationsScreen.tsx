import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors, radii, spacing, typography } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { StatusBadge, StatusVariant } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { Icon } from '../../components/common/Icon';
import { useOpportunityStore } from '../../store/opportunityStore';
import { ApplicationRecord } from '../../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'MyApplications'>;

export const MyApplicationsScreen: React.FC<Props> = ({ navigation }) => {
  const { myApplications, fetchMyApplications } = useOpportunityStore();

  useEffect(() => {
    fetchMyApplications();
  }, [fetchMyApplications]);

  const getStatusVariant = (status: ApplicationRecord['status']): StatusVariant => {
    switch (status) {
      case 'ACCEPTED':
        return 'success';
      case 'SHORTLISTED':
        return 'primary';
      case 'UNDER_REVIEW':
        return 'warning';
      case 'REJECTED':
        return 'danger';
      case 'APPLIED':
      default:
        return 'neutral';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ');
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="My Applications"
        onBackPress={() => navigation.goBack()}
      />

      {myApplications.length === 0 ? (
        <EmptyState
          title="No Applications Submitted"
          description="You haven't submitted any internal applications yet. Explore openings to get started."
          icon="briefcase"
          actionLabel="Find Opportunities"
          onActionPress={() => navigation.navigate('MainTabs', { screen: 'Jobs' })}
        />
      ) : (
        <FlatList
          data={myApplications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('OpportunityDetail', {
                  opportunityId: item.opportunityId,
                })
              }
              activeOpacity={0.7}
              style={styles.card}
            >
              <View style={styles.cardTop}>
                <StatusBadge
                  label={formatStatus(item.status)}
                  variant={getStatusVariant(item.status)}
                />
                <Text style={styles.dateText}>
                  Applied: {formatDate(item.appliedAt)}
                </Text>
              </View>

              <Text style={styles.title}>{item.opportunityTitle}</Text>
              <Text style={styles.org}>{item.organization}</Text>

              {item.notes && (
                <View style={styles.notesBox}>
                  <Icon name="clock" size={13} color={colors.textSecondary} />
                  <Text style={styles.notesText}>{item.notes}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing[4],
    gap: spacing[3],
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing[4],
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  dateText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  title: {
    ...typography.cardTitle,
    color: colors.text,
    marginBottom: 2,
  },
  org: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing[2],
  },
  notesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceMuted,
    padding: spacing[2],
    borderRadius: radii.sm,
    marginTop: spacing[1],
  },
  notesText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
