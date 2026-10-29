import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../types/navigation';
import { OpportunityCategory, WorkMode } from '../../types/models';
import { colors, radii, spacing, typography } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { SearchField } from '../../components/common/SearchField';
import { FilterChips } from '../../components/common/FilterChips';
import { OpportunityListItem } from '../../components/opportunity/OpportunityListItem';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { useOpportunityStore } from '../../store/opportunityStore';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Jobs'>,
  NativeStackScreenProps<RootStackParamList>
>;

const CATEGORIES: (OpportunityCategory | 'All')[] = [
  'All',
  'Internship',
  'Job',
  'Hackathon',
  'Competition',
  'Scholarship',
  'Workshop',
  'Certification',
  'Training',
  'Research',
  'Apprenticeship',
];

const WORK_MODES: (WorkMode | 'All')[] = ['All', 'Remote', 'Hybrid', 'On-site'];

export const JobsScreen: React.FC<Props> = ({ navigation, route }) => {
  const [showWorkModeFilter, setShowWorkModeFilter] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    opportunities,
    selectedCategory,
    workModeFilter,
    searchQuery,
    isLoading,
    error,
    fetchOpportunities,
    setSelectedCategory,
    setWorkModeFilter,
    setSearchQuery,
  } = useOpportunityStore();

  useEffect(() => {
    if (route.params?.initialCategory) {
      setSelectedCategory(route.params.initialCategory);
    } else {
      fetchOpportunities();
    }
  }, [fetchOpportunities, route.params?.initialCategory, setSelectedCategory]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchOpportunities();
    setIsRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* 
        Jobs Header:
        Title: Explore Opportunities on the same row as header actions
      */}
      <AppHeader
        title="Explore Opportunities"
        onBookmarkPress={() => navigation.navigate('SavedOpportunities')}
        onNotificationPress={() => navigation.navigate('Notifications')}
        onProfilePress={() => navigation.navigate('MyProfile')}
      />

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <SearchField
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by role, organization, skill..."
          onFilterPress={() => setShowWorkModeFilter(!showWorkModeFilter)}
          hasActiveFilters={workModeFilter !== 'All'}
        />
      </View>

      {/* Work-mode sub-filter row when toggled */}
      {showWorkModeFilter && (
        <View style={styles.subFilterSection}>
          <Text style={styles.subFilterLabel}>Work Mode:</Text>
          <View style={styles.workModeChips}>
            {WORK_MODES.map((mode) => (
              <TouchableOpacity
                key={mode}
                onPress={() => setWorkModeFilter(mode)}
                style={[
                  styles.modeChip,
                  workModeFilter === mode && styles.modeChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.modeText,
                    workModeFilter === mode && styles.modeTextSelected,
                  ]}
                >
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Primary Category Horizontal Chips (All 10 required types) */}
      <View style={styles.categoriesRow}>
        <FilterChips
          items={CATEGORIES}
          selectedId={selectedCategory}
          onSelect={(cat) => setSelectedCategory(cat as OpportunityCategory | 'All')}
        />
      </View>

      {/* Main List */}
      {isLoading && !isRefreshing ? (
        <LoadingState message="Fetching opportunities..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchOpportunities} />
      ) : opportunities.length === 0 ? (
        <EmptyState
          title="No Matching Opportunities"
          description="We couldn't find any opportunities matching your active filters."
          icon="briefcase"
          actionLabel="Clear Filters"
          onActionPress={() => {
            setSelectedCategory('All');
            setWorkModeFilter('All');
            setSearchQuery('');
          }}
        />
      ) : (
        <FlatList
          data={opportunities}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <OpportunityListItem
              opportunity={item}
              onPress={() =>
                navigation.navigate('OpportunityDetail', {
                  opportunityId: item.id,
                })
              }
            />
          )}
          contentContainerStyle={styles.listContent}
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
  searchSection: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[1],
  },
  subFilterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.surfaceMuted,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  subFilterLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginRight: spacing[2],
  },
  workModeChips: {
    flexDirection: 'row',
    gap: spacing[2],
    flexWrap: 'wrap',
  },
  modeChip: {
    paddingVertical: 2,
    paddingHorizontal: spacing[2],
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeChipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  modeText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  modeTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  categoriesRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listContent: {
    flexGrow: 1,
  },
});
