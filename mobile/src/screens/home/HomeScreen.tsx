import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../types/navigation';
import { colors, radii, spacing, typography } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { SearchField } from '../../components/common/SearchField';
import { FilterChips } from '../../components/common/FilterChips';
import { SectionHeader } from '../../components/common/SectionHeader';
import { OpportunityCard } from '../../components/opportunity/OpportunityCard';
import { OpportunityListItem } from '../../components/opportunity/OpportunityListItem';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { Icon } from '../../components/common/Icon';
import { useOpportunityStore } from '../../store/opportunityStore';
import { CampusEvent } from '../../types/models';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const HOME_CATEGORIES = [
  'All',
  'Internships',
  'Jobs',
  'Hackathons',
  'Workshops',
  'Events',
] as const;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedHomeCategory, setSelectedHomeCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    opportunities,
    events,
    isLoading,
    error,
    fetchOpportunities,
    fetchEvents,
  } = useOpportunityStore();

  useEffect(() => {
    fetchOpportunities();
    fetchEvents();
  }, [fetchOpportunities, fetchEvents]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchOpportunities(), fetchEvents()]);
    setIsRefreshing(false);
  };

  // Filter opportunities based on selected quick category or search
  const filteredOpportunities = opportunities.filter((opp) => {
    if (selectedHomeCategory === 'Internships' && opp.type !== 'Internship') return false;
    if (selectedHomeCategory === 'Jobs' && opp.type !== 'Job') return false;
    if (selectedHomeCategory === 'Hackathons' && opp.type !== 'Hackathon') return false;
    if (selectedHomeCategory === 'Workshops' && opp.type !== 'Workshop') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        opp.title.toLowerCase().includes(q) ||
        opp.organization.toLowerCase().includes(q) ||
        opp.requiredSkills.some((s) => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const featuredOpportunities = opportunities.filter((o) => o.isVerified).slice(0, 4);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Discover"
        onBookmarkPress={() => navigation.navigate('SavedOpportunities')}
        onNotificationPress={() => navigation.navigate('Notifications')}
        onProfilePress={() => navigation.navigate('MyProfile')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Search entry point */}
        <View style={styles.searchContainer}>
          <SearchField
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search opportunities, roles, skills..."
          />
        </View>

        {/* Quick category filter chips */}
        <FilterChips
          items={[...HOME_CATEGORIES]}
          selectedId={selectedHomeCategory}
          onSelect={setSelectedHomeCategory}
        />

        {isLoading && !isRefreshing ? (
          <LoadingState message="Loading latest campus activity..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchOpportunities} />
        ) : (
          <>
            {/* Featured Opportunities Section */}
            {selectedHomeCategory === 'All' && !searchQuery && featuredOpportunities.length > 0 && (
              <View style={styles.sectionWrapper}>
                <SectionHeader
                  title="Featured Opportunities"
                  actionLabel="See all"
                  onActionPress={() => navigation.navigate('Jobs', undefined)}
                />
                <FlatList
                  data={featuredOpportunities}
                  keyExtractor={(item) => `feat-${item.id}`}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                  renderItem={({ item }) => (
                    <OpportunityCard
                      opportunity={item}
                      onPress={() =>
                        navigation.navigate('OpportunityDetail', {
                          opportunityId: item.id,
                        })
                      }
                    />
                  )}
                />
              </View>
            )}

            {/* Upcoming Campus Notices / Events */}
            {selectedHomeCategory === 'All' && !searchQuery && events.length > 0 && (
              <View style={styles.sectionWrapper}>
                <SectionHeader title="Campus Notices & Events" />
                <View style={styles.eventsContainer}>
                  {events.map((event: CampusEvent) => (
                    <View key={event.id} style={styles.eventCard}>
                      <View style={styles.eventBadge}>
                        <Icon name="calendar" size={14} color={colors.primary} />
                        <Text style={styles.eventDateText}>{event.date}</Text>
                      </View>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventSubtitle}>
                        {event.organization} • {event.location}
                      </Text>
                      <Text style={styles.eventTimeText}>{event.time}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Main Opportunities List */}
            <View style={styles.sectionWrapper}>
              <SectionHeader
                title={
                  selectedHomeCategory === 'All'
                    ? 'Explore Opportunities'
                    : selectedHomeCategory
                }
                actionLabel="View all"
                onActionPress={() => navigation.navigate('Jobs', undefined)}
              />

              {filteredOpportunities.length === 0 ? (
                <EmptyState
                  title="No Opportunities Found"
                  description="Try adjusting your filter or search criteria to discover more openings."
                  icon="briefcase"
                  actionLabel="Reset Filters"
                  onActionPress={() => {
                    setSelectedHomeCategory('All');
                    setSearchQuery('');
                  }}
                />
              ) : (
                <View style={styles.listContainer}>
                  {filteredOpportunities.map((opp) => (
                    <OpportunityListItem
                      key={opp.id}
                      opportunity={opp}
                      onPress={() =>
                        navigation.navigate('OpportunityDetail', {
                          opportunityId: opp.id,
                        })
                      }
                    />
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export const FeedScreen = HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[1],
  },
  sectionWrapper: {
    marginBottom: spacing[2],
  },
  horizontalList: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[2],
  },
  eventsContainer: {
    paddingHorizontal: spacing[4],
    gap: spacing[2],
  },
  eventCard: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing[3],
  },
  eventBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  eventDateText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  eventTitle: {
    ...typography.cardTitle,
    fontSize: 14,
    color: colors.text,
    marginBottom: 2,
  },
  eventSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  eventTimeText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  listContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

